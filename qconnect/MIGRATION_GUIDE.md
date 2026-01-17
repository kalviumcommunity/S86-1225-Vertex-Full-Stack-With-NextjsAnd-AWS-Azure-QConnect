# Apply migrations
npm run migrate:dev

# Seed database
npm run db:seed

# View data
npm run prisma:studio

# Check status
npx prisma migrate status# Apply migrations
npm run migrate:dev

# Seed database
npm run db:seed

# View data
npm run prisma:studio

# Check status
npx prisma migrate status# Database Migrations & Seeding Guide

## Overview

This document provides a comprehensive guide to managing database migrations and seeding with Prisma ORM in the QConnect project. Migrations capture schema changes and keep the database synchronized with Prisma models, while seeding populates the database with reproducible test data.

---

## Table of Contents

1. [Understanding Migrations](#understanding-migrations)
2. [Migration Workflow](#migration-workflow)
3. [Creating New Migrations](#creating-new-migrations)
4. [Rollback Procedures](#rollback-procedures)
5. [Data Seeding](#data-seeding)
6. [Production Safety](#production-safety)
7. [Troubleshooting](#troubleshooting)

---

## Understanding Migrations

### What is a Migration?

A migration is a versioned change to your database schema. Each migration:
- Is stored as a timestamped SQL file in `prisma/migrations/`
- Contains the SQL statements needed to apply or revert changes
- Is tracked in `prisma/migrations/migration_lock.toml` (prevents concurrent migrations)
- Can be applied or reset deterministically

### How Prisma Migrations Work

1. **You modify** `prisma/schema.prisma` (the schema definition)
2. **Prisma generates** a SQL migration file based on the differences
3. **The migration is applied** to your connected PostgreSQL database
4. **Your team gets** the same migration files via Git

### Current Migrations in QConnect

The project currently has the following migration history:

| Migration | Date | Purpose |
|-----------|------|---------|
| `20251217083615_init_schema` | Dec 17, 2025 | Initial schema: User, Doctor, Queue, Appointment, File, RefreshToken models |
| `20251217095346_add_user_phone` | Dec 17, 2025 | Added phone field to User model |
| `20251223120000_add_indexes` | Dec 23, 2025 | Added performance indexes (Doctor.specialty, Queue.doctorId+date, etc.) |
| `20251223150000_add_user_password` | Dec 23, 2025 | Added password field to User model |

---

## Migration Workflow

### 1. **Modify the Schema**

Edit `prisma/schema.prisma` to add, remove, or modify models:

```prisma
model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  phone     String?   // Added: phone field
  password  String?   // Added: password field
  role      Role
  createdAt DateTime  @default(now())
  appointments Appointment[]
}
```

### 2. **Create a Migration**

Generate a migration that captures your changes:

```bash
# Automated migration with a descriptive name
npx prisma migrate dev --name add_phone_field

# Or using the npm script
npm run migrate:dev -- --name add_phone_field
```

**What happens:**
1. Prisma compares `schema.prisma` with the current database schema
2. Generates a `.sql` file with the necessary changes in `prisma/migrations/`
3. Applies the migration to the database automatically
4. Regenerates the Prisma Client

### 3. **Review the Generated SQL** (Recommended)

Always review the generated SQL before committing to Git:

```bash
# Open the latest migration file
cat prisma/migrations/<timestamp>_<name>/migration.sql
```

Example output for adding a field:
```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
```

### 4. **Commit & Push**

```bash
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "feat: add phone field to User model"
git push origin feature-branch
```

### 5. **Team Members Apply the Migration**

Your teammates pull the changes and apply them:

```bash
npm install  # Updates node_modules if Prisma changed
npm run migrate:dev
```

---

## Creating New Migrations

### Example: Adding a New Model

Let's add a `Review` model to track doctor reviews:

```prisma
model Review {
  id        Int       @id @default(autoincrement())
  rating    Int       @db.SmallInt  // 1-5 stars
  comment   String?
  doctorId  Int
  userId    Int
  createdAt DateTime  @default(now())

  doctor    Doctor    @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([doctorId, userId])  // One review per user per doctor
  @@index([doctorId])
  @@index([userId])
}
```

Update the `Doctor` and `User` models to include the relationship:

```prisma
model Doctor {
  // ... existing fields ...
  reviews   Review[]
}

model User {
  // ... existing fields ...
  reviews   Review[]
}
```

Create the migration:

```bash
npm run migrate:dev -- --name add_review_model
```

---

## Rollback Procedures

### Option 1: Reset the Entire Database (Local Development)

If you want to start fresh locally:

```bash
npm run migrate:reset
```

**What it does:**
1. Drops the entire database
2. Re-applies all migrations in order
3. Runs the seed script (if configured)

**Warning:** This deletes all local data. Use only in development!

### Option 2: Manually Rollback (Advanced)

If you need to undo a specific migration in production:

```bash
# Resolve a migration that failed to apply
npx prisma migrate resolve --rolled-back <migration_name>

# Example:
npx prisma migrate resolve --rolled-back 20251223150000_add_user_password
```

### Option 3: Create a Rollback Migration

For production, it's safer to create a new migration that reverts changes:

```prisma
// In schema.prisma, remove the field or model:
model User {
  // Removed: phone field
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  role      Role
  createdAt DateTime  @default(now())
}
```

Create a rollback migration:

```bash
npm run migrate:dev -- --name remove_phone_field
```

This generates SQL to drop the column.

---

## Data Seeding

### Why Seed Data?

Seeding ensures that:
- Every developer has consistent test data locally
- QA teams have reproducible test scenarios
- You can quickly reset to a known state
- Deployment environments have baseline data

### Seed Script Overview

The project includes `prisma/seed.ts` which uses **idempotent upserts**:

```typescript
// Idempotent: Won't create duplicates if run multiple times
const user = await prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: { name: 'Alice Johnson' },  // Update if exists
  create: { name: 'Alice Johnson', email: 'alice@example.com', role: Role.PATIENT }
});
```

**Key features:**
- Uses `upsert` operations to prevent duplicate data
- Seeds multiple tables: Users, Doctors, Queues, Appointments, Files
- Provides rich console output with progress indicators
- Can be run multiple times safely

### Running the Seed Script

#### Automatic (with reset):

```bash
npm run migrate:reset
# Drops DB → Re-applies migrations → Runs seed → Done
```

#### Manual (seed only):

```bash
npm run db:seed
# Applies seed to existing database (without resetting)
```

### Verify Seed Data

#### Using Prisma Studio:

```bash
npm run prisma:studio
# Opens http://localhost:5555 to visually inspect data
```

#### Using PostgreSQL Client:

```bash
psql -h localhost -U postgres -d qconnect_db

-- View all users
SELECT * FROM "User";

-- View appointment counts by status
SELECT status, COUNT(*) FROM "Appointment" GROUP BY status;

-- Verify indexes were created
\d "Doctor"
```

### Sample Seed Output

```
🌱 Starting database seeding...

📝 Seeding Users...
  ✓ Alice Johnson (alice@example.com)
  ✓ Bob Smith (bob@example.com)
  ✓ Charlie Brown (charlie@example.com)
  ✓ Diana Prince (diana@example.com)
  ✓ Admin User (admin@example.com)

👨‍⚕️ Seeding Doctors...
  ✓ Dr. Smith - Cardiology (Room A101)
  ✓ Dr. Johnson - Neurology (Room B202)
  ✓ Dr. Williams - Orthopedics (Room C303)
  ✓ Dr. Brown - Dermatology (Room D404)

📋 Seeding Queues...
  ✓ Queue for Dr. Smith on 1/18/2026
  ✓ Queue for Dr. Johnson on 1/19/2026
  ✓ Queue for Dr. Williams on 1/20/2026
  ✓ Queue for Dr. Brown on 1/21/2026

🗓️ Seeding Appointments...
  ✓ Appointment #1 for Alice Johnson - Status: PENDING
  ✓ Appointment #2 for Bob Smith - Status: PENDING
  ✓ Appointment #3 for Charlie Brown - Status: IN_PROGRESS
  ✓ Appointment #1 for Diana Prince - Status: COMPLETED

📁 Seeding Files...
  ✓ prescription_1.pdf (244.14 KB)
  ✓ medical_report.pdf (439.45 KB)
  ✓ lab_results.xlsx (117.19 KB)

✅ Database seeding completed successfully!

📊 Summary:
  • Users: 5
  • Doctors: 4
  • Queues: 4
  • Appointments: 4
  • Files: 3
```

### Verify Idempotency

Run the seed script twice to ensure no duplicates are created:

```bash
npm run db:seed
# First run: Creates data

npm run db:seed
# Second run: Should update existing records without creating duplicates
```

Check the database:

```bash
psql -h localhost -U postgres -d qconnect_db
SELECT COUNT(*) FROM "User";
-- Result: 5 (not 10)
```

### Customizing the Seed Script

Edit `prisma/seed.ts` to add your own seed data:

```typescript
// Add to the seed script:
const teams = [
  { name: 'Cardiology Team', specialty: 'Cardiology' },
  { name: 'Neurology Team', specialty: 'Neurology' },
];

for (const team of teams) {
  await prisma.team.upsert({
    where: { id: teams.indexOf(team) + 1 },
    update: { name: team.name },
    create: { name: team.name, specialty: team.specialty },
  });
}
```

Then run:

```bash
npm run db:seed
```

---

## Production Safety

### Best Practices

#### 1. **Never Run Migrations Directly Against Production**

Instead, follow this workflow:

1. Test locally: `npm run migrate:dev`
2. Test in staging environment
3. Create a backup of production: `pg_dump production_db > backup_20260117.sql`
4. Apply migration: `npx prisma migrate deploy` (apply only; doesn't create new ones)
5. Monitor for errors

#### 2. **Use Automated Backups**

Before any migration:

```bash
# AWS RDS
aws rds create-db-snapshot \
  --db-instance-identifier qconnect-prod \
  --db-snapshot-identifier qconnect-prod-backup-20260117

# Azure PostgreSQL
az postgres server backup create \
  --resource-group myResourceGroup \
  --server-name myServer
```

#### 3. **Use Connection Pooling**

For serverless or high-concurrency deployments, use PgBouncer or Prisma Accelerate:

```env
# .env.production
DATABASE_URL=postgresql://user:pass@pgbouncer-host:6432/qconnect_db
```

#### 4. **Monitor After Deployment**

```bash
# Check query performance
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

# Monitor active connections
SELECT count(*) FROM pg_stat_activity;
```

#### 5. **Document All Changes**

Create a `DEPLOYMENT_LOG.md`:

```markdown
## 2026-01-17 - Migration: Add Review Model

**Change:** Added User Review functionality
**Migration:** 20260117120000_add_review_model
**Downtime:** 0 seconds (ALTER TABLE is fast)
**Rollback Plan:** Drop review tables if issues occur
**Status:** ✅ Deployed successfully to production
**Verified:** SELECT COUNT(*) FROM "Review"; -- Returns 0
```

### Staging vs. Production

| Action | Local | Staging | Production |
|--------|-------|---------|------------|
| `migrate dev` | ✅ Yes | ❌ No | ❌ No |
| `migrate reset` | ✅ Yes | ❌ No | ❌ No |
| `migrate deploy` | ✅ OK | ✅ Yes | ✅ After backup |
| `db seed` | ✅ Yes | ✅ Optional | ❌ No (data loss) |

### Disaster Recovery

If a migration fails in production:

1. **Identify the issue:**
   ```bash
   # Check migration status
   npx prisma migrate status
   ```

2. **Restore from backup (if available):**
   ```bash
   pg_restore -d qconnect_prod backup_20260117.sql
   ```

3. **Resolve and retry:**
   ```bash
   npx prisma migrate resolve --rolled-back <migration_name>
   npx prisma migrate deploy  # Retry
   ```

---

## Troubleshooting

### Issue: Migration Won't Apply

**Symptom:** `Error: P3008 - Migration cannot be applied`

**Solution:**
1. Check your database connection: `npm run check:db`
2. Verify `DATABASE_URL` is correct in `.env.local`
3. Check if a previous migration failed: `npx prisma migrate status`
4. If stuck, resolve manually: `npx prisma migrate resolve --rolled-back <migration_name>`

### Issue: Schema Conflicts After Merge

**Symptom:** Two branches both added migrations

**Solution:**
1. Pull latest: `git pull origin main`
2. Reapply migrations: `npm run migrate:dev`
3. Prisma will automatically apply both in order

### Issue: Seed Script Fails

**Symptom:** `Error seeding database`

**Solution:**
1. Check if tables exist: `psql -c "\dt"`
2. Run migrations first: `npm run migrate:dev`
3. Check for data conflicts: `SELECT * FROM "User" WHERE email = 'alice@example.com';`
4. Run seed with debug: `DEBUG=prisma:* npm run db:seed`

### Issue: Duplicate Data After Seed

**Symptom:** Running seed twice created duplicates

**Solution:**
- Verify the seed script uses `upsert` (not `create`)
- Check the `where` clause in upsert is using a unique field (e.g., email)
- Example (correct):
  ```typescript
  await prisma.user.upsert({
    where: { email: 'alice@example.com' },  // Unique identifier
    update: { name: 'Alice' },
    create: { email: 'alice@example.com', name: 'Alice' },
  });
  ```

### Issue: Can't Connect to PostgreSQL

**Symptom:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
1. Ensure PostgreSQL is running: `sudo systemctl status postgresql`
2. Check DATABASE_URL: `echo $DATABASE_URL`
3. For Docker: `docker-compose up -d postgres`
4. Verify credentials: `psql -h localhost -U postgres`

---

## Quick Reference Commands

```bash
# Development Workflow
npm run migrate:dev -- --name <migration_name>    # Create and apply
npm run db:seed                                     # Populate data
npm run prisma:studio                              # Visual inspection
npm run migrate:reset                              # Full reset (local only)

# Production Workflow
npx prisma migrate status                          # Check status
npx prisma migrate deploy                          # Apply pending migrations
npx prisma migrate resolve --rolled-back <name>    # Resolve failed migration

# Verification
npm run check:db                                    # Test DB connection
psql -c "SELECT COUNT(*) FROM \"User\";"          # Check row counts
```

---

## Resources

- **Prisma Documentation:** [Database Migrations](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate)
- **Prisma Studio:** [Visual Data Inspector](https://www.prisma.io/docs/orm/tools-and-interfaces/prisma-studio)
- **PostgreSQL Backup:** [pg_dump documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- **AWS RDS Backups:** [RDS Automated Backups](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_BackupRestore.html)

---

**Last Updated:** January 17, 2026  
**Version:** 1.0  
**Maintainer:** QConnect Development Team
