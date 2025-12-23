import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signupSchema } from "@/lib/schemas/authSchema";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    try {
      const data = signupSchema.parse(body);

      // Check if user exists
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) return sendError("User already exists", ERROR_CODES.VALIDATION_ERROR, 400);

      const hashed = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({ data: { name: data.name, email: data.email, password: hashed } });

      // return safe user object (omit password)
      const safe = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } });
      return sendSuccess(safe, "Signup successful", 201);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return sendError("Validation Error", ERROR_CODES.VALIDATION_ERROR, 400, err.errors.map((e) => ({ field: e.path.join("."), message: e.message })));
      }
      throw err;
    }
  } catch (e: any) {
    console.error(e);
    return sendError("Signup failed", ERROR_CODES.INTERNAL_ERROR, 500, e.message);
  }
}