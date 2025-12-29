import { sendSuccess, sendError } from "@/lib/responseHandler";
import { sanitizeInput, sanitizeAllowHtml } from "@/lib/sanitize";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text;
    if (typeof text !== "string") return sendError("Invalid payload", undefined, 400);

    const before = text;
    const after = sanitizeInput(text);
    const allowedHtml = sanitizeAllowHtml(text);

    return sendSuccess({ before, after, allowedHtml }, "Sanitization demo");
  } catch (e: any) {
    console.error(e);
    return sendError("Sanitization demo failed", undefined, 500, e.message);
  }
}
