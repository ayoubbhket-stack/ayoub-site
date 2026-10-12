import 'server-only';
import { and, asc, desc, eq, gte, ilike, lt, or, sql } from 'drizzle-orm';
import { getDb, schema as s } from '@/db';

export const STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Interested'], ['client', 'Became client'], ['lost', 'Not interested']];
const TZ = sql.raw(`'Africa/Cairo'`);

export function leadWhere(p) {
  const w = [];
  if (p.q) { const t = `%${p.q.trim()}%`; const d = p.q.replace(/\D/g, ''); w.push(or(ilike(s.leads.name, t), ilike(s.leads.industry, t), ilike(s.leads.notes, t), ilike(s.leads.phone, d ? `%${d}%` : t))); }
  if (p.status) w.push(eq(s.leads.status, p.status));
  if (p.source) w.push(eq(s.leads.source, p.source));
  if (p.from) w.push(gte(s.leads.createdAt, sql`(${p.from}::date)::timestamp at time zone ${TZ}`));
  if (p.to) w.push(lt(s.leads.createdAt, sql`((${p.to}::date + 1)::date)::timestamp at time zone ${TZ}`));
  return w.length ? and(...w) : undefined;
}

export async function listLeads(p, { per = 30, all = false } = {}) {
  const db = await getDb();
  const where = leadWhere(p);
  const col = { created: s.leads.createdAt, name: s.leads.name, status: s.leads.status, source: s.leads.source }[p.sort] || s.leads.createdAt;
  const page = Math.max(1, Number(p.page) || 1);
  let q = db.select().from(s.leads).where(where).orderBy(p.dir === 'asc' ? asc(col) : desc(col), desc(s.leads.id));
  if (!all) q = q.limit(per).offset((page - 1) * per);
  const [rows, [{ n }]] = await Promise.all([q, db.select({ n: sql`count(*)::int` }).from(s.leads).where(where)]);
  return { rows, total: n, page, pages: Math.ceil(n / per), per };
}

export async function leadStats(r) {
  const db = await getDb();
  const range = and(gte(s.leads.createdAt, r.start), lt(s.leads.createdAt, r.end));
  const day = sql`(${s.leads.createdAt} at time zone ${TZ})::date`;
  const [totals, byStatus, bySource, byIndustry, daily] = await Promise.all([
    db.select({
      total: sql`count(*)::int`,
      today: sql`count(*) filter (where (${s.leads.createdAt} at time zone ${TZ})::date = (now() at time zone ${TZ})::date)::int`,
      week: sql`count(*) filter (where ${s.leads.createdAt} > now() - interval '7 days')::int`,
      waiting: sql`count(*) filter (where ${s.leads.status} = 'new')::int`,
    }).from(s.leads),
    db.select({ status: s.leads.status, n: sql`count(*)::int` }).from(s.leads).where(range).groupBy(s.leads.status),
    db.select({ source: s.leads.source, n: sql`count(*)::int`, clients: sql`count(*) filter (where ${s.leads.status}='client')::int` }).from(s.leads).where(range).groupBy(s.leads.source).orderBy(desc(sql`count(*)`)),
    db.select({ industry: sql`lower(${s.leads.industry})`, n: sql`count(*)::int` }).from(s.leads).where(range).groupBy(sql`lower(${s.leads.industry})`).orderBy(desc(sql`count(*)`)).limit(8),
    db.select({ d: sql`to_char(${day}, 'YYYY-MM-DD')`, n: sql`count(*)::int` }).from(s.leads).where(range).groupBy(day),
  ]);
  const map = new Map(daily.map((x) => [x.d, x.n]));
  const series = [];
  for (let d = new Date(`${r.from}T00:00:00Z`); d <= new Date(`${r.to}T00:00:00Z`); d = new Date(d.getTime() + 86400000)) {
    const k = d.toISOString().slice(0, 10); series.push({ label: k, n: map.get(k) || 0 });
  }
  const st = Object.fromEntries(byStatus.map((x) => [x.status, x.n]));
  const inRange = byStatus.reduce((a, x) => a + x.n, 0);
  return { ...totals[0], st, inRange, bySource, byIndustry, series };
}
