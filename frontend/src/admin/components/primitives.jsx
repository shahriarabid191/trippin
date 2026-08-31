// Small shared presentational pieces + formatters for the admin panel.

export const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

export const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const fmtMoney = (n) =>
    `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtInt = (n) => Number(n || 0).toLocaleString();

export const timeAgo = (d) => {
    if (!d) return "—";
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
};

// Countdown / overdue label for an ISO timestamp.
export const untilLabel = (iso) => {
    if (!iso) return "—";
    const diff = new Date(iso).getTime() - Date.now();
    const abs = Math.abs(diff);
    const m = Math.floor(abs / 60000);
    const h = Math.floor(m / 60);
    const txt = h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
    return diff >= 0 ? `in ${txt}` : `${txt} overdue`;
};

export function Badge({ children, tone = "grey", icon }) {
    return (
        <span className={`admin-badge ${tone}`}>
            {icon && <span className="material-symbols-outlined">{icon}</span>}
            {children}
        </span>
    );
}

export function StatusBadge({ status }) {
    const map = {
        completed: ["green", "Completed"],
        confirmed: ["green", "Confirmed"],
        active: ["green", "Active"],
        pending: ["amber", "Pending"],
        cancelled: ["red", "Cancelled"],
        refunded: ["blue", "Refunded"],
        failed: ["red", "Failed"],
        open: ["red", "Open"],
        acknowledged: ["amber", "Acknowledged"],
        resolved: ["green", "Resolved"],
        suspended: ["red", "Suspended"],
    };
    const [tone, label] = map[status] || ["grey", status || "—"];
    return <Badge tone={tone}>{label}</Badge>;
}

export function EmptyState({ icon = "inbox", title = "Nothing here yet", children }) {
    return (
        <div className="admin-empty">
            <span className="material-symbols-outlined">{icon}</span>
            <h4>{title}</h4>
            {children && <p style={{ margin: 0, fontSize: 13 }}>{children}</p>}
        </div>
    );
}

export function NoteBox({ children, tone = "info", icon = "info" }) {
    return (
        <div className={`admin-note-box ${tone === "warn" ? "warn" : ""}`}>
            <span className="material-symbols-outlined">{icon}</span>
            <div>{children}</div>
        </div>
    );
}

export function KpiCard({ label, value, icon, foot, danger }) {
    return (
        <div className="admin-kpi">
            <div className="label">
                {icon && <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{icon}</span>}
                {label}
            </div>
            <div className={`value ${danger ? "danger" : ""}`}>{value}</div>
            {foot && <div className="foot">{foot}</div>}
        </div>
    );
}

export function Stars({ value }) {
    const v = Math.round(Number(value || 0) * 10) / 10;
    return (
        <span title={`${v} / 5`} style={{ whiteSpace: "nowrap" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#e8a33d", verticalAlign: "-2px" }}>star</span>
            {" "}{v.toFixed(1)}
        </span>
    );
}
