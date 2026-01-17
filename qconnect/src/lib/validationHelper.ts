/**
 * Validation Utility Helper
 * Provides consistent error handling and validation for Zod schemas across API routes
 */

import { ZodSchema, ZodError } from "zod";
import { sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

/**
 * Validates incoming request data against a Zod schema
 * Returns validated data or sends error response
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or null if validation fails
 */
export function validateRequest<T>(
  schema: ZodSchema,
  data: unknown
): { success: true; data: T } | { success: false; error: any } {
  try {
    const validatedData = schema.parse(data) as T;
    return { success: true, data: validatedData };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Formats Zod errors into a consistent error response structure
 * 
 * @param error - ZodError instance
 * @returns Formatted error object with field and message
 */
export function formatZodErrors(error: ZodError) {
  return error.errors.map((e) => ({
    field: e.path.join(".") || "root",
    message: e.message,
    code: e.code,
  }));
}

/**
 * Handles validation errors and returns appropriate response
 * 
 * @param error - Error to handle
 * @returns Error response or null if not a validation error
 */
export function handleValidationError(error: unknown) {
  if (error instanceof ZodError) {
    return sendError(
      "Validation Error",
      ERROR_CODES.VALIDATION_ERROR,
      400,
      formatZodErrors(error)
    );
  }
  return null;
}

/**
 * Validates request body and handles errors
 * Usage:
 * const validation = await validateRequestBody(schema, req);
 * if (!validation.success) return validation.error;
 * const { data } = validation;
 */
export async function validateRequestBody(
  schema: ZodSchema,
  req: Request
): Promise<{ success: true; data: any } | { success: false; error: any }> {
  try {
    const body = await req.json();
    const result = validateRequest(schema, body);
    
    if (!result.success) {
      const error = handleValidationError(result.error);
      return { success: false, error };
    }
    
    return { success: true, data: result.data };
  } catch (err: any) {
    return {
      success: false,
      error: sendError(
        "Invalid JSON",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        "Request body must be valid JSON"
      ),
    };
  }
}
