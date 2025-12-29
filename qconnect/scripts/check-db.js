// Usage: DATABASE_URL=postgresql://user:pass@host:5432/db node scripts/check-db.js
// Optionally set PG_SSL=true if the server requires SSL (e.g., Heroku / some RDS configs)
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL environment variable. Example: postgresql://admin:pass@your-host:5432/dbname');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  // You can tune pool max/min via env vars if needed
});

(async () => {
  try {
    const res = await pool.query('SELECT NOW() as now');
    console.log('Successfully connected to DB. Server time:', res.rows[0].now);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err.message || err);
    process.exit(2);
  }
})();
