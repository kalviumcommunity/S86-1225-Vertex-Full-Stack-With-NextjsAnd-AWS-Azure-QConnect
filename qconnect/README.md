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

## Unit Testing (Jest + React Testing Library) ✅

Unit and component tests are configured with Jest + React Testing Library (RTL). The repository includes a minimal setup and a couple of sample tests to get you started.

Quick overview:

- Dev dependencies to install (examples):
  - jest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, ts-jest, @types/jest, jest-environment-jsdom
- Scripts in `package.json`:
  - `npm test` — run Jest
  - `npm run test:coverage` — run tests with coverage report
  - `npm run test:watch` — watch mode

Files added to this repo:

- `jest.config.js` — Next-aware Jest config (uses `next/jest`) with a global 80% coverage threshold
- `jest.setup.ts` — imports `@testing-library/jest-dom`
- `__tests__/sum.test.ts` — small unit test for `src/lib/sum.ts`
- `src/components/ui/__tests__/Button.test.tsx` — component test that verifies the existing `Button` component
- `.github/workflows/test.yml` — CI job that runs tests + coverage on push/PR and fails on unmet coverage thresholds

How to run locally:

1. Install dev dependencies (if not already installed):

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest jest-environment-jsdom
```

2. Run tests:

```bash
npm test
# or
npm run test:coverage
```

If coverage thresholds (80%) are not met, Jest will fail the run; the CI workflow enforces the same command for PRs and pushes.

Notes & next steps:
- Add more tests under `src/` as you grow the codebase (unit + integration). Consider MSW for network mocking and Playwright/Cypress for end-to-end tests.

### Integration tests for API routes

We recommend writing integration tests that call your App Router `route.ts` handlers directly. These tests should:

- Mock external dependencies (Prisma, Redis, email clients, etc.) with Jest mocks
- Construct a `Request` (e.g., `new Request('http://localhost/api/contact', {...})`) and call the exported handler (e.g., `await POST(req)`)
- Assert on the returned `Response` / JSON payload and status codes

Example files added to this repo:
- `__tests__/api/contact.test.ts` — integration tests that call `src/app/api/contact/route.ts` and mock `sendEmail`
- `__tests__/api/users.test.ts` — integration tests that mock `prisma` and `redis` and verify authorization and caching behavior

Run integration tests the same as unit tests (they live under `__tests__`):

```bash
npm test
# or filter only api tests
npx jest "__tests__/api"
```

- Option: add a dedicated `test:integration` script if you want to run them separately.

---

## Database Migrations and Seeding ✅

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

## Cloud Database Configuration (RDS / Azure Database for PostgreSQL) ☁️🐘

This project supports connecting to a managed PostgreSQL database (AWS RDS, Azure Database for PostgreSQL, Heroku Postgres, etc.). Below are recommended steps and sample configuration for provisioning, securing, and connecting your cloud DB.

### Provisioning quick-start
- AWS RDS (Postgres):
  1. Console → RDS → Create database → Select PostgreSQL.
  2. Choose instance size (Free tier / Dev / Prod), set DB identifier, admin username and password.
  3. Configure VPC & subnet group; for quick testing you can enable Public access but **only** temporarily.
  4. Add your client/server IP to the security group's inbound rules (Postgres / TCP 5432).
  5. Wait for the DB endpoint to be available.

- Azure Database for PostgreSQL:
  1. Portal → Create a resource → Databases → Azure Database for PostgreSQL.
  2. Choose single server, set admin login, password and compute tier.
  3. In Networking, add your client/IP or allow public access for testing (prefer private endpoints in production).
  4. Wait for the server to finish provisioning.

### Environment (example `.env.local`)
- Store credentials securely (never commit to Git):

DATABASE_URL=postgresql://admin:YourStrongPassword@your-db-endpoint:5432/nextjsdb
# Optional: set PG_SSL=true when connecting to cloud DBs that require SSL
PG_SSL=true

Notes:
- For Prisma to work it expects `DATABASE_URL` to be set (see `prisma/schema.prisma` which uses `env("DATABASE_URL")`).
- For many cloud DBs you must enable SSL; set `PG_SSL=true` and the helper script will use SSL (with `rejectUnauthorized: false` by default for convenience/testing).

### Network & Security
- In production use private access (VPC peering, private endpoint, or security group allowlist) instead of public access.
- Rotate admin and app credentials periodically; use a secrets manager (AWS Secrets Manager, Azure Key Vault) for production.
- Consider using connection pooling (PgBouncer) for serverless or high-concurrency deployments to avoid connection exhaustion.

### Backups & Maintenance
- Enable automated backups (RDS snapshot retention, Azure backup policy) and set a retention period that fits your recovery goals.
- Configure maintenance windows for patching. For high availability, consider a Multi-AZ deployment or read replicas.

### Quick verification & testing
- Use the provided helper script to verify connectivity from the same environment where your app runs:

  - Set `DATABASE_URL` then run:
    - npm run check:db

- From your machine or a DB client:
  - psql -h your-db-endpoint -U admin -d nextjsdb

### Notes & troubleshooting
- If you see connection errors, verify the DB endpoint, port (5432), VPC/security group/firewall rules, and credentials.
- If SSL is required: include `?sslmode=require` in the `DATABASE_URL` or set `PG_SSL=true` for the helper script.

### Reflection
- Public access simplifies testing but is risky for production — always prefer private networking & strict firewall rules.
- Use automated backups & monitoring to detect and respond to failures quickly.
- For horizontal scaling and high throughput, evaluate read replicas and connection pooling solutions.


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

## API Docs & Architecture 📚

This repository includes interactive API docs and a high-level architecture overview to help contributors and integrators onboard quickly.

- **Swagger UI (OpenAPI)** — Static Swagger UI is available at `/docs` and loads the OpenAPI JSON at `/api-docs/openapi.json` (subset of endpoints and schemas). Use it to explore request/response examples and try endpoints against your local or deployed server.

- **Postman collection** — A minimal Postman collection is available at `docs/postman_collection.json` for quick import into Postman (variable `base_url` provided).

- **Architecture doc** — See `ARCHITECTURE.md` for a system overview, directory layout, data flow, deployment architecture, CI/CD notes, and maintenance guidance.

- **Version & last update** — API docs version: `1.0.0`. Last updated: 2026-01-05.

How to use locally:

1. Start your app (`npm run dev`) and visit: `http://localhost:3000/docs`
2. Import `docs/postman_collection.json` into Postman and set `base_url` to `http://localhost:3000`.

How to update docs:
- Edit `public/api-docs/openapi.json` (or regenerate it from JSDoc / a generator), then commit the changes.
- Update `docs/postman_collection.json` and `ARCHITECTURE.md` to reflect new endpoints or architectural changes.

---


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
- POST /api/auth/login — validate input, verify password, set **HttpOnly** cookies (`token` short-lived, `refreshToken` long-lived) and return safe user (no token in body)
- POST /api/auth/refresh — swap a valid refresh token (from HttpOnly cookie) for a new access token (set via cookie) and rotate refresh tokens
- POST /api/auth/logout — clears cookies and revokes refresh tokens
- GET /api/auth/me — protected endpoint; if you use client fetches with `credentials: 'same-origin'` the access token cookie will be sent automatically

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
- This project implements **access + refresh tokens**:
  - Access token: short-lived (default 15m, controlled by `ACCESS_TOKEN_EXPIRES`), set as an **HttpOnly** cookie named `token`.
  - Refresh token: long-lived (default 7 days, controlled by `REFRESH_TOKEN_DAYS`), generated server-side and stored hashed in the DB in the `RefreshToken` model; the raw token is set as an **HttpOnly** cookie named `refreshToken` and rotated on use.
- On protected API calls, clients automatically send the `token` cookie (use `fetch(..., { credentials: 'same-origin' })`). If a request receives 401, client code attempts `POST /api/auth/refresh` to rotate refresh and obtain a new access token (handled automatically by `src/lib/fetcher.ts`).
- Security choices:
  - **HttpOnly** cookies + **SameSite=Strict** reduce XSS and CSRF risks.
  - Refresh tokens are stored hashed (not plain) and rotated/deleted on use to reduce replay risk.
- Never store JWT secrets in repo; use environment variables and a secrets manager for production.

Migration note: After pulling these changes you must run `npx prisma migrate dev` to add the `RefreshToken` table to your database.

