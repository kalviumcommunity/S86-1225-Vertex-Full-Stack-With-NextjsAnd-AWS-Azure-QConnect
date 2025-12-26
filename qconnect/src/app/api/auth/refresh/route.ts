import { NextResponse } from "next/server";
import { consumeRefreshToken, signAccessToken, createRefreshTokenForUser } from "@/lib/authTokens";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/refreshToken=([^;]+)/);
    const token = match?.[1];
    if (!token) return sendError("Missing refresh token", "E401", 401);

    const user = await consumeRefreshToken(token);
    if (!user) return sendError("Invalid or expired refresh token", "E401", 401);

    // issue new access token and rotate refresh token
    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const { token: newRefreshToken, expiresAt } = await createRefreshTokenForUser(user.id);

    const accessMaxAge = 15 * 60; // 15 minutes in seconds
    const refreshMaxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

    const res = NextResponse.json({ success: true, message: "Refreshed", data: { user: { id: user.id, email: user.email, role: user.role } } });
    // Set cookies
    res.headers.append("Set-Cookie", `token=${accessToken}; HttpOnly; Path=/; Max-Age=${accessMaxAge}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`);
    res.headers.append("Set-Cookie", `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=${refreshMaxAge}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`);

    return res;
  } catch (e: any) {
    console.error(e);
    return sendError("Refresh failed", "E500", 500, e.message);
  }
}