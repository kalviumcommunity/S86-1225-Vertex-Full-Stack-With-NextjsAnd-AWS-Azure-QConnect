"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/schemas/authSchema";
import { z } from "zod";
import { useState } from "react";
import FormInput from "@/components/forms/FormInput";
import { useRouter } from "next/navigation";
import { toastSuccess, toastError, toastLoading } from "@/lib/toast";
import Spinner from "@/components/ui/Spinner";

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    const loader = toastLoading("Creating account…");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        setServerError(json.message || "Signup failed");
        toastError(json.message || "Signup failed");
        return;
      }
      toastSuccess("Account created — check your email");
      // Redirect to login after successful signup
      router.push("/login");
    } catch (err: any) {
      setServerError(err.message || "Signup failed");
      toastError(err.message || "Signup failed");
    }
  };

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Signup</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="w-96 bg-gray-50 p-6 border rounded-lg">
        <FormInput label="Name" name="name" register={register} error={errors.name?.message as any} />
        <FormInput label="Email" name="email" type="email" register={register} error={errors.email?.message as any} />
        <FormInput label="Password" name="password" type="password" register={register} error={errors.password?.message as any} />

        {serverError && <p className="text-red-600 mt-2">{serverError}</p>}

        <button disabled={isSubmitting} className="bg-blue-600 text-white py-2 rounded mt-4 w-full">
          {isSubmitting ? "Signing up…" : "Sign up"}
        </button>
      </form>
    </main>
  );
}
