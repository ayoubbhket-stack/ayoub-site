import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '@/lib/auth';
import { handler, ok } from '@/lib/http';
import { saveContent } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const t = (max = 300) => z.string().max(max).default('');
const url = z.string().max(300).refine((v) => !v || /^https?:\/\//.test(v), 'Links must start with https://').default('');
const img = z.object({ mediaId: z.string().uuid().nullable().optional(), legacy: z.string().max(200).nullable().optional() }).nullable();

const schema = z.object({
  brand: z.object({ name: z.string().trim().min(2, 'Name is required.').max(60), role: t(80), logo: img, seoTitle: t(70), seoDescription: t(170), gtmId: z.string().trim().regex(/^(GTM-[A-Z0-9]+)?$/, 'GTM ID looks like GTM-XXXXXXX').default('') }),
  contact: z.object({ whatsapp: z.string().trim().regex(/^\d{10,15}$/, 'WhatsApp number: digits only in international format, e.g. 201555227040'), phoneDisplay: t(30), email: z.string().trim().email('Enter a valid email').or(z.literal('')), facebookUrl: url, facebookLabel: t(80) }),
  hero: z.object({ eyebrow: t(120), headline: z.string().trim().min(2).max(80), highlightLastWord: z.boolean(), tagline: t(160), text: t(300), primaryLabel: t(40), metrics: z.array(z.object({ label: t(30), value: t(12) })).max(4) }),
  ticker: z.array(z.string().max(40)).max(12),
  about: z.object({ photo: img, name: t(80), facts: z.array(z.string().max(60)).max(6), paragraphs: z.array(z.string().max(800)).max(5), skills: z.array(z.string().max(40)).max(12) }),
  stats: z.array(z.object({ value: z.string().regex(/^\d{1,6}$/, 'Stat values must be whole numbers'), suffix: t(4), label: t(40) })).max(4),
  services: z.array(z.object({ icon: t(8), title: z.string().trim().min(2).max(60), text: t(300) })).max(8),
  results: z.object({ title: t(80), text: t(300), items: z.array(z.object({ mediaId: z.string().uuid().nullable().optional(), legacy: z.string().max(200).nullable().optional(), caption: t(120) })).max(30) }),
  consult: z.object({ title: t(80), text: t(300), industries: z.array(z.string().max(40)).max(12) }),
  closing: z.object({ title: t(80), text: t(300) }),
  footer: t(160),
});

export const PUT = handler(async (req) => {
  await requireAdminApi('content.write');
  await saveContent(schema.parse(await req.json()));
  revalidatePath('/');
  return ok({ ok: true });
});
