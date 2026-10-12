// Copies the images from the original site into the database once, so the
// new site keeps working even if the old site is taken down.
import 'server-only';
import { getDb, schema } from '@/db';
import { OLD_SITE } from './defaults';
import { getContent, saveContent } from './settings';

const g = globalThis;

async function fetchImage(name) {
  const res = await fetch(`${OLD_SITE}/${encodeURI(name)}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get('content-type')?.split(';')[0] || (name.endsWith('.png') ? 'image/png' : 'image/jpeg');
  if (!mime.startsWith('image/')) throw new Error(`${name}: not an image`);
  const db = await getDb();
  const [m] = await db.insert(schema.media).values({ filename: name, mime, size: buf.length, data: buf }).returning({ id: schema.media.id });
  return m.id;
}

/** Import every image that still points at the old site. Returns a summary. */
export async function importLegacyImages() {
  if (g.__importing) return g.__importing;
  g.__importing = (async () => {
    const c = structuredClone(await getContent());
    const fields = [c.brand.logo, c.about.photo, ...c.results.items].filter((f) => f && !f.mediaId && f.legacy);
    let done = 0; const failed = [];
    for (const f of fields) {
      try { f.mediaId = await fetchImage(f.legacy); done++; } catch (e) { failed.push(String(e.message || e)); }
    }
    if (done) await saveContent(c);
    return { imported: done, failed, remaining: fields.length - done };
  })().finally(() => { g.__importing = null; });
  return g.__importing;
}

export function pendingLegacy(c) {
  return [c.brand.logo, c.about.photo, ...c.results.items].filter((f) => f && !f.mediaId && f.legacy).length;
}
