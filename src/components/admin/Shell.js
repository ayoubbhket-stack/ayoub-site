'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mark } from './Mark';

const I = (d) => () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const IC = {
  dash: I('M4 13h6V4H4zM14 20h6V11h-6zM4 20h6v-4H4zM14 7h6V4h-6z'),
  leads: I('M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 8v6M22 11h-6'),
  content: I('M4 4h16v16H4zM4 9h16M9 9v11'),
  acct: I('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 20a7 7 0 0 1 14 0'),
  site: I('M3 9l1-5h16l1 5M4 9v11h16V9M9 20v-6h6v6'),
};

export default function Shell({ me, name, newLeads, canContent, children }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const nav = [['/admin', 'Dashboard', 'dash'], ['/admin/leads', 'Leads', 'leads', newLeads], ...(canContent ? [['/admin/content', 'Site content', 'content']] : []), ['/admin/account', 'Account', 'acct']];
  const active = (h) => (h === '/admin' ? path === '/admin' : path.startsWith(h));
  return (
    <div className="adm">
      <aside className={`adm-side${open ? ' open' : ''}`} aria-label="Admin navigation">
        <Link href="/admin" className="logo"><Mark />{name}<small>ADMIN</small></Link>
        <nav className="adm-nav">
          {nav.map(([h, l, ic, badge]) => { const C = IC[ic]; return <Link key={h} href={h} aria-current={active(h) ? 'page' : undefined}><C />{l}{badge > 0 && <span className="n">{badge}</span>}</Link>; })}
          <span className="grp">View</span>
          <a href="/" target="_blank" rel="noreferrer">{(() => { const C = IC.site; return <C />; })()}Open site ↗</a>
        </nav>
        <div className="me">
          <strong>{me.name}</strong><span className="muted" style={{ fontSize: '.8rem', overflowWrap: 'anywhere' }}>{me.email}</span>
          <button className="link" style={{ background: 'none', border: 0, padding: 0, fontSize: '.82rem', color: 'var(--muted)', justifySelf: 'start' }} onClick={async () => { await fetch('/api/admin/auth/logout', { method: 'POST' }); router.replace('/admin/login'); router.refresh(); }}>Sign out</button>
        </div>
      </aside>
      <div className="adm-main">
        <header className="adm-top">
          <button className="icon-btn adm-burger" aria-label="Open navigation" onClick={() => setOpen(true)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 8h16M4 16h10" /></svg></button>
          <form role="search" onSubmit={(e) => { e.preventDefault(); router.push(`/admin/leads?q=${encodeURIComponent(new FormData(e.currentTarget).get('q'))}`); }}>
            <label htmlFor="adm-q" className="sr-only">Search leads</label>
            <input id="adm-q" name="q" className="input" placeholder="Search leads by name, phone or field" />
          </form>
        </header>
        <main className="adm-body">{children}</main>
      </div>
      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 70 }} onClick={() => setOpen(false)} aria-hidden="true" />}
    </div>
  );
}
