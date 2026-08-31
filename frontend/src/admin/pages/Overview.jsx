import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminAPI";
import { TimeSeriesChart } from "../components/Charts";
import { KpiCard, fmtInt, fmtMoney, fmtDateTime, timeAgo } from "../components/primitives";

const RANGES = [
    { days: 14, label: "14d" },
    { days: 30, label: "30d" },
    { days: 90, label: "90d" },
];

function EmergencyWidget({ summary }) {
    const active = summary ? (summary.triggeredUnresolved || 0) + (summary.countingDown || 0) : 0;
    const calm = active === 0;
    return (
        <div className={`admin-emergency-banner ${calm ? "calm" : ""}`}>
            <span className="material-symbols-outlined">{calm ? "verified_user" : "e911_emergency"}</span>
            {calm ? (
                <div>
                    <div style={{ fontWeight: 800 }}>No active emergencies</div>
                    <div style={{ fontSize: 12.5, opacity: 0.9 }}>All Bachao alerts are resolved.</div>
                </div>
            ) : (
                <>
                    <div className="count">{active}</div>
                    <div>
                        <div style={{ fontWeight: 800 }}>
                            {summary.triggeredUnresolved || 0} triggered · {summary.countingDown || 0} counting down
                        </div>
                        <div style={{ fontSize: 12.5, opacity: 0.9 }}>
                            {summary.open || 0} open · {summary.acknowledged || 0} acknowledged
                        </div>
                    </div>
                </>
            )}
            <Link to="/admin/emergency">Open board →</Link>
        </div>
    );
}

export default function Overview() {
    const [stats, setStats] = useState(null);
    const [emergency, setEmergency] = useState(null);
    const [days, setDays] = useState(30);
    const [series, setSeries] = useState({ signups: [], bookings: [], itineraries: [] });
    const [err, setErr] = useState(null);

    useEffect(() => {
        let active = true;
        Promise.all([adminApi.stats(), adminApi.emergencySummary()])
            .then(([s, e]) => { if (active) { setStats(s); setEmergency(e); } })
            .catch((e) => active && setErr(e.message));
        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;
        Promise.all([
            adminApi.signupsSeries(days),
            adminApi.bookingsSeries(days),
            adminApi.itinerarySeries(days),
        ])
            .then(([signups, bookings, itineraries]) => {
                if (active) setSeries({ signups, bookings, itineraries });
            })
            .catch(() => {});
        return () => { active = false; };
    }, [days]);

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Overview</h2>
                <p>Platform health at a glance. Metrics are drawn from live production data.</p>
            </div>

            <EmergencyWidget summary={emergency} />

            {err && <div className="admin-note-box warn"><span className="material-symbols-outlined">error</span>{err}</div>}

            <div className="admin-kpi-grid">
                <KpiCard label="Total users" icon="group" value={stats ? fmtInt(stats.totalUsers) : "—"} />
                <KpiCard label="Active trips" icon="luggage" value={stats ? fmtInt(stats.activeTrips) : "—"} foot="Upcoming hotel stays" />
                <KpiCard label="Bookings · 7d" icon="event_available" value={stats ? fmtInt(stats.bookingsThisWeek) : "—"} foot="Hotel + guide + car" />
                <KpiCard label="Simulated revenue" icon="payments" value={stats ? fmtMoney(stats.simulatedRevenue) : "—"} foot="Hotel bookings" />
                <KpiCard label="Open emergencies" icon="e911_emergency" danger value={stats ? fmtInt(stats.openEmergencies) : "—"} />
                <KpiCard label="Flagged content" icon="flag" value={stats ? fmtInt(stats.flaggedContent) : "—"} foot="Photos + reviews" />
            </div>

            <div className="admin-card" style={{ marginBottom: 16 }}>
                <div className="admin-card-head">
                    <h3>Trends</h3>
                    <span className="sub">Last {days} days</span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                        {RANGES.map((r) => (
                            <button
                                key={r.days}
                                className={`admin-btn sm ${days === r.days ? "primary" : "ghost"}`}
                                onClick={() => setDays(r.days)}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="admin-card-body">
                    <div className="admin-chart-grid">
                        <div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--a-text-2)", marginBottom: 6 }}>Sign-ups over time</div>
                            <TimeSeriesChart data={series.signups} series={[{ key: "count", label: "Sign-ups", color: "#0d79bd" }]} />
                        </div>
                        <div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--a-text-2)", marginBottom: 6 }}>Bookings by type</div>
                            <TimeSeriesChart
                                kind="bar"
                                data={series.bookings}
                                series={[
                                    { key: "hotel", label: "Hotel", color: "#0d79bd" },
                                    { key: "guide", label: "Guide", color: "#1a7f4b" },
                                    { key: "car", label: "Car", color: "#e8a33d" },
                                ]}
                            />
                        </div>
                        <div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--a-text-2)", marginBottom: 6 }}>AI itinerary activity</div>
                            <TimeSeriesChart data={series.itineraries} series={[{ key: "count", label: "Drafts", color: "#7b5cd6" }]} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div className="admin-note-box">
                                <span className="material-symbols-outlined">info</span>
                                <div>
                                    Chatbot and translation usage are not recorded on the current schema, so
                                    “AI activity” tracks itinerary questionnaire generations. See
                                    {" "}<code>ADMIN_PANEL_NOTES.md</code>.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {emergency?.mostUrgent?.length > 0 && (
                <div className="admin-card">
                    <div className="admin-card-head"><h3>Most urgent alerts</h3></div>
                    <div className="admin-card-body" style={{ paddingTop: 8 }}>
                        {emergency.mostUrgent.slice(0, 4).map((a) => (
                            <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--a-border)" }}>
                                <span className={`admin-badge ${a.phase === "resolved" ? "green" : a.phase === "counting_down" ? "amber" : "red"}`}>
                                    {a.phase === "counting_down" ? "Counting down" : a.phase === "resolved" ? "Resolved" : "Triggered"}
                                </span>
                                <strong>{a.sender_username}</strong>
                                <span className="admin-cell-sub">{a.type}</span>
                                <span className="admin-cell-sub" style={{ marginLeft: "auto" }}>
                                    {a.cntdown_end ? fmtDateTime(a.cntdown_end) : timeAgo(a.created_at)}
                                </span>
                            </div>
                        ))}
                        <Link to="/admin/emergency" style={{ display: "inline-block", marginTop: 10, fontSize: 13, fontWeight: 700, color: "var(--a-accent-ink)" }}>
                            Go to Emergency board →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
