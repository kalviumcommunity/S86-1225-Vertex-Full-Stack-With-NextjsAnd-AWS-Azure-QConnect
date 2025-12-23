import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) return sendError("Not found", ERROR_CODES.NOT_FOUND, 404);
  return sendSuccess(appt);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const appt = await prisma.appointment.update({ where: { id }, data: body });
    return sendSuccess(appt);
  } catch (e: any) {
    console.error(e);
    return sendError("Update failed", ERROR_CODES.DATABASE_FAILURE, 400, e.message);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await prisma.appointment.delete({ where: { id } });
    return sendSuccess(null, "Appointment deleted");
  } catch (e: any) {
    console.error(e);
    return sendError("Delete failed", ERROR_CODES.DATABASE_FAILURE, 400, e.message);
  }
}
