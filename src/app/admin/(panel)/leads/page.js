import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { getDb, schema as s } from '@/db';
import { can, requireAdminPage } from '@/lib/auth';
import { STATUSES, listLeads } from '@/lib/leads';
import { Pager, SortTh, qs } from '@/components/admin/server-ui';
import LeadsTable from '@/components/admin/LeadsTable';

export const metadata = { title: 'Leads' };

export default async function Leads({ searchParams: p }) {
  const me = await requireAdminPage('leads.read');
  const { rows, total, page, pages, per } = await listLeads(p);
  const db = await getDb();
  const sources = (await db.select({ v: s.leads.source }).from(s.leads).groupBy(s.leads.source).orderBy(sql`count(*) desc`)).map((x) => x.v);
  const base = '/admin/leads';
  return (
    <>
      <div className="adm-head"><div><h1>Leads</h1><p className="sub">{total} lead{total === 1 ? '' : 's'} match these filters</p></div>
        {can(me, 'leads.export') && <a className="btn ghost small" href={`/api/admin/leads/export${qs(p, { page: '', open: '' })}`}>Export CSV</a>}</div>
      <form className="panel" method="get" action={base}><div className="pb filters-row">
        <div className="field" style={{ flex: '2 1 220px' }}><label htmlFor="q">Search</label><input id="q" name="q" className="input" defaultValue={p.q} placeholder="Name, phone, field or note" /></div>
        <div className="field"><label htmlFor="status">Status</label><select id="status" name="status" className="select" defaultValue={p.status || ''}><option value="">All</option>{STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div className="field"><label htmlFor="source">Source</label><select id="source" name="source" className="select" defaultValue={p.source || ''}><option value="">All</option>{sources.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div className="field"><label htmlFor="from">From</label><input id="from" name="from" type="date" className="input" defaultValue={p.from} /></div>
        <div className="field"><label htmlFor="to">To</label><input id="to" name="to" type="date" className="input" defaultValue={p.to} /></div>
        <div className="row" style={{ gap: 8 }}><button className="btn small">Filter</button><Link className="btn small ghost" href={base}>Reset</Link></div>
      </div></form>
      <section className="panel">
        <LeadsTable rows={rows.map((l) => ({ ...l, createdAt: l.createdAt.toISOString(), updatedAt: l.updatedAt.toISOString() }))} openId={Number(p.open) || null} canDelete={can(me, 'leads.export')}
          head={<tr><SortTh label="Name" k="name" params={p} base={base} /><th>Phone</th><th>Field</th><SortTh label="Source" k="source" params={p} base={base} /><SortTh label="Status" k="status" params={p} base={base} /><SortTh label="Received" k="created" params={p} base={base} /><th /></tr>} />
        <Pager page={page} pages={pages} total={total} params={p} base={base} per={per} />
      </section>
    </>
  );
}
