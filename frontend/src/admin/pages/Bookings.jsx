import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminAPI";
import { DataTable } from "../components/DataTable";
import { ConfirmDialog } from "../components/Modal";
import { useToast } from "../components/Toast";
import { Badge, StatusBadge, fmtMoney, fmtDate, fmtInt } from "../components/primitives";

const typeBadge = { hotel: ["blue", "Hotel"], guide: ["green", "Guide"], car: ["amber", "Car"] };

export default function Bookings() {
    const toast = useToast();
    const [refresh, setRefresh] = useState(0);
    const [type, setType] = useState("all");
    const [status, setStatus] = useState("");
    const [summary, setSummary] = useState(null);
    const [action, setAction] = useState(null); // { kind:'cancel'|'refund', row }

    const bump = () => setRefresh((n) => n + 1);

    useEffect(() => {
        adminApi.bookingsSummary().then(setSummary).catch(() => {});
    }, [refresh]);

    const load = useCallback((params) => adminApi.bookings(params), []);
    const extraParams = useMemo(() => ({ type, status }), [type, status]);

    const columns = [
        {
            key: "type", header: "Type", render: (r) => {
                const [tone, label] = typeBadge[r.type] || ["grey", r.type];
                return <Badge tone={tone}>{label}</Badge>;
            },
        },
        {
            key: "user_email", header: "Guest", render: (r) => (
                <span className="admin-cell-strong">{r.user_email || "—"}</span>
            ),
        },
        {
            key: "item_name", header: "Item", render: (r) => (
                <div>
                    <div>{r.item_name || <span className="muted">(deleted)</span>}</div>
                    {r.item_location && <div className="admin-cell-sub">{r.item_location}</div>}
                </div>
            ),
        },
        {
            key: "dates", header: "Dates", render: (r) => (
                <span className="admin-cell-sub">
                    {fmtDate(r.start_date)}{r.end_date && r.end_date !== r.start_date ? ` → ${fmtDate(r.end_date)}` : ""}
                </span>
            ),
        },
        {
            key: "amount", header: "Amount", align: "right", render: (r) => (
                r.amount != null
                    ? <span className="num">{fmtMoney(r.amount)}</span>
                    : <span className="muted" title="No amount recorded for this booking type">—</span>
            ),
        },
        {
            key: "transaction_id", header: "Txn", render: (r) => (
                r.transaction_id
                    ? <code style={{ fontSize: 11 }}>{String(r.transaction_id).slice(0, 14)}…</code>
                    : <span className="muted">—</span>
            ),
        },
        { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        {
            key: "_a", header: "", align: "right", render: (r) => (
                <div className="admin-row-actions">
                    {!["cancelled", "refunded"].includes(r.status) && (
                        <button className="admin-btn sm" onClick={() => setAction({ kind: "cancel", row: r })}>Cancel</button>
                    )}
                    {r.type === "hotel" && r.status !== "refunded" && (
                        <button className="admin-btn sm danger" onClick={() => setAction({ kind: "refund", row: r })}>Refund</button>
                    )}
                    {r.admin_note && (
                        <span className="material-symbols-outlined" title={r.admin_note} style={{ color: "var(--a-text-3)", fontSize: 18 }}>sticky_note_2</span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Bookings</h2>
                <p>Read-only oversight across hotel, guide and car bookings. Cancel or refund on a guest’s behalf.</p>
            </div>

            {summary && (
                <div className="admin-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
                    <div className="admin-kpi"><div className="label">Total</div><div className="value">{fmtInt(summary.total)}</div></div>
                    <div className="admin-kpi"><div className="label">This week</div><div className="value">{fmtInt(summary.this_week)}</div></div>
                    <div className="admin-kpi"><div className="label">Hotel / Guide / Car</div><div className="value" style={{ fontSize: 18 }}>{summary.hotel} · {summary.guide} · {summary.car}</div></div>
                    <div className="admin-kpi"><div className="label">Cancelled</div><div className="value">{fmtInt(summary.cancelled)}</div></div>
                    <div className="admin-kpi"><div className="label">Refunded</div><div className="value">{fmtInt(summary.refunded)}</div></div>
                </div>
            )}

            <DataTable
                columns={columns}
                load={load}
                extraParams={extraParams}
                refreshToken={refresh}
                searchPlaceholder="Search guest or item…"
                empty={{ icon: "receipt_long", title: "No bookings match these filters" }}
                toolbar={
                    <>
                        <select className="admin-select" value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="all">All types</option>
                            <option value="hotel">Hotel</option>
                            <option value="guide">Guide</option>
                            <option value="car">Car</option>
                        </select>
                        <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="">Any status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </>
                }
            />

            {action && (
                <ConfirmDialog
                    title={action.kind === "cancel" ? "Cancel this booking?" : "Refund this booking?"}
                    message={
                        action.kind === "cancel"
                            ? `The booking is kept for history but marked cancelled, freeing up the reserved dates.`
                            : `Marks the simulated payment of ${fmtMoney(action.row.amount)} as refunded. This is a simulated ledger — no real money moves.`
                    }
                    confirmLabel={action.kind === "cancel" ? "Cancel booking" : "Mark refunded"}
                    icon={action.kind === "cancel" ? "event_busy" : "currency_exchange"}
                    reasonLabel="Note (optional)"
                    onConfirm={async (note) => {
                        const fn = action.kind === "cancel" ? adminApi.cancelBooking : adminApi.refundBooking;
                        await toast.run(fn(action.row.type, action.row.id, note), {
                            success: action.kind === "cancel" ? "Booking cancelled" : "Booking refunded",
                            error: "Action failed",
                        });
                        bump();
                    }}
                    onClose={() => setAction(null)}
                />
            )}
        </div>
    );
}
