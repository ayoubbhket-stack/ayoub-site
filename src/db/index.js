// Database client: PostgreSQL when DATABASE_URL is set (production), else an
// embedded PGlite Postgres in ./data for local development. Tables are created
// automatically on first use, so a fresh database needs no manual setup.
import * as schema from './schema.js';

const g = globalThis;

async function create() {
  const url = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '').trim();
  if (!url.startsWith('postgres') && process.env.VERCEL) throw new Error('DATABASE_URL is missing. Add your PostgreSQL connection string in the hosting environment variables.');
  let db; let exec;
  if (url.startsWith('postgres')) {
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const pg = (await import('pg')).default;
    const pool = new pg.Pool({ connectionString: url, max: 3, ssl: /sslmode=(require|verify)/.test(url) || url.includes('neon.tech') ? { rejectUnauthorized: false } : undefined });
    db = drizzle(pool, { schema });
    exec = (sql) => pool.query(sql);
  } else {
    const { PGlite } = await import('@electric-sql/pglite');
    const { drizzle } = await import('drizzle-orm/pglite');
    const dir = process.env.PGLITE_DIR || './data/pglite';
    (await import('node:fs')).mkdirSync(dir, { recursive: true });
    const client = new PGlite(dir);
    await client.waitReady;
    db = drizzle(client, { schema });
    exec = (sql) => client.exec(sql);
  }
  await exec(schema.SCHEMA_SQL);
  return db;
}

export function getDb() {
  if (!g.__ayoubDb) g.__ayoubDb = create().catch((e) => { g.__ayoubDb = undefined; throw e; });
  return g.__ayoubDb;
}
export { schema };
