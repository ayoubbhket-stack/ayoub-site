import crypto from 'node:crypto';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb, schema as s } from '@/db';
import { HttpError, countAdmins, hashPassword, login, setSessionCookie, validatePassword } from '@/lib/auth';
import { assertSameOrigin, clientIp, handler, rateLimit } from '@/lib/http';

export const dynamic = 'force-dynamic';

// Owner creation (first run) and owner password recovery. Both require the
// SETUP_TOKEN from the server environment, so only the site owner can use it.
export const POST = handler(async (req) => {
  assertSameOrigin(req);
  rateLimit(`setup:${clientIp(req)}`, 5, 10 * 60000);
  if (!process.env.SETUP_TOKEN) throw new HttpError(403, 'Setup is locked. Set SETUP_TOKEN on the server.');
  const b = z.object({ token: z.string(), name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email(), password: z.string() }).parse(await req.json());
  const a = Buffer.from(b.token); const e = Buffer.from(process.env.SETUP_TOKEN);
  if (a.length !== e.length || !crypto.timingSafeEqual(a, e)) throw new HttpError(403, 'Setup token is incorrect.');
  const bad = validatePassword(b.password); if (bad) throw new HttpError(422, bad);
  const db = await getDb();
  if ((await countAdmins()) > 0) {
    // recovery: with the server's SETUP_TOKEN, an existing owner can set a new password
    const [u] = await db.select().from(s.adminUsers).where(eq(s.adminUsers.email, b.email));
    if (!u || u.role !== 'owner') throw new HttpError(403, 'An administrator already exists. To recover access, enter the existing owner email.');
    await db.update(s.adminUsers).set({ passwordHash: await hashPassword(b.password), failedAttempts: 0, lockedUntil: null, active: true }).where(eq(s.adminUsers.id, u.id));
    await db.delete(s.adminSessions).where(eq(s.adminSessions.userId, u.id));
  } else {
    await db.insert(s.adminUsers).values({ email: b.email, name: b.name, role: 'owner', passwordHash: await hashPassword(b.password) });
  }
  const r = await login(b.email, b.password, { ip: clientIp(req) });
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, r.token);
  return res;
});
