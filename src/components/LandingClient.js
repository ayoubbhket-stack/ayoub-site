'use client';
// Interactive parts of the landing page: motion, 3D hero, results gallery,
// lead form (saves to the database, then opens WhatsApp) and click tracking.
import { useEffect, useRef, useState } from 'react';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const push = (o) => { try { (window.dataLayer = window.dataLayer || []).push(o); } catch { /* ignore */ } };

/** Remember where the visitor came from (first landing in this tab). */
function attribution() {
  try {
    const saved = sessionStorage.getItem('ab_attr');
    if (saved) return JSON.parse(saved);
    const q = new URLSearchParams(location.search);
    const a = {
      utmSource: q.get('utm_source') || '', utmMedium: q.get('utm_medium') || '', utmCampaign: q.get('utm_campaign') || '', utmContent: q.get('utm_content') || '',
      referrer: document.referrer || '', fbclid: !!q.get('fbclid'), gclid: !!q.get('gclid'), ttclid: !!q.get('ttclid'),
    };
    sessionStorage.setItem('ab_attr', JSON.stringify(a));
    return a;
  } catch { return {}; }
}

export function Effects() {
  useEffect(() => {
    attribution();
    const off = [];
    // loader once per tab
    const loader = document.getElementById('loader');
    let seen = false; try { seen = sessionStorage.getItem('ab_seen') === '1'; sessionStorage.setItem('ab_seen', '1'); } catch { seen = true; }
    if (loader) { if (seen || reduced()) loader.remove(); else setTimeout(() => { loader.classList.add('done'); setTimeout(() => loader.remove(), 700); }, 1300); }
    // header
    const hdr = document.getElementById('hdr');
    const onScroll = () => hdr?.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); off.push(() => window.removeEventListener('scroll', onScroll));
    // reveal
    const rv = [...document.querySelectorAll('.rv')];
    if (!reduced() && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
      rv.forEach((el) => { if (el.getBoundingClientRect().top > window.innerHeight * 0.9) io.observe(el); else el.classList.add('in'); });
      off.push(() => io.disconnect());
      // count-up
      const co = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return; co.unobserve(e.target);
        const el = e.target; const to = Number(el.dataset.to); const suf = el.dataset.suffix || ''; if (!Number.isFinite(to)) return;
        const t0 = performance.now();
        const step = (t) => { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - (1 - p) ** 3)) + suf; if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }), { threshold: 0.5 });
      document.querySelectorAll('.count').forEach((c) => co.observe(c));
      off.push(() => co.disconnect());
    } else rv.forEach((el) => el.classList.add('in'));
    // parallax
    const px = [...document.querySelectorAll('[data-parallax]')];
    const par = () => { if (reduced()) return; for (const el of px) { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) continue; const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; el.style.transform = `translate3d(0,${(-p * Number(el.dataset.parallax) * 100).toFixed(2)}%,0)`; } };
    const onPar = () => requestAnimationFrame(par);
    window.addEventListener('scroll', onPar, { passive: true }); par(); off.push(() => window.removeEventListener('scroll', onPar));
    // CTA tracking
    const click = (e) => { const a = e.target.closest?.('[data-track]'); if (a) push({ event: 'cta_click', cta: a.dataset.track }); };
    document.addEventListener('click', click); off.push(() => document.removeEventListener('click', click));
    // cursor
    const cur = document.getElementById('cursor');
    if (cur && !reduced() && window.matchMedia('(pointer: fine)').matches) {
      let x = -99, y = -99, cx = x, cy = y, raf;
      const mv = (e) => { x = e.clientX; y = e.clientY; cur.classList.add('on'); cur.classList.toggle('hover', !!e.target.closest?.('a,button,input,select')); };
      const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; raf = requestAnimationFrame(loop); };
      window.addEventListener('pointermove', mv); loop();
      off.push(() => { window.removeEventListener('pointermove', mv); cancelAnimationFrame(raf); });
    }
    return () => off.forEach((f) => f());
  }, []);
  return null;
}

export function Gallery({ items }) {
  const track = useRef(null); const prog = useRef(null); const drag = useRef(null);
  const [open, setOpen] = useState(null);
  useEffect(() => {
    const tx = track.current;
    const upd = () => { const m = tx.scrollWidth - tx.clientWidth; if (prog.current) prog.current.style.width = `${m ? (tx.scrollLeft / m) * 100 : 0}%`; };
    tx.addEventListener('scroll', upd, { passive: true }); upd();
    const mv = (e) => { const d = drag.current; if (!d) return; d.m = Math.abs(e.clientX - d.x); if (d.m > 4) tx.classList.add('drag'); tx.scrollLeft = d.l - (e.clientX - d.x); };
    const up = () => { setTimeout(() => { drag.current = null; }, 0); tx.classList.remove('drag'); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    return () => { tx.removeEventListener('scroll', upd); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    const k = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', k);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', k); };
  }, [open]);
  return (
    <>
      <div className="track-x" ref={track} tabIndex={0} aria-label="Campaign result screenshots, scroll horizontally"
        onPointerDown={(e) => { if (e.pointerType === 'mouse') drag.current = { x: e.clientX, l: track.current.scrollLeft, m: 0 }; }}>
        {items.map((it, i) => (
          <button key={i} className="shot" onClick={() => { if (drag.current && drag.current.m > 6) return; setOpen(it); }}>
            <div className="frame"><img src={it.url} alt={it.caption} loading="lazy" draggable={false} /></div>
            <div className="cap"><span>{it.caption}</span><span>{String(i + 1).padStart(2, '0')}</span></div>
          </button>
        ))}
      </div>
      <div className="progress" aria-hidden="true"><i ref={prog} /></div>
      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={open.caption} onClick={(e) => e.target.tagName !== 'IMG' && setOpen(null)}>
          <img src={open.url} alt={open.caption} />
          <button type="button" aria-label="Close" autoFocus onClick={() => setOpen(null)}>✕</button>
        </div>
      )}
    </>
  );
}

