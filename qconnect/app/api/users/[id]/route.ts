import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { userUpdateSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } });
  if (!user) return sendError("Not found", ERROR_CODES.NOT_FOUND, 404);
  return sendSuccess(user);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    try {
      const data = userUpdateSchema.parse(body);
      const user = await prisma.user.update({ where: { id }, data });
      return sendSuccess(user);
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
    await prisma.user.delete({ where: { id } });
    return sendSuccess(null, "User deleted");
  } catch (e: any) {
    console.error(e);
    return sendError("Delete failed", ERROR_CODES.DATABASE_FAILURE, 400, e.message);
  }
}
