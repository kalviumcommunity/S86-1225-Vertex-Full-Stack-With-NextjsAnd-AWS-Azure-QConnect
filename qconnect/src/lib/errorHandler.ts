import { NextResponse } from "next/server";
import { logger } from "./logger";

export function handleError(error: any, context = "") {
  const isProd = process.env.NODE_ENV === "production";

  const errorResponse: any = {
    success: false,
    message: isProd ? "Something went wrong. Please try again later." : error?.message || "Unknown error",
  };

  if (!isProd) {
    errorResponse.stack = error?.stack;
  }

  // Structured logging for observability; redact stack in prod
  logger.error(`Error in ${context}`, {
    message: error?.message,
    stack: isProd ? "REDACTED" : error?.stack,
    context,
  });

  return NextResponse.json(errorResponse, { status: 500 });
}
