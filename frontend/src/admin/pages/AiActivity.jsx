import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../../api/adminAPI";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { NoteBox, Badge, fmtDateTime } from "../components/primitives";

export default function AiActivity() {
    const [summary, setSummary] = useState(null);
    const [view, setView] = useState(null);
    const load = useCallback((params) => adminApi.aiItineraries(params), []);

    useEffect(() => { adminApi.aiSummary().then(setSummary).catch(() => {}); }, []);

    const columns = [
        { key: "user_email", header: "User", render: (r) => <span className="admin-cell-strong">{r.user_email}</span> },
        {
            key: "answers", header: "Questionnaire", render: (r) => (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {Object.entries(r.answers || {}).slice(0, 5).map(([k, v]) => (
                        <span key={k} className="admin-badge grey" style={{ fontSize: 11 }}>{v}</span>
                    ))}
                </div>
            ),
        },
        { key: "day_count", header: "Days", align: "right", render: (r) => r.day_count || "—" },
        { key: "regenerated", header: "Outcome", render: (r) => <Badge tone="green" icon="check">{r.regenerated ? "Regenerated" : "Generated"}</Badge> },
        { key: "updated_at", header: "Last run", sortable: true, render: (r) => fmtDateTime(r.updated_at) },
        {
            key: "_a", header: "", align: "right", render: (r) => (
                <button className="admin-btn sm ghost" onClick={() => setView(r)}>Inspect</button>
            ),
        },
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>AI Activity</h2>
                <p>Oversight of the itinerary questionnaire generator.</p>
            </div>

            <NoteBox icon="info">
                This schema only records the itinerary questionnaire. Chatbot sessions, translation
                requests and platform-wide AI kill-switches have no data source and are not shown —
                see <code>ADMIN_PANEL_NOTES.md</code> for the extension points.
            </NoteBox>

            <div style={{ height: 12 }} />

            {summary && (
                <div className="admin-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
                    <div className="admin-kpi"><div className="label">Total drafts</div><div className="value">{summary.total_drafts}</div></div>
                    <div className="admin-kpi"><div className="label">Regenerated</div><div className="value">{summary.regenerated}</div></div>
                    <div className="admin-kpi"><div className="label">Last 7 days</div><div className="value">{summary.last_7_days}</div></div>
                </div>
            )}

            <DataTable
                columns={columns}
                load={load}
                initialSort="updated_at"
                searchPlaceholder="Search user or questionnaire answer…"
                empty={{ icon: "smart_toy", title: "No itinerary generations yet" }}
            />

            {view && (
                <Modal title="Itinerary generation" subtitle={`${view.user_email} · ${fmtDateTime(view.updated_at)}`} icon="smart_toy" wide onClose={() => setView(null)}>
                    <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>Questionnaire inputs</h4>
                    <dl className="admin-kv">
                        {Object.entries(view.answers || {}).map(([k, v]) => (
                            <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>
                        ))}
                    </dl>
                    <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--a-text-3)" }}>
                        Generated a {view.day_count || 0}-day plan · created {fmtDateTime(view.created_at)}
                    </div>
                </Modal>
            )}
        </div>
    );
}
