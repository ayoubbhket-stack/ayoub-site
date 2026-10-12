import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { getDb, schema as s } from '@/db';
import { requireAdminPage, can } from '@/lib/auth';
import { STATUSES, leadStats } from '@/lib/leads';
import { parseRange } from '@/lib/range';
import { getContent } from '@/lib/settings';
import { importLegacyImages, pendingLegacy } from '@/lib/importer';
import RangePicker from '@/components/admin/RangePicker';
import { BarList } from '@/components/admin/server-ui';
import { LeadsChart } from '@/components/admin/LeadsChart';

export const metadata = { title: 'Dashboard' };

export default async function Dashboard({ searchParams }) {
  const me = await requireAdminPage('dashboard');
  // first visit after deployment: copy the old site's images into the database
  let imported = null;
  if (can(me, 'content.write') && pendingLegacy(await getContent()) > 0) imported = await importLegacyImages().catch((e) => ({ imported: 0, failed: [e.message] }));
  const r = parseRange(searchParams);
  const st = await leadStats(r);
  const db = await getDb();
  const recent = await db.select().from(s.leads).orderBy(desc(s.leads.createdAt)).limit(8);
  const rate = st.inRange ? Math.round(((st.st.client || 0) / st.inRange) * 100) : 0;
  const label = Object.fromEntries(STATUSES);
  return (
    <>
      {imported && imported.imported > 0 && <div className="notice ok">Imported {imported.imported} images from your old site into the new site.</div>}
      {imported && imported.failed?.length > 0 && <div className="notice bad">Some images could not be copied from the old site ({imported.failed.length}). You can upload them in Site content.</div>}
      <div className="adm-head"><div><h1>Dashboard</h1><p className="sub">{r.from} → {r.to} · Cairo time</p></div><RangePicker preset={r.preset} from={r.from} to={r.to} /></div>
      <div className="kpis">
        <Link href="/admin/leads?status=new" className={`kpi${st.waiting ? ' accent' : ''}`}><span className="k">Waiting for a reply</span><span className="v num">{st.waiting}</span><span className="d">Status “New” — all time</span></Link>
        <div className="kpi"><span className="k">Leads today</span><span className="v num">{st.today}</span></div>
        <div className="kpi"><span className="k">Last 7 days</span><span className="v num">{st.week}</span></div>
        <div className="kpi"><span className="k">In this period</span><span className="v num">{st.inRange}</span><span className="d">{st.total} all time</span></div>
        <div className="kpi"><span className="k">Became clients</span><span className="v num">{st.st.client || 0}</span><span className="d">{rate}% of leads in this period</span></div>
      </div>
      <div className="status-strip" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {STATUSES.map(([k, l]) => <Link key={k} href={`/admin/leads?status=${k}`}><span className="label">{l}</span><b className="num">{st.st[k] || 0}</b></Link>)}
      </div>
      <div className="grid-2">
        <section className="panel"><div className="ph"><h2>Leads per day</h2></div><div className="pb"><LeadsChart data={st.series} /></div></section>
        <section className="panel"><div className="ph"><h2>Where leads come from</h2><span className="label">clients in brackets</span></div><div className="pb">
          <BarList items={st.bySource.map((x) => ({ label: x.source, value: x.n, extra: `${x.clients} client${x.clients === 1 ? '' : 's'}`, href: `/admin/leads?source=${encodeURIComponent(x.source)}` }))} format={(v) => `${v}`} />
          <p className="muted" style={{ fontSize: '.8rem', marginTop: 14 }}>Add <code className="mono">?utm_source=facebook&amp;utm_campaign=…</code> to your ad links to see each campaign here.</p>
        </div></section>
      </div>
      <div className="grid-2">
        <section className="panel"><div className="ph"><h2>Latest leads</h2><Link className="link label" href="/admin/leads">All leads →</Link></div><div className="pb flush tbl-wrap">
          {recent.length ? <table className="tbl"><thead><tr><th>Name</th><th>Phone</th><th>Field</th><th>Source</th><th>Status</th><th>When</th></tr></thead><tbody>
            {recent.map((l) => <tr key={l.id}><td><Link className="rowlink" href={`/admin/leads?open=${l.id}`}>{l.name}</Link></td><td className="mono">{l.phone}</td><td>{l.industry}</td><td className="muted">{l.source}</td><td><span className={`pill ${l.status}`}>{label[l.status]}</span></td><td className="mono muted">{new Date(l.createdAt).toLocaleString('en-GB', { timeZone: 'Africa/Cairo', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td></tr>)}
          </tbody></table> : <div className="empty-adm"><strong>No leads yet</strong><span>Every consultation request from the site will appear here.</span></div>}
        </div></section>
        <section className="panel"><div className="ph"><h2>Top fields</h2></div><div className="pb"><BarList items={st.byIndustry.map((x) => ({ label: x.industry || '—', value: x.n }))} /></div></section>
      </div>
    </>
  );
}
