# Input Validation with Zod - Implementation Guide

## Overview

QConnect implements **Zod** — a TypeScript-first schema validation library — to validate all incoming API requests. This ensures that POST and PUT requests receive valid, well-structured data, preventing bad inputs from corrupting the database or crashing your API.

By validating every input upfront, your API stops breaking silently and starts communicating clearly with detailed, structured error messages.

---

## 📋 Key Benefits

✅ **Type Safety** — Zod schemas are TypeScript-first, catching errors at dev time
✅ **Data Integrity** — Validates before writing to database
✅ **Consistent Error Messages** — Clear, structured validation feedback
✅ **Schema Reuse** — Share validation logic between client and server
✅ **Graceful Failures** — Structured error responses with field-level details

---

## 🔧 Installed & Configured

Zod is already installed in your project:

```bash
npm install zod
```

Check `package.json`:
```json
{
  "dependencies": {
    "zod": "^3.22.0"
  }
}
```

---

## 📁 Schema Files Location

All validation schemas are stored in: **`src/lib/schemas/`**

```
src/lib/schemas/
├── userSchema.ts          # User creation & updates
├── authSchema.ts          # Sign up & login validation
├── appointmentSchema.ts   # Appointment booking validation
├── doctorSchema.ts        # Doctor CRUD validation
├── queueSchema.ts         # Queue management validation
├── emailSchema.ts         # Email & contact form validation
└── fileSchema.ts          # File upload validation
```

---

## 🏗️ Creating Validation Schemas

### Example: User Schema

**File:** `src/lib/schemas/userSchema.ts`

```typescript
import { z } from "zod";
import { Role } from "@prisma/client";

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

export const userUpdateSchema = userCreateSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: "At least one field must be provided" }
);

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
```

### Key Patterns:

**String Validation:**
```typescript
z.string().min(2, "Error message").max(100).email().url()
```

**Number Validation:**
```typescript
z.number().positive().min(1).max(100)
```

**Enum Validation:**
```typescript
z.nativeEnum(Status)
```

**Optional Fields:**
```typescript
z.string().optional()
```

**Partial Updates:**
```typescript
z.object({...}).partial()
```

---

## 🚀 Applying Validation in API Routes

### Example: POST Endpoint with Validation

**File:** `app/api/users/route.ts`

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { userCreateSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    try {
      // Validate input against schema
      const data = userCreateSchema.parse(body);
      
      // Create user in database
      const user = await prisma.user.create({ data });
      
      return sendSuccess(user, "User created", 201);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return sendError(
          "Validation Error",
          ERROR_CODES.VALIDATION_ERROR,
          400,
          err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message
          }))
        );
      }
      throw err;
    }
  } catch (e: any) {
    return handleError(e, "POST /api/users");
  }
}
```

### Example: PATCH Endpoint with Validation

**File:** `app/api/users/[id]/route.ts`

```typescript
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    
    try {
      const data = userUpdateSchema.parse(body);
      const user = await prisma.user.update({ where: { id }, data });
      return sendSuccess(user, "User updated");
    } catch (err: any) {
      if (err instanceof ZodError) {
        return sendError(
          "Validation Error",
          ERROR_CODES.VALIDATION_ERROR,
          400,
          err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message
          }))
        );
      }
      throw err;
    }
  } catch (e: any) {
    return handleError(e, "PATCH /api/users/:id");
  }
}
```

---

## 🛠️ Validation Helper Utility

For consistency and reduced code duplication, use the validation helper:

**File:** `src/lib/validationHelper.ts`

```typescript
import { ZodSchema, ZodError } from "zod";
import { sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

/**
 * Validates request body and handles errors automatically
 */
export async function validateRequestBody(
  schema: ZodSchema,
  req: Request
): Promise<{ success: true; data: any } | { success: false; error: any }> {
  try {
    const body = await req.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: sendError(
          "Validation Error",
          ERROR_CODES.VALIDATION_ERROR,
          400,
          error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message
          }))
        )
      };
    }
    throw error;
  }
}
```

### Usage in API Route:

```typescript
export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(userCreateSchema, req);
    if (!validation.success) return validation.error;
    
    const { data } = validation;
    const user = await prisma.user.create({ data });
    return sendSuccess(user, "User created", 201);
  } catch (e: any) {
    return handleError(e, "POST /api/users");
  }
}
```

---

## 📋 All Validation Schemas

### 1. Authentication

**File:** `src/lib/schemas/authSchema.ts`

```typescript
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```

### 2. Users

**File:** `src/lib/schemas/userSchema.ts`

```typescript
export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

