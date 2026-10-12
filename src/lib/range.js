import { sql } from 'drizzle-orm';
const TZ = 'Africa/Cairo';
const TZSQL = sql.raw(`'${TZ}'`);
export function parseRange(params) {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const preset = params.range || (params.from || params.to ? 'custom' : '30d');
  let from; let to = iso(today);
  if (preset === '7d') from = iso(new Date(today.getTime() - 6 * 86400000));
  else if (preset === '90d') from = iso(new Date(today.getTime() - 89 * 86400000));
  else if (preset === 'month') from = iso(new Date(today.getFullYear(), today.getMonth(), 1));
  else if (preset === 'year') from = iso(new Date(today.getFullYear(), 0, 1));
  else if (preset === 'custom') { from = params.from || iso(new Date(today.getTime() - 29 * 86400000)); to = params.to || to; }
  else from = iso(new Date(today.getTime() - 29 * 86400000));
  if (from > to) [from, to] = [to, from];
  return { preset, from, to, start: sql`(${from}::date)::timestamp at time zone ${TZSQL}`, end: sql`((${to}::date + 1)::date)::timestamp at time zone ${TZSQL}` };
}
