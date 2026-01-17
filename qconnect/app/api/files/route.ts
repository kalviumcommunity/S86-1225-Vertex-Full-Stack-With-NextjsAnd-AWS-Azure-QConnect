import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { handleError } from "@/lib/errorHandler";
import { fileCreateSchema } from "@/lib/schemas/fileSchema";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    try {
      const data = fileCreateSchema.parse(body);

      const uploaderEmail = req.headers.get("x-user-email") || null;

      const record = await prisma.file.create({
        data: {
          name: data.fileName,
          url: data.fileURL,
          size: data.size ? Number(data.size) : null,
          mime: data.mime || "",
          uploaderEmail,
        },
      });

      return sendSuccess(record, "File record created", 201);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return sendError("Validation Error", ERROR_CODES.VALIDATION_ERROR, 400, err.errors.map((e) => ({ field: e.path.join("."), message: e.message })));
      }
      throw err;
    }
  } catch (error: any) {
    return handleError(error, "POST /api/files");
  }
}
