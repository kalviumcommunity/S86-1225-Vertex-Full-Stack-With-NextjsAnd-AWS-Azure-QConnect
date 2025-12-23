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

### Enabling query logging & benchmarking
- Prisma (JS) query logs:
  - macOS / Linux: DEBUG="prisma:query" npm run dev
  - Windows (PowerShell): $env:DEBUG = "prisma:query"; npm run dev
- Use SQL `EXPLAIN` in your Postgres client (or tools like PgHero, AWS RDS Performance Insights) to benchmark before/after index changes.

### Notes & Reflection
- Transaction usage ensures atomicity (appointment creation + queue increment). Test rollback by calling the failing demo (already done by `prisma/transactionDemo.ts`).
- Indexes generally improve read/query performance but add write overhead. Monitor write impact if your app is write-heavy and select indexes accordingly.

If you'd like, I can add an automated benchmark (EXPLAIN outputs) into the demo script so you have before/after timings included in the README.
