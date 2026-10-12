import 'server-only';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { DEFAULT_CONTENT } from './defaults';

export async function getContent() {
  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, 'content'));
  return row ? { ...DEFAULT_CONTENT, ...row.value } : DEFAULT_CONTENT;
}

export async function saveContent(value) {
  const db = await getDb();
  await db.insert(schema.settings).values({ key: 'content', value }).onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
}
