import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminAPI";
import { DataTable } from "../components/DataTable";
import { Modal, ConfirmDialog } from "../components/Modal";
import { useToast } from "../components/Toast";
import { Badge, NoteBox, fmtDate, fmtInt } from "../components/primitives";

const STATUS_TONE = { pending: "amber", approved: "green", rejected: "red" };
const SOURCE_LABEL = { seed: "Seeded", admin: "Admin", user: "Community" };

const EMPTY = {
    name: "", district: "", area: "", address: "", landmark: "",
    phone: "", altPhone: "", email: "", hours: "", established: "",
    mapLink: "", operators: [], services: [], esimSupport: false,
};

function ShopFormModal({ mode, shop, meta, onClose, onSaved }) {
    const toast = useToast();
    const [f, setF] = useState(() =>
        mode === "edit"
            ? {
                  ...EMPTY, ...shop,
                  operators: shop.operators || [],
                  services: shop.services || [],
              }
            : EMPTY
    );
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
    const toggle = (key, val) =>
        setF((p) => ({
            ...p,
            [key]: p[key].includes(val) ? p[key].filter((x) => x !== val) : [...p[key], val],
        }));

    const validate = () => {
        const e = {};
        ["name", "district", "area", "address", "phone", "hours"].forEach((k) => {
            if (!String(f[k] || "").trim()) e[k] = "Required";
        });
        if (f.operators.length === 0) e.operators = "Pick at least one operator";
        if (f.services.length === 0) e.services = "Pick at least one service";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setBusy(true);
        const payload = {
            name: f.name, district: f.district, area: f.area, address: f.address,
            landmark: f.landmark, phone: f.phone, altPhone: f.altPhone, email: f.email,
            hours: f.hours, established: f.established, mapLink: f.mapLink,
            operators: f.operators, services: f.services, esimSupport: !!f.esimSupport,
        };
        try {
            if (mode === "edit") {
                await toast.run(adminApi.updateSimShop(shop.id, payload), { success: "Shop updated", error: "Update failed" });
            } else {
                await toast.run(adminApi.createSimShop(payload), { success: "Shop created & published", error: "Create failed" });
            }
            onSaved();
            onClose();
        } catch { setBusy(false); }
    };

    const field = (name, label, opts = {}) => (
        <div className="admin-field" style={{ gridColumn: opts.full ? "1 / -1" : "auto" }}>
            <label>{label}{opts.required && " *"}</label>
            <input
                type={opts.type || "text"}
                value={f[name] ?? ""}
                placeholder={opts.placeholder}
                onChange={(e) => set(name, e.target.value)}
            />
            {errors[name] && <div className="err">{errors[name]}</div>}
        </div>
    );

    return (
        <Modal
            title={mode === "edit" ? `Edit — ${shop.name}` : "Add SIM / eSIM shop"}
            subtitle={mode === "edit" ? `#${shop.id} · ${SOURCE_LABEL[shop.source] || shop.source}` : "Created shops are published immediately."}
            icon={mode === "edit" ? "edit" : "add_business"}
            wide
            onClose={busy ? undefined : onClose}
            footer={
                <>
                    <button type="button" className="admin-btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
                    <button type="submit" form="shop-form" className="admin-btn primary" disabled={busy}>
                        {busy ? "Saving…" : mode === "edit" ? "Save changes" : "Create & publish"}
                    </button>
                </>
            }
        >
            <form id="shop-form" onSubmit={submit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                    {field("name", "Shop name", { required: true, full: true })}

                    <div className="admin-field">
                        <label>District *</label>
                        <select value={f.district} onChange={(e) => set("district", e.target.value)}>
                            <option value="">— Select —</option>
                            {(meta?.districts || []).map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.district && <div className="err">{errors.district}</div>}
                    </div>
                    {field("area", "Area / Thana", { required: true })}

                    {field("address", "Exact address", { required: true, full: true })}
                    {field("landmark", "Landmark", { full: true })}

                    {field("phone", "Primary phone", { required: true, type: "tel" })}
                    {field("altPhone", "Alternate phone", { type: "tel" })}
                    {field("email", "Email", { type: "email" })}
                    {field("established", "Year established", { placeholder: "e.g. 2018" })}

                    {field("hours", "Opening hours", { required: true, full: true, placeholder: "Sat–Thu: 9 AM – 9 PM" })}
                    {field("mapLink", "Google Maps link", { type: "url", full: true })}

                    <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
                        <label>Operators supported *</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {Object.entries(meta?.operators || {}).map(([key, op]) => (
                                <label key={key} className={`admin-btn sm ${f.operators.includes(key) ? "primary" : "ghost"}`} style={{ cursor: "pointer" }}>
                                    <input type="checkbox" hidden checked={f.operators.includes(key)} onChange={() => toggle("operators", key)} />
                                    {op.name}
                                </label>
                            ))}
                        </div>
                        {errors.operators && <div className="err">{errors.operators}</div>}
                    </div>

                    <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
                        <label>Services offered *</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {(meta?.services || []).map((svc) => (
                                <label key={svc} className={`admin-btn sm ${f.services.includes(svc) ? "primary" : "ghost"}`} style={{ cursor: "pointer" }}>
                                    <input type="checkbox" hidden checked={f.services.includes(svc)} onChange={() => toggle("services", svc)} />
                                    {svc}
                                </label>
                            ))}
                        </div>
                        {errors.services && <div className="err">{errors.services}</div>}
                    </div>

                    <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
                        <label className="admin-check">
                            <input type="checkbox" checked={!!f.esimSupport} onChange={(e) => set("esimSupport", e.target.checked)} />
                            eSIM activation available at this shop
                        </label>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

function DetailModal({ shop, onClose }) {
    return (
        <Modal title={shop.name} subtitle={`${shop.area}, ${shop.district}`} icon="storefront" wide onClose={onClose}>
            <dl className="admin-kv">
                <div><dt>Status</dt><dd><Badge tone={STATUS_TONE[shop.status]}>{shop.status}</Badge></dd></div>
                <div><dt>Source</dt><dd>{SOURCE_LABEL[shop.source] || shop.source}</dd></div>
                {shop.submittedByEmail && <div><dt>Submitted by</dt><dd>{shop.submittedByEmail}</dd></div>}
                {shop.reviewedByName && <div><dt>Reviewed by</dt><dd>{shop.reviewedByName} · {fmtDate(shop.reviewedAt)}</dd></div>}
                {shop.rejectionReason && <div><dt>Rejection reason</dt><dd>{shop.rejectionReason}</dd></div>}
                <div><dt>Address</dt><dd>{shop.address}</dd></div>
                {shop.landmark && <div><dt>Landmark</dt><dd>{shop.landmark}</dd></div>}
                <div><dt>Phone</dt><dd>{shop.phone}{shop.altPhone ? ` / ${shop.altPhone}` : ""}</dd></div>
                {shop.email && <div><dt>Email</dt><dd>{shop.email}</dd></div>}
                <div><dt>Hours</dt><dd>{shop.hours}</dd></div>
                {shop.established && <div><dt>Established</dt><dd>{shop.established}</dd></div>}
                <div><dt>Operators</dt><dd>{(shop.operators || []).join(", ") || "—"}</dd></div>
                <div><dt>Services</dt><dd style={{ textAlign: "right" }}>{(shop.services || []).join(", ") || "—"}</dd></div>
                <div><dt>eSIM</dt><dd>{shop.esimSupport ? "Yes" : "No"}</dd></div>
            </dl>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {shop.mapLink && (
                    <a className="admin-btn sm" href={shop.mapLink} target="_blank" rel="noreferrer">
                        <span className="material-symbols-outlined">map</span> Open map
                    </a>
                )}
                {shop.documentUrl && (
                    <a className="admin-btn sm" href={shop.documentUrl} target="_blank" rel="noreferrer">
                        <span className="material-symbols-outlined">description</span> View verification PDF
                    </a>
                )}
            </div>
        </Modal>
    );
}

export default function SimShops() {
    const toast = useToast();
    const [meta, setMeta] = useState(null);
    const [summary, setSummary] = useState(null);
    const [refresh, setRefresh] = useState(0);
    const [status, setStatus] = useState("");
    const [district, setDistrict] = useState("");
    const [form, setForm] = useState(null);   // { mode, shop }
    const [detail, setDetail] = useState(null);
    const [confirm, setConfirm] = useState(null);

    const bump = () => setRefresh((n) => n + 1);

    useEffect(() => { adminApi.simShopMeta().then(setMeta).catch(() => {}); }, []);
    useEffect(() => { adminApi.simShopsSummary().then(setSummary).catch(() => {}); }, [refresh]);

    const load = useCallback((params) => adminApi.simShops(params), []);
    const extraParams = useMemo(() => ({ status, district }), [status, district]);
    const quick = async (fn, msg) => { await toast.run(fn, { success: msg, error: "Action failed" }); bump(); };

    const columns = [
        {
            key: "name", header: "Shop", sortable: true, render: (s) => (
                <div>
                    <div className="admin-cell-strong">{s.name} {s.esimSupport && <Badge tone="blue">eSIM</Badge>}</div>
                    <div className="admin-cell-sub">{s.area}, {s.district}</div>
                </div>
            ),
        },
        {
            key: "operators", header: "Operators", render: (s) => (
                <span className="admin-cell-sub">{(s.operators || []).join(", ") || "—"}</span>
            ),
        },
        {
            key: "source", header: "Source", render: (s) => (
                <div>
                    <Badge tone="grey">{SOURCE_LABEL[s.source] || s.source}</Badge>
                    {s.submittedByEmail && <div className="admin-cell-sub" style={{ marginTop: 3 }}>{s.submittedByEmail}</div>}
                </div>
            ),
        },
        {
            key: "status", header: "Status", sortable: true, render: (s) => (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
                    {!s.isActive && <Badge tone="grey">inactive</Badge>}
                </div>
            ),
        },
        { key: "created_at", header: "Added", sortable: true, render: (s) => fmtDate(s.createdAt) },
        {
            key: "_a", header: "", align: "right", render: (s) => (
                <div className="admin-row-actions">
                    <button className="admin-btn sm ghost" onClick={() => setDetail(s)} title="Details">
                        <span className="material-symbols-outlined">visibility</span>
                    </button>
                    {s.status !== "approved" && (
                        <button className="admin-btn sm" onClick={() => quick(adminApi.approveSimShop(s.id), "Shop approved")}>Approve</button>
                    )}
                    {s.status === "pending" && (
                        <button className="admin-btn sm danger" onClick={() => setConfirm({ kind: "reject", shop: s })}>Reject</button>
                    )}
                    {s.status === "approved" && (
                        <button className="admin-btn sm ghost" onClick={() => quick(adminApi.setSimShopActive(s.id, !s.isActive), s.isActive ? "Hidden from public" : "Shown to public")} title={s.isActive ? "Deactivate" : "Activate"}>
                            <span className="material-symbols-outlined">{s.isActive ? "toggle_on" : "toggle_off"}</span>
                        </button>
                    )}
                    <button className="admin-btn sm" onClick={() => setForm({ mode: "edit", shop: s })}>
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="admin-btn sm danger" onClick={() => setConfirm({ kind: "delete", shop: s })}>
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="admin-page">
            <div className="admin-page-head" style={{ display: "flex", alignItems: "flex-start" }}>
                <div>
                    <h2>SIM / eSIM Shops</h2>
                    <p>Curated shop directory plus the review queue for community-submitted shops. Only approved &amp; active shops show on the public finder.</p>
                </div>
                <button className="admin-btn primary" style={{ marginLeft: "auto" }} onClick={() => setForm({ mode: "create" })}>
                    <span className="material-symbols-outlined">add</span> Add shop
                </button>
            </div>

            {summary && (
                <div className="admin-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
                    <div className="admin-kpi"><div className="label">Total</div><div className="value">{fmtInt(summary.total)}</div></div>
                    <div className="admin-kpi"><div className="label">Pending review</div><div className={`value ${summary.pending ? "danger" : ""}`}>{fmtInt(summary.pending)}</div></div>
                    <div className="admin-kpi"><div className="label">Approved</div><div className="value">{fmtInt(summary.approved)}</div></div>
                    <div className="admin-kpi"><div className="label">Rejected</div><div className="value">{fmtInt(summary.rejected)}</div></div>
                    <div className="admin-kpi"><div className="label">Inactive</div><div className="value">{fmtInt(summary.inactive)}</div></div>
                </div>
            )}

            {summary?.pending > 0 && (
                <>
                    <NoteBox tone="warn" icon="inbox">
                        {summary.pending} community submission{summary.pending === 1 ? "" : "s"} waiting for review. Filter by “Pending” below.
                    </NoteBox>
                    <div style={{ height: 12 }} />
                </>
            )}

            <DataTable
                columns={columns}
                load={load}
                extraParams={extraParams}
                refreshToken={refresh}
                initialSort="created_at"
                searchPlaceholder="Search name, area, address, submitter…"
                empty={{ icon: "sim_card", title: "No shops match these filters" }}
                toolbar={
                    <>
                        <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select className="admin-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                            <option value="">All districts</option>
                            {(meta?.districts || []).map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </>
                }
            />

            {form && (
                <ShopFormModal
                    mode={form.mode}
                    shop={form.shop}
                    meta={meta}
                    onClose={() => setForm(null)}
                    onSaved={bump}
                />
            )}

            {detail && <DetailModal shop={detail} onClose={() => setDetail(null)} />}

            {confirm?.kind === "reject" && (
                <ConfirmDialog
                    title={`Reject "${confirm.shop.name}"?`}
                    message="The submitter can see the reason on their submissions list. The shop stays in the system as rejected."
                    confirmLabel="Reject submission"
                    icon="cancel"
                    reasonLabel="Reason"
                    reasonRequired
                    onConfirm={(reason) => quick(adminApi.rejectSimShop(confirm.shop.id, reason), "Submission rejected")}
                    onClose={() => setConfirm(null)}
                />
            )}
            {confirm?.kind === "delete" && (
                <ConfirmDialog
                    title={`Delete "${confirm.shop.name}"?`}
                    message="Permanently removes the shop and its verification document. This cannot be undone."
                    confirmLabel="Delete permanently"
                    reasonLabel="Reason (optional)"
                    onConfirm={() => quick(adminApi.deleteSimShop(confirm.shop.id), "Shop deleted")}
                    onClose={() => setConfirm(null)}
                />
            )}
        </div>
    );
}
