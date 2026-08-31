import { useCallback, useMemo, useState } from "react";
import { adminApi } from "../../api/adminAPI";
import { DataTable } from "../components/DataTable";
import { ConfirmDialog } from "../components/Modal";
import { useToast } from "../components/Toast";
import { Badge, fmtDate, fmtDateTime } from "../components/primitives";

function PhotosTab() {
    const toast = useToast();
    const [refresh, setRefresh] = useState(0);
    const [flagged, setFlagged] = useState("");
    const [act, setAct] = useState(null);

    const bump = () => setRefresh((n) => n + 1);
    const load = useCallback((params) => adminApi.modPhotos(params), []);
    const extraParams = useMemo(() => ({ flagged }), [flagged]);
    const quick = async (fn, msg) => { await toast.run(fn, { success: msg, error: "Action failed" }); bump(); };

    const columns = [
        {
            key: "photo", header: "Photo", render: (p) => (
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <img src={p.url} alt="" style={{ width: 52, height: 40, objectFit: "cover", borderRadius: 6, background: "var(--a-surface-2)" }} />
                    <div>
                        <div className="admin-cell-strong">{p.caption || <span className="muted">(no caption)</span>}</div>
                        <div className="admin-cell-sub">{p.uploader_email}</div>
                    </div>
                </div>
            ),
        },
        { key: "engagement", header: "Engagement", render: (p) => <span className="admin-cell-sub">{p.like_count} likes · {p.comment_count} comments</span> },
        {
            key: "state", header: "State", render: (p) => (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {p.is_public ? <Badge tone="green">Public</Badge> : <Badge tone="grey">Unpublished</Badge>}
                    {p.flagged_at && <Badge tone="red" icon="flag">{p.flag_reason || "Flagged"}</Badge>}
                </div>
            ),
        },
        { key: "created_at", header: "Uploaded", render: (p) => fmtDate(p.created_at) },
        {
            key: "_a", header: "", align: "right", render: (p) => (
                <div className="admin-row-actions">
                    {p.flagged_at
                        ? <button className="admin-btn sm ghost" onClick={() => quick(adminApi.unflagPhoto(p.id), "Flag cleared")}>Unflag</button>
                        : <button className="admin-btn sm" onClick={() => setAct({ kind: "flag", row: p })}>Flag</button>}
                    {p.is_public
                        ? <button className="admin-btn sm" onClick={() => setAct({ kind: "unpublish", row: p })}>Unpublish</button>
                        : <button className="admin-btn sm ghost" onClick={() => quick(adminApi.republishPhoto(p.id), "Photo republished")}>Republish</button>}
                    <button className="admin-btn sm danger" onClick={() => setAct({ kind: "delete", row: p })}>
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <DataTable
                columns={columns}
                load={load}
                extraParams={extraParams}
                refreshToken={refresh}
                searchPlaceholder="Search caption or uploader…"
                empty={{ icon: "photo_library", title: "No photos match" }}
                toolbar={
                    <select className="admin-select" value={flagged} onChange={(e) => setFlagged(e.target.value)}>
                        <option value="">All photos</option>
                        <option value="true">Flagged only</option>
                        <option value="false">Unflagged only</option>
                    </select>
                }
            />
            {act?.kind === "flag" && (
                <ConfirmDialog title="Flag this photo" message="Marks the photo for review. It stays public until unpublished."
                    confirmLabel="Flag photo" tone="primary" icon="flag" reasonLabel="Reason" reasonRequired
                    onConfirm={(r) => quick(adminApi.flagPhoto(act.row.id, r), "Photo flagged")} onClose={() => setAct(null)} />
            )}
            {act?.kind === "unpublish" && (
                <ConfirmDialog title="Unpublish this photo" message="Removes the photo from the public gallery. The owner keeps it privately."
                    confirmLabel="Unpublish" icon="visibility_off" reasonLabel="Reason" reasonRequired
                    onConfirm={(r) => quick(adminApi.unpublishPhoto(act.row.id, r), "Photo unpublished")} onClose={() => setAct(null)} />
            )}
            {act?.kind === "delete" && (
                <ConfirmDialog title="Delete this photo?" message="Permanently deletes the photo and its file, likes and comments. This cannot be undone."
                    confirmLabel="Delete permanently" reasonLabel="Reason" reasonRequired
                    onConfirm={() => quick(adminApi.deletePhoto(act.row.id), "Photo deleted")} onClose={() => setAct(null)} />
            )}
        </>
    );
}

function CommentsTab() {
    const toast = useToast();
    const [refresh, setRefresh] = useState(0);
    const [del, setDel] = useState(null);
    const bump = () => setRefresh((n) => n + 1);
    const load = useCallback((params) => adminApi.modComments(params), []);

    const columns = [
        { key: "author_email", header: "Author", render: (c) => <span className="admin-cell-strong">{c.author_email}</span> },
        { key: "body", header: "Comment", render: (c) => <span style={{ maxWidth: 380, display: "inline-block" }}>{c.body}</span> },
        { key: "photo_caption", header: "On photo", render: (c) => <span className="admin-cell-sub">{c.photo_caption || `#${c.photo_id}`}</span> },
        { key: "created_at", header: "Posted", render: (c) => fmtDateTime(c.created_at) },
        {
            key: "_a", header: "", align: "right", render: (c) => (
                <button className="admin-btn sm danger" onClick={() => setDel(c)}>
                    <span className="material-symbols-outlined">delete</span> Remove
                </button>
            ),
        },
    ];

    return (
        <>
            <DataTable
                columns={columns}
                load={load}
                refreshToken={refresh}
                searchPlaceholder="Search comment text or author…"
                empty={{ icon: "chat_bubble", title: "No comments" }}
            />
            {del && (
                <ConfirmDialog
                    title="Remove this comment?"
                    message={`“${del.body.slice(0, 120)}” — by ${del.author_email}. Replies to it are removed too.`}
                    confirmLabel="Remove comment"
                    reasonLabel="Reason (optional)"
                    onConfirm={async () => {
                        await toast.run(adminApi.deleteComment(del.id), { success: "Comment removed", error: "Failed" });
                        bump();
                    }}
                    onClose={() => setDel(null)}
                />
            )}
        </>
    );
}

export default function ModerationGallery() {
    const [tab, setTab] = useState("photos");
    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Gallery Moderation</h2>
                <p>Public community photos and their comment threads.</p>
            </div>
            <div className="admin-toolbar">
                <button className={`admin-btn sm ${tab === "photos" ? "primary" : "ghost"}`} onClick={() => setTab("photos")}>Photos</button>
                <button className={`admin-btn sm ${tab === "comments" ? "primary" : "ghost"}`} onClick={() => setTab("comments")}>Comments</button>
            </div>
            {tab === "photos" ? <PhotosTab /> : <CommentsTab />}
        </div>
    );
}
