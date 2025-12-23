import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 10)));
  const skip = (page - 1) * limit;
  const q = searchParams.get("q") || undefined;

  const where = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ page, limit, total, data: items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.email || !body.name) {
      return NextResponse.json({ error: "name and email required" }, { status: 400 });
    }

    const user = await prisma.user.create({ data: { name: body.name, email: body.email, phone: body.phone, role: body.role } });
    return NextResponse.json(user, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
