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

  // API route protection with Role-Based Access Control (RBAC)
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users") || 
      pathname.startsWith("/api/doctors") || pathname.startsWith("/api/appointments")) {
    const authHeader = req.headers.get("authorization");
    const headerToken = authHeader?.split(" ")[1];
    const cookieToken = req.cookies.get("token")?.value;
    const token = headerToken || cookieToken;

    if (!token) {
      const res = NextResponse.json(
        { success: false, error: "Authorization token is missing", code: "UNAUTHORIZED" },
        { status: 401 }
      );
      addCorsHeaders(res, origin);
      addSecurityHeaders(res);
      return res;
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // Role-based access control (RBAC) for different routes
      // Admin routes: Only admin role
      if (pathname.startsWith("/api/admin")) {
        if (decoded.role !== "admin") {
          const res = NextResponse.json(
            { success: false, error: "Access denied. Admin role required.", code: "FORBIDDEN" },
            { status: 403 }
          );
          addCorsHeaders(res, origin);
          addSecurityHeaders(res);
          return res;
        }
      }
      
      // Users routes: Admin or self-access
      if (pathname.startsWith("/api/users")) {
        const isDeleteRoute = pathname.includes("/delete");
        const isPromoteRoute = pathname.includes("/promote");
        
        // Only admins can delete or promote users (principle of least privilege)
        if ((isDeleteRoute || isPromoteRoute) && decoded.role !== "admin") {
          const res = NextResponse.json(
            { success: false, error: "Access denied. Admin role required.", code: "FORBIDDEN" },
            { status: 403 }
          );
          addCorsHeaders(res, origin);
          addSecurityHeaders(res);
          return res;
        }
      }

      // Doctors routes: Authenticated users (any role)
      if (pathname.startsWith("/api/doctors")) {
        // Allow all authenticated users to view doctors
        // Restrict write operations to admins only
        if ((req.method === "POST" || req.method === "PUT" || req.method === "DELETE") && 
            decoded.role !== "admin") {
          const res = NextResponse.json(
            { success: false, error: "Access denied. Admin role required for this operation.", code: "FORBIDDEN" },
            { status: 403 }
          );
          addCorsHeaders(res, origin);
          addSecurityHeaders(res);
          return res;
        }
      }

      // Appointments routes: Authenticated users, with restrictions
      if (pathname.startsWith("/api/appointments")) {
        // Allow authenticated users to book appointments
        // Only admins can delete appointments
        if (req.method === "DELETE" && decoded.role !== "admin") {
          const res = NextResponse.json(
            { success: false, error: "Access denied. Admin role required to delete appointments.", code: "FORBIDDEN" },
            { status: 403 }
          );
          addCorsHeaders(res, origin);
          addSecurityHeaders(res);
          return res;
        }
      }

      // Attach user info to request headers for downstream handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", String(decoded.id));
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      const res = NextResponse.next({ request: { headers: requestHeaders } });
      addCorsHeaders(res, origin);
      addSecurityHeaders(res);
      return res;
    } catch (err: any) {
      // Handle different JWT errors
      let message = "Invalid or expired token";
      if (err.name === "TokenExpiredError") {
        message = "Authorization token has expired";
      } else if (err.name === "JsonWebTokenError") {
        message = "Invalid authorization token";
      }

      const res = NextResponse.json(
        { success: false, error: message, code: "UNAUTHORIZED" },
        { status: 401 }
      );
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
