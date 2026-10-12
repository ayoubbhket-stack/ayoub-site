'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, useAdmin } from './ui';

export const STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['qualified', 'Interested'], ['client', 'Became client'], ['lost', 'Not interested']];
const when = (d) => new Date(d).toLocaleString('en-GB', { timeZone: 'Africa/Cairo', day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const intl = (p) => `2${p}`; // 010… -> 2010… (Egypt)

export default function LeadsTable({ rows, head, openId, canDelete }) {
  const router = useRouter();
  const { toast, confirm } = useAdmin();
  const [open, setOpen] = useState(rows.find((r) => r.id === openId) || null);
  const [notes, setNotes] = useState('');
  useEffect(() => setNotes(open?.notes || ''), [open]);
  const patch = async (id, body, msg) => { const r = await api('PATCH', `/api/admin/leads/${id}`, body); if (r.ok) { toast(msg); router.refresh(); return true; } toast(r.error, 'bad'); return false; };
  if (!rows.length) return <div className="empty-adm"><strong>No leads found</strong><span>New consultation requests from your site appear here instantly.</span></div>;
  return (
    <>
      <div className="pb flush tbl-wrap">
        <table className="tbl">
          <thead>{head}</thead>
          <tbody>{rows.map((l) => (
            <tr key={l.id}>
              <td><button className="rowlink" style={{ background: 'none', border: 0, padding: 0, textAlign: 'start' }} onClick={() => setOpen(l)}>{l.name}</button>{l.notes && <div className="muted" style={{ fontSize: '.76rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📝 {l.notes}</div>}</td>
              <td className="mono"><a className="link" href={`https://wa.me/${intl(l.phone)}`} target="_blank" rel="noreferrer">{l.phone}</a></td>
              <td>{l.industry}{l.service && <div className="muted" style={{ fontSize: '.76rem' }}>{l.service}</div>}</td>
              <td className="muted">{l.source}{l.utmCampaign && <div style={{ fontSize: '.74rem' }}>{l.utmCampaign}</div>}</td>
              <td><select className={`select status-select pill ${l.status}`} aria-label={`Status for ${l.name}`} value={l.status} onChange={(e) => patch(l.id, { status: e.target.value }, 'Status updated')}>{STATUSES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></td>
              <td className="mono muted">{when(l.createdAt)}</td>
              <td className="r"><button className="btn small ghost" onClick={() => setOpen(l)}>Open</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {open && (
        <>
          <div className="dlg-scrim" style={{ background: 'rgba(0,0,0,.5)' }} onClick={() => setOpen(null)} />
          <aside className="lead-drawer" role="dialog" aria-modal="true" aria-label={`Lead ${open.name}`}>
            <div className="spread" style={{ alignItems: 'center' }}><h2 className="display-s">{open.name}</h2><button className="icon-btn" aria-label="Close" onClick={() => setOpen(null)}>✕</button></div>
            <div className="row" style={{ gap: 8 }}>
              <a className="btn small" style={{ '--b': '#25d366', background: '#25d366' }} href={`https://wa.me/${intl(open.phone)}?text=${encodeURIComponent(`Hi ${open.name.split(' ')[0]}, this is Ayoub — thanks for reaching out about a consultation.`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
              <a className="btn small ghost" href={`tel:${open.phone}`}>Call</a>
              <span className="mono" style={{ alignSelf: 'center' }}>{open.phone}</span>
            </div>
            <dl className="kv">
              <dt>Field</dt><dd>{open.industry}</dd>
              {open.service && <><dt>Interested in</dt><dd>{open.service}</dd></>}
              <dt>Received</dt><dd>{when(open.createdAt)}</dd>
              <dt>Source</dt><dd>{open.source}</dd>
              {open.utmCampaign && <><dt>Campaign</dt><dd>{open.utmCampaign}</dd></>}
              {open.utmMedium && <><dt>Medium</dt><dd>{open.utmMedium}</dd></>}
              {open.utmContent && <><dt>Ad</dt><dd>{open.utmContent}</dd></>}
              {open.referrer && <><dt>Came from</dt><dd style={{ fontSize: '.8rem' }}>{open.referrer}</dd></>}
            </dl>
            <div className="field"><label htmlFor="ld-status">Status</label>
              <select id="ld-status" className="select" value={open.status} onChange={async (e) => { const v = e.target.value; if (await patch(open.id, { status: v }, 'Status updated')) setOpen({ ...open, status: v }); }}>{STATUSES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
            </div>
            <div className="field"><label htmlFor="ld-notes">Notes</label><textarea id="ld-notes" className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Budget, follow-up date, what they need…" /></div>
            <button className="btn" disabled={notes === (open.notes || '')} onClick={async () => { if (await patch(open.id, { notes }, 'Notes saved')) setOpen({ ...open, notes }); }}>Save notes</button>
            {canDelete && <button className="btn small danger" style={{ justifySelf: 'start' }} onClick={async () => {
              if (!(await confirm({ title: `Delete ${open.name}?`, body: 'This lead will be removed permanently.', danger: true, confirmLabel: 'Delete' }))) return;
              const r = await api('DELETE', `/api/admin/leads/${open.id}`); if (r.ok) { toast('Lead deleted'); setOpen(null); router.refresh(); } else toast(r.error, 'bad');
            }}>Delete lead</button>}
          </aside>
        </>
      )}
    </>
  );
}
