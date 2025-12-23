import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { doctorCreateSchema } from "@/lib/schemas/doctorSchema";
import { ZodError } from "zod";

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
    try {
      const data = doctorCreateSchema.parse(body);
      const doctor = await prisma.doctor.create({ data });
      return sendSuccess(doctor, "Doctor created", 201);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return sendError("Validation Error", ERROR_CODES.VALIDATION_ERROR, 400, err.errors.map((e) => ({ field: e.path.join("."), message: e.message })));
      }
      throw err;
    }
  } catch (e: any) {
    console.error(e);
    return sendError("Internal", ERROR_CODES.INTERNAL_ERROR, 500, e.message);
  }
}
