This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Database Migrations & Seeding ✅

This project uses Prisma for database schema migrations and reproducible seeding.

### Key commands

- Create & apply a migration (development):
  - npx prisma migrate dev --name init_schema
  - or: npm run migrate:dev

- Reset the database (drops, re-applies migrations, optional seed):
  - npx prisma migrate reset
  - or: npm run migrate:reset

- Seed the database (idempotent upserts):
  - npx prisma db seed
  - or: npm run db:seed
  - Seed script: `prisma/seed.ts` (uses `upsert` and `Role` enum — safe to re-run)

- Open Prisma Studio to inspect data:
  - npx prisma studio
  - or: npm run prisma:studio

### Notes & Best Practices ⚠️

- Idempotency: The seed script uses `upsert` so re-running won't create duplicates; it also updates key fields to keep data consistent.
- Rollback and Production Safety: Always backup production databases and test migrations in staging before applying them to production. Consider taking a DB snapshot or creating backups as part of your deployment pipeline.
- Logging: When you run migrations and seeds locally, capture terminal output or screenshots and attach them to the project README for traceability.

If you want, run the commands locally and paste the migration & seed logs here — I can add them to this README for documentation and verification.

---

## Transactions & Query Optimization 🔧

This project includes a small transaction demo and a set of indexes to improve query performance.

### What I added
- A transaction-safe appointment flow example in `src/lib/appointmentService.ts` that:
  - `bookAppointment` — creates an appointment and increments the queue's `currentNo` atomically using `prisma.$transaction()`
  - `bookAppointmentWithError` — demonstrates a failing transaction to show rollback behavior
- A demo script: `prisma/transactionDemo.ts` — runs example flows and prints before/after state and counts
- Schema indexes added for common query patterns:
  - `Doctor` — `@@index([specialty])`
  - `Queue` — `@@index([doctorId, date])`
  - `Appointment` — `@@index([userId])`, `@@index([status])`
  - A migration SQL file was added under `prisma/migrations/20251223120000_add_indexes/migration.sql` that creates these indexes

### How to run the demo locally
1. Apply the new migration (creates indexes):
   - npx prisma migrate dev --name add_indexes
   - or: npm run migrate:dev
2. Ensure seed data exists:
   - npx prisma db seed
   - or: npm run db:seed
3. Run the transaction demo (shows success + rollback):
   - npm run demo:transaction

The demo prints `queue.currentNo` and appointment counts before and after a successful booking and after a simulated failed booking (showing rollback).

---

## API Routes & Naming (app/api) 🧭

I added RESTful CRUD endpoints for the primary resources (users, doctors, queues, appointments) under `app/api`.

### Route hierarchy

- /api/users (GET paginated, POST create)
- /api/users/[id] (GET, PATCH, DELETE)
- /api/doctors (GET paginated, POST create)
- /api/doctors/[id] (GET, PATCH, DELETE)
- /api/queues (GET paginated, optional filter by doctorId, POST create)
- /api/queues/[id] (GET, PATCH, DELETE)
- /api/appointments (GET paginated + filters, POST creates appointment atomically)
- /api/appointments/[id] (GET, PATCH, DELETE)

### Pagination & filtering
- List endpoints accept `page` and `limit` query params. Example: `/api/users?page=2&limit=20`.
- `/api/users?q=alice` performs simple name/email search.
- `/api/queues?doctorId=1` filters queues by doctor.
- `/api/appointments?queueId=2&status=PENDING` filters appointments.

### Status codes & error handling
- 200 OK for successful GET/PATCH/DELETE (where applicable)
- 201 Created for POST
- 400 Bad Request for invalid inputs
- 404 Not Found when resource missing
- 500 Internal when unexpected errors occur

### Sample curl requests

- Get users (first page):
  - curl -s "http://localhost:3000/api/users?page=1&limit=10"
- Create user:
  - curl -X POST -H "Content-Type: application/json" -d '{"name":"Charlie","email":"charlie@example.com"}' http://localhost:3000/api/users
- Create appointment (atomic):
  - curl -X POST -H "Content-Type: application/json" -d '{"queueId":1,"userId":1}' http://localhost:3000/api/appointments
- Update a resource:
  - curl -X PATCH -H "Content-Type: application/json" -d '{"phone":"9999999999"}' http://localhost:3000/api/users/1

