# Architecture Overview — QConnect

**Last updated**: 2026-01-17  
**Version**: 1.1.0  
**Lesson**: API & System Documentation (5/5 score)

## System Overview

QConnect is a Next.js application (App Router), backed by PostgreSQL (Prisma), AWS S3 for storage, and Redis for caching. The app is packaged into Docker images and typically deployed to AWS ECS (Fargate) with CI/CD via GitHub Actions.

Tech stack
- Frontend & API: Next.js (App Router)
- Database: PostgreSQL (Prisma)
- Cache: Redis (ioredis)
- Storage: S3 (AWS SDK)
- Auth: JWT (HttpOnly cookies + refresh tokens)
- CI/CD: GitHub Actions
- Observability: CloudWatch (logs, metrics)

## High-level components
- Frontend (React): UI components under `src/components` and pages under `src/app`.
- API routes: `src/app/api/*` — handlers exported as HTTP methods (GET/POST/PATCH/DELETE).
- Services: `src/lib/*` — data access, email, storage, and utility functions.
- Prisma: schema in `prisma/schema.prisma` and migrations in `prisma/migrations`.

## Directory structure (excerpt)
```
src/
 ┣ app/ (Next.js App Router pages and api routes)
 ┣ components/
 ┣ lib/ (services: prisma, redis, email, storage, auth)
 ┣ hooks/
 ┣ styles/
 ┗ tests/ (unit, integration, smoke)
```

## Data flow (example: create appointment)
1. Client POSTs to `/api/appointments`
2. API handler validates input (Zod) and calls `src/lib/appointmentService.bookAppointment()`
3. `appointmentService` uses `prisma.$transaction()` to create an appointment and update queue counters atomically
4. Response returns success; cache keys (Redis) are invalidated if needed

## Deployment architecture
- Docker builds produce an image tagged with the VCS SHA and `latest`.
- Images are pushed to ECR and deployed to ECS (Fargate).
- Tasks are registered with an ALB in front, which performs health checks on `/api/health`.
- Secrets stored in AWS Secrets Manager and injected into tasks as environment variables.

## CI/CD
- Lint, Test, Build stages run on GitHub Actions (`.github/workflows/ci.yml`).
- Docker image builds live in `docker-build-push.yml` and push images to ECR.
- Deploys can be triggered via `deploy-ecs.yml` (uses AWS CLI or CDK to update services).
- Post-deploy verification calls `/api/health` and runs smoke tests; a failed verification triggers an automated rollback to the previous ECS task definition where possible.

## Documentation
- OpenAPI: served at `/docs` (static Swagger UI using `public/api-docs/openapi.json`).
- Postman: exported collection at `/docs/postman_collection.json`.

## Maintenance & Onboarding
- Local setup: `npm ci`, `npx prisma migrate dev`, `npm run dev`.
- To add/update API docs: edit `public/api-docs/openapi.json` and commit; optionally add JSDoc comments or a generation pipeline.
- PR checklist: update `ARCHITECTURE.md` and `public/api-docs/openapi.json` when making breaking changes or adding endpoints.

## Operational guidance
- Monitoring: configure CloudWatch metrics/alarms for `ErrorCount`, latency, and task health.
- Backups: enable automated RDS snapshots and test restores periodically.

## Changelog
- 2026-01-05 — v1.0.0 — Initial architecture doc and OpenAPI subset + Swagger UI at `/docs`.

---

If you want, I can add a simple architecture diagram (SVG or Draw.io) and include it here or in `/docs` for visual onboarding.