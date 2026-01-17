import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin
 * Admin-only route. Only users with admin role can access.
 *
 * Middleware ensures:
 * 1. JWT token is valid
 * 2. User role is "admin"
 * 3. User info is attached to headers (x-user-id, x-user-email, x-user-role)
 */
export async function GET(req: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");
    const userRole = req.headers.get("x-user-role");

    // This is a backup check (middleware should have already enforced this)
    if (userRole !== "admin") {
      return sendError(
        "Access denied. Admin role required.",
        ERROR_CODES.FORBIDDEN,
        403
      );
    }

    // Fetch admin statistics
    const totalUsers = await prisma.user.count();
    const totalDoctors = await prisma.doctor.count();
    const totalAppointments = await prisma.appointment.count();

    return sendSuccess(
      {
        message: "Welcome to Admin Dashboard!",
        admin: {
          id: userId,
          email: userEmail,
          role: userRole,
        },
        statistics: {
          totalUsers,
          totalDoctors,
          totalAppointments,
        },
        adminFeatures: [
          "View all users",
          "Manage user roles",
          "Delete users",
          "View system analytics",
          "Manage doctors",
          "View all appointments",
          "System monitoring",
        ],
      },
      "Admin access granted"
    );
  } catch (error) {
    console.error("Admin route error:", error);
    return sendError("Internal server error", ERROR_CODES.INTERNAL_ERROR, 500);
  }
}