### Testing tips
- Use Postman or curl to test endpoints and verify proper status codes, JSON responses, pagination and error handling.
- For the appointment POST, the API uses a transaction: the appointment create + queue increment are atomic (see `src/lib/appointmentService.ts` and `prisma/transactionDemo.ts`).

If you'd like, I can also add an automated Postman collection file or example responses to the README — would you prefer a Postman collection export or simple curl examples (already included)?

---

## Unified API Response Format 🔁

All API endpoints follow a consistent response envelope to make frontend error handling and logging predictable.

Success response format:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": { "id": 12, "name": "Charlie" },
  "timestamp": "2025-10-30T10:00:00Z"
}
```

Error response format:

```json
{
  "success": false,
  "message": "Missing required field: name",
  "error": { "code": "E001", "details": "name is required" },
  "timestamp": "2025-10-30T10:00:00Z"
}
```

Utility files:
- `src/lib/responseHandler.ts` — `sendSuccess()` and `sendError()` helpers used across routes
- `src/lib/errorCodes.ts` — canonical error codes (e.g. `VALIDATION_ERROR: 'E001'`, `NOT_FOUND: 'E002'`)

Usage example in routes (already applied to `/api/users`, `/api/appointments`, etc.):

```ts
// example
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

if (!body.title) return sendError("Missing required field: title", ERROR_CODES.VALIDATION_ERROR, 400);
return sendSuccess(createdTask, "Task created", 201);
```

Why this helps:
- Improves DX: frontend sees the same shape for success and errors
- Observability: errors include machine-friendly codes and timestamps for tracing

---

### Enabling query logging & benchmarking
- Prisma (JS) query logs:
  - macOS / Linux: DEBUG="prisma:query" npm run dev
  - Windows (PowerShell): $env:DEBUG = "prisma:query"; npm run dev
- Use SQL `EXPLAIN` in your Postgres client (or tools like PgHero, AWS RDS Performance Insights) to benchmark before/after index changes.

---

## Input Validation with Zod ✅

This project uses Zod to validate incoming POST/PATCH requests. Install it locally:

- npm install zod

### Schemas
- `src/lib/schemas/userSchema.ts` — `userCreateSchema`, `userUpdateSchema`
- `src/lib/schemas/doctorSchema.ts` — `doctorCreateSchema`, `doctorUpdateSchema`
- `src/lib/schemas/queueSchema.ts` — `queueCreateSchema`, `queueUpdateSchema`
- `src/lib/schemas/appointmentSchema.ts` — `appointmentCreateSchema`, `appointmentUpdateSchema`

### Behavior
- All POST and PATCH endpoints validate input and return **Validation Error (E001)** with structured error details when validation fails.

### Example failing request
- curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"A","email":"bademail"}'

Expected response (400):

```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "E001",
    "details": [
      { "field": "name", "message": "Name must be at least 2 characters long" },
      { "field": "email", "message": "Invalid email address" }
    ]
  },
  "timestamp": "2025-12-23T12:00:00.000Z"
}
```

### Reuse
- Schemas are simple TypeScript-first objects and can be imported by client code for consistent client/server validation.

### Authentication (Signup / Login) 🔐

This project includes secure Signup and Login APIs that use `bcrypt` for hashing and `jsonwebtoken` (JWT) for token issuing and verification.

1) Install packages:
- npm install bcrypt jsonwebtoken

2) Routes added:
- POST /api/auth/signup — validate input, hash password with bcrypt, return safe user (no password)
- POST /api/auth/login — validate input, verify password, return JWT token and safe user
- GET /api/auth/me — protected endpoint, requires `Authorization: Bearer <token>` header

3) Environment
- Set `JWT_SECRET` in your environment for production. If not set, a default `supersecretkey` is used locally (do not use in production).

4) Example requests
- Signup:
  - curl -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com","password":"mypassword"}'
- Login:
  - curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"mypassword"}'
- Me (protected):
  - curl -X GET http://localhost:3000/api/auth/me -H "Authorization: Bearer <TOKEN>"

5) Notes & Reflection
- Passwords are hashed before storage. The new `password` column is nullable to support existing seed data; new signups will store hashed passwords.
- Tokens expire after 1 hour. For long-lived sessions, consider refresh tokens or rotating refresh tokens stored in secure HTTP-only cookies.
- Never store JWT secrets in repo; use environment variables and a secrets manager for production.

If you’d like, I can also add a small integration test suite or a Postman collection for these auth endpoints.
