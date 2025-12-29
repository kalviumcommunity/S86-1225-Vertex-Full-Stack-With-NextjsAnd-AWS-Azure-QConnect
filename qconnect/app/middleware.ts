import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const isProduction = process.env.NODE_ENV === "production";
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:3000").split(",").map((s) => s.trim()).filter(Boolean);

function addSecurityHeaders(res: NextResponse) {
  if (isProduction || process.env.ENABLE_HSTS === "true") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=()");
  return res;
}

function addCorsHeaders(res: NextResponse, origin?: string) {
  if (origin && CORS_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin") || undefined;
  const forwardedProto = req.headers.get("x-forwarded-proto");

  // Enforce HTTPS in production when requested
  if ((isProduction || process.env.ENFORCE_HTTPS === "true") && (forwardedProto === "http" || req.nextUrl.protocol === "http:")) {
    const httpsUrl = new URL(req.url);
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl);
  }

  // Handle CORS preflight for API routes
  if (pathname.startsWith("/api")) {
    if (req.method === "OPTIONS") {
      const res = NextResponse.next();
      addCorsHeaders(res, origin);
      res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      res.headers.set("Access-Control-Max-Age", "86400");
      addSecurityHeaders(res);
      return res;
    }
  }

  // API route protection (accept token via Authorization header OR cookie)
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    const authHeader = req.headers.get("authorization");
    const headerToken = authHeader?.split(" ")[1];
    const cookieToken = req.cookies.get("token")?.value;
    const token = headerToken || cookieToken;

    if (!token) {
      const res = NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });
      addCorsHeaders(res, origin);
      addSecurityHeaders(res);
      return res;
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // Role-based access control for admin API
      if (pathname.startsWith("/api/admin") && decoded.role !== "admin") {
        const res = NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
        addCorsHeaders(res, origin);
        addSecurityHeaders(res);
        return res;
      }

      // Attach user info for downstream handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", String(decoded.id));
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      const res = NextResponse.next({ request: { headers: requestHeaders } });
      addCorsHeaders(res, origin);
      addSecurityHeaders(res);
      return res;
    } catch (err) {
      // Token invalid/expired — return 401 so clients can attempt refresh
      const res = NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
      addCorsHeaders(res, origin);
      addSecurityHeaders(res);
      return res;
    }
  }

  // Page-level protection: redirect to /login if not authenticated
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      const res = NextResponse.redirect(loginUrl);
      addSecurityHeaders(res);
      return res;
    }

    try {
      jwt.verify(token, JWT_SECRET);
      const res = NextResponse.next();
      addSecurityHeaders(res);
      return res;
    } catch {
      const loginUrl = new URL("/login", req.url);
      const res = NextResponse.redirect(loginUrl);
      addSecurityHeaders(res);
      return res;
    }
  }

  const res = NextResponse.next();
  addCorsHeaders(res, origin);
  addSecurityHeaders(res);
  return res;
}

// Limit middleware to these paths for performance
export const config = {
  matcher: ["/api/:path*", "/api/admin/:path*", "/api/users/:path*", "/dashboard/:path*", "/users/:path*"],
};
