'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, Dropzone, F, Toggle, uploadFiles, useAdmin } from './ui';

const OLD = 'https://ayoub-bhket.pages.dev';
const src = (f) => (f?.mediaId ? `/api/media/${f.mediaId}` : f?.legacy ? `${OLD}/${encodeURI(f.legacy)}` : f?.src || null);
const list = (v) => v.split(',').map((x) => x.trim()).filter(Boolean);

function Img({ label, value, onChange }) {
  const { toast } = useAdmin();
  const [busy, setBusy] = useState(false);
  const url = src(value);
  return (
    <div className="stack" style={{ gap: 8 }}>
      <span className="label" style={{ fontSize: '.64rem' }}>{label}</span>
      {url && <div className="img-tile" style={{ maxWidth: 200 }}><img src={url} alt="" /><div className="bar"><span className="label" style={{ fontSize: '.58rem' }}>{value?.mediaId ? 'Uploaded' : value?.legacy ? 'From old site' : 'Built-in'}</span></div></div>}
      <Dropzone multiple={false} busy={busy} label={url ? 'Replace image' : 'Upload image'} onFiles={async (files) => {
        if (!files.length) return; setBusy(true);
        try { const [m] = await uploadFiles(files.slice(0, 1)); onChange({ mediaId: m.id, legacy: null, src: null }); toast('Image uploaded — press Save to publish'); } catch (e) { toast(e.message, 'bad'); } finally { setBusy(false); }
      }} />
    </div>
  );
}

