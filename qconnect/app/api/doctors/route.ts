import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(req: Request) {
  try {
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

    return sendSuccess({ page, limit, total, data: items }, "Doctors fetched");
  } catch (e: any) {
    console.error(e);
    return sendError("Failed to fetch doctors", ERROR_CODES.INTERNAL_ERROR, 500, e.message);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.specialty || !body.roomNo) return sendError("missing fields", ERROR_CODES.VALIDATION_ERROR, 400);
    const doctor = await prisma.doctor.create({ data: { name: body.name, specialty: body.specialty, roomNo: body.roomNo } });
    return sendSuccess(doctor, "Doctor created", 201);
  } catch (e: any) {
    console.error(e);
    return sendError("Internal", ERROR_CODES.INTERNAL_ERROR, 500, e.message);
  }
}
