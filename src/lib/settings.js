import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { DEFAULT_CONTENT, WEB_SERVICE } from './defaults';

export async function getContent() {
  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, 'content'));
  if (!row) return DEFAULT_CONTENT;
  const c = { ...DEFAULT_CONTENT, ...row.value };
  if ((row.value.contentVersion || 0) < 2) {
    // One-time upgrade: add the website design service to saved content.
    if (!c.services.some((s) => /web/i.test(s.title))) c.services = [...c.services, WEB_SERVICE];
    c.contentVersion = 2;
    try { await saveContent(c); } catch { /* render anyway */ }
  }
  return c;
}

export async function saveContent(value) {
  const db = await getDb();
  await db.insert(schema.settings).values({ key: 'content', value }).onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
}