export const userUpdateSchema = userCreateSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: "At least one field must be provided" }
);
```

### 3. Doctors

**File:** `src/lib/schemas/doctorSchema.ts`

```typescript
export const doctorCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  specialty: z.string().min(2, "Specialty is required"),
  roomNo: z.string().min(1, "Room number is required"),
});

export const doctorUpdateSchema = doctorCreateSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: "At least one field must be provided" }
);
```

### 4. Appointments

**File:** `src/lib/schemas/appointmentSchema.ts`

```typescript
export const appointmentCreateSchema = z.object({
  queueId: z.number({ invalid_type_error: "queueId must be a number" }),
  userId: z.number({ invalid_type_error: "userId must be a number" }),
});

export const appointmentUpdateSchema = z.object({
  status: z.string().optional(),
  tokenNo: z.number().optional(),
});
```

### 5. Queues

**File:** `src/lib/schemas/queueSchema.ts`

```typescript
export const queueCreateSchema = z.object({
  doctorId: z.number({ invalid_type_error: "doctorId must be a number" }),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "date must be an ISO date string",
  }),
});

export const queueUpdateSchema = z.object({
  date: z.string().optional(),
  currentNo: z.number().optional(),
});
```

### 6. Email & Contact

**File:** `src/lib/schemas/emailSchema.ts`

```typescript
export const sendEmailSchema = z.object({
  to: z.string().email("Invalid recipient email address"),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(10000),
  html: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(5).max(5000),
});
```

### 7. Files

**File:** `src/lib/schemas/fileSchema.ts`

```typescript
export const fileCreateSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileURL: z.string().url("Invalid file URL"),
  size: z.number().positive().optional(),
  mime: z.string().optional(),
});
```

---

## 🧪 Testing Validation

### Passing Example ✅

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1-555-0100"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User created",
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1-555-0100",
    "role": "user",
    "createdAt": "2026-01-17T14:30:00.000Z"
  }
}
```

