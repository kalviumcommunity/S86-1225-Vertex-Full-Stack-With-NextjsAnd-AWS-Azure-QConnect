import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.split(" ")?.[1];
    if (!token) return sendError("Token missing", ERROR_CODES.VALIDATION_ERROR, 401);

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } });
      if (!user) return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
      return sendSuccess(user, "User fetched");
    } catch (err: any) {
      return sendError("Invalid or expired token", ERROR_CODES.VALIDATION_ERROR, 403, err.message);
    }
  } catch (e: any) {
    console.error(e);
    return sendError("Failed to fetch user", ERROR_CODES.INTERNAL_ERROR, 500, e.message);
  }
}