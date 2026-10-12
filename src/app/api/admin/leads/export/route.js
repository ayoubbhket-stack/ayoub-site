import { requireAdminApi } from '@/lib/auth';
import { csvResponse, handler } from '@/lib/http';
import { STATUSES, listLeads } from '@/lib/leads';

export const dynamic = 'force-dynamic';

export const GET = handler(async (req) => {
  await requireAdminApi('leads.export');
  const { rows } = await listLeads(Object.fromEntries(new URL(req.url).searchParams), { all: true });
  const label = Object.fromEntries(STATUSES);
  return csvResponse(`leads-${new Date().toISOString().slice(0, 10)}.csv`, [
    ['Received', 'Name', 'Phone', 'Field', 'Interested in', 'Status', 'Notes', 'Source', 'UTM source', 'UTM medium', 'UTM campaign', 'UTM content', 'Referrer'],
    ...rows.map((l) => [new Date(l.createdAt).toLocaleString('en-GB', { timeZone: 'Africa/Cairo' }), l.name, l.phone, l.industry, l.service, label[l.status], l.notes, l.source, l.utmSource, l.utmMedium, l.utmCampaign, l.utmContent, l.referrer]),
  ]);
});