If you’d like, I can also add a small integration test suite or a Postman collection for these auth endpoints.

---

## Cloud Secret Management (AWS Secrets Manager) 🔐

**Overview:** For production, store sensitive environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`) in **AWS Secrets Manager** rather than keeping them in `.env` files. Secrets Manager encrypts secrets at rest and supports IAM-based, least-privilege access and automatic rotation.

**Create a secret:**
- Console: Secrets Manager → Store a new secret → Other type of secret → add JSON key/value pairs (e.g., `{"DATABASE_URL":"postgresql://...","JWT_SECRET":"..."}`)
- Name it (example): `nextjs/app-secrets` and note the **ARN**.

**Grant least-privilege access:**
- Create an IAM Role for ECS tasks with `secretsmanager:GetSecretValue` on the secret ARN.

**Retrieval (server-side):**
- This repo includes `src/lib/secrets.ts` which will fetch the secret when `SECRET_ARN` and `AWS_REGION` env vars are set. Locally it falls back to `process.env` for `DATABASE_URL` / `JWT_SECRET`.
- Install the AWS Secrets Manager client:

```bash
npm install @aws-sdk/client-secrets-manager
```

**Validate:**
- Use the API route `GET /api/secrets` to confirm keys are visible (the route returns secret keys only, not values).

```bash
# Locally (uses process.env when SECRET_ARN not set):
curl -s http://localhost:3000/api/secrets | jq

# In prod with SECRET_ARN set in task / environment, call the same endpoint and ensure keys appear
curl -s https://<your-app-url>/api/secrets | jq
```

**Rotation & policy:**
- Use Secrets Manager rotation with a Lambda for DB credentials or rotate keys monthly/quarterly depending on sensitivity.
- Document rotation ownership and timeline in this README.

---

## Container Deployment (AWS ECS - Fargate) 🚀

**Docker:** A multi-stage `Dockerfile` is included to produce a small production image (see `Dockerfile`). `.dockerignore` excludes `.env` and build artifacts.

**ECR:** Create an ECR repository (e.g., `nextjs-app`) and push the image. The provided GitHub Actions workflow (`.github/workflows/deploy-ecs.yml`) builds the image, pushes to ECR and updates your ECS service.

**ECS Task & Service (recommended starter settings):**
- CPU: 256 (0.25 vCPU)
- Memory: 512 MB
- Port: 3000
- Health check: HTTP GET / (use ALB health checks or container health checks)
- Auto-scaling: scale 1 → 3 tasks by CPU or request-based metrics

**Injecting secrets into task definition (ECS / Fargate):**
You can map Secrets Manager keys directly into container env vars in the task definition's `secrets` field.

Example (snippet of container definition):

```json
"secrets": [
  {
    "name": "DATABASE_URL",
    "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:nextjs/app-secrets:jsonkey:DATABASE_URL::"
  },
  {
    "name": "JWT_SECRET",
    "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:nextjs/app-secrets:jsonkey:JWT_SECRET::"
  }
]
```

**GitHub Actions / CI:**
- Add these Secrets to your GitHub repo: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `ECR_REPO`, `ECS_CLUSTER`, `ECS_SERVICE`.
- This repository now includes a comprehensive CI workflow at `.github/workflows/ci.yml` which runs **Lint → Test → Build → Deploy (placeholder)** on push and pull requests for `main` and `develop` branches.

**CI workflow highlights**
- Lint: runs `npm run lint` (ESLint) to check code style and quality
- Test: runs `npm test -- --coverage` (Jest + RTL). Coverage thresholds are enforced in `jest.config.js` (80% global)
- Build: runs `npm run build` to ensure the Next.js app compiles
- Deploy: placeholder step runs only on `main` (replace with actual deploy commands or integrate with `deploy-ecs.yml` provided in this repo)

**Docker Build & Push (ECR)**

This repo includes a dedicated workflow to build a Docker image and push it to Amazon ECR:

- Workflow path: `.github/workflows/docker-build-push.yml`
- What it does:
  - Checks out code and configures AWS credentials from GitHub Secrets
  - Logs into ECR and builds the Docker image with `docker/build-push-action`
  - Tags the image with the git SHA and `latest`, then pushes both tags to your ECR repo
- Required GitHub Secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `ECR_REPO` (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com/your-repo`)

**How it triggers**
- Runs on push to `main` and can be triggered manually via the `workflow_dispatch` event.
- The pushed image tags are `${ECR_REPO}:${GITHUB_SHA}` and `${ECR_REPO}:latest`.

**Integration with ECS deployment**
- The repo already contains `.github/workflows/deploy-ecs.yml` which registers task definitions and updates the ECS service. You can either run that workflow directly or have this workflow trigger it once the image is pushed (for example via a repository_dispatch or by updating task definitions).

**Optimization & Safety**
- Caching: the build workflow uses inline cache and the registry as a cache source to speed rebuilds
- Concurrency: the workflow cancels in-progress runs on the same ref to avoid overlapping deploys
- Secrets: Do NOT hardcode secrets in workflows. Use GitHub Secrets and reference them as `${{ secrets.YOUR_SECRET }}`.

**Validation & Monitoring**
- After a push, open GitHub → Actions → Docker Build & Push to inspect the build and push logs.
- Confirm your image appears in ECR (AWS Console → ECR → Repositories → <your-repo> → Images).

**Next steps / Recommendations**
- Optionally trigger `deploy-ecs.yml` after a successful image push to automate full deploys (use repository dispatch or call the ECS deploy job from this workflow).
- Add an image digest or tag metadata into your release notes or CI artifacts for traceability.

**Example quick test (local)**
```bash
# Build locally
docker build -t <ECR_REPO>:local-test .
# Push (after authenticating with AWS/ECR)
# docker push <ECR_REPO>:local-test
```

**Reflections**
- Automating Docker builds in CI reduces manual steps and keeps production images reproducible.
- Using the registry and inline caching improves incremental rebuild speeds and reduces CI time.


**Validation:**
- After a push, go to GitHub → Actions → CI Pipeline and inspect the run. A successful run shows green checks for each step and a coverage report in the logs.

**Reflections / Tips:**
- Consider splitting long-running stages (e.g., e2e tests) into separate jobs or workflows and using artifacts to pass build outputs between jobs.
- Once CI is stable, add a coverage badge to the README and require the workflow to pass for protected branches.

**Next steps (Optional):**
- Replace the Deploy placeholder with actual deployment steps (AWS CLI / ECS deploy or Azure Web App), or trigger `deploy-ecs.yml` from this workflow via a repository dispatch.
- Add parallel jobs for lint and tests to reduce CI runtime.

---

## GitHub Actions CI/CD Pipeline 🚀 (Week 3)

This project includes a comprehensive **GitHub Actions CI/CD pipeline** that automates code quality checks, testing, building, and deployment. Every push or pull request triggers an automated workflow to validate that code meets standards before merging.

### Quick Links
- **Detailed CI/CD Guide**: See [CI_CD_PIPELINE.md](CI_CD_PIPELINE.md) for comprehensive documentation
- **Workflow File**: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- **Test Reports**: After push/PR, view results in **GitHub → Actions → CI Pipeline**

### Pipeline Overview

The CI/CD pipeline executes **4 main stages** in sequence, with quality gates at each step:

```
Push/PR → Lint ✅ → (Test + Build + Integration Tests in parallel) → Deploy (main only) ✅
```

#### Stage 1: LINT 🔍
- **Purpose**: Validate code style and syntax
- **Checks**:
  - ESLint: code style consistency
  - TypeScript: type safety verification
- **Failure**: Blocks entire pipeline if lint fails
- **Duration**: ~30-45 seconds

**Run locally**:
```bash
npm run lint           # Run ESLint
npm run type-check    # Run TypeScript check
```

#### Stage 2: TEST ✅
- **Purpose**: Run unit tests and verify coverage
- **Coverage Requirements**: 80%+ global coverage (lines, branches, functions, statements)
- **Tests Included**:
  - Unit tests (80+ tests for utilities, logger, monitoring)
  - API integration tests (email, contact, users endpoints)
- **Artifacts**: Coverage reports uploaded to Codecov
- **Duration**: ~20-30 seconds

**Run locally**:
```bash
npm test                          # Run all tests
npm test -- --coverage           # Run with coverage report
npm test -- __tests__/api        # Run only API tests
```

