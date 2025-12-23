import { prisma, Status } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queueId = searchParams.get("queueId") ? Number(searchParams.get("queueId")) : undefined;
    const userId = searchParams.get("userId") ? Number(searchParams.get("userId")) : undefined;
    const status = searchParams.get("status") || undefined;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (queueId) where.queueId = queueId;
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({ where, skip, take: limit, orderBy: { id: "desc" } }),
      prisma.appointment.count({ where }),
    ]);

    return sendSuccess({ page, limit, total, data: items }, "Appointments fetched");
  } catch (e: any) {
    console.error(e);
    return sendError("Failed to fetch appointments", ERROR_CODES.INTERNAL_ERROR, 500, e.message);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.queueId || !body.userId) return sendError("queueId and userId required", ERROR_CODES.VALIDATION_ERROR, 400);

    // Use the transaction helper to ensure atomic creation and queue increment
    const appointment = await prisma.$transaction(async (tx) => {
      const q = await tx.queue.findUnique({ where: { id: Number(body.queueId) }, select: { currentNo: true } });
      if (!q) throw new Error("Queue not found");
      const tokenNo = q.currentNo + 1;
      const appt = await tx.appointment.create({ data: { tokenNo, status: Status.PENDING as any, userId: Number(body.userId), queueId: Number(body.queueId) } });
      await tx.queue.update({ where: { id: Number(body.queueId) }, data: { currentNo: { increment: 1 } } });
      return appt;
    });

    return sendSuccess(appointment, "Appointment created", 201);
  } catch (e: any) {
    console.error(e);
    return sendError(e.message || "Internal", ERROR_CODES.INTERNAL_ERROR, 400, e.message);
  }
}
