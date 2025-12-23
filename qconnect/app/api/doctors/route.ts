import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 10)));
  const skip = (page - 1) * limit;

  const where = q ? { name: { contains: q, mode: "insensitive" } } : undefined;
  const [items, total] = await Promise.all([
    prisma.doctor.findMany({ where, skip, take: limit }),
    prisma.doctor.count({ where }),
  ]);

  return NextResponse.json({ page, limit, total, data: items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.specialty || !body.roomNo) return NextResponse.json({ error: "missing fields" }, { status: 400 });
    const doctor = await prisma.doctor.create({ data: { name: body.name, specialty: body.specialty, roomNo: body.roomNo } });
    return NextResponse.json(doctor, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