#### Stage 3: BUILD 🏗️
- **Purpose**: Verify Next.js production build succeeds
- **Checks**:
  - TypeScript compilation
  - All imports resolve correctly
  - No syntax errors
  - API routes validate
  - Next.js optimization passes
- **Artifacts**: Built `.next/` directory stored for 30 days
- **Duration**: ~45-60 seconds

**Run locally**:
```bash
npm run build    # Build for production
```

#### Stage 4: DEPLOY 🚀 (main branch only)
- **Purpose**: Deploy to production after all checks pass
- **When**: Only on push to `main` branch (not on PRs)
- **Prerequisites**: All previous stages must pass
- **Steps**:
  1. Verify build was successful
  2. Run deployment steps (placeholder, configure for AWS/Azure)
  3. Health checks
  4. Generate deployment summary
- **Duration**: ~30-45 seconds

### Workflow Triggers

The pipeline automatically triggers in these scenarios:

```yaml
on:
  push:
    branches: [main, develop]      # On commits to main/develop
  pull_request:
    branches: [main, develop]      # On PR creation/updates
  workflow_dispatch:               # Manual trigger via GitHub UI
```

#### Scenario Examples

**1. Feature Development** (on feature branch)
```bash
git push origin feature/new-api
# → GitHub detects PR against main/develop
# → Pipeline runs automatically
# → Results shown in PR checks
# → Must pass before merge
```

**2. Code Merge** (push to main)
```bash
git merge feature/new-api          # Creates local merge
git push origin main               # Push to main
# → Pipeline runs Lint → Test → Build → Deploy
# → Deploy stage activates (only on main)
# → Auto-deployment to production
```

**3. Manual Trigger**
- Go to **GitHub → Actions → CI Pipeline**
- Click **Run workflow**
- Select branch and click **Run**

### Adding GitHub Secrets

The pipeline can use secrets for credentials (AWS, Azure, Slack, etc.):

**Add a Secret**:
1. Go to **Repository Settings → Secrets and Variables → Actions**
2. Click **New repository secret**
3. Enter:
   ```
   Name: AWS_ACCESS_KEY_ID
   Value: AKIAIOSFODNN7EXAMPLE
   ```
4. Click **Add secret**

**Required Secrets** (if deploying to AWS):
| Secret | Usage | Example |
|--------|-------|---------|
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS authentication | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS authentication | `wJalr...` |
| `AWS_BUCKET_NAME` | S3 bucket | `my-app-bucket` |
| `SLACK_WEBHOOK` | Slack notifications | `https://hooks.slack.com/...` |

### Monitoring Pipeline Runs

**View Pipeline Results**:
1. Go to **GitHub → Actions** tab
2. Select **CI Pipeline**
3. Click a workflow run
4. View logs for each job

**Understanding Status**:
- ✅ **Green checkmark**: Job passed
- ❌ **Red X**: Job failed
- 🟡 **Yellow circle**: Job in progress
- ⊘ **Dash**: Job skipped (condition not met)

**View Step Details**:
- Click on a job name
- Expand any step to see logs
- Search logs for errors

**Example**: Debug a test failure
```
Actions → CI Pipeline → [Run ID] → test → npm test
→ See which test failed
→ Fix locally: npm test -- failing.test.ts
→ Commit and push again
```

### Caching Strategy

The pipeline uses **npm caching** to speed up installs:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'    # Caches node_modules
```

**Benefits**:
- ⚡ **50-70% faster** npm installs
- 💾 **Reduces bandwidth** usage
- 🔒 **Ensures consistency** across runs

**Cache hits**: Automatic when `package-lock.json` hasn't changed

### Adding a Coverage Badge

Display coverage status in your README:

```markdown
![CI Pipeline](https://github.com/YOUR-ORG/YOUR-REPO/actions/workflows/ci.yml/badge.svg)
```

Result: Shows a green "passing" or red "failing" badge

### Configuring Branch Protection

Enforce CI passing before merge:

1. Go to **Settings → Branches**
2. Click **Add rule** under Branch protection rules
3. Select `main` as branch pattern
4. Check:
   - ✅ "Require status checks to pass before merging"
   - ✅ "Require branches to be up to date before merging"
5. Select status checks:
   - ✅ lint
   - ✅ test
   - ✅ build
6. Click **Create** / **Update**

**Effect**: PRs cannot merge until pipeline passes

### Performance Statistics

**Current Pipeline Performance**:

| Stage | Duration | Node Cache | Dependencies |
|-------|----------|-----------|--------------|
| Lint | ~30-45s | — | Already installed |
| Test | ~20-30s | ✅ Cache hit | Test runs only |
| Build | ~45-60s | ✅ Cache hit | Next.js compile |
| Deploy | ~30-45s | — | Custom steps |
| **Total** | **~2-3 minutes** | ✅ Optimized | Parallel jobs |

**Optimization Tips**:
- ✅ Caching reduces install time significantly
- ✅ Parallel jobs (test, build run together) save ~30-45s
- ✅ Integration tests run in separate optional job
- ✅ Deploy only on main branch (saves time on feature branches)

### Common Workflow Patterns

**Pattern 1: Feature Development**
```bash
# Local
git checkout -b feature/user-auth
# ... code changes ...
npm run lint && npm test && npm run build   # Test locally first!

# Push
git push origin feature/user-auth

# GitHub
# → Create PR
# → Pipeline runs automatically
# → View results in PR checks
# → Address any failures
# → Merge when all checks pass
```

**Pattern 2: Hotfix to Production**
```bash
# Local
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug
# ... urgent fix ...
npm run lint && npm test

# Push & merge
git push origin hotfix/critical-bug
# → Create PR with "HOTFIX:" prefix
# → Get fast review
# → Merge to main
# → Deploy stage automatically runs
# → Fix live in production
```

**Pattern 3: Bulk Dependency Updates**
```bash
# Local
npm update
npm audit fix
npm run lint && npm test   # Verify no breaking changes!

# Push
git push origin deps/security-update
# → Pipeline validates all updates
# → Coverage must stay >= 80%
# → Build must succeed
# → Only then can merge
```

### Troubleshooting Pipeline Issues

**Problem: ESLint Fails**
```
ERROR: code ESLINTFAILURE
```

**Solution**:
```bash
# Fix locally
npm run lint -- --fix
git add .
git commit -m "style: fix linting issues"
git push
```

---

**Problem: Coverage Below Threshold**
```
ERROR: Coverage threshold not met: 80%
```

**Solution**:
```bash
# Check coverage locally
npm test -- --coverage

# Write more tests to reach 80%
# Update or create test files

# Verify locally before pushing
npm test -- --coverage
```

---

**Problem: Build Fails with "Command not found"**
```
ERROR: npm ERR! code ENOENT: command not found
```

**Solution**:
```bash
# Verify npm scripts in package.json
npm run build    # Test locally first!

# Check for missing dependencies
npm install

# Rebuild and test
npm run build
```

---

**Problem: Deployment Doesn't Trigger**
```
Deploy step skipped: condition not met
```

**Check**:
- ✅ Pushed to `main` branch (not `develop`)
- ✅ Used `git push` (not merged PR)
- ✅ All previous stages passed (check workflow logs)

---

**Problem: Secrets Not Found**
```
ERROR: ${{ secrets.AWS_REGION }} is not defined
```

**Solution**:
1. Go to **Settings → Secrets and Variables → Actions**
2. Verify secret name matches exactly
3. Use default if optional:
   ```yaml
   AWS_REGION: ${{ secrets.AWS_REGION || 'us-east-1' }}
   ```

---

### Next Steps

✅ **Immediate**:
1. Review [CI_CD_PIPELINE.md](CI_CD_PIPELINE.md) for detailed documentation
2. Monitor pipeline runs: **GitHub → Actions → CI Pipeline**
3. Add repository secrets if deploying to AWS/Azure

✅ **Short Term**:
1. Configure branch protection rules (require status checks)
2. Add coverage badge to README
3. Test with a feature branch PR

✅ **Long Term**:
1. Integrate deployment steps (AWS ECS, Azure, Vercel)
2. Add Slack notifications for failures
3. Implement E2E test stage
4. Monitor performance metrics

---

## Domain & SSL (Route 53 + ACM) 🔒

**Overview:** Configure a custom domain via **Route 53** and secure traffic with an **AWS Certificate Manager (ACM)** public certificate. Attach the certificate to your Load Balancer (ALB) or CloudFront distribution so users access your app over HTTPS.

**Register or connect a domain:**
- If you own a domain, change its nameservers to the ones provided by Route 53 (Hosted Zone → NS records). If not, register via Route 53 or your registrar.

**Create a Hosted Zone:**
1. Route 53 → Hosted Zones → Create Hosted Zone → enter `example.com`.
2. Copy NS records and update your registrar to point to Route 53 nameservers.

**Request a public certificate (ACM) with DNS validation:**
- ACM → Request certificate → Public certificate → add `example.com` and `*.example.com` → DNS validation.
- ACM will provide a CNAME validation record; create it in Route 53 (Record type: CNAME) and wait for the status to change to **Issued**.

**Attach certificate to your ALB / CloudFront:**
- ALB: Create / Edit listener on port 443, select the ACM certificate, and ensure you have an HTTP → HTTPS redirect rule on port 80 that redirects to 443 (HTTP 301 or 302).
- CloudFront: Configure the distribution to use the ACM certificate (in us-east-1 for CloudFront) and point origin to your ALB or ECS service endpoint.

**Route 53 records (example):**
- Root A record (Alias) → points to ALB DNS name (choose Alias yes)
- `www` CNAME → `example.com`

**Force HTTPS & HSTS:**
- At the ALB level: Add a listener rule to redirect HTTP (80) → HTTPS (443).
- Application-level: Set `ENFORCE_HTTPS=true` and consider enabling `ENABLE_HSTS=true` in your task env to add HSTS headers (the middleware already sets Strict-Transport-Security when `ENABLE_HSTS` is true or in production).

**Validation checklist:**
- [ ] DNS A/ALIAS records point to load balancer and have propagated (use `dig`/`nslookup`).
- [ ] ACM certificate status is **Issued**.
- [ ] ALB listener on 443 uses the ACM certificate and health checks pass.
- [ ] Visiting https://example.com shows the padlock 🔒 and the browser Security tab shows a valid certificate.
- [ ] Run SSL checks: https://www.ssllabs.com/ssltest/ (score A+ recommended)

**Automation & renewal:**
- ACM public certificates are provisioned and renewed automatically when validated via DNS (no manual renewal step required).

**Notes & troubleshooting:**
- If using CloudFront, request the certificate in `us-east-1` and use DNS validation there.
- If the certificate stays in **Pending validation**, ensure the CNAME validation record exists in the correct Route 53 hosted zone and that TTLs have expired.
- For staging vs production, use subdomains (e.g., `staging.example.com`) and separate certificates or wildcard certificates.

**Screenshot checklist to add to README:**
- Route 53 Hosted Zone record set (show NS / A records)
- ACM certificate status (`Issued`)
- Browser showing HTTPS padlock for `https://example.com`


## Logging & Monitoring (AWS CloudWatch) 📈

**Goals:** Emit structured JSON logs with correlation IDs, collect container logs in CloudWatch Logs, create metric filters for error rates, and configure dashboards and alerts for operational visibility.

### Structured logs (JSON)
- Use a consistent schema: `timestamp`, `level`, `message`, `requestId` (correlation id), and additional metadata (userId, path, statusCode).
- This repo includes `src/lib/logger.ts` which prints JSON logs ready for CloudWatch ingestion. Example log:

```json
{"timestamp":"2025-12-30T10:00:00.000Z","level":"error","message":"Failed to process request","requestId":"1670000000000","userId":123}
```

### ECS task definition: send logs to CloudWatch Logs
Add a `logConfiguration` to the container definition in your task definition so that each container sends stdout/stderr to CloudWatch:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nextjs-app",
    "awslogs-region": "ap-south-1",
    "awslogs-stream-prefix": "ecs"
  }
}
```

Create the log group (or let ECS create it automatically):

```bash
aws logs create-log-group --log-group-name /ecs/nextjs-app --region ap-south-1
aws logs put-retention-policy --log-group-name /ecs/nextjs-app --retention-in-days 14 --region ap-south-1
```

### Metric filter & alarm (example: count error logs)
Create a metric filter to count logs where `level` is `error`:

```bash
aws logs put-metric-filter \
  --log-group-name "/ecs/nextjs-app" \
  --filter-name "ErrorCount" \
  --filter-pattern '{ $.level = "error" }' \
  --metric-transformations metricName=ErrorCount,metricNamespace=NextJSApp,metricValue=1

