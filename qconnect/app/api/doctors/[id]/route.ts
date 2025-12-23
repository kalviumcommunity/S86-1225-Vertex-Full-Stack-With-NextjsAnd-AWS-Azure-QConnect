import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor) return sendError("Not found", ERROR_CODES.NOT_FOUND, 404);
  return sendSuccess(doctor);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const doctor = await prisma.doctor.update({ where: { id }, data: body });
    return sendSuccess(doctor);
  } catch (e: any) {
    console.error(e);
    return sendError("Update failed", ERROR_CODES.DATABASE_FAILURE, 400, e.message);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await prisma.doctor.delete({ where: { id } });
    return sendSuccess(null, "Doctor deleted");
  } catch (e: any) {
    console.error(e);
    return sendError("Delete failed", ERROR_CODES.DATABASE_FAILURE, 400, e.message);
  }
}
