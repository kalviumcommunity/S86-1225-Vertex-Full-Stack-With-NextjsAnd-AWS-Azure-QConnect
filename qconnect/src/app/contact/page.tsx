"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormInput from "@/components/forms/FormInput";
import { toastLoading, toastSuccess, toastError } from "@/lib/toast";
import Spinner from "@/components/ui/Spinner";

const contactSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    const loader = toastLoading("Sending message...");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Send failed");
      toastSuccess("Message sent — we'll be in touch");
    } catch (err: any) {
      toastError(err.message || "Failed to send message");
    }
  };

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Contact Us</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="w-96 bg-gray-50 p-6 border rounded-lg">
        <FormInput label="Name" name="name" register={register} error={errors.name?.message as any} />
        <FormInput label="Email" name="email" type="email" register={register} error={errors.email?.message as any} />
        <FormInput label="Message" name="message" register={register} error={errors.message?.message as any} />

        <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white px-4 py-2 mt-2 rounded w-full flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Spinner size={16} />
              <span>Sending…</span>
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </main>
  );
}
