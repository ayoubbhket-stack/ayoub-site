export function LeadsChart({ data }) {
  const W = 760, H = 220, P = { l: 34, r: 12, t: 12, b: 26 };
  const max = Math.max(4, ...data.map((d) => d.n));
  const top = Math.ceil(max / 4) * 4;
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const x = (i) => P.l + (iw / data.length) * (i + 0.5);
  const y = (v) => P.t + ih - (v / top) * ih;
  const bw = Math.max(2, (iw / data.length) * 0.62);
  const every = Math.ceil(data.length / 10);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Leads per day">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => <g key={t}><line className="grid" x1={P.l} x2={W - P.r} y1={y(top * t)} y2={y(top * t)} /><text x={P.l - 6} y={y(top * t) + 3} textAnchor="end">{top * t}</text></g>)}
      {data.map((d, i) => <g key={d.label}><rect className="bar" x={x(i) - bw / 2} y={y(d.n)} width={bw} height={Math.max(0, P.t + ih - y(d.n))} rx="1.5"><title>{`${d.label}: ${d.n} leads`}</title></rect>{i % every === 0 && <text x={x(i)} y={H - 8} textAnchor="middle">{d.label.slice(5)}</text>}</g>)}
    </svg>
  );
}
