import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi } from "../../api/adminAPI";
import { useToast } from "../components/Toast";
import { ConfirmDialog } from "../components/Modal";
import { EmptyState, fmtDateTime, timeAgo, untilLabel } from "../components/primitives";

const VIEWS = [
    { key: "active", label: "Active" },
    { key: "all", label: "All" },
    { key: "resolved", label: "Resolved" },
];

const phaseMeta = {
    triggered: { cls: "triggered", badge: "red", label: "Triggered" },
    counting_down: { cls: "counting_down", badge: "amber", label: "Counting down" },
    resolved: { cls: "resolved", badge: "green", label: "Resolved" },
};

function AlertCard({ alert, onAck, onResolve, onReopen }) {
    const meta = phaseMeta[alert.phase] || phaseMeta.triggered;
    const maps = alert.lat && alert.long
        ? `https://www.google.com/maps?q=${alert.lat},${alert.long}`
        : null;

    return (
        <div className={`admin-alert-card ${meta.cls}`}>
            <div className="top">
                <span className={`admin-badge ${meta.badge}`}>
                    <span className="material-symbols-outlined">
                        {alert.phase === "resolved" ? "check_circle" : alert.phase === "counting_down" ? "timer" : "e911_emergency"}
                    </span>
                    {meta.label}
                </span>
                <span className={`admin-badge ${alert.status === "acknowledged" ? "amber" : alert.status === "resolved" ? "green" : "grey"}`}>
                    {alert.status}
                </span>
                <span className="who" style={{ marginLeft: 4 }}>{alert.sender_username}</span>
                <span className="admin-cell-sub">· {alert.type}</span>
                <span className="admin-cell-sub" style={{ marginLeft: "auto" }}>{timeAgo(alert.created_at)}</span>
            </div>

            <div className="meta">
                <span>Contact <b>{alert.sender_email}</b></span>
                <span>Notified <b>{alert.contacts_notified}</b> contact{alert.contacts_notified === 1 ? "" : "s"} · <b>{alert.contacts_acked}</b> acknowledged</span>
                {alert.type === "COUNTDOWN" && alert.cntdown_end && (
                    <span>Timer expiry <b>{fmtDateTime(alert.cntdown_end)}</b> ({untilLabel(alert.cntdown_end)})</span>
                )}
                {maps
                    ? <span>Last location <a href={maps} target="_blank" rel="noreferrer" style={{ color: "var(--a-accent-ink)", fontWeight: 700 }}>{Number(alert.lat).toFixed(4)}, {Number(alert.long).toFixed(4)} ↗</a></span>
                    : <span>Last location <b>not shared</b></span>}
                {alert.handled_by && <span>Handled by <b>{alert.handled_by}</b></span>}
            </div>

            {alert.contacts?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "6px 0" }}>
                    {alert.contacts.map((c, i) => (
                        <span key={i} className={`admin-badge ${c.acked ? "green" : "grey"}`} style={{ fontSize: 11 }}>
                            {c.acked && <span className="material-symbols-outlined">done</span>}
                            {c.username}
                        </span>
                    ))}
                </div>
            )}

            {alert.admin_note && (
                <div className="admin-note-box" style={{ margin: "8px 0 0" }}>
                    <span className="material-symbols-outlined">sticky_note_2</span>
                    <div>{alert.admin_note}</div>
                </div>
            )}

            <div className="acts">
                {alert.status !== "resolved" && (
                    <>
                        {alert.status !== "acknowledged" && (
                            <button className="admin-btn sm" onClick={() => onAck(alert)}>
                                <span className="material-symbols-outlined">visibility</span> Acknowledge
                            </button>
                        )}
                        <button className="admin-btn sm danger-solid" onClick={() => onResolve(alert)}>
                            <span className="material-symbols-outlined">task_alt</span> Resolve
                        </button>
                    </>
                )}
                {alert.status === "resolved" && (
                    <button className="admin-btn sm" onClick={() => onReopen(alert)}>
                        <span className="material-symbols-outlined">restart_alt</span> Reopen
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Emergency() {
    const toast = useToast();
    const [view, setView] = useState("active");
    const [state, setState] = useState({ rows: [], loading: true, error: null });
    const [confirm, setConfirm] = useState(null);
    const timer = useRef(null);

    const load = useCallback(async (silent) => {
        if (!silent) setState((s) => ({ ...s, loading: true }));
        try {
            const params = { limit: 100 };
            if (view === "active") params.view = "active";
            if (view === "resolved") params.status = "resolved";
            const res = await adminApi.emergencyAlerts(params);
            setState({ rows: res.data, loading: false, error: null });
        } catch (e) {
            setState((s) => ({ ...s, loading: false, error: e.message }));
        }
    }, [view]);

    useEffect(() => {
        load();
        timer.current = setInterval(() => load(true), 12000);
        return () => clearInterval(timer.current);
    }, [load]);

    const doAck = async (a) => {
        await toast.run(adminApi.ackAlert(a.id), { success: "Alert acknowledged", error: "Couldn’t acknowledge" });
        load(true);
    };
    const doReopen = async (a) => {
        await toast.run(adminApi.reopenAlert(a.id), { success: "Alert reopened", error: "Couldn’t reopen" });
        load(true);
    };

    const { rows, loading, error } = state;
    const activeCount = rows.filter((r) => r.phase !== "resolved").length;

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2 style={{ color: "var(--a-danger)" }}>Emergency Rescue — Bachao</h2>
                <p>Live countdown timers and triggered alerts, most urgent first. Auto-refreshes every 12 seconds.</p>
            </div>

            <div className={`admin-emergency-banner ${activeCount === 0 ? "calm" : ""}`}>
                <span className="material-symbols-outlined">{activeCount === 0 ? "verified_user" : "e911_emergency"}</span>
                {activeCount === 0
                    ? <div style={{ fontWeight: 800 }}>No active alerts in this view</div>
                    : <><div className="count">{activeCount}</div><div style={{ fontWeight: 800 }}>active alert{activeCount === 1 ? "" : "s"} need attention</div></>}
            </div>

            <div className="admin-toolbar">
                {VIEWS.map((v) => (
                    <button
                        key={v.key}
                        className={`admin-btn sm ${view === v.key ? "primary" : "ghost"}`}
                        onClick={() => setView(v.key)}
                    >
                        {v.label}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <button className="admin-btn ghost sm" onClick={() => load()}>
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </div>

            {loading && rows.length === 0 && (
                <div className="admin-card"><div className="admin-card-body">
                    {[0, 1, 2].map((i) => <span key={i} className="admin-skel" style={{ height: 60, marginBottom: 10 }} />)}
                </div></div>
            )}
            {error && <EmptyState icon="cloud_off" title="Couldn’t load alerts">{error}</EmptyState>}
            {!loading && !error && rows.length === 0 && (
                <EmptyState icon="shield_moon" title="All clear">No alerts match this view.</EmptyState>
            )}

            {rows.map((a) => (
                <AlertCard
                    key={a.id}
                    alert={a}
                    onAck={doAck}
                    onReopen={doReopen}
                    onResolve={(al) => setConfirm(al)}
                />
            ))}

            {confirm && (
                <ConfirmDialog
                    title={`Resolve alert from ${confirm.sender_username}?`}
                    message="Mark this emergency incident as handled. This is recorded with your name and a timestamp."
                    confirmLabel="Mark resolved"
                    icon="task_alt"
                    tone="primary"
                    reasonLabel="Resolution note"
                    reasonRequired
                    onConfirm={async (note) => {
                        await toast.run(adminApi.resolveAlert(confirm.id, note), { success: "Alert resolved", error: "Couldn’t resolve" });
                        load(true);
                    }}
                    onClose={() => setConfirm(null)}
                />
            )}
        </div>
    );
}