### Failing Example ❌

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "email": "not-an-email",
    "phone": null
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "E001",
    "details": [
      {
        "field": "name",
        "message": "Name must be at least 2 characters long"
      },
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

---

## 📊 Error Response Format

All validation errors follow this consistent structure:

```typescript
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "E001",  // ERROR_CODES.VALIDATION_ERROR
    "details": [
      {
        "field": "fieldName",
        "message": "Human-readable error message"
      }
    ]
  }
}
```

---

## 🔄 Schema Reuse Between Client and Server

A major benefit of Zod in a full-stack TypeScript app is **schema reuse**:

### Server-side (API Route):

```typescript
import { userCreateSchema, type UserCreateInput } from "@/lib/schemas/userSchema";

export async function POST(req: Request) {
  const data: UserCreateInput = userCreateSchema.parse(await req.json());
  // Create user...
}
```

### Client-side (Form Component):

```typescript
import { userCreateSchema, type UserCreateInput } from "@/lib/schemas/userSchema";

export function UserForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  async function handleSubmit(formData: UserCreateInput) {
    try {
      // Validate on client before sending
      const validated = userCreateSchema.parse(formData);
      
      // Send to server
      const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(validated),
      });
      
      const result = await res.json();
      if (!result.success) {
        // Display server-side validation errors
        const fieldErrors: Record<string, string> = {};
        result.error.details.forEach((err: any) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      }
    } catch (err) {
      // Handle local validation errors
      if (err instanceof ZodError) {
        setErrors(/* ... */);
      }
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      {errors.name && <span className="error">{errors.name}</span>}
      {/* ... */}
    </form>
  );
}
```

---

## 📈 Best Practices

### ✅ DO:

1. **Always validate input** — Never trust client data
2. **Reuse schemas** — Import from `src/lib/schemas/`
3. **Provide clear messages** — Help developers understand failures
4. **Use `.partial()`** — For optional PATCH requests
5. **Chain refinements** — Add custom logic with `.refine()`

### ❌ DON'T:

1. **Don't skip validation** — Even for "internal" APIs
2. **Don't duplicate schemas** — Import and reuse
3. **Don't leak sensitive details** — In error messages
4. **Don't use `any` types** — Use `z.infer` for TypeScript safety
5. **Don't mix validation libraries** — Stick with Zod

---

## 🔗 Why Validation Consistency Matters in Team Projects

### Problem Without Validation:
- Each developer validates differently
- Inconsistent error formats break frontend expectations
- Database gets corrupted with malformed data
- Debugging becomes a nightmare

### Solution With Zod:
- **Unified validation logic** — Shared schemas across the team
- **Predictable responses** — Clients know exactly what to expect
- **Type safety** — TypeScript catches mistakes early
- **Less bugs** — Validation before data touches the database
- **Better collaboration** — Clear contract between frontend & backend

### Real-world Example:

**Without Zod:** Different endpoints validate email differently
```
POST /api/users → Requires email, no format check
POST /api/doctors → Doesn't require email
POST /api/contact → Requires email, checks format
```

**With Zod:** Consistent validation everywhere
```
All POST endpoints → Import shared schema → Same validation rules
Endpoint behavior is predictable ✓
Database has consistent data ✓
```

---

## 📚 Validation Endpoints Overview

| Endpoint | Method | Schema | Validation |
|----------|--------|--------|-----------|
| `/api/users` | POST | `userCreateSchema` | Name (2+), Email, Phone (opt) |
| `/api/users/:id` | PATCH | `userUpdateSchema` | Partial fields required |
| `/api/auth/signup` | POST | `signupSchema` | Name, Email, Password (6+) |
| `/api/auth/login` | POST | `loginSchema` | Email, Password |
| `/api/doctors` | POST | `doctorCreateSchema` | Name, Specialty, Room # |
| `/api/doctors/:id` | PATCH | `doctorUpdateSchema` | Partial fields |
| `/api/queues` | POST | `queueCreateSchema` | Doctor ID, ISO Date |
| `/api/queues/:id` | PATCH | `queueUpdateSchema` | Optional fields |
| `/api/appointments` | POST | `appointmentCreateSchema` | Queue ID, User ID |
| `/api/appointments/:id` | PATCH | `appointmentUpdateSchema` | Optional status/token |
| `/api/email` | POST | `sendEmailSchema` | To, Subject, Message |
| `/api/contact` | POST | `contactSchema` | Name, Email, Message |
| `/api/files` | POST | `fileCreateSchema` | FileName, FileURL, MIME |

---

## 🔗 Related Documentation

- [Global API Response Handler](GLOBAL_API_RESPONSE_HANDLER.md)
- [Error Codes Reference](GLOBAL_API_RESPONSE_HANDLER.md#error-codes-dictionary)
- [Zod Official Docs](https://zod.dev)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## ✅ Deliverables Checklist

- [x] Zod installed and configured
- [x] Schema files created for all data types
- [x] All POST endpoints use validation
- [x] All PATCH/PUT endpoints use validation
- [x] Consistent error response format
- [x] Validation helper utility created
- [x] Schema reuse implemented
- [x] Error messages are clear and helpful
- [x] Documentation complete

---

**Pro Tip:** Zod turns "guessing" into "guaranteeing." By validating every input upfront, your app stops breaking silently — and starts communicating clearly.
