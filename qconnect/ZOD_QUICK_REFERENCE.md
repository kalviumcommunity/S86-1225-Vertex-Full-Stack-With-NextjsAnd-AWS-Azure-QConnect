# Zod Validation Quick Reference

## 🚀 Quick Start

### 1. Import Schema in Your API Route
```typescript
import { userCreateSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
```

### 2. Validate & Handle Errors
```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    try {
      const data = userCreateSchema.parse(body);
      // Process validated data
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

---

## 📝 Common Schema Patterns

### String Fields
```typescript
z.string().min(2, "Too short").max(100, "Too long")
z.string().email("Invalid email")
z.string().url("Invalid URL")
z.string().optional()  // Optional field
z.string().nullable()  // Can be null
```

### Number Fields
```typescript
z.number().positive("Must be positive")
z.number().min(1).max(100)
z.number().optional()
```

### Date Fields
```typescript
z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
  message: "Must be valid ISO date"
})
```

### Enum Fields
```typescript
z.nativeEnum(Role)  // From Prisma enum
z.enum(["ACTIVE", "INACTIVE"])
```

### Partial Updates
```typescript
const updateSchema = createSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  { message: "At least one field required" }
);
```

### Arrays
```typescript
z.array(z.string())
z.array(z.number()).min(1)
```

---

## 🔍 Available Schemas

| Schema File | Export Names |
|-------------|--------------|
| `authSchema.ts` | `signupSchema`, `loginSchema` |
| `userSchema.ts` | `userCreateSchema`, `userUpdateSchema` |
| `doctorSchema.ts` | `doctorCreateSchema`, `doctorUpdateSchema` |
| `appointmentSchema.ts` | `appointmentCreateSchema`, `appointmentUpdateSchema` |
| `queueSchema.ts` | `queueCreateSchema`, `queueUpdateSchema` |
| `emailSchema.ts` | `sendEmailSchema`, `contactSchema` |
| `fileSchema.ts` | `fileCreateSchema` |

---

## 💾 Type Inference

Create types from schemas for type-safe code:

```typescript
import { userCreateSchema } from "@/lib/schemas/userSchema";

// Get TypeScript type from schema
type UserInput = z.infer<typeof userCreateSchema>;

// Use in functions
function createUser(data: UserInput) {
  // data is fully typed!
}
```

---

## ❌ Error Response Example

```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "E001",
    "details": [
      { "field": "email", "message": "Invalid email address" },
      { "field": "name", "message": "Name must be at least 2 characters long" }
    ]
  }
}
```

---

## 🧪 Testing Commands

### Valid Request ✅
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'
```

### Invalid Request ❌
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"A","email":"invalid"}'
```

---

## 📚 More Info

- [Complete Guide](INPUT_VALIDATION_ZOD.md)
- [Zod Docs](https://zod.dev)
- [Prisma Integration](https://www.prisma.io/docs/concepts/components/prisma-client/middleware/zod)

---

## ✅ Validation Checklist

- [ ] Schema exists for your data type
- [ ] Schema imported in API route
- [ ] `schema.parse(body)` called in try-catch
- [ ] `ZodError` handled in catch block
- [ ] Error response uses `ERROR_CODES.VALIDATION_ERROR`
- [ ] Error details mapped from `err.errors`
- [ ] Field paths use `e.path.join(".")`
- [ ] Test with both valid and invalid data

---

**Remember:** Validate early, fail clearly, communicate well! 🚀