# Create an alarm on that metric (example: >10 errors in 5 minutes)
aws cloudwatch put-metric-alarm \
  --alarm-name "NextJS-High-Errors" \
  --metric-name ErrorCount \
  --namespace NextJSApp \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions <SNS_TOPIC_ARN>
```

### Logs Insights query example (trace errors by hour)

```
fields @timestamp, @message
| parse @message /"level":\s*"(?<level>[^\"]+)"/
| filter level = "error"
| stats count() by bin(1h)
```

### Dashboards & alerts
- Build a CloudWatch Dashboard showing: ErrorCount (metric), Average response latency, Container CPU/Memory usage.
- Configure alerts to notify via SNS (email/Slack webhook) when thresholds are crossed.

### Retention & archival
- Keep operational logs for 7–14 days and audit logs longer (90+ days) depending on compliance needs.
- Archive logs to S3 for long-term storage using a Lambda or Lifecycle export if needed.

### Validation checklist
- [ ] CloudWatch Log Group `/ecs/nextjs-app` exists and receives logs.
- [ ] Metric filter `ErrorCount` is created and shows non-zero data when errors occur.
- [ ] Dashboard shows relevant metrics and alarms are configured to notify the on-call channel.


### Notes
- Use structured logs — they make metric extraction and searching far more reliable.
- Correlate application logs with X-Ray traces or request metrics for full-stack observability.


### Example: Refresh flow (curl)
1) Login (sets cookies):

```bash
curl -i -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"demo-user@example.com","password":"demo"}'
```

2) Trigger protected API (using cookie set by login):

```bash
curl -i -X GET http://localhost:3000/api/users -b "cookie.txt"
```

3) If access token expired (401), call refresh to obtain new access token (cookies are rotated automatically):

```bash
curl -i -X POST http://localhost:3000/api/auth/refresh -b "cookie.txt" -c "cookie.txt"
```

4) Logout (clears cookies and revokes refresh tokens):

```bash
curl -i -X POST http://localhost:3000/api/auth/logout -b "cookie.txt"
```


---

## Authorization Middleware & RBAC (Role-Based Access Control) 🔐

This project includes a reusable middleware (`app/middleware.ts`) that validates JWTs and enforces role-based access for API routes.

### Behavior
- The middleware runs for `/api/users/*` and `/api/admin/*` (configured via `matcher`).
- It expects `Authorization: Bearer <token>` header and verifies the token using `JWT_SECRET`.
- On success the middleware adds `x-user-email` and `x-user-role` headers for downstream handlers.
- Access rules:
  - `/api/users` — any authenticated user can access (general protected route)
  - `/api/admin` — restricted to users with `role === "admin"` (admin-only)

### Example: Protected Admin Route
- Request (admin):
  - curl -X GET http://localhost:3000/api/admin \
    -H "Authorization: Bearer <ADMIN_JWT>"
- Successful response (200):
  - { "success": true, "message": "Welcome Admin! You have full access." }

- Request (regular user):
  - curl -X GET http://localhost:3000/api/admin \
    -H "Authorization: Bearer <USER_JWT>"
- Response (403):
  - { "success": false, "message": "Access denied" }

### Example: General Protected Route `/api/users`
- Request without token:
  - curl -X GET http://localhost:3000/api/users
- Response (401):
  - { "success": false, "message": "Token missing" }

- Request with valid token:
  - curl -X GET http://localhost:3000/api/users \
    -H "Authorization: Bearer <USER_JWT>"
- Response (200): contains paginated users and a `meta` object that shows who accessed and the role.

### Notes & Reflection
- Principle of least privilege: only routes that need elevated permissions are restricted to the `admin` role; ordinary routes require authentication only.
- Extensibility: Add new roles (e.g., `editor`, `moderator`) in the database and extend middleware checks (or use a role->permission map) to manage fine-grained permissions.
- Testing: Use the `/api/auth/login` route to obtain tokens for users with different roles and exercise the protected endpoints.

---

## Centralized Error Handling & Structured Logging 🛠️

This project includes a small, reusable error handling utility (`src/lib/errorHandler.ts`) and a structured logger (`src/lib/logger.ts`) to centralize error classification, logging and safe user responses.

### logger (src/lib/logger.ts)
- Lightweight structured logger that outputs JSON lines for `info` and `error`.
- Example usage:

```ts
import { logger } from "@/lib/logger";
logger.error("DB failed", { message: err.message, stack: err.stack });
```

### handleError (src/lib/errorHandler.ts)
- Call `handleError(error, context)` from route catch blocks for consistent logging and user-friendly messages.
- Behavior:
  - In **development** (`NODE_ENV !== 'production'`): response includes `message` and `stack`.
  - In **production**: response message is redacted to `"Something went wrong. Please try again later."` and the stack is logged as `"REDACTED"`.

### Example usage in a route
```ts
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    throw new Error("Database connection failed!");
  } catch (error) {
    return handleError(error, "GET /api/users");
  }
}
```

### Example logs
- Development console (detailed):
```json
{"level":"error","message":"Error in GET /api/users","meta":{"message":"Database connection failed!","stack":"Error: Database connection failed! at ..."},"timestamp":"2025-10-29T16:45:00Z"}
```
- Production console (redacted):
```json
{"level":"error","message":"Error in GET /api/users","meta":{"message":"Database connection failed!","stack":"REDACTED"},"timestamp":"2025-10-29T16:45:00Z"}
```

### Why this helps
- **Consistency**: All unhandled errors follow a single format and route for logging.
- **Security**: Stack traces are redacted in production responses to avoid leaking internals.
- **Observability**: JSON logs are easy to ship to CloudWatch, Datadog, ELK, etc.

---

If you want, I can also add a comparison table for dev vs prod output, or wire the logger to `pino`/`winston` for more advanced features. Let me know which you'd prefer.

---

## Redis Caching (Cache-Aside Pattern) ⚡

This project includes a simple Redis integration to cache frequently-read API responses and reduce database load.

### Setup
- Install the client:
  - `npm install ioredis`
- Environment variable:
  - `REDIS_URL` — e.g. `redis://localhost:6379`
  - Optional TTL:
    - `REDIS_TTL` (seconds, default `60`)
- Client utility: `src/lib/redis.ts` exports a connected redis client.

### Strategy
- We use **cache-aside** (lazy loading): check cache first; on miss, query DB and populate Redis with a TTL.
- Cache keys for users list use parameters: `users:list:<page>:<limit>:<q>` to support pagination & search.

### Example: `GET /api/users` (simplified)
```ts
const cacheKey = `users:list:${page}:${limit}:${q || ""}`;
const cached = await redis.get(cacheKey);
if (cached) return sendSuccess(JSON.parse(cached));
// otherwise fetch from DB
await redis.set(cacheKey, JSON.stringify(payload), "EX", ttl);
```

### Invalidation
- On user create/update/delete, delete keys matching `users:list*` to avoid stale results:
```ts
const keys = await redis.keys("users:list*");
if (keys.length) await redis.del(...keys);
```

### Example logs & behavior
- Cold request (cache miss):
  - `Cache Miss - Fetching from DB` → DB query → cache the result (TTL 60s)
- Subsequent request (cache hit):
  - `Cache Hit` → returned from Redis (much faster)

### Notes & Reflection
- TTL balances freshness vs performance; set shorter TTL for rapidly-changing data.
- Invalidation must be performed on writes to keep cache coherent. For large-scale systems, consider more robust patterns (pub/sub invalidation, cache versioning, or fine-grained keys).
- For production use, consider a managed Redis service and enable monitoring (latency, hit/miss rate).

---

## Security Headers — HTTPS, HSTS, CSP & CORS 🔐

This project enforces important security headers and provides middleware to help you enforce HTTPS, HSTS, Content Security Policy (CSP), and CORS for API routes.

### What was added
- **Global headers** (via `next.config.ts`): `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and **Strict-Transport-Security** (HSTS) when running in production or when `ENABLE_HSTS=true`.
- **Middleware (`app/middleware.ts`)**:
  - Optional HTTPS enforcement/redirect when `NODE_ENV=production` or `ENFORCE_HTTPS=true`.
  - Adds HSTS and other security headers to all responses (in production).
  - Handles CORS for `/api/*` routes, including `OPTIONS` preflight handling and dynamic `Access-Control-Allow-Origin` based on `CORS_ORIGINS` environment variable.

### Configuration (env)
- `ENFORCE_HTTPS` — set to `true` to redirect HTTP → HTTPS in non-production testing environments.
- `ENABLE_HSTS` — set to `true` to add HSTS header even during testing.
- `CSP_DIRECTIVES` — overrides the CSP header (default: `default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';`).
- `CORS_ORIGINS` — comma-separated list of allowed origins for API access (default: `http://localhost:3000`).

### How to test locally
- Start dev server: `npm run dev`.
- Example curl to inspect headers on a page:
  - curl -I http://localhost:3000/
- Example curl to test CORS preflight (replace origin):
  - curl -i -X OPTIONS http://localhost:3000/api/users -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST"
- In the browser: open DevTools → Network → click a request → check the **Response headers** for `Content-Security-Policy`, `Strict-Transport-Security`, `Access-Control-Allow-Origin`, etc.

### Security scan recommendations
- Use https://securityheaders.com/ or https://observatory.mozilla.org/ to scan your deployed domain.
- Test changes in staging before making CSP stricter in production — strict CSPs can break third-party integrations (analytics, fonts).

### Notes & Future improvements
- If deploying behind a proxy or CDN (e.g., Vercel, CloudFront), ensure the `x-forwarded-proto` header is set so the middleware can detect secure requests.
- Consider adding a CSP report-uri to collect CSP violations and iteratively tighten policies.
- Consider adding automated CI checks (e.g., a simple curl-based header check) to fail builds if headers are missing.

---

## File Uploads (AWS S3 / Azure Blob) 🗂️

This project implements pre-signed URL uploads so clients can upload files directly to cloud storage without streaming large files through the app server.

### Packages
- AWS: `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- Azure: `@azure/storage-blob`

Install:
- `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @azure/storage-blob`

### Environment variables
- Storage selection (optional):
  - `STORAGE_PROVIDER` — `aws` (default) or `azure`

- AWS (if using AWS):
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `AWS_BUCKET_NAME`

- Azure (if using Azure):
  - `AZURE_ACCOUNT_NAME`
  - `AZURE_ACCOUNT_KEY`
  - `AZURE_CONTAINER_NAME`

- Common:
  - `UPLOAD_URL_EXPIRES` — seconds the presigned URL is valid (default `60`)
  - `MAX_UPLOAD_SIZE` — maximum upload size in bytes (default `10000000` = 10MB)
  - `FILE_UPLOAD_PREFIX` — optional path prefix inside the bucket/container (default `uploads`)

### Flow
1. Client requests a pre-signed URL from `POST /api/upload` with `{ filename, fileType, size }`.
2. Server validates file type/size and returns a pre-signed `uploadURL` (method: PUT) and a `publicUrl` where the object will be available (subject to bucket/container ACLs).
3. Client uploads directly to the storage provider using the `uploadURL`.
4. After successful upload, client calls `POST /api/files` with `{ fileName, fileURL, size, mime }` to persist metadata in the DB.

### Example: request presigned URL
```bash
curl -s -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"filename":"profile.png","fileType":"image/png","size":43212}'
```
Response (success):
```json
{ "success": true, "upload": { "uploadURL": "https://...", "key":"uploads/...,", "publicUrl":"https://...", "method":"PUT", "expiresIn":60 } }
```

### Example: store file metadata
```bash
curl -s -X POST http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -d '{"fileName":"profile.png","fileURL":"https://...","size":43212,"mime":"image/png" }'
```
Response:
```json
{ "success": true, "message": "File record created", "data": { /* new file record */ } }
```

### IAM / SAS snippets & best practices

AWS (minimal S3 policy for uploading/reading objects in a single bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": ["arn:aws:s3:::your-bucket-name/*"]
    }
  ]
}
```

