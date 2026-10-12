import './site.css';
import { getContent } from '@/lib/settings';
import { imgUrl } from '@/lib/defaults';
import { Effects, Gallery, Hero3D, LeadForm } from '@/components/LandingClient';

const WA = 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.2.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z';

export default async function Landing() {
  const c = await getContent();
  const wa = `https://wa.me/${c.contact.whatsapp}`;
  const words = c.hero.headline.split(/\s+/).filter(Boolean);
  const [tagA, tagB] = c.hero.tagline.includes('|') ? c.hero.tagline.split('|') : ['', c.hero.tagline];
  const [closeA, closeB] = c.closing.title.includes('|') ? c.closing.title.split('|') : [c.closing.title, ''];
  const logo = imgUrl(c.brand.logo);
  const photo = imgUrl(c.about.photo);
  const results = c.results.items.map((it) => ({ url: imgUrl(it), caption: it.caption })).filter((x) => x.url);
  const ticker = [...c.ticker, ...c.ticker];
  const gtm = /^GTM-[A-Z0-9]+$/.test(c.brand.gtmId || '') ? c.brand.gtmId : null;
  return (
    <>
      {gtm && <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');` }} />}
      {gtm && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="gtm" /></noscript>}
      {logo && <link rel="icon" href={logo} />}
      <div className="loader" id="loader" aria-hidden="true"><div className="bars"><i /><i /><i /><i /><i /></div><span className="label">Loading campaign data…</span></div>
      <div className="cursor" id="cursor" aria-hidden="true" />

      <header id="hdr">
        <div className="wrap">
          <a href="#top" className="brand" aria-label={`${c.brand.name}, back to top`}>
            {logo && <img src={logo} alt="" />}
            <div><strong>{c.brand.name}</strong><span>{c.brand.role}</span></div>
          </a>
          <nav className="links" aria-label="Sections"><a href="#about">About</a><a href="#services">Services</a><a href="#results">Results</a><a href="#consult">Consultation</a></nav>
          <div className="head-cta">
            {c.contact.facebookUrl && <a className="btn ghost fb" href={c.contact.facebookUrl} target="_blank" rel="noopener" data-track="facebook_header">Facebook</a>}
            <a className="btn wa" href={wa} target="_blank" rel="noopener" data-track="whatsapp_header">WhatsApp</a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-label="Introduction" style={{ paddingBlock: 0 }}>
          <Hero3D />
          <div className="wrap hero-inner">
            <div>
              <p className="label accent" style={{ marginBottom: 18 }}>{c.hero.eyebrow}</p>
              <h1 aria-label={c.hero.headline}>
                {words.map((w, i) => <span key={i} className={`w${c.hero.highlightLastWord && i === words.length - 1 ? ' hl' : ''}`} aria-hidden="true"><span style={{ '--i': i }}>{w}</span>{i < words.length - 1 ? ' ' : ''}</span>)}
              </h1>
              <p className="tag">{tagA && <b>{tagA}</b>} {tagB}</p>
              <p className="lede">{c.hero.text}</p>
              <div className="row">
                <a className="btn" href="#consult" data-track="hero_primary">{c.hero.primaryLabel} <span aria-hidden="true">→</span></a>
                <a className="btn ghost" href={wa} target="_blank" rel="noopener" data-track="whatsapp_hero">WhatsApp</a>
              </div>
            </div>
            <div className="metrics" aria-label="Key results">
              {c.hero.metrics.map((m, i) => <div key={i}><span className="label">{m.label}</span><b className={i === 0 ? 'up' : ''}>{m.value}</b></div>)}
            </div>
          </div>
          <span className="cue" aria-hidden="true" />
        </section>

        <div className="ticker" aria-label={`Platforms: ${c.ticker.join(', ')}`}>
          <div className="track" aria-hidden="true">{ticker.flatMap((t, i) => [<span key={`t${i}`}>{t}</span>, <i key={`s${i}`}>✦</i>])}</div>
        </div>

        <section id="about">
          <div className="wrap about">
            <div className="photo rv">{photo && <img src={photo} alt={c.about.name} loading="lazy" data-parallax="0.1" />}<span className="stamp">{c.brand.role.split('&')[0].trim()}</span></div>
            <div className="rv" style={{ '--d': '120ms' }}>
              <p className="label accent">About me</p>
              <h2>{c.about.name}</h2>
              <div className="facts">{c.about.facts.map((f) => <span key={f}>{f}</span>)}</div>
              {c.about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              <div className="chips">{c.about.skills.map((s) => <span key={s}>{s}</span>)}</div>
            </div>
          </div>
        </section>

        <section style={{ paddingTop: 0 }} aria-label="Numbers">
          <div className="wrap stats">
            {c.stats.map((s, i) => <div key={i} className="stat rv" style={{ '--d': `${i * 100}ms` }}><b className="count" data-to={s.value} data-suffix={s.suffix}>{s.value}{s.suffix}</b><span className="label">{s.label}</span></div>)}
          </div>
        </section>

        <section id="services" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="svc-head rv"><h2>What I do</h2><p className="label">Tap a service to ask about it on WhatsApp</p></div>
            <div className="svc">
              {c.services.map((s) => (
                <a key={s.title} className="rv" href={`${wa}?text=${encodeURIComponent(`Hi Ayoub, I'm interested in ${s.title}`)}`} target="_blank" rel="noopener" data-track={`service_${s.title}`}>
                  <span className="ic" aria-hidden="true">{s.icon}</span><h3>{s.title}</h3><p>{s.text}</p><span className="arr" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {results.length > 0 && (
          <section id="results" className="results">
            <div className="wrap res-head rv"><div><p className="label accent">Real results</p><h2 style={{ marginTop: 12 }}>{c.results.title}</h2></div><p>{c.results.text}</p></div>
            <Gallery items={results} />
          </section>
        )}

        <section id="consult">
          <div className="wrap consult">
            <div className="rv">
              <p className="label accent">Consultation</p>
              <h2 style={{ marginTop: 12 }}>{c.consult.title.replace(/free/i, '\u0000').split('\u0000').map((part, i, arr) => <span key={i}>{part}{i < arr.length - 1 && <span className="free">free</span>}</span>)}</h2>
              <p style={{ color: 'var(--muted)', marginTop: 22, maxWidth: '44ch' }}>{c.consult.text}</p>
            </div>
            <LeadForm whatsapp={c.contact.whatsapp} industries={c.consult.industries} services={c.services.map((s) => s.title)} />
          </div>
        </section>

        <section className="closing">
          <div className="wrap">
            <h2 className="rv">{closeA}{closeB && <><br /><span className="accent">{closeB}</span></>}</h2>
            <p className="rv">{c.closing.text}</p>
            <a className="btn wa rv" href={wa} target="_blank" rel="noopener" data-track="whatsapp_closing">Chat on WhatsApp 💬</a>
            <div className="contacts rv">
              {c.contact.email && <a href={`mailto:${c.contact.email}`}><span className="label">Email</span><strong>{c.contact.email}</strong></a>}
              <a href={wa} target="_blank" rel="noopener"><span className="label">WhatsApp</span><strong>{c.contact.phoneDisplay}</strong></a>
              {c.contact.facebookUrl && <a href={c.contact.facebookUrl} target="_blank" rel="noopener"><span className="label">Facebook</span><strong>{c.contact.facebookLabel}</strong></a>}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap" style={{ display: 'block' }}>
          <div className="bigname" aria-hidden="true">{c.brand.name.toUpperCase()}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}><span>{c.footer}</span><span className="label">{c.brand.role}</span></div>
        </div>
      </footer>

      <a className="fab" href={wa} target="_blank" rel="noopener" aria-label="Chat on WhatsApp" data-track="whatsapp_float"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={WA} /></svg></a>
      <Effects />
    </>
  );
}
