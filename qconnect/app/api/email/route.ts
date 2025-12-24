import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { handleError } from "@/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const { to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ success: false, message: "to, subject and message are required" }, { status: 400 });
    }

    const res = await sendEmail({ to, subject, html: message });
    return NextResponse.json({ success: true, ...res });
  } catch (err: any) {
    return handleError(err, "POST /api/email");
  }
}
