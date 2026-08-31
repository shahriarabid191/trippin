import { useCallback, useMemo, useState } from "react";
import { adminApi } from "../../api/adminAPI";
import { DataTable } from "../components/DataTable";
import { ConfirmDialog } from "../components/Modal";
import { useToast } from "../components/Toast";
import { Badge, fmtDate } from "../components/primitives";

const typeTone = { hotel: "blue", guide: "green", car: "amber" };

export default function ModerationReviews() {
    const toast = useToast();
    const [refresh, setRefresh] = useState(0);
    const [type, setType] = useState("all");
    const [flagged, setFlagged] = useState("");
    const [act, setAct] = useState(null);

    const bump = () => setRefresh((n) => n + 1);
    const load = useCallback((params) => adminApi.modReviews(params), []);
    const extraParams = useMemo(() => ({ type, flagged }), [type, flagged]);
    const quick = async (fn, msg) => { await toast.run(fn, { success: msg, error: "Action failed" }); bump(); };

    const columns = [
        { key: "type", header: "For", render: (r) => <Badge tone={typeTone[r.type]}>{r.type}</Badge> },
        {
            key: "item_name", header: "Item / Author", render: (r) => (
                <div>
                    <div className="admin-cell-strong">{r.item_name || "—"}</div>
                    <div className="admin-cell-sub">{r.user_email}</div>
                </div>
            ),
        },
        { key: "rating", header: "Rating", align: "center", render: (r) => <span className="num">{r.rating}★</span> },
        {
            key: "comment", header: "Comment", render: (r) => (
                <div style={{ maxWidth: 340 }}>
                    <span>{r.comment || <span className="muted">(no text)</span>}</span>
                    {r.flagged_at && <div><Badge tone="red" icon="flag">{r.flag_reason || "Flagged"}</Badge></div>}
                </div>
            ),
        },
        { key: "created_at", header: "Date", render: (r) => fmtDate(r.created_at) },
        {
            key: "_a", header: "", align: "right", render: (r) => (
                <div className="admin-row-actions">
                    {r.flagged_at
                        ? <button className="admin-btn sm ghost" onClick={() => quick(adminApi.unflagReview(r.type, r.id), "Flag cleared")}>Unflag</button>
                        : <button className="admin-btn sm" onClick={() => setAct({ kind: "flag", row: r })}>Flag</button>}
                    <button className="admin-btn sm danger" onClick={() => setAct({ kind: "delete", row: r })}>Remove</button>
                </div>
            ),
        },
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Review Moderation</h2>
                <p>Ratings and written reviews across hotels, guides and car services. Flag suspicious reviews or remove abusive ones.</p>
            </div>

            <DataTable
                columns={columns}
                load={load}
                extraParams={extraParams}
                refreshToken={refresh}
                searchPlaceholder="Search comment, author or item…"
                empty={{ icon: "reviews", title: "No reviews match" }}
                toolbar={
                    <>
                        <select className="admin-select" value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="all">All types</option>
                            <option value="hotel">Hotels</option>
                            <option value="guide">Guides</option>
                            <option value="car">Cars</option>
                        </select>
                        <select className="admin-select" value={flagged} onChange={(e) => setFlagged(e.target.value)}>
                            <option value="">All reviews</option>
                            <option value="true">Flagged only</option>
                        </select>
                    </>
                }
            />

            {act?.kind === "flag" && (
                <ConfirmDialog
                    title="Flag this review"
                    message="Marks the review for follow-up. It stays visible until removed."
                    confirmLabel="Flag review" tone="primary" icon="flag" reasonLabel="Reason" reasonRequired
                    onConfirm={(r) => quick(adminApi.flagReview(act.row.type, act.row.id, r), "Review flagged")}
                    onClose={() => setAct(null)}
                />
            )}
            {act?.kind === "delete" && (
                <ConfirmDialog
                    title="Remove this review?"
                    message="Permanently deletes the review. This cannot be undone."
                    confirmLabel="Remove review" reasonLabel="Reason (optional)"
                    onConfirm={() => quick(adminApi.deleteReview(act.row.type, act.row.id), "Review removed")}
                    onClose={() => setAct(null)}
                />
            )}
        </div>
    );
}
