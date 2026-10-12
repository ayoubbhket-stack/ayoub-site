import { z } from 'zod';
import { getDb, schema as s } from '@/db';
import { assertSameOrigin, clientIp, handler, ok, rateLimit } from '@/lib/http';

export const dynamic = 'force-dynamic';

const str = (max) => z.string().trim().max(max).optional().default('');
const body = z.object({
  name: z.string().trim().min(3, 'Please enter your full name.').max(80),
  phone: z.string().trim().transform((p) => p.replace(/[^\d+]/g, '').replace(/^\+?20(?=1)/, '0').replace(/^0020/, '0'))
    .refine((p) => /^01[0125]\d{8}$/.test(p), 'Enter an Egyptian mobile number, e.g. 010 1234 5678.'),
  industry: z.string().trim().min(2, 'Tell me your field or industry.').max(80),
  service: str(80), utmSource: str(80), utmMedium: str(80), utmCampaign: str(160), utmContent: str(160), referrer: str(500),
  fbclid: z.boolean().optional(), gclid: z.boolean().optional(), ttclid: z.boolean().optional(),
});

function sourceOf(b) {
  if (b.utmSource) return b.utmSource.toLowerCase();
  if (b.fbclid) return 'facebook';
  if (b.gclid) return 'google';
  if (b.ttclid) return 'tiktok';
  try {
    const h = new URL(b.referrer).hostname.replace(/^www\.|^m\.|^l\./, '');
    if (/facebook|fb\.com/.test(h)) return 'facebook';
    if (/instagram/.test(h)) return 'instagram';
    if (/google\./.test(h)) return 'google';
    if (/tiktok/.test(h)) return 'tiktok';
    if (/snapchat/.test(h)) return 'snapchat';
    return h || 'direct';
  } catch { return 'direct'; }
}

export const POST = handler(async (req) => {
  assertSameOrigin(req);
  rateLimit(`lead:${clientIp(req)}`, 6, 10 * 60000);
  const b = body.parse(await req.json());
  const db = await getDb();
  const [lead] = await db.insert(s.leads).values({
    name: b.name, phone: b.phone, industry: b.industry, service: b.service, source: sourceOf(b),
    utmSource: b.utmSource, utmMedium: b.utmMedium, utmCampaign: b.utmCampaign, utmContent: b.utmContent, referrer: b.referrer,
  }).returning({ id: s.leads.id });
  return ok({ ok: true, id: lead.id }, { status: 201 });
});
