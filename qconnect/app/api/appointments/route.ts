import { NextResponse } from "next/server";
import { prisma, Status } from "@/lib/prisma";

export async function GET(req: Request) {
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

  return NextResponse.json({ page, limit, total, data: items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.queueId || !body.userId) return NextResponse.json({ error: "queueId and userId required" }, { status: 400 });

    // Use the transaction helper to ensure atomic creation and queue increment
    const appointment = await prisma.$transaction(async (tx) => {
      const q = await tx.queue.findUnique({ where: { id: Number(body.queueId) }, select: { currentNo: true } });
      if (!q) throw new Error("Queue not found");
      const tokenNo = q.currentNo + 1;
      const appt = await tx.appointment.create({ data: { tokenNo, status: Status.PENDING as any, userId: Number(body.userId), queueId: Number(body.queueId) } });
      await tx.queue.update({ where: { id: Number(body.queueId) }, data: { currentNo: { increment: 1 } } });
      return appt;
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Internal" }, { status: 400 });
  }
}
