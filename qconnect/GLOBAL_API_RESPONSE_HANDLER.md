# Global API Response Handler - Implementation Guide

## Overview

The QConnect project implements a **Global API Response Handler** — a centralized utility that ensures every API endpoint returns responses in a consistent, structured, and predictable format.

This unified approach improves:
- **Developer Experience (DX)** — Predictable response structure
- **Error Debugging** — Standardized error codes and messages
- **Observability** — Easy integration with monitoring tools
- **Maintainability** — Consistent patterns across all endpoints

---

## 📋 Response Structure

### Success Response Format

Every successful API response follows this structure:

```json
{
  "success": true,
  "message": "Description of what was successful",
  "data": {
    // Response data here
  },
  "timestamp": "2026-01-17T14:30:00.000Z"
}
```

### Error Response Format

Every error response follows this structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  },
  "timestamp": "2026-01-17T14:30:00.000Z"
}
```

---

## 🔧 Implementation

### 1. Response Handler Utility

**File:** `src/lib/responseHandler.ts`

```typescript
import { NextResponse } from "next/server";

export const sendSuccess = (data: any, message = "Success", status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

export const sendError = (
  message = "Something went wrong",
  code = "INTERNAL_ERROR",
  status = 500,
  details?: any
) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: { code, details },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};
```

**Key Functions:**
- `sendSuccess(data, message, status)` — Returns success response
- `sendError(message, code, status, details)` — Returns error response

### 2. Error Codes Dictionary

**File:** `src/lib/errorCodes.ts`

```typescript
export const ERROR_CODES = {
  VALIDATION_ERROR: "E001",
  NOT_FOUND: "E002",
  DATABASE_FAILURE: "E003",
  INTERNAL_ERROR: "E500",
  UNAUTHORIZED: "E401",
};
```

**Benefits:**
- Consistent error code across team
- Easier to track errors in monitoring tools
- Enables programmatic error handling on frontend

---

## 💻 Usage Examples

### Example 1: GET Endpoint (Users List)

```typescript
// app/api/users/route.ts
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany();
    return sendSuccess(users, "Users fetched successfully", 200);
  } catch (error) {
    return sendError(
      "Failed to fetch users",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error.message
    );
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "timestamp": "2026-01-17T14:30:00.000Z"
}
```

### Example 2: POST Endpoint (Create Doctor)

```typescript
// app/api/doctors/route.ts
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.name) {
      return sendError(
        "Missing required field: name",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }
    
    const doctor = await prisma.doctor.create({ data: body });
    return sendSuccess(doctor, "Doctor created successfully", 201);
  } catch (error) {
    return sendError(
      "Failed to create doctor",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error.message
    );
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Doctor created successfully",
  "data": {
    "id": 5,
    "name": "Dr. Sarah Ahmed",
    "specialization": "Cardiology",
    "email": "sarah@hospital.com"
  },
  "timestamp": "2026-01-17T14:30:00.000Z"
}
```

**Error Response (Validation):**
```json
{
  "success": false,
  "message": "Missing required field: name",
  "error": {
    "code": "E001",
    "details": null
  },
  "timestamp": "2026-01-17T14:30:00.000Z"
}
```

### Example 3: GET by ID Endpoint

```typescript
// app/api/users/[id]/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      return sendError(
        "User not found",
        ERROR_CODES.NOT_FOUND,
        404
      );
    }
    
    return sendSuccess(user, "User retrieved successfully");
  } catch (error) {
    return sendError(
      "Failed to fetch user",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error.message
    );
  }
}
```

### Example 4: DELETE Endpoint with Authorization

```typescript
// app/api/users/[id]/route.ts
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userRole = req.headers.get("x-user-role");
    
    if (userRole !== "admin") {
      return sendError(
        "Unauthorized access",
        ERROR_CODES.UNAUTHORIZED,
        403
      );
    }
    
    const id = Number(params.id);
    await prisma.user.delete({ where: { id } });
    
    return sendSuccess(null, "User deleted successfully", 200);
  } catch (error) {
    return sendError(
      "Failed to delete user",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error.message
    );
  }
}
```

---

## 📊 HTTP Status Codes

The response handler uses appropriate HTTP status codes:

| Code | Meaning | Use Case |
|------|---------|----------|
| **200** | OK | Successful GET, PATCH, DELETE |
| **201** | Created | Successful POST (resource created) |
| **400** | Bad Request | Validation error, invalid input |
| **401** | Unauthorized | Missing/invalid authentication |
| **403** | Forbidden | Authenticated but no permission |
| **404** | Not Found | Resource doesn't exist |
| **500** | Internal Server Error | Unexpected server error |

---

## 🎯 Error Codes Reference

| Code | Value | Use Case |
|------|-------|----------|
| VALIDATION_ERROR | E001 | Invalid input, missing required fields |
| NOT_FOUND | E002 | Resource doesn't exist |
| DATABASE_FAILURE | E003 | Database operation failed |
| INTERNAL_ERROR | E500 | Unexpected server error |
| UNAUTHORIZED | E401 | Missing authentication or no permission |

---

## ✅ Implementation Verification

### Routes Using Global Handler ✓

The following routes consistently use the global response handler:

**Users API:**
- ✅ GET /api/users (list with pagination)
- ✅ POST /api/users (create user)
- ✅ GET /api/users/[id] (get specific user)
- ✅ PATCH /api/users/[id] (update user)
- ✅ DELETE /api/users/[id] (delete user)

**Doctors API:**
- ✅ GET /api/doctors (list with search)
- ✅ POST /api/doctors (create doctor)
- ✅ GET /api/doctors/[id] (get specific doctor)
- ✅ PATCH /api/doctors/[id] (update doctor)

**Appointments API:**
- ✅ GET /api/appointments (list with filtering)
- ✅ POST /api/appointments (create appointment)
- ✅ GET /api/appointments/[id] (get specific appointment)
- ✅ PATCH /api/appointments/[id] (update appointment)

**Authentication:**
- ✅ POST /api/auth/signup (register user)
- ✅ POST /api/auth/login (login user)
- ✅ GET /api/auth/me (get current user)

**18+ endpoints all returning unified response format** ✓

---

## 💡 Developer Experience Benefits

### 1. **Predictable Response Structure**
Frontend developers know exactly what shape every response will have:
```typescript
// Frontend can always expect this structure
if (response.success) {
  const data = response.data;  // Type-safe
} else {
  const errorCode = response.error.code;  // Programmatic error handling
}
```

### 2. **Simplified Error Handling**
All errors follow the same pattern:
```typescript
// Works for any endpoint
if (!response.success) {
  handleError(response.error.code);  // One handler for all errors
}
```

### 3. **Easy Debugging**
Every response includes:
- Timestamp for correlation
- Error code for logging
- Detailed message for developers
- Additional details for diagnostics

### 4. **Monitoring & Observability**
Consistent format enables:
- Easy integration with Sentry, Datadog, or similar
- Automated error tracking and alerting
- Performance metrics collection
- Standardized logs across all endpoints

### 5. **Consistent API Behavior**
All endpoints "speak the same language":
```typescript
// Same response format whether calling users, doctors, or appointments
const response = await fetch("/api/users");
const response2 = await fetch("/api/doctors");
// Both have same shape: { success, message, data/error, timestamp }
```

---

## 📚 Integration with Monitoring Tools

### With Sentry
```typescript
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    const data = await fetchData();
    return sendSuccess(data, "Success");
  } catch (error) {
    Sentry.captureException(error, {
      tags: { errorCode: ERROR_CODES.INTERNAL_ERROR }
    });
    return sendError("Error", ERROR_CODES.INTERNAL_ERROR, 500);
  }
}
```

### With Postman Monitors
The consistent response format makes it easy to set up Postman tests:
```javascript
// Postman test
pm.test("Response has success flag", function () {
  pm.expect(pm.response.json()).to.have.property("success");
});

