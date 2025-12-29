import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { userCreateSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
import { handleError } from "@/lib/errorHandler";
import redis from "@/lib/redis";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    // middleware adds these headers for authenticated requests
    const userEmail = req.headers.get("x-user-email");
    const userRole = req.headers.get("x-user-role") || "user";

    if (!userEmail) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401, "Missing authentication headers");
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 10)));
    const skip = (page - 1) * limit;
    const q = searchParams.get("q") || undefined;

    const where = q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined;

    const cacheKey = `users:list:${page}:${limit}:${q || ""}`;
    const ttl = Number(process.env.REDIS_TTL || 60); // seconds

    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.info("Cache Hit", { key: cacheKey });
      const payload = JSON.parse(cached);
      return sendSuccess({ ...payload, meta: { accessedBy: userEmail, role: userRole } }, "Users fetched successfully");
    }

    logger.info("Cache Miss - Fetching from DB", { key: cacheKey });
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } }),
      prisma.user.count({ where }),
    ]);

    const payload = { page, limit, total, data: items };
    // Cache the payload for TTL seconds
    try {
      await redis.set(cacheKey, JSON.stringify(payload), "EX", ttl);
    } catch (err) {
      logger.error("Failed to set users cache", { err, key: cacheKey });
    }

    // include who accessed and role for demonstration/testing
    return sendSuccess({ ...payload, meta: { accessedBy: userEmail, role: userRole } }, "Users fetched successfully");
  } catch (e: any) {
    return handleError(e, "GET /api/users");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    try {
      const data = userCreateSchema.parse(body);
      const { sanitizeInput } = await import("@/lib/sanitize");
      const clean = sanitizeInput(data);
      const user = await prisma.user.create({ data: clean });

      // Invalidate users list cache to avoid serving stale data
      try {
        const keys = await redis.keys("users:list*");
        if (keys.length) {
          await redis.del(...keys);
          logger.info("Invalidated users cache", { keys });
        }
      } catch (err) {
        logger.error("Failed to invalidate users cache", { err });
      }

      return sendSuccess(user, "User created", 201);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return sendError("Validation Error", ERROR_CODES.VALIDATION_ERROR, 400, err.errors.map((e) => ({ field: e.path.join("."), message: e.message })));
      }
      throw err;
    }
  } catch (e: any) {
    return handleError(e, "POST /api/users");
  }
}