Azure (SAS token permissions example):

- Generate a SAS token with `Write` and `Create` permissions scoped to a single container and a short expiry time.

Security best practices:

- **Block public access** on the bucket/container for private apps.
- Use short expirations for presigned URLs (30–120s) and narrow permissions for SAS tokens.
- Store cloud credentials in a secrets manager (AWS Secrets Manager, Azure Key Vault) and never commit them to source control.

### Security & lifecycle
- Validate file types and sizes server-side as a last line of defense.
- Use short expiry for presigned URLs (30–120s recommended).
- Apply appropriate bucket/container ACLs: use private by default and return signed access URLs to clients if necessary.
- Configure lifecycle policies to archive or delete old files to control cost.

### Local test UI & verification

- Install the necessary SDK packages locally if you plan to run AWS/Azure code: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @azure/storage-blob`.
- Start dev server: `npm run dev` and visit `/upload-demo` to test the end-to-end flow in the browser.
- After uploading, verify the file is available (if public or your bucket allows) with the helper script:
  - `npm run verify:upload https://your-bucket.s3.region.amazonaws.com/.../file.jpg`

---

## Transactional Email (AWS SES / SendGrid) ✉️

This project includes a small email utility (`src/lib/email.ts`) that supports **AWS SES** and **SendGrid**. Use `EMAIL_PROVIDER` env var to choose the provider (`ses` by default).

