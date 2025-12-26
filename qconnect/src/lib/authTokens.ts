import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "./prisma";

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m"; // e.g., 15m
const REFRESH_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function signAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export async function createRefreshTokenForUser(userId: number) {
  const token = crypto.randomBytes(64).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  // Store hashed token in DB
  await prisma.refreshToken.create({ data: { tokenHash, userId, expiresAt } });

  return { token, expiresAt };
}

export async function consumeRefreshToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const rec = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!rec) return null;
  if (rec.expiresAt.getTime() < Date.now()) {
    // expired — delete and return null
    await prisma.refreshToken.delete({ where: { id: rec.id } });
    return null;
  }

  // Optionally rotate: delete the used token
  await prisma.refreshToken.delete({ where: { id: rec.id } });

  return rec.user;
}

export async function revokeUserRefreshTokens(userId: number) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

export function buildSetCookieString(name: string, value: string, opts?: { maxAge?: number; path?: string; httpOnly?: boolean; secure?: boolean; sameSite?: string }) {
  const parts: string[] = [];
  parts.push(`${name}=${value}`);
  parts.push(`Path=${opts?.path ?? '/'}`);
  if (opts?.maxAge) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts?.httpOnly) parts.push(`HttpOnly`);
  if (opts?.secure) parts.push(`Secure`);
  if (opts?.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  return parts.join('; ');
}