import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/adminAPI";
import { useToast } from "../components/Toast";
import { ConfirmDialog } from "../components/Modal";
import { Badge, NoteBox, StatusBadge, EmptyState, fmtDate, fmtMoney, fmtDateTime } from "../components/primitives";

const roleTone = { admin: "red", moderator: "amber", user: "grey" };

function Section({ title, count, children }) {
    return (
        <div className="admin-card" style={{ marginBottom: 14 }}>
            <div className="admin-card-head">
                <h3>{title}</h3>
                {count != null && <span className="sub">{count}</span>}
            </div>
            <div className="admin-card-body" style={{ padding: 0 }}>{children}</div>
        </div>
    );
}

function MiniTable({ head, rows, render, empty }) {
    if (!rows?.length) return <div style={{ padding: 16 }}><EmptyState icon="inbox" title={empty} /></div>;
    return (
        <div className="admin-table-wrap" style={{ border: "none", boxShadow: "none", borderRadius: 0 }}>
            <table className="admin-table">
                <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>{rows.map(render)}</tbody>
            </table>
        </div>
    );
}

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [data, setData] = useState(null);
    const [err, setErr] = useState(null);
    const [confirm, setConfirm] = useState(null);

    const load = useCallback(() => {
        setErr(null);
        adminApi.user(id).then(setData).catch((e) => setErr(e.message));
    }, [id]);

    useEffect(() => { load(); }, [load]);

    if (err) return <div className="admin-page"><EmptyState icon="person_off" title="Couldn’t load this user">{err}</EmptyState></div>;
    if (!data) return <div className="admin-page"><span className="admin-skel" style={{ height: 120 }} /></div>;

    const u = data.user;

    return (
        <div className="admin-page">
            <div className="admin-page-head" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="admin-btn ghost sm" onClick={() => navigate("/admin/users")}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h2 style={{ marginBottom: 2 }}>{u.username || u.email}</h2>
                    <p>{u.email} · joined {fmtDate(u.created_at)}</p>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <Badge tone={roleTone[u.role]}>{u.role}</Badge>
                    {u.suspended_at ? <Badge tone="red" icon="block">Suspended</Badge> : <Badge tone="green" icon="check_circle">Active</Badge>}
                </div>
            </div>

            <div className="admin-detail-grid">
                <div>
                    <div className="admin-card" style={{ marginBottom: 14 }}>
                        <div className="admin-card-head"><h3>Account</h3></div>
                        <div className="admin-card-body">
                            <dl className="admin-kv">
                                <div><dt>User ID</dt><dd>#{u.id}</dd></div>
                                <div><dt>Role</dt><dd>{u.role}</dd></div>
                                <div><dt>Bookings</dt><dd>{u.booking_count}</dd></div>
                                <div><dt>Reviews</dt><dd>{u.review_count}</dd></div>
                                <div><dt>Gallery photos</dt><dd>{u.photo_count}</dd></div>
                                <div><dt>Public journals</dt><dd>{u.public_journal_count}</dd></div>
                                <div><dt>Vault documents</dt><dd>{u.vault_doc_count}</dd></div>
                            </dl>
                            {u.suspended_at && (
                                <div style={{ marginTop: 12 }}>
                                    <NoteBox tone="warn" icon="block">
                                        Suspended {fmtDateTime(u.suspended_at)}{u.suspend_reason ? ` — ${u.suspend_reason}` : ""}
                                    </NoteBox>
                                </div>
                            )}
                            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                                {u.suspended_at
                                    ? <button className="admin-btn" onClick={async () => { await toast.run(adminApi.unsuspendUser(u.id), { success: "Reinstated", error: "Failed" }); load(); }}>Reinstate</button>
                                    : <button className="admin-btn danger" onClick={() => setConfirm("suspend")}>Suspend account</button>}
                            </div>
                        </div>
                    </div>

                    <NoteBox icon="privacy_tip">
                        Vault file contents, private journal text and travel-buddy chat are never exposed here —
                        only counts and document metadata.
                    </NoteBox>

                    {data.vaultDocuments?.length > 0 && (
                        <div className="admin-card" style={{ marginTop: 14 }}>
                            <div className="admin-card-head"><h3>Vault — metadata only</h3><span className="sub">{data.vaultDocuments.length}</span></div>
                            <div className="admin-card-body" style={{ padding: 0 }}>
                                <MiniTable
                                    head={["Type", "Size", "Uploaded"]}
                                    rows={data.vaultDocuments}
                                    empty="No documents"
                                    render={(d) => (
                                        <tr key={d.id}>
                                            <td>{d.document_type || "unknown"}</td>
                                            <td className="num">{d.file_size ? `${Math.round(d.file_size / 1024)} KB` : "—"}</td>
                                            <td>{fmtDate(d.uploaded_at)}</td>
                                        </tr>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <Section title="Bookings" count={data.bookings.length}>
                        <MiniTable
                            head={["Type", "Item", "Dates", "Amount", "Status"]}
                            rows={data.bookings}
                            empty="No bookings"
                            render={(b) => (
                                <tr key={`${b.type}-${b.id}`}>
                                    <td><Badge tone="grey">{b.type}</Badge></td>
                                    <td>{b.item_name || "—"}</td>
                                    <td className="admin-cell-sub">{fmtDate(b.start_date)}{b.end_date && b.end_date !== b.start_date ? ` → ${fmtDate(b.end_date)}` : ""}</td>
                                    <td className="num">{b.amount != null ? fmtMoney(b.amount) : "—"}</td>
                                    <td><StatusBadge status={b.status} /></td>
                                </tr>
                            )}
                        />
                    </Section>

                    <Section title="Reviews" count={data.reviews.length}>
                        <MiniTable
                            head={["Type", "Item", "Rating", "Comment", "Flagged"]}
                            rows={data.reviews}
                            empty="No reviews"
                            render={(r) => (
                                <tr key={`${r.type}-${r.id}`}>
                                    <td><Badge tone="grey">{r.type}</Badge></td>
                                    <td>{r.item_name || "—"}</td>
                                    <td className="num">{r.rating}★</td>
                                    <td className="admin-cell-sub" style={{ maxWidth: 260 }}>{r.comment || "—"}</td>
                                    <td>{r.flagged_at ? <Badge tone="red">Flagged</Badge> : "—"}</td>
                                </tr>
                            )}
                        />
                    </Section>

                    <Section title="Gallery photos" count={data.photos.length}>
                        <MiniTable
                            head={["Caption", "Visibility", "Flag", "Uploaded"]}
                            rows={data.photos}
                            empty="No photos"
                            render={(p) => (
                                <tr key={p.id}>
                                    <td>{p.caption || <span className="muted">(no caption)</span>}</td>
                                    <td>{p.is_public ? <Badge tone="green">Public</Badge> : <Badge tone="grey">Private</Badge>}</td>
                                    <td>{p.flagged_at ? <Badge tone="red">{p.flag_reason || "Flagged"}</Badge> : "—"}</td>
                                    <td className="admin-cell-sub">{fmtDate(p.created_at)}</td>
                                </tr>
                            )}
                        />
                    </Section>

                    <Section title="Public journal entries" count={data.publicJournals.length}>
                        <MiniTable
                            head={["Title", "State", "Created"]}
                            rows={data.publicJournals}
                            empty="No public journal entries"
                            render={(j) => (
                                <tr key={j.id}>
                                    <td>{j.title}</td>
                                    <td>{j.is_public ? <Badge tone="green">Public</Badge> : <Badge tone="amber">Unpublished</Badge>}</td>
                                    <td className="admin-cell-sub">{fmtDate(j.created_at)}</td>
                                </tr>
                            )}
                        />
                    </Section>
                </div>
            </div>

            {confirm === "suspend" && (
                <ConfirmDialog
                    title={`Suspend ${u.email}?`}
                    message="The account is soft-flagged and blocked from signing in until reinstated."
                    confirmLabel="Suspend account"
                    icon="block"
                    reasonLabel="Reason"
                    reasonRequired
                    onConfirm={async (reason) => {
                        await toast.run(adminApi.suspendUser(u.id, reason), { success: "Account suspended", error: "Failed" });
                        load();
                    }}
                    onClose={() => setConfirm(null)}
                />
            )}
        </div>
    );
}
