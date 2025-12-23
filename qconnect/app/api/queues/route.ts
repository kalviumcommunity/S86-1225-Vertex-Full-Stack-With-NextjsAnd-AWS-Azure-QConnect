import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get("doctorId") ? Number(searchParams.get("doctorId")) : undefined;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 10)));
  const skip = (page - 1) * limit;

  const where = doctorId ? { doctorId } : undefined;
  const [items, total] = await Promise.all([
    prisma.queue.findMany({ where, skip, take: limit, orderBy: { date: "desc" } }),
    prisma.queue.count({ where }),
  ]);

  return NextResponse.json({ page, limit, total, data: items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.doctorId || !body.date) return NextResponse.json({ error: "doctorId and date required" }, { status: 400 });
    const date = new Date(body.date);
    const q = await prisma.queue.create({ data: { doctorId: Number(body.doctorId), date } });
    return NextResponse.json(q, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
