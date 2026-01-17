import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { handleError } from "@/lib/errorHandler";
import { sendEmailSchema } from "@/lib/schemas/emailSchema";
import { ZodError } from "zod";
import { sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    try {
      const data = sendEmailSchema.parse(body);
      const res = await sendEmail({ to: data.to, subject: data.subject, html: data.html || data.message });
      return NextResponse.json({ success: true, ...res });
    } catch (err: any) {
      if (err instanceof ZodError) {
        return sendError("Validation Error", ERROR_CODES.VALIDATION_ERROR, 400, err.errors.map((e) => ({ field: e.path.join("."), message: e.message })));
      }
      throw err;
    }
  } catch (err: any) {
    return handleError(err, "POST /api/email");
  }
}
