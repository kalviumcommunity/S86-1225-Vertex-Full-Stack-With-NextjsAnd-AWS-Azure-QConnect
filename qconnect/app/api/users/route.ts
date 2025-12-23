import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(req: Request) {
  try {
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

    return sendSuccess({ page, limit, total, data: items }, "Users fetched successfully");
  } catch (e: any) {
    console.error(e);
    return sendError("Failed to fetch users", ERROR_CODES.INTERNAL_ERROR, 500, e.message);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.email || !body.name) {
      return sendError("name and email required", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const user = await prisma.user.create({ data: { name: body.name, email: body.email, phone: body.phone, role: body.role } });
    return sendSuccess(user, "User created", 201);
  } catch (e: any) {
    console.error(e);
    return sendError("Internal server error", ERROR_CODES.INTERNAL_ERROR, 500, e.message);
  }
}
