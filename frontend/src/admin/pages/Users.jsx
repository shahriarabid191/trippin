import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminAPI";
import { DataTable } from "../components/DataTable";
import { Modal, ConfirmDialog } from "../components/Modal";
import { useToast } from "../components/Toast";
import { Badge, fmtDate } from "../components/primitives";

const roleTone = { admin: "red", moderator: "amber", user: "grey" };

function RoleModal({ user, onClose, onDone }) {
    const toast = useToast();
    const [role, setRole] = useState(user.role);
    const [busy, setBusy] = useState(false);

    const save = async () => {
        setBusy(true);
        try {
            await toast.run(adminApi.setUserRole(user.id, role), { success: "Role updated", error: "Couldn’t change role" });
            onDone();
            onClose();
        } catch { setBusy(false); }
    };

    return (
        <Modal
            title="Change role"
            subtitle={user.email}
            icon="admin_panel_settings"
            onClose={busy ? undefined : onClose}
            footer={
                <>
                    <button className="admin-btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
                    <button className="admin-btn primary" onClick={save} disabled={busy || role === user.role}>
                        {busy ? "Saving…" : "Update role"}
                    </button>
                </>
            }
        >
            <div className="admin-field">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="user">User — standard traveller</option>
                    <option value="moderator">Moderator — content moderation + emergency board</option>
                    <option value="admin">Administrator — full access</option>
                </select>
                <div className="admin-field-hint">
                    Moderators can reach content moderation and the emergency board, but not users,
                    payments, listings or role management.
                </div>
            </div>
        </Modal>
    );
}

export default function Users() {
    const toast = useToast();
    const navigate = useNavigate();
    const [refresh, setRefresh] = useState(0);
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [roleModal, setRoleModal] = useState(null);
    const [suspendModal, setSuspendModal] = useState(null);

    const bump = () => setRefresh((n) => n + 1);
    const load = useCallback((params) => adminApi.users(params), []);
    const extraParams = useMemo(() => ({ role, status }), [role, status]);

    const unsuspend = async (u) => {
        await toast.run(adminApi.unsuspendUser(u.id), { success: "Account reinstated", error: "Failed" });
        bump();
    };

    const columns = [
        {
            key: "email", header: "User", sortable: true, render: (u) => (
                <div>
                    <div className="admin-cell-strong">{u.username || u.email.split("@")[0]}</div>
                    <div className="admin-cell-sub">{u.email}</div>
                </div>
            ),
        },
        { key: "role", header: "Role", sortable: true, render: (u) => <Badge tone={roleTone[u.role] || "grey"}>{u.role}</Badge> },
        {
            key: "activity", header: "Activity", render: (u) => (
                <span className="admin-cell-sub">
                    {u.booking_count} bookings · {u.review_count} reviews · {u.photo_count} photos
                </span>
            ),
        },
        { key: "created_at", header: "Joined", sortable: true, render: (u) => fmtDate(u.created_at) },
        {
            key: "status", header: "Status", render: (u) => (
                u.suspended_at
                    ? <Badge tone="red" icon="block">Suspended</Badge>
                    : <Badge tone="green" icon="check_circle">Active</Badge>
            ),
        },
        {
            key: "_a", header: "", align: "right", render: (u) => (
                <div className="admin-row-actions">
                    <button className="admin-btn sm ghost" onClick={() => navigate(`/admin/users/${u.id}`)} title="View">
                        <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button className="admin-btn sm" onClick={() => setRoleModal(u)}>Role</button>
                    {u.suspended_at
                        ? <button className="admin-btn sm" onClick={() => unsuspend(u)}>Reinstate</button>
                        : <button className="admin-btn sm danger" onClick={() => setSuspendModal(u)}>Suspend</button>}
                </div>
            ),
        },
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Users</h2>
                <p>Every registered account, its activity summary and moderation state.</p>
            </div>

            <DataTable
                columns={columns}
                load={load}
                extraParams={extraParams}
                refreshToken={refresh}
                initialSort="created_at"
                searchPlaceholder="Search email or username…"
                onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
                empty={{ icon: "group", title: "No users match these filters" }}
                toolbar={
                    <>
                        <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="">All roles</option>
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                        </select>
                        <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="">Any status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </>
                }
            />

            {roleModal && (
                <RoleModal user={roleModal} onClose={() => setRoleModal(null)} onDone={bump} />
            )}

            {suspendModal && (
                <ConfirmDialog
                    title={`Suspend ${suspendModal.email}?`}
                    message="The account is soft-flagged. The user is blocked from signing in on their next request until reinstated."
                    confirmLabel="Suspend account"
                    icon="block"
                    reasonLabel="Reason"
                    reasonRequired
                    onConfirm={async (reason) => {
                        await toast.run(adminApi.suspendUser(suspendModal.id, reason), { success: "Account suspended", error: "Failed" });
                        bump();
                    }}
                    onClose={() => setSuspendModal(null)}
                />
            )}
        </div>
    );
}
