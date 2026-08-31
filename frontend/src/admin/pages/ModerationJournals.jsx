import { useCallback, useState } from "react";
import { adminApi } from "../../api/adminAPI";
import { DataTable } from "../components/DataTable";
import { Modal, ConfirmDialog } from "../components/Modal";
import { useToast } from "../components/Toast";
import { Badge, NoteBox, fmtDate } from "../components/primitives";

export default function ModerationJournals() {
    const toast = useToast();
    const [refresh, setRefresh] = useState(0);
    const [read, setRead] = useState(null);
    const [act, setAct] = useState(null);

    const bump = () => setRefresh((n) => n + 1);
    const load = useCallback((params) => adminApi.modJournals(params), []);
    const quick = async (fn, msg) => { await toast.run(fn, { success: msg, error: "Action failed" }); bump(); };

    const columns = [
        {
            key: "title", header: "Entry", render: (j) => (
                <div>
                    <div className="admin-cell-strong">{j.title}</div>
                    <div className="admin-cell-sub">{j.author_email}</div>
                </div>
            ),
        },
        {
            key: "preview", header: "Preview", render: (j) => (
                <span className="admin-cell-sub" style={{ maxWidth: 340, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {j.content || "—"}
                </span>
            ),
        },
        {
            key: "state", header: "State", render: (j) => (
                j.is_public
                    ? <Badge tone="green">Public</Badge>
                    : <Badge tone="amber" icon="visibility_off">Unpublished{j.moderation_note ? ` — ${j.moderation_note}` : ""}</Badge>
            ),
        },
        { key: "created_at", header: "Created", render: (j) => fmtDate(j.created_at) },
        {
            key: "_a", header: "", align: "right", render: (j) => (
                <div className="admin-row-actions">
                    <button className="admin-btn sm ghost" onClick={() => setRead(j)}>Read</button>
                    {j.is_public
                        ? <button className="admin-btn sm" onClick={() => setAct({ kind: "unpublish", row: j })}>Unpublish</button>
                        : <button className="admin-btn sm ghost" onClick={() => quick(adminApi.republishJournal(j.id), "Entry republished")}>Republish</button>}
                    <button className="admin-btn sm danger" onClick={() => setAct({ kind: "delete", row: j })}>Delete</button>
                </div>
            ),
        },
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Journal Moderation</h2>
                <p>Community journal entries the author chose to make public.</p>
            </div>

            <NoteBox icon="privacy_tip">
                Only entries a user marked <strong>public</strong> are listed here. Private journals are never
                readable, listable, or removable from the admin panel.
            </NoteBox>

            <div style={{ height: 12 }} />

            <DataTable
                columns={columns}
                load={load}
                refreshToken={refresh}
                searchPlaceholder="Search title, body or author…"
                empty={{ icon: "menu_book", title: "No public journal entries" }}
            />

            {read && (
                <Modal title={read.title} subtitle={`by ${read.author_email} · ${fmtDate(read.created_at)}`} icon="menu_book" wide onClose={() => setRead(null)}>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.7, color: "var(--a-text)" }}>
                        {read.content || <span className="muted">(empty entry)</span>}
                    </div>
                </Modal>
            )}

            {act?.kind === "unpublish" && (
                <ConfirmDialog
                    title="Unpublish this entry"
                    message="Removes it from the community feed. The author keeps it as a private entry."
                    confirmLabel="Unpublish" icon="visibility_off" reasonLabel="Moderator note" reasonRequired
                    onConfirm={(n) => quick(adminApi.unpublishJournal(act.row.id, n), "Entry unpublished")}
                    onClose={() => setAct(null)}
                />
            )}
            {act?.kind === "delete" && (
                <ConfirmDialog
                    title="Delete this journal entry?"
                    message="Permanently deletes the entry. This cannot be undone."
                    confirmLabel="Delete permanently" reasonLabel="Reason (optional)"
                    onConfirm={() => quick(adminApi.deleteJournal(act.row.id), "Entry deleted")}
                    onClose={() => setAct(null)}
                />
            )}
        </div>
    );
}