### Packages
- AWS: `@aws-sdk/client-ses`
- SendGrid: `@sendgrid/mail`

Install:
- `npm install @aws-sdk/client-ses` or `npm install @sendgrid/mail`

### Environment variables
- Common:
  - `EMAIL_PROVIDER` — `ses` or `sendgrid` (default `ses`)

- AWS SES:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `SES_EMAIL_SENDER` — verified sender (e.g., `no-reply@yourdomain.com`)

- SendGrid:
  - `SENDGRID_API_KEY`
  - `SENDGRID_SENDER` — verified sender email

### Usage
- Route: `POST /api/email` accepts `{ to, subject, message }` and returns provider-specific success info.

Example:
```bash
curl -s -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{"to":"student@example.com","subject":"Welcome!","message":"<h3>Hello from QConnect 🚀</h3>"}'
```
Success response (SES):
```json
{ "success": true, "provider": "ses", "messageId": "01010189b2example123" }
```

### Template example
- `src/lib/templates/emailTemplates.ts` exposes `welcomeTemplate(userName)`.
- Use it like:
```ts
import { welcomeTemplate } from "@/lib/templates/emailTemplates";
import { sendEmail } from "@/lib/email";

await sendEmail({ to: user.email, subject: "Welcome to QConnect", html: welcomeTemplate(user.name) });
```

---

## Page routing & dynamic pages (App Router)

This project uses the Next.js App Router under `src/app` and includes public and protected pages plus dynamic user pages.

### Routes overview
- Public:
  - `/` — home (existing `src/app/page.tsx`)
  - `/login` — login page (client)
- Protected (middleware redirects to `/login` if unauthenticated):
  - `/dashboard` — protected dashboard
  - `/users` — protected users list (server-rendered)
  - `/users/[id]` — dynamic user profile
- Custom 404: `src/app/not-found.tsx`

### Component architecture & Layout
- Components are organized under `src/components`:
  - `src/components/layout` — `Header`, `Sidebar`, `LayoutWrapper`
  - `src/components/ui` — reusable UI elements like `Button`
  - `src/components/index.ts` — barrel export for easy imports

- The global layout (`src/app/layout.tsx`) now uses `LayoutWrapper` so every page gets the shared header and sidebar automatically.

### Key snippets
- Middleware handles both API and page protection. For pages it checks cookie `token` and redirects to `/login` if missing or invalid.

- Example client login (sets cookie):
```ts
// src/app/login/page.tsx (client)
// submits to /api/auth/login, sets cookie `token`, then router.push('/dashboard')
```

- Example protected server page (users list):
```ts
// src/app/users/page.tsx
const users = await prisma.user.findMany({ select: { id, name, email } });
```

### How to test
1. Start dev server: `npm run dev`
2. Visit `/login` and sign in with seeded user (e.g., `demo-user@example.com`) or create one via the signup endpoint.
3. After successful login you'll be redirected to `/dashboard` and can visit `/users` and `/users/1`.

### Reflection
- Dynamic routes (`[id]`) make it easy to scale resource pages (users, appointments).
- Middleware centralizes page protection and keeps UI code simple.
- Use server-rendered pages for SEO-sensitive content and to avoid exposing internal APIs to the client.

---

## Component Architecture & Reusable UI 🧩

A small component library was added under `src/components` to encourage reusability and consistent UI across pages.

### Folder structure
- `src/components/layout` — `Header.tsx`, `Sidebar.tsx`, `LayoutWrapper.tsx` (LayoutWrapper composes Header + Sidebar)
- `src/components/ui` — `Button.tsx` (reusable UI element)
- `src/components/index.ts` — barrel export for convenience

### Header
- Accessible header with role="banner" and nav label. Use `<Link>` from `next/link` for navigation.

### Sidebar
- Sidebar exposes contextual navigation and uses semantic `aside` with `role="navigation"`.

### LayoutWrapper
- Composes `Header` + `Sidebar` and provides page content area. Pages are rendered inside the layout wrapper so they inherit the shared navigation and spacing.

### Button (ui)
- Small, accessible button component with `primary` and `secondary` variants and an optional `ariaLabel` prop.

### Accessibility & Best Practices
- Use semantic elements (`header`, `nav`, `aside`, `main`) and `aria-*` attributes where appropriate.
- Keep interactive components keyboard accessible and provide visible focus styles (use CSS).

### Example usage
```tsx
import { LayoutWrapper, Button } from '@/components';

export default function Page() {
  return (
    <LayoutWrapper>
      <h1>Page</h1>
      <Button label="Create" />
    </LayoutWrapper>
  );
}
```

---

## Loading & Error States (Skeletons & Error Boundaries) ⏳❌

To make the app resilient and communicative during async operations, the project includes route-level loading skeletons and error fallback UIs using Next.js App Router conventions.

### What I added
- `src/components/ui/Skeleton.tsx` — small skeleton helper component using `animate-pulse`.
- Route-level fallbacks:
  - `src/app/loading.tsx` — global loading skeleton for top-level navigation.
  - `src/app/error.tsx` — global error boundary with retry button.
  - `src/app/users/loading.tsx` & `src/app/users/error.tsx` — route-specific skeleton & retry-friendly error UI.
  - `src/app/users/[id]/loading.tsx` & `src/app/users/[id]/error.tsx` — per-user loading & error fallbacks.

### How to simulate states
- Slow fetch: set `SLOW_FETCH_MS` env var (number of milliseconds) to simulate network delay for server pages. Example:

  - In development run: `SLOW_FETCH_MS=2000 npm run dev`
  - Or set it in your `.env` file for a persistent delay.

- Error testing: you can throw an error inside a page for testing (e.g., `if (!data) throw new Error('Failed')`) or use browser/Network tab to throttle and disconnect.

### UX decisions
- Skeletons give users a sense of content structure rather than an ambiguous spinner.
- Error fallbacks include a prominent retry button (`reset()`), which re-renders the route and attempts to fetch again.

---

## Responsive & Themed Design (Tailwind) 🎨📱


## Feedback UI: Toasts, Modals & Loaders 🔔🛑⏳

This project includes a small set of accessible feedback components to improve user confidence and UX:

- **Toasts (instant feedback)** — implemented with `sonner`. A global `<Toaster />` is mounted in `src/app/layout.tsx` so you can call `toastSuccess()`, `toastError()` or `toastLoading()` from anywhere via `src/lib/toast.ts`.
- **Confirm Modal (blocking confirmation)** — a promise-based confirmation dialog implemented via `src/context/ModalContext.tsx` and rendered by `src/components/ui/ConfirmModal.tsx`. Use `const { confirm } = useModal()` and `await confirm({ title, description })` to prompt the user.
- **Spinner / Loader (process feedback)** — `src/components/ui/Spinner.tsx` provides a small SVG spinner used in buttons and list items while asynchronous operations run.

Accessibility and behavior:
- Toasts are announced politely via the underlying library and disappear automatically.
- The confirm modal uses `role="dialog"`, `aria-modal="true"`, focus trapping (Tab) and closes on `Escape`.
- Loaders include `role="status"` where appropriate and are non-blocking unless placed inside a blocking modal.