function Rows({ items, onChange, blank, render, add = 'Add' }) {
  const mv = (i, d) => { const a = [...items]; [a[i], a[i + d]] = [a[i + d], a[i]]; onChange(a); };
  return (
    <div className="repeater">
      {items.map((it, i) => (
        <div className="repeater-item" key={i}>
          {render(it, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
          <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
            <button type="button" className="btn small ghost" disabled={i === 0} onClick={() => mv(i, -1)} aria-label="Move up">↑</button>
            <button type="button" className="btn small ghost" disabled={i === items.length - 1} onClick={() => mv(i, 1)} aria-label="Move down">↓</button>
            <button type="button" className="btn small danger" onClick={() => onChange(items.filter((_, j) => j !== i))}>Remove</button>
          </div>
        </div>
      ))}
      {blank && <button type="button" className="btn small ghost" style={{ justifySelf: 'start' }} onClick={() => onChange([...items, structuredClone(blank)])}>+ {add}</button>}
    </div>
  );
}

export default function ContentEditor({ initial, pending }) {
  const router = useRouter();
  const { toast } = useAdmin();
  const [c, setC] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState(false);
  const set = (path, v) => { setC((x) => { const y = structuredClone(x); const ks = path.split('.'); let o = y; ks.slice(0, -1).forEach((k) => { o = o[k]; }); o[ks.at(-1)] = v; return y; }); setDirty(true); };
  const get = (path) => path.split('.').reduce((o, k) => o?.[k], c);
  const inp = (path, label, o = {}) => (
    <F id={`c-${path}`} label={label} hint={o.hint} full={o.full}>
      {o.area ? <textarea id={`c-${path}`} className="textarea" style={{ minHeight: o.rows || 80 }} value={get(path) ?? ''} onChange={(e) => set(path, e.target.value)} />
        : <input id={`c-${path}`} className={`input${o.mono ? ' mono' : ''}`} value={get(path) ?? ''} onChange={(e) => set(path, e.target.value)} />}
    </F>
  );
  const csv = (path, label, hint) => (
    <F id={`c-${path}`} label={label} hint={hint || 'Separate with commas'} full><input id={`c-${path}`} className="input" defaultValue={get(path).join(', ')} onChange={(e) => set(path, list(e.target.value))} /></F>
  );
  const save = async () => {
    setBusy(true);
    const r = await api('PUT', '/api/admin/content', c);
    setBusy(false);
    if (r.ok) { toast('Saved — your site is updated'); setDirty(false); router.refresh(); }
    else toast(`${r.error} ${Object.entries(r.fields || {})[0]?.join(': ') || ''}`, 'bad');
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div className="adm-head"><div><h1>Site content</h1><p className="sub">Edit anything on your page, then press Save. Changes go live immediately.</p></div><a className="btn ghost small" href="/" target="_blank" rel="noreferrer">View site ↗</a></div>
      {pending > 0 && (
        <div className="notice row" style={{ justifyContent: 'space-between' }}>
          <span>{pending} image{pending > 1 ? 's are' : ' is'} still loaded from your old site. Copy them here so the new site doesn&apos;t depend on it.</span>
          <button className="btn small" disabled={up} onClick={async () => { setUp(true); const r = await api('POST', '/api/admin/import'); setUp(false); if (r.ok) { toast(`Copied ${r.data.imported} image(s)${r.data.failed.length ? `, ${r.data.failed.length} failed` : ''}`, r.data.failed.length ? 'bad' : 'ok'); router.refresh(); window.location.reload(); } else toast(r.error, 'bad'); }}>{up ? 'Copying…' : 'Copy images now'}</button>
        </div>
      )}

      <section className="panel"><div className="ph"><h2>Brand &amp; Google</h2></div><div className="pb form-grid">
        {inp('brand.name', 'Your name')}{inp('brand.role', 'Title under your name')}
        {inp('brand.seoTitle', 'Google title', { hint: 'Shown in Google results and the browser tab (max 70)' })}{inp('brand.gtmId', 'Google Tag Manager ID', { mono: true, hint: 'e.g. GTM-KPMZ5J47. Leave empty to turn off' })}
        {inp('brand.seoDescription', 'Google description', { area: true, full: true, rows: 60 })}
        <div className="full"><Img label="Logo / profile picture" value={c.brand.logo} onChange={(v) => set('brand.logo', v)} /></div>
      </div></section>

      <section className="panel"><div className="ph"><h2>Contact</h2></div><div className="pb form-grid">
        {inp('contact.whatsapp', 'WhatsApp number (international)', { mono: true, hint: 'Digits only, e.g. 201555227040' })}{inp('contact.phoneDisplay', 'Phone as shown on the page')}
        {inp('contact.email', 'Email')}{inp('contact.facebookUrl', 'Facebook link')}{inp('contact.facebookLabel', 'Facebook page name')}
      </div></section>

      <section className="panel"><div className="ph"><h2>Top of the page</h2></div><div className="pb form-grid">
        {inp('hero.eyebrow', 'Small line above the headline', { full: true })}
        {inp('hero.headline', 'Headline')}
        <div style={{ alignSelf: 'end' }}><Toggle id="hl" label="Last word in orange" checked={c.hero.highlightLastWord} onChange={(v) => set('hero.highlightLastWord', v)} /></div>
        {inp('hero.tagline', 'Tagline', { full: true, hint: 'Text before | is orange, e.g. Media Buyer.|Growth Driver.' })}
        {inp('hero.text', 'Short description', { area: true, full: true, rows: 60 })}
        {inp('hero.primaryLabel', 'Main button text')}
        <div className="full"><span className="label" style={{ fontSize: '.64rem' }}>Numbers on the right</span>
          <Rows items={c.hero.metrics} blank={{ label: '', value: '' }} add="Add number" onChange={(a) => set('hero.metrics', a)} render={(m, p) => (
            <div className="form-grid"><F label="Label"><input className="input" value={m.label} onChange={(e) => p({ label: e.target.value })} /></F><F label="Value"><input className="input" value={m.value} onChange={(e) => p({ value: e.target.value })} /></F></div>
          )} />
        </div>
        {csv('ticker', 'Moving strip of platforms')}
      </div></section>

      <section className="panel"><div className="ph"><h2>About me</h2></div><div className="pb form-grid">
        <div className="full"><Img label="Your photo" value={c.about.photo} onChange={(v) => set('about.photo', v)} /></div>
        {inp('about.name', 'Full name', { full: true })}
        {csv('about.facts', 'Short facts', 'e.g. 22 years old, B.Sc. Chemistry')}
        <F id="c-par" label="About text" hint="Leave an empty line between paragraphs" full><textarea id="c-par" className="textarea" style={{ minHeight: 140 }} defaultValue={c.about.paragraphs.join('\n\n')} onChange={(e) => set('about.paragraphs', e.target.value.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean))} /></F>
        {csv('about.skills', 'Skills')}
      </div></section>

      <section className="panel"><div className="ph"><h2>Big numbers</h2></div><div className="pb">
        <Rows items={c.stats} blank={{ value: '0', suffix: '+', label: '' }} add="Add number" onChange={(a) => set('stats', a)} render={(s, p) => (
          <div className="form-grid-3"><F label="Number"><input className="input mono" value={s.value} onChange={(e) => p({ value: e.target.value.replace(/\D/g, '') })} /></F><F label="After the number"><input className="input mono" value={s.suffix} onChange={(e) => p({ suffix: e.target.value })} placeholder="+ or x or %" /></F><F label="Label"><input className="input" value={s.label} onChange={(e) => p({ label: e.target.value })} /></F></div>
        )} />
      </div></section>

      <section className="panel"><div className="ph"><h2>Services</h2></div><div className="pb">
        <Rows items={c.services} blank={{ icon: '✨', title: '', text: '' }} add="Add service" onChange={(a) => set('services', a)} render={(s, p) => (
          <div className="form-grid"><F label="Icon (emoji)"><input className="input" value={s.icon} onChange={(e) => p({ icon: e.target.value })} /></F><F label="Title"><input className="input" value={s.title} onChange={(e) => p({ title: e.target.value })} /></F><F label="Description" full><textarea className="textarea" style={{ minHeight: 60 }} value={s.text} onChange={(e) => p({ text: e.target.value })} /></F></div>
        )} />
      </div></section>

      <section className="panel"><div className="ph"><h2>Websites I built</h2><span className="label">Shown in this order</span></div><div className="pb stack" style={{ gap: 14 }}>
        <div className="form-grid">{inp('websites.title', 'Section title')}{inp('websites.text', 'Section text')}</div>
        <Rows items={c.websites.items} blank={{ name: '', category: '', url: 'https://', image: null }} add="Add website" onChange={(a) => set('websites.items', a)} render={(w, p) => (
          <div className="form-grid"><F label="Website name"><input className="input" value={w.name} onChange={(e) => p({ name: e.target.value })} /></F><F label="Type (e.g. Clinic website)"><input className="input" value={w.category} onChange={(e) => p({ category: e.target.value })} /></F><F label="Link" full><input className="input mono" value={w.url} onChange={(e) => p({ url: e.target.value.trim() })} /></F><div className="full"><Img label="Screenshot" value={w.image} onChange={(v) => p({ image: v })} /></div></div>
        )} />
      </div></section>

      <section className="panel"><div className="ph"><h2>Results (screenshots)</h2><span className="label">First image shows first</span></div><div className="pb stack" style={{ gap: 14 }}>
        <div className="form-grid">{inp('results.title', 'Section title')}{inp('results.text', 'Section text')}</div>
        <div className="img-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {c.results.items.map((it, i) => (
            <div className="img-tile" key={(it.mediaId || it.legacy || '') + i}>
              <img src={src(it)} alt={it.caption} style={{ aspectRatio: '4/5', objectPosition: 'top' }} />
              <input className="input" style={{ minHeight: 32, fontSize: '.78rem', borderRadius: 0, border: 0, borderTop: '1px solid var(--line)' }} aria-label="Caption" value={it.caption} onChange={(e) => set('results.items', c.results.items.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} />
              <div className="bar">
                <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => { const a = [...c.results.items]; [a[i], a[i - 1]] = [a[i - 1], a[i]]; set('results.items', a); }}>←</button>
                <button type="button" aria-label="Move right" disabled={i === c.results.items.length - 1} onClick={() => { const a = [...c.results.items]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; set('results.items', a); }}>→</button>
                <button type="button" aria-label="Remove" onClick={() => set('results.items', c.results.items.filter((_, j) => j !== i))}>✕</button>
              </div>
            </div>
          ))}
        </div>
        <Dropzone busy={up} label="Add screenshots (you can select several)" onFiles={async (files) => {
          setUp(true);
          try { const ms = await uploadFiles(files); set('results.items', [...c.results.items, ...ms.map((m) => ({ mediaId: m.id, legacy: null, caption: 'Campaign result' }))]); toast(`${ms.length} image(s) added — press Save to publish`); } catch (e) { toast(e.message, 'bad'); } finally { setUp(false); }
        }} />
      </div></section>

      <section className="panel"><div className="ph"><h2>Consultation form</h2></div><div className="pb form-grid">
        {inp('consult.title', 'Title', { hint: 'The word “free” is highlighted automatically' })}{inp('consult.text', 'Text')}
        {csv('consult.industries', 'Suggested fields in the form')}
      </div></section>

      <section className="panel"><div className="ph"><h2>Ending &amp; footer</h2></div><div className="pb form-grid">
        {inp('closing.title', 'Closing headline', { hint: 'Text after | goes on a new line in orange' })}{inp('closing.text', 'Closing text')}
        {inp('footer', 'Footer text', { full: true })}
      </div></section>

      <div className="saving-bar">{dirty && <span className="muted" style={{ fontSize: '.85rem' }}>Unsaved changes</span>}<button className="btn" disabled={busy || !dirty} onClick={save}>{busy ? 'Saving…' : 'Save & publish'}</button></div>
    </div>
  );
}