pm.test("Response has timestamp", function () {
  pm.expect(pm.response.json()).to.have.property("timestamp");
});
```

---

## 🔐 Security Considerations

### Error Details
- **Production:** Include minimal details in error messages
- **Development:** Include full error stack for debugging
- Never expose sensitive information in error responses

Example:
```typescript
// Production-safe error handling
const details = process.env.NODE_ENV === "development" ? error.message : undefined;
return sendError("Database error", ERROR_CODES.DATABASE_FAILURE, 500, details);
```

---

## 📖 Usage in Frontend

### React Example
```typescript
// hooks/useApi.ts
async function fetchUsers() {
  const response = await fetch("/api/users");
  const json = await response.json();
  
  if (json.success) {
    setUsers(json.data);
  } else {
    handleError(json.error.code);  // Programmatic error handling
  }
}
```

### TypeScript Types
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: { code: string; details?: any };
  timestamp: string;
}

// Type-safe usage
const response: ApiResponse<User[]> = await fetch("/api/users").then(r => r.json());
```

---

## 🎯 Best Practices

### ✅ DO:
- Always use `sendSuccess` or `sendError` for responses
- Use appropriate HTTP status codes
- Include meaningful messages
- Add error codes for programmatic handling
- Include timestamps for debugging

### ❌ DON'T:
- Mix response formats across endpoints
- Return raw data without the envelope
- Use generic error messages
- Forget to handle errors with try/catch
- Expose sensitive information in error details

