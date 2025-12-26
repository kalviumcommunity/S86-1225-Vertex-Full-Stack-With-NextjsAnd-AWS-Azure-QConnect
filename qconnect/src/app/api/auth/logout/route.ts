import { NextResponse } from "next/server";
import { revokeUserRefreshTokens } from "@/lib/authTokens";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/refreshToken=([^;]+)/);
    const token = match?.[1];
    if (!token) {
      // clear cookies anyway
      const res = NextResponse.json({ success: true, message: "Logged out" });
      res.headers.append("Set-Cookie", `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`);
      res.headers.append("Set-Cookie", `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`);
      return res;
    }

    // find the refresh token record to get userId
    const rec = await prisma.refreshToken.findUnique({ where: { tokenHash: require("crypto").createHash("sha256").update(token).digest("hex") } });
    if (rec) await revokeUserRefreshTokens(rec.userId);

    const res = NextResponse.json({ success: true, message: "Logged out" });
    res.headers.append("Set-Cookie", `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`);
    res.headers.append("Set-Cookie", `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`);
    return res;
  } catch (e: any) {
    console.error(e);
    return sendError("Logout failed", "E500", 500, e.message);
  }
}