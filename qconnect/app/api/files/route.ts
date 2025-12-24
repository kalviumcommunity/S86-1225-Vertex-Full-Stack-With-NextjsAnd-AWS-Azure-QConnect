import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { handleError } from "@/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const { fileName, fileURL, size, mime } = await req.json();

    if (!fileName || !fileURL) return sendError("fileName and fileURL are required", ERROR_CODES.VALIDATION_ERROR, 400);

    const uploaderEmail = req.headers.get("x-user-email") || null;

    const record = await prisma.file.create({
      data: {
        name: fileName,
        url: fileURL,
        size: size ? Number(size) : null,
        mime: mime || "",
        uploaderEmail,
      },
    });

    return sendSuccess(record, "File record created", 201);
  } catch (error: any) {
    return handleError(error, "POST /api/files");
  }
}