---

## 📊 Real-World Example: Complete API Endpoint

```typescript
// app/api/appointments/route.ts
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { appointmentCreateSchema } from "@/lib/schemas/appointmentSchema";

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = appointmentCreateSchema.parse(body);
    
    // Create appointment atomically (with transaction)
    const appointment = await prisma.$transaction(async (tx) => {
      const queue = await tx.queue.findUnique({
        where: { id: validatedData.queueId }
      });
      
      if (!queue) {
        return null;  // Will be handled below
      }
      
      const tokenNo = queue.currentNo + 1;
      const appt = await tx.appointment.create({
        data: {
          tokenNo,
          userId: validatedData.userId,
          queueId: validatedData.queueId,
          status: "PENDING"
        }
      });
      
      await tx.queue.update({
        where: { id: validatedData.queueId },
        data: { currentNo: { increment: 1 } }
      });
      
      return appt;
    });
    
    if (!appointment) {
      return sendError(
        "Queue not found",
        ERROR_CODES.NOT_FOUND,
        404
      );
    }
    
    return sendSuccess(
      appointment,
      "Appointment created successfully",
      201
    );
    
  } catch (error: any) {
    // Validation errors
    if (error.name === "ZodError") {
      return sendError(
        "Validation failed",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        error.errors
      );
    }
    
    // Database errors
    if (error.code === "P2025") {
      return sendError(
        "Record not found",
        ERROR_CODES.NOT_FOUND,
        404
      );
    }
    
    // Generic errors
    return sendError(
      "Failed to create appointment",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      process.env.NODE_ENV === "development" ? error.message : undefined
    );
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": 157,
    "tokenNo": 42,
    "status": "PENDING",
    "userId": 15,
    "queueId": 3,
    "createdAt": "2026-01-17T14:30:00.000Z"
  },
  "timestamp": "2026-01-17T14:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "E001",
    "details": [
      {
        "field": "userId",
        "message": "Invalid user ID"
      }
    ]
  },
  "timestamp": "2026-01-17T14:30:00.000Z"
}
```

---

## 🧪 Testing the Global Handler

### Jest Test Example
```typescript
import { sendSuccess, sendError } from "@/lib/responseHandler";

describe("Response Handler", () => {
  it("should return success response with correct structure", () => {
    const response = sendSuccess({ id: 1 }, "Created", 201);
    const json = response.json();
    
    expect(json).toHaveProperty("success", true);
    expect(json).toHaveProperty("message", "Created");
    expect(json).toHaveProperty("data");
    expect(json).toHaveProperty("timestamp");
  });
  
  it("should return error response with correct structure", () => {
    const response = sendError("Error", "E001", 400);
    const json = response.json();
    
    expect(json).toHaveProperty("success", false);
    expect(json.error).toHaveProperty("code", "E001");
    expect(json).toHaveProperty("timestamp");
  });
});
```

---

## 📈 Observability Example

### Logging with Timestamps
```typescript
logger.info("API Response", {
  endpoint: "/api/users",
  statusCode: 200,
  responseTime: Date.now() - startTime,
  success: true
});
```

### Error Tracking
```typescript
if (!response.success) {
  Sentry.captureMessage(response.message, {
    level: "error",
    tags: {
      errorCode: response.error.code,
      endpoint: "/api/users"
    }
  });
}
```

---

## 🎓 Pro Tips

1. **Keep Messages Clear** — Messages should be readable by frontend developers and users
2. **Use Error Codes** — Enable programmatic error handling on the client
3. **Include Timestamps** — Help with debugging and correlation
4. **Be Consistent** — Every endpoint must follow the same pattern
5. **Document APIs** — Help frontend team understand response structure

---

## Summary

The Global API Response Handler ensures that:

✅ Every endpoint returns a consistent, predictable format  
✅ Error handling is standardized and easy to implement  
✅ Monitoring and observability are built-in  
✅ Developer experience is improved across the team  
✅ Debugging and error tracking are simplified  
✅ Frontend integration is more reliable  

By centralizing response handling, you create an "API voice" — every endpoint speaks the same language, making your entire application more coherent and maintainable.

---

**Implementation Status:** ✅ Complete  
**Routes Using Handler:** 18+ endpoints  
**Error Codes Defined:** 5 codes  
**Last Updated:** January 17, 2026
