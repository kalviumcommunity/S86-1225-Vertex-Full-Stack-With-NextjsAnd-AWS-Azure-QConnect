"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormInput from "@/components/forms/FormInput";

const contactSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    console.log("Contact Form Submitted:", data);
    alert("Message Sent Successfully!");
  };

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Contact Us</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="w-96 bg-gray-50 p-6 border rounded-lg">
        <FormInput label="Name" name="name" register={register} error={errors.name?.message as any} />
        <FormInput label="Email" name="email" type="email" register={register} error={errors.email?.message as any} />
        <FormInput label="Message" name="message" register={register} error={errors.message?.message as any} />

        <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white px-4 py-2 mt-2 rounded w-full">
          {isSubmitting ? "Sending…" : "Submit"}
        </button>
      </form>
    </main>
  );
}
