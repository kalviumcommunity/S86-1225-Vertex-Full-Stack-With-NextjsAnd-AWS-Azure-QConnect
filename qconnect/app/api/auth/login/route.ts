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

      const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" });

      // Create refresh token and persist hashed version
      const { token: refreshToken, expiresAt } = await (await import("@/lib/authTokens")).createRefreshTokenForUser(user.id);

      const safe = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } });

      const res = new Response(JSON.stringify({ success: true, message: "Login successful", data: { user: safe } }), { status: 200, headers: { "Content-Type": "application/json" } });

      // Set http-only cookies: access token (short lived) & refresh token (long lived)
      const accessMaxAge = 15 * 60; // seconds
      const refreshMaxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

      res.headers.append("Set-Cookie", `token=${accessToken}; HttpOnly; Path=/; Max-Age=${accessMaxAge}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`);
      res.headers.append("Set-Cookie", `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${refreshMaxAge}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`);

      return res;
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