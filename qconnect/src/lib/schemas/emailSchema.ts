import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z.string().email("Invalid recipient email address"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject must be 200 characters or less"),
  message: z.string().min(1, "Message is required").max(10000, "Message must be 10000 characters or less"),
  html: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(100, "Name must be 100 characters or less"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(5, "Message must be at least 5 characters").max(5000, "Message must be 5000 characters or less"),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
