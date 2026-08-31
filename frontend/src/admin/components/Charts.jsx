// Dependency-free SVG charts for the admin dashboard. Responsive via
// viewBox; colours come straight from the caller.

const W = 640;
const H = 220;
const PAD = { t: 12, r: 12, b: 26, l: 34 };

const niceMax = (v) => {
    if (v <= 5) return 5;
    const pow = Math.pow(10, Math.floor(Math.log10(v)));
    return Math.ceil(v / pow) * pow;
};

const xLabels = (data) => {
    if (data.length <= 1) return data.map((d, i) => i);
    const step = Math.max(1, Math.round(data.length / 6));
    const idx = [];
    for (let i = 0; i < data.length; i += step) idx.push(i);
    if (idx[idx.length - 1] !== data.length - 1) idx.push(data.length - 1);
    return idx;
};

function Axes({ max }) {
    const rows = [0, 0.25, 0.5, 0.75, 1];
    return (
        <>
            {rows.map((r) => {
                const y = PAD.t + (H - PAD.t - PAD.b) * (1 - r);
                return (
                    <g key={r}>
                        <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="var(--a-border)" strokeWidth="1" />
                        <text x={PAD.l - 6} y={y + 3} textAnchor="end" fontSize="10" fill="var(--a-text-3)">
                            {Math.round(max * r)}
                        </text>
                    </g>
                );
            })}
        </>
    );
}

export function TimeSeriesChart({ data = [], series, kind = "line" }) {
    if (!data.length) {
        return <div className="admin-empty" style={{ padding: 30 }}><span className="material-symbols-outlined">show_chart</span><h4>No activity in this window</h4></div>;
    }

    const max = niceMax(Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key] || 0)))));
    const iw = W - PAD.l - PAD.r;
    const ih = H - PAD.t - PAD.b;
    const x = (i) => PAD.l + (data.length === 1 ? iw / 2 : (iw * i) / (data.length - 1));
    const y = (v) => PAD.t + ih * (1 - Number(v || 0) / max);
    const labelIdx = xLabels(data);
    const fmtX = (d) => new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });

    return (
        <div className="admin-chart">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img">
                <Axes max={max} />

                {kind === "bar" && (() => {
                    const groupW = iw / data.length;
                    const barW = Math.max(2, (groupW * 0.7) / series.length);
                    return data.map((d, i) => (
                        <g key={i}>
                            {series.map((s, si) => {
                                const v = Number(d[s.key] || 0);
                                const bx = PAD.l + groupW * i + groupW * 0.15 + si * barW;
                                return <rect key={s.key} x={bx} y={y(v)} width={barW} height={Math.max(0, PAD.t + ih - y(v))} fill={s.color} rx="1.5" />;
                            })}
                        </g>
                    ));
                })()}

                {kind === "line" && series.map((s) => {
                    const pts = data.map((d, i) => `${x(i)},${y(d[s.key])}`).join(" ");
                    const area = `${PAD.l},${PAD.t + ih} ${pts} ${x(data.length - 1)},${PAD.t + ih}`;
                    return (
                        <g key={s.key}>
                            {series.length === 1 && <polygon points={area} fill={s.color} opacity="0.12" />}
                            <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                            {data.length <= 45 && data.map((d, i) => (
                                <circle key={i} cx={x(i)} cy={y(d[s.key])} r="2" fill={s.color} />
                            ))}
                        </g>
                    );
                })}

                {labelIdx.map((i) => (
                    <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--a-text-3)">
                        {fmtX(data[i])}
                    </text>
                ))}
            </svg>

            {series.length > 1 && (
                <div className="admin-chart-legend">
                    {series.map((s) => (
                        <span key={s.key}><i style={{ background: s.color }} />{s.label}</span>
                    ))}
                </div>
            )}
        </div>
    );
}
