import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { queueUpdateSchema } from "@/lib/schemas/queueSchema";
import { ZodError } from "zod";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const q = await prisma.queue.findUnique({ where: { id } });
  if (!q) return sendError("Not found", ERROR_CODES.NOT_FOUND, 404);
  return sendSuccess(q);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    try {
      const data = queueUpdateSchema.parse(body);
      const q = await prisma.queue.update({ where: { id }, data });
      return sendSuccess(q);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return sendError("Validation Error", ERROR_CODES.VALIDATION_ERROR, 400, err.errors.map((e) => ({ field: e.path.join("."), message: e.message })));
      }
      throw err;
    }
  } catch (e: any) {
    console.error(e);
    return sendError("Update failed", ERROR_CODES.DATABASE_FAILURE, 400, e.message);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await prisma.queue.delete({ where: { id } });
    return sendSuccess(null, "Queue deleted");
  } catch (e: any) {
    console.error(e);
    return sendError("Delete failed", ERROR_CODES.DATABASE_FAILURE, 400, e.message);
  }
}
