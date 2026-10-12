import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, schema as s } from '@/db';
import { HttpError, requireAdminApi } from '@/lib/auth';
import { handler, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const PATCH = handler(async (req, { params }) => {
  await requireAdminApi('leads.write');
  const b = z.object({ status: z.enum(['new', 'contacted', 'qualified', 'client', 'lost']).optional(), notes: z.string().max(4000).optional() }).parse(await req.json());
  const db = await getDb();
  const [l] = await db.update(s.leads).set({ ...b, updatedAt: new Date() }).where(eq(s.leads.id, Number(params.id))).returning({ id: s.leads.id });
  if (!l) throw new HttpError(404, 'Lead not found.');
  return ok({ ok: true });
});

export const DELETE = handler(async (req, { params }) => {
  await requireAdminApi('leads.export');
  const db = await getDb();
  await db.delete(s.leads).where(eq(s.leads.id, Number(params.id)));
  return ok({ ok: true });
});
