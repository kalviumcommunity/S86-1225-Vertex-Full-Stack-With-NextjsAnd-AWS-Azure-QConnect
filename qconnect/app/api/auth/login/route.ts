import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginSchema } from "@/lib/schemas/authSchema";
import { ZodError } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    try {
      const data = loginSchema.parse(body);
      const user = await prisma.user.findUnique({ where: { email: data.email } });
      if (!user || !user.password) return sendError("User not found or no password set", ERROR_CODES.NOT_FOUND, 404);

      const valid = await bcrypt.compare(data.password, user.password);
      if (!valid) return sendError("Invalid credentials", ERROR_CODES.VALIDATION_ERROR, 401);

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

      const safe = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } });

      return sendSuccess({ token, user: safe }, "Login successful");
    } catch (err: any) {
      if (err instanceof ZodError) {
        return sendError("Validation Error", ERROR_CODES.VALIDATION_ERROR, 400, err.errors.map((e) => ({ field: e.path.join("."), message: e.message })));
      }
      throw err;
    }
  } catch (e: any) {
    console.error(e);
    return sendError("Login failed", ERROR_CODES.INTERNAL_ERROR, 500, e.message);
  }
}