import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { queueCreateSchema } from "@/lib/schemas/queueSchema";
import { ZodError } from "zod";

export async function GET(req: Request) {
  try {
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

    return sendSuccess({ page, limit, total, data: items }, "Queues fetched");
  } catch (e: any) {
    console.error(e);
    return sendError("Failed to fetch queues", ERROR_CODES.INTERNAL_ERROR, 500, e.message);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    try {
      const data = queueCreateSchema.parse(body);
      const date = new Date(data.date);
      const q = await prisma.queue.create({ data: { doctorId: Number(data.doctorId), date } });
      return sendSuccess(q, "Queue created", 201);
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