const WA_ICON = <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.2.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z" /></svg>;

export function LeadForm({ whatsapp, industries, services }) {
  const [f, setF] = useState({ name: '', phone: '', industry: '', service: '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErrs({ ...errs, [k]: '' }); };
  const waText = (x) => `Hi Ayoub, I'd like a free consultation.\nName: ${x.name}\nPhone: ${x.phone}\nField: ${x.industry}${x.service ? `\nInterested in: ${x.service}` : ''}`;
  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 3) er.name = 'Please enter your full name.';
    if (!/^(\+?20|0)?1[0125]\d{8}$/.test(f.phone.replace(/[\s-]/g, ''))) er.phone = 'Enter an Egyptian mobile number, e.g. 010 1234 5678.';
    if (f.industry.trim().length < 2) er.industry = 'Tell me your field or industry.';
    setErrs(er);
    if (Object.keys(er).length) { document.getElementById(`lf-${Object.keys(er)[0]}`)?.focus(); return; }
    setBusy(true);
    // open the WhatsApp tab right away (inside the click) so pop-up blockers allow it
    const win = window.open('', '_blank');
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(waText(f))}`;
    try {
      const r = await fetch('/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...f, ...attribution() }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (d.fields) setErrs(d.fields);
        if (r.status === 422) { win?.close(); setBusy(false); return; }
      }
    } catch { /* still send them to WhatsApp so the lead is not lost */ }
    push({ event: 'generate_lead', form: 'consultation', industry: f.industry });
    if (win) win.location.href = url; else window.location.href = url;
    setDone(f); setBusy(false);
  };
  if (done) {
    return (
      <div className="form lead-ok" role="status">
        <span className="label accent">Received</span>
        <strong>Thanks, {done.name.split(' ')[0]}.</strong>
        <p style={{ color: 'var(--muted)', margin: 0 }}>Your details are saved and WhatsApp should have opened with your message ready to send. If it didn&apos;t open, use the button below.</p>
        <a className="btn wa" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waText(done))}`} target="_blank" rel="noopener">{WA_ICON}Open WhatsApp</a>
      </div>
    );
  }
  const Field = ({ id, label, err, children }) => (
    <div className={`field${err ? ' err' : ''}`}><label htmlFor={`lf-${id}`}>{label}</label>{children}<span className="msg" role="alert">{err}</span></div>
  );
  return (
    <form className="form rv" onSubmit={submit} noValidate style={{ '--d': '120ms' }}>
      {Field({ id: 'name', label: 'Full name', err: errs.name, children: <input id="lf-name" autoComplete="name" value={f.name} onChange={set('name')} /> })}
      {Field({ id: 'phone', label: 'Phone number', err: errs.phone, children: <input id="lf-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01x xxxx xxxx" value={f.phone} onChange={set('phone')} /> })}
      {Field({ id: 'industry', label: 'Field / Industry', err: errs.industry, children: (
        <>
          <input id="lf-industry" list="industries" placeholder="e.g. Real estate, clinic, clothing store" value={f.industry} onChange={set('industry')} />
          <datalist id="industries">{industries.map((x) => <option key={x} value={x} />)}</datalist>
        </>
      ) })}
      {Field({ id: 'service', label: 'Interested in (optional)', children: (
        <select id="lf-service" value={f.service} onChange={set('service')}>
          <option value="">Not sure yet</option>{services.map((s) => <option key={s}>{s}</option>)}
        </select>
      ) })}
      <button className="btn wa" type="submit" disabled={busy}>{WA_ICON}{busy ? 'Sending…' : 'Send via WhatsApp'}</button>
      <p className="note">Your details are only used to reply to you.</p>
    </form>
  );
}

export function Hero3D() {
  const host = useRef(null);
  useEffect(() => {
    let dispose = () => {};
    let cancelled = false;
    const start = async () => {
      try {
        const c = document.createElement('canvas');
        if (!(c.getContext('webgl2') || c.getContext('webgl'))) return;
        const { mountChart } = await import('./chart3d');
        if (!cancelled) dispose = mountChart(host.current, reduced());
      } catch (e) { console.warn('3D unavailable', e); }
    };
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 150));
    idle(start);
    return () => { cancelled = true; dispose(); };
  }, []);
  return <div id="scene" ref={host} aria-hidden="true" />;
}
