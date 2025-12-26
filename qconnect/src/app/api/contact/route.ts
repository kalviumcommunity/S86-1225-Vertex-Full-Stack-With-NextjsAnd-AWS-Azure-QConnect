import { NextResponse } from "next/server";
import { z } from "zod";
import { handleError } from "@/lib/errorHandler";
import { sendEmail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const to = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@example.local";
    const subject = `Contact form: ${data.name}`;
    const html = `<p><strong>Name:</strong> ${data.name}</p><p><strong>Email:</strong> ${data.email}</p><p>${data.message}</p>`;

    try {
      await sendEmail({ to, subject, html });
    } catch (e) {
      console.warn("sendEmail failed", e);
    }

    return NextResponse.json({ success: true, message: "Message received" });
  } catch (err: any) {
    return handleError(err, { context: "POST /api/contact" });
  }
}