Where used in the demo:
- `src/components/users/AddUser.tsx` — shows a spinner in the button during creation and shows success/error toasts.
- `src/components/users/UsersSWRList.tsx` — delete actions prompt the confirm modal, show a spinner while deleting and display success/error toasts.
- `src/app/contact/page.tsx` & `src/app/signup/page.tsx` — submission flows use loading spinners and toasts to indicate progress and result.

How to enable locally:
1. Install the toast dependency: `npm install` (we added `sonner` to `package.json`, run `npm install` locally if you haven't yet).
2. Start dev server: `npm run dev` and visit the pages mentioned above.

Design notes:
- Keep toasts succinct (2–4 words for success), and avoid stacking too many toasts.
- Modals should be used for destructive or irreversible actions only (deletion, approvals).
- Use loaders for any operation that takes a noticeable time (file uploads, long API calls). This improves perceived performance.

---

## Context & Hooks (Auth + UI State) 🧭

This project adds a small, demo-ready global state solution using React Context and custom hooks:

Structure:
- `src/context/AuthContext.tsx` — `AuthProvider` + `useAuthContext()` (stores a `user` object and exposes `login`/logout).
- `src/context/UIContext.tsx` — `UIProvider` + `useUIContext()` (stores `theme` and `sidebarOpen`).
- `src/hooks/useAuth.ts` — `useAuth()` custom hook that returns `{ isAuthenticated, user, login, logout }`.
- `src/hooks/useUI.ts` — `useUI()` custom hook that returns `{ theme, toggleTheme, sidebarOpen, toggleSidebar }`.

### Usage
- Wrap your app with the providers (done in `src/app/layout.tsx`):
```tsx
<AuthProvider>
  <UIProvider>
    <LayoutWrapper>{children}</LayoutWrapper>
  </UIProvider>
</AuthProvider>
```

- Demo page: `src/app/context-demo/page.tsx` shows login/logout and theme/sidebar toggles.

### Notes & Best Practices
- The provided context is intentionally simple (demo): it stores some state in `localStorage` for hydration and logs events to console for visibility.
- For complex state or many actions, prefer `useReducer` to centralize updates and avoid unnecessary re-renders.
- Use React DevTools to inspect provider values and memoize consumers where appropriate.

---

## Client-side Data Fetching with SWR ⚡

This project demonstrates client-side data fetching using **SWR** (stale-while-revalidate) for caching, revalidation and optimistic updates.

### Install
- `npm install swr`

### Fetcher helper (`src/lib/fetcher.ts`)
- Provides a small wrapper that maps the API response envelope (`{ success, data }`) to the payload returned to components:
```ts
export const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const body = await res.json();
  if (!body.success) throw new Error(body.message || "API error");
  return body.data; // e.g., { page, limit, total, data: [...] }
};
```

### Example: client-side users list
- `src/components/users/UsersSWRList.tsx` uses `useSWR('/api/users', fetcher)` and renders `payload.data`.
- It shows `isValidating` and handles errors.

### Example: optimistic add
- `src/components/users/AddUser.tsx` performs an optimistic update using `mutate('/api/users')`:
  - Immediately updates UI with a temporary user
  - Calls `POST /api/users`
  - Revalidates the `/api/users` key after the request to sync server state

### How to test
1. Start dev server: `npm run dev`
2. Visit `/users` - page contains server-side list and a client-side SWR demo section.
3. Use the Add User form to test optimistic UI (immediate UI update, background revalidation).
4. Observe caching behavior and revalidation in React DevTools → SWR cache.

### Notes
- SWR keys uniquely identify cache entries — use stable keys (strings or arrays for parameterized requests).
- Use `mutate(key, data, false)` for optimistic UI and then `mutate(key)` to revalidate.
- Use `onErrorRetry` or `refreshInterval` to tune revalidation and resilience.

---

## Email Service Integration ✉️

QConnect integrates transactional email functionality using either **AWS SES** or **SendGrid**. This system sends automated notifications for critical events like user signups, password resets, appointment reminders, and security alerts.

### Why Transactional Emails Matter

Transactional emails are essential for user engagement and trust. Unlike marketing emails, they are **trigger-based** and sent automatically in response to user actions:

| Event | Email Type | Purpose |
|-------|-----------|---------|
| User signs up | Welcome email | Confirm account creation |
| Password reset request | Reset link | Enable account recovery |
| Appointment scheduled | Confirmation | Notify doctor & patient |
| Appointment reminder | Reminder | Reduce no-shows |
| Security event | Alert | Protect account |

### Choosing Your Provider

Both AWS SES and SendGrid are production-ready. Choose based on your needs:

| Feature | AWS SES | SendGrid |
|---------|---------|----------|
| **Pricing** | Pay-per-email ($0.10/1000) | Free tier (100/day), then $0.0001/email |
| **Setup** | Requires AWS account + domain verification | Create account + API key |
| **Ideal for** | Backend automation at scale | Rapid development, small volume |
| **Sandbox Mode** | Requires email verification | Full API access |
| **Bounce Handling** | SNS notifications | Event API |

### Setup & Configuration

#### Option A: AWS SES Setup

1. **Create AWS Account** and navigate to [Simple Email Service (SES)](https://console.aws.amazon.com/ses/)

2. **Verify Email/Domain**:
   - In sandbox mode: verify individual recipient emails in the AWS SES console
   - In production: verify your domain (requires DNS records for DKIM/SPF)

3. **Get AWS Credentials**:
   - Create an IAM user with `AmazonSESFullAccess` policy
   - Generate access key + secret key

4. **Add to `.env`**:
   ```bash
   EMAIL_PROVIDER=ses
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   SES_EMAIL_SENDER=no-reply@yourdomain.com
   ```

5. **Install Dependencies**:
   ```bash
   npm install @aws-sdk/client-ses
   ```

#### Option B: SendGrid Setup

1. **Create SendGrid Account** at [sendgrid.com](https://sendgrid.com)

2. **Verify Sender Email**:
   - Go to Settings → Sender Authentication
   - Verify your email address or domain

3. **Generate API Key**:
   - Settings → API Keys
   - Create "Full Access" API key

4. **Add to `.env`**:
   ```bash
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.abc123...
   SENDGRID_SENDER=no-reply@yourdomain.com
   ```

5. **Install Dependencies**:
   ```bash
   npm install @sendgrid/mail
   ```

### Email Implementation

#### Email Service Library

The email system is implemented in [src/lib/email.ts](src/lib/email.ts):

```typescript
import { sendEmail } from "@/lib/email";

// Send an email
const result = await sendEmail({
  to: "user@example.com",
  subject: "Welcome to QConnect",
  html: "<h3>Hello! 🎉</h3>",
  from: "no-reply@yourdomain.com" // optional, uses env default
});

// Result: { success: true, provider: "ses", messageId: "01010189..." }
```

#### API Route

POST `/api/email` — Send transactional email

**Request**:
```json
{
  "to": "user@example.com",
  "subject": "Welcome!",
  "message": "<h3>Hello from QConnect 🚀</h3>"
}
```

**Response**:
```json
{
  "success": true,
  "provider": "ses",
  "messageId": "01010189b2example123"
}
```

**Test with cURL**:
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "student@example.com",
    "subject": "Welcome!",
    "message": "<h3>Hello from QConnect 🚀</h3>"
  }'
```

### Email Templates

Pre-built HTML templates are in [src/lib/templates/emailTemplates.ts](src/lib/templates/emailTemplates.ts):

#### Welcome Email
```typescript
import { welcomeTemplate } from "@/lib/templates/emailTemplates";

const html = welcomeTemplate("John Doe");
await sendEmail({
  to: "john@example.com",
  subject: "Welcome to QConnect!",
  html
});
```

**Output**:
```html
<h2>Welcome to QConnect, John Doe!</h2>
<p>We're thrilled to have you onboard 🎉</p>
<p>Start managing your appointments and doctors...</p>
<a href="https://app.qconnect.local/dashboard">Get Started</a>
```

#### Password Reset Email
```typescript
import { passwordResetTemplate } from "@/lib/templates/emailTemplates";

const resetLink = "https://app.qconnect.local/reset?token=abc123";
const html = passwordResetTemplate("John Doe", resetLink, 24);
await sendEmail({
  to: "john@example.com",
  subject: "Reset Your Password",
  html
});
```

#### Appointment Reminder Email
```typescript
import { appointmentReminderTemplate } from "@/lib/templates/emailTemplates";

const html = appointmentReminderTemplate(
  "John Doe",
  "Smith",
  "Jan 20, 2026 at 2:30 PM",
  "Consultation - Room 101"
);
await sendEmail({
  to: "john@example.com",
  subject: "Appointment Reminder",
  html
});
```

#### Security Alert Email
```typescript
import { securityAlertTemplate } from "@/lib/templates/emailTemplates";

const html = securityAlertTemplate(
  "John Doe",
  "Unusual login from 192.168.1.1",
  true
);
await sendEmail({
  to: "john@example.com",
  subject: "Security Alert",
  html
});
```

#### Custom Notification Email
```typescript
import { notificationTemplate } from "@/lib/templates/emailTemplates";

const html = notificationTemplate(
  "John Doe",
  "Payment Received",
  "Your appointment payment of $50 was received.",
  "https://app.qconnect.local/invoices",
  "View Invoice"
);
await sendEmail({
  to: "john@example.com",
  subject: "Payment Confirmation",
  html
});
```

### Email Logging & Monitoring

Email sends are logged using [src/lib/emailLogger.ts](src/lib/emailLogger.ts):

```typescript
import { logEmailSent, logEmailFailed, getEmailStats } from "@/lib/emailLogger";

// Logs are automatically created in sendEmail()
// Retrieve statistics:
const stats = getEmailStats();
console.log(stats);
// {
//   totalSent: 42,
//   successful: 40,
//   failed: 2,
//   successRate: "95.24",
//   byProvider: { ses: 25, sendgrid: 15 }
// }

// Get recent email logs
import { getEmailLogs } from "@/lib/emailLogger";
const logs = getEmailLogs({ status: "success", limit: 10 });
```

### Testing Email Service

#### Unit Tests

Integration tests for the email API are in `__tests__/api/email.test.ts`:

```bash
npm test __tests__/api/email.test.ts
```

Tests cover:
- ✅ Successful sends via SES and SendGrid
- ✅ Validation of required fields (to, subject, message)
- ✅ Error handling and graceful failures
- ✅ Password reset email flow
- ✅ Appointment reminder flow
- ✅ Security alert flow

#### Manual Testing with Postman

1. **Start dev server**: `npm run dev`

2. **Create new POST request** to `http://localhost:3000/api/email`

3. **Set Headers**:
   ```
   Content-Type: application/json
   ```

4. **Body (raw JSON)**:
   ```json
   {
     "to": "test@example.com",
     "subject": "Test Email",
     "message": "<h3>Hello Test!</h3>"
   }
   ```

5. **Send** and check response:
   ```json
   {
     "success": true,
     "provider": "ses",
     "messageId": "01010189b2example123"
   }
   ```

6. **Check Console Logs**:
   ```
   Email sent (SES): { to: 'test@example.com', messageId: '01010189b2example123' }
   ```

### Handling Common Issues

#### Problem: Emails Not Delivered

**Cause**: AWS SES sandbox mode or email not verified

**Solution**:
- If using SES sandbox: add recipient email to verified addresses in AWS console
- Check spam folder
- Verify sender email is correct
- Check email headers for bounces in SES dashboard

#### Problem: "Email Service Unavailable"

**Cause**: Invalid credentials or service rate limit

**Solution**:
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct
- Check AWS region is accessible
- Verify SendGrid API key is valid
- Wait 60 seconds before retrying (rate limit)

#### Problem: Slow Email Delivery

**Cause**: Synchronous API calls blocking requests

**Solution**:
- Use background tasks for bulk sends (implement Redis queue)
- Implement retry logic with exponential backoff
- Monitor CloudWatch metrics (AWS SES) or SendGrid dashboard

#### Problem: Email Headers Issues

**Cause**: Improper DKIM/SPF configuration

**Solution**:
- AWS SES: verify domain and add DKIM/SPF records to DNS
- SendGrid: verify domain under Settings → Sender Authentication
- Test SPF/DKIM with online tools

### Sandbox vs Production

#### AWS SES Sandbox Mode

**When**: Development, testing

**Limitations**:
- Can only send to verified email addresses
- Limited to 1 email/second
- Max 200 emails/24 hours
- No reputation tracking

**Enable Production**:
1. Go to AWS SES console → Account Dashboard
2. Click "Request Production Access"
3. Describe your use case
4. AWS reviews and grants access (usually within 24 hours)

#### SendGrid

**When**: Use free tier for development, paid for production

**Free Tier**:
- 100 emails/day
- Full API access
- Ideal for testing

**Upgrade to Paid**:
1. Add payment method in Settings → Billing
2. No restrictions on sender emails or volume

### Rate Limits & Throttling

#### AWS SES Rate Limits (Sandbox)
- 1 email/second
- 200 emails/24 hours
- Burst capacity: 5 emails/second

**Implementation** (in `src/lib/email.ts`):
```typescript
// Add this to prevent rate limit errors
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
await sleep(100); // Throttle to 10 emails/second
```

#### SendGrid Rate Limits
- Free tier: 100 emails/day
- Paid: No rate limits
- Max burst: 300 emails/10 seconds

**Implement Retry Logic**:
```typescript
async function sendEmailWithRetry(options: EmailOptions, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await sendEmail(options);
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const backoff = Math.pow(2, attempt - 1) * 1000; // exponential backoff
      await sleep(backoff);
    }
  }
}
```

### Bounce Handling & Compliance

#### AWS SES Bounce Handling

1. **Enable SNS Notifications** (AWS Console):
   - SES → Email Addresses → Select sender
   - Set notifications for Bounces and Complaints

2. **Webhook Handler**:
   Create `app/api/webhooks/ses-bounces/route.ts`:
   ```typescript
   export async function POST(req: Request) {
     const event = await req.json();
     
     if (event.messageType === "Bounce") {
       const bounces = event.bounce.bouncedRecipients;
       bounces.forEach((bounce: any) => {
         logger.warn(`Email bounced: ${bounce.emailAddress}`);
         // Mark user as inactive or notify admin
       });
     }
     
     if (event.messageType === "Complaint") {
       const complaints = event.complaint.complainedRecipients;
       complaints.forEach((complaint: any) => {
         logger.error(`Complaint received: ${complaint.emailAddress}`);
         // Unsubscribe user
       });
     }
     
     return NextResponse.json({ success: true });
   }
   ```

#### SendGrid Bounce Handling

1. **Enable Event Webhook**:
   - Settings → Mail Send Settings → Event Webhook
   - Set URL to `https://yourdomain.com/api/webhooks/sendgrid-events`

2. **Webhook Handler**:
   Create `app/api/webhooks/sendgrid-events/route.ts`:
   ```typescript
   export async function POST(req: Request) {
     const events = await req.json();
     
     events.forEach((event: any) => {
       if (event.event === "bounce") {
         logger.warn(`Email bounced: ${event.email}`);
       }
       if (event.event === "dropped") {
         logger.warn(`Email dropped: ${event.email}`);
       }
       if (event.event === "spamreport") {
         logger.error(`Spam report: ${event.email}`);
       }
     });
     
     return NextResponse.json({ success: true });
   }
   ```

### Security Best Practices

1. **Never expose API keys**: Store in `.env`, never in version control
2. **Use environment-specific senders**: Separate domains for dev/prod
3. **Validate recipient emails**: Use Zod schema validation
4. **Rate limit email sends**: Prevent email flooding attacks
5. **Monitor bounce rates**: Unsubscribe users with persistent bounces
6. **SPF/DKIM/DMARC**: Set up email authentication records
7. **Sanitize HTML content**: Use `sanitize-html` for user-generated content

### Database Integration (Future Enhancement)

Store email logs in PostgreSQL:

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  provider VARCHAR(20) NOT NULL,
  message_id VARCHAR(255),
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_to ON email_logs(to);
```

Use Prisma schema:
```prisma
model EmailLog {
  id        String   @id @default(cuid())
  to        String
  subject   String
  provider  String
  messageId String?
  status    String
  error     String?
  createdAt DateTime @default(now())
}
```

### Key Takeaways

✅ **Transactional emails** are critical for user engagement and trust

✅ **Choose SES for scale**, **SendGrid for simplicity**

✅ **Use templates** for consistent, branded communication

✅ **Monitor bounce rates** and implement retry logic

✅ **Test in sandbox mode** before production

✅ **Log all sends** for audit and debugging

✅ **Handle rate limits** with exponential backoff

✅ **Secure API keys** in environment variables

---


