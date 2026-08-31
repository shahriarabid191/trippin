import { useCallback, useMemo, useState } from "react";
import { adminApi } from "../../api/adminAPI";
import { DataTable } from "../components/DataTable";
import { EntityFormModal, ConfirmDialog } from "../components/Modal";
import { useToast } from "../components/Toast";
import { Badge, Stars, fmtMoney } from "../components/primitives";

const IMG = (url) =>
    url ? (
        <img src={url} alt="" style={{ width: 40, height: 40, borderRadius: 7, objectFit: "cover", flexShrink: 0, background: "var(--a-surface-2)" }} />
    ) : (
        <div style={{ width: 40, height: 40, borderRadius: 7, background: "var(--a-surface-2)", flexShrink: 0 }} />
    );

const activeBadge = (r) =>
    r.is_active ? <Badge tone="green" icon="check_circle">Active</Badge> : <Badge tone="grey" icon="do_not_disturb_on">Inactive</Badge>;

function makeConfig(kind) {
    if (kind === "hotels") {
        return {
            title: "Hotels",
            subtitle: "Lodging inventory. Deactivated hotels are hidden from the public Booking page.",
            noun: "hotel",
            list: adminApi.hotels,
            create: adminApi.createHotel,
            update: adminApi.updateHotel,
            setActive: adminApi.setHotelActive,
            remove: adminApi.deleteHotel,
            fields: [
                { name: "name", label: "Name", required: true, full: true },
                { name: "location", label: "Location", required: true },
                { name: "price_per_night", label: "Price / night ($)", type: "number", min: 0, required: true },
                { name: "total_rooms", label: "Total rooms", type: "number", min: 1 },
                { name: "rating", label: "Base rating", type: "number", min: 1, max: 5, step: "0.1" },
                { name: "image_url", label: "Image URL", type: "url", full: true },
                { name: "amenities", label: "Amenities", type: "textarea", hint: "Free text — e.g. Pool, Wi-Fi, Breakfast", full: true },
                { name: "is_active", label: "Active (visible to travellers)", type: "checkbox" },
            ],
            columns: (openEdit, askDelete, toggleActive) => [
                {
                    key: "name", header: "Hotel", sortable: true, render: (r) => (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {IMG(r.image_url)}
                            <div>
                                <div className="admin-cell-strong">{r.name}</div>
                                <div className="admin-cell-sub">{r.location}</div>
                            </div>
                        </div>
                    ),
                },
                { key: "price_per_night", header: "Price/night", sortable: true, align: "right", render: (r) => <span className="num">{fmtMoney(r.price_per_night)}</span> },
                { key: "total_rooms", header: "Rooms", align: "right", sortable: true, render: (r) => <span className="num">{r.total_rooms ?? "—"}</span> },
                { key: "rating", header: "Rating", align: "right", render: (r) => <Stars value={r.avg_rating ?? r.rating} /> },
                { key: "booking_count", header: "Bookings", align: "right", render: (r) => <span className="num">{r.booking_count ?? 0}</span> },
                { key: "is_active", header: "Status", render: activeBadge },
                { key: "_a", header: "", align: "right", render: (r) => rowActions(r, openEdit, askDelete, toggleActive) },
            ],
        };
    }
    if (kind === "guides") {
        return {
            title: "Guides",
            subtitle: "Tour-guide profiles. Verification and activation are managed here.",
            noun: "guide",
            list: adminApi.guides,
            create: adminApi.createGuide,
            update: adminApi.updateGuide,
            setActive: adminApi.setGuideActive,
            remove: adminApi.deleteGuide,
            verify: adminApi.setGuideVerified,
            fields: [
                { name: "name", label: "Name", required: true, full: true },
                { name: "location", label: "Location" },
                { name: "price_per_day", label: "Rate / day ($)", type: "number", min: 0, required: true },
                { name: "languages", label: "Languages", hint: "e.g. Bangla, English", full: true },
                { name: "specialties", label: "Specialties", hint: "e.g. Trekking, Heritage tours", full: true },
                { name: "photo_url", label: "Photo URL", type: "url", full: true },
                { name: "bio", label: "Bio", type: "textarea", full: true },
                { name: "is_active", label: "Active (visible to travellers)", type: "checkbox" },
            ],
            columns: (openEdit, askDelete, toggleActive, toggleVerified) => [
                {
                    key: "name", header: "Guide", sortable: true, render: (r) => (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {IMG(r.photo_url)}
                            <div>
                                <div className="admin-cell-strong">{r.name}</div>
                                <div className="admin-cell-sub">{r.location || "—"}{r.languages ? ` · ${r.languages}` : ""}</div>
                            </div>
                        </div>
                    ),
                },
                { key: "price_per_day", header: "Rate/day", sortable: true, align: "right", render: (r) => <span className="num">{fmtMoney(r.price_per_day)}</span> },
                { key: "specialties", header: "Specialties", render: (r) => <span className="admin-cell-sub">{r.specialties || "—"}</span> },
                { key: "review_count", header: "Reviews", align: "right", render: (r) => <span className="num">{r.review_count ?? 0}</span> },
                {
                    key: "verified_at", header: "Verification", render: (r) => (
                        <button className="admin-btn sm ghost" onClick={() => toggleVerified(r)}>
                            {r.verified_at
                                ? <Badge tone="blue" icon="verified">Verified</Badge>
                                : <Badge tone="grey" icon="gpp_maybe">Unverified</Badge>}
                        </button>
                    ),
                },
                { key: "is_active", header: "Status", render: activeBadge },
                { key: "_a", header: "", align: "right", render: (r) => rowActions(r, openEdit, askDelete, toggleActive) },
            ],
        };
    }
    // cars
    return {
        title: "Car & Ride Services",
        subtitle: "Vehicle and ride inventory. Deactivated vehicles are hidden from public search.",
        noun: "vehicle",
        list: adminApi.cars,
        create: adminApi.createCar,
        update: adminApi.updateCar,
        setActive: adminApi.setCarActive,
        remove: adminApi.deleteCar,
        fields: [
            { name: "name", label: "Vehicle / service name", required: true, full: true },
            { name: "type", label: "Vehicle type", hint: "e.g. Sedan, SUV, Microbus" },
            { name: "provider", label: "Provider" },
            { name: "location", label: "Location" },
            { name: "price_per_day", label: "Price / day ($)", type: "number", min: 0, required: true },
            { name: "photo_url", label: "Photo URL", type: "url", full: true },
            { name: "is_active", label: "Active (visible to travellers)", type: "checkbox" },
        ],
        columns: (openEdit, askDelete, toggleActive) => [
            {
                key: "name", header: "Vehicle", sortable: true, render: (r) => (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {IMG(r.photo_url)}
                        <div>
                            <div className="admin-cell-strong">{r.name}</div>
                            <div className="admin-cell-sub">{[r.type, r.provider].filter(Boolean).join(" · ") || "—"}</div>
                        </div>
                    </div>
                ),
            },
            { key: "location", header: "Location", sortable: true, render: (r) => r.location || "—" },
            { key: "price_per_day", header: "Price/day", sortable: true, align: "right", render: (r) => <span className="num">{fmtMoney(r.price_per_day)}</span> },
            { key: "booking_count", header: "Bookings", align: "right", render: (r) => <span className="num">{r.booking_count ?? 0}</span> },
            { key: "is_active", header: "Status", render: activeBadge },
            { key: "_a", header: "", align: "right", render: (r) => rowActions(r, openEdit, askDelete, toggleActive) },
        ],
    };
}

function rowActions(r, openEdit, askDelete, toggleActive) {
    return (
        <div className="admin-row-actions">
            <button className="admin-btn sm ghost" onClick={() => toggleActive(r)} title={r.is_active ? "Deactivate" : "Activate"}>
                <span className="material-symbols-outlined">{r.is_active ? "toggle_on" : "toggle_off"}</span>
            </button>
            <button className="admin-btn sm" onClick={() => openEdit(r)}>
                <span className="material-symbols-outlined">edit</span>
            </button>
            <button className="admin-btn sm danger" onClick={() => askDelete(r)}>
                <span className="material-symbols-outlined">delete</span>
            </button>
        </div>
    );
}

export default function Listings({ kind }) {
    const toast = useToast();
    const cfg = useMemo(() => makeConfig(kind), [kind]);
    const [refresh, setRefresh] = useState(0);
    const [modal, setModal] = useState(null); // {mode:'create'|'edit', row}
    const [del, setDel] = useState(null);
    const [activeFilter, setActiveFilter] = useState("");
    const [verifiedFilter, setVerifiedFilter] = useState("");

    const bump = () => setRefresh((n) => n + 1);

    const toggleActive = async (r) => {
        await toast.run(cfg.setActive(r.id, !r.is_active), {
            success: r.is_active ? `${cfg.title} entry deactivated` : `${cfg.title} entry activated`,
            error: "Update failed",
        });
        bump();
    };
    const toggleVerified = async (r) => {
        await toast.run(cfg.verify(r.id, !r.verified_at), {
            success: r.verified_at ? "Verification removed" : "Guide verified",
            error: "Update failed",
        });
        bump();
    };

    const columns = cfg.columns(
        (row) => setModal({ mode: "edit", row }),
        (row) => setDel(row),
        toggleActive,
        toggleVerified,
    );

    const extraParams = useMemo(() => {
        const p = {};
        if (activeFilter) p.active = activeFilter;
        if (kind === "guides" && verifiedFilter) p.verified = verifiedFilter;
        return p;
    }, [activeFilter, verifiedFilter, kind]);

    const load = useCallback((params) => cfg.list(params), [cfg]);

    return (
        <div className="admin-page">
            <div className="admin-page-head" style={{ display: "flex", alignItems: "flex-start" }}>
                <div>
                    <h2>{cfg.title}</h2>
                    <p>{cfg.subtitle}</p>
                </div>
                <button className="admin-btn primary" style={{ marginLeft: "auto" }} onClick={() => setModal({ mode: "create" })}>
                    <span className="material-symbols-outlined">add</span> Add {cfg.noun}
                </button>
            </div>

            <DataTable
                columns={columns}
                load={load}
                extraParams={extraParams}
                refreshToken={refresh}
                initialSort="created_at"
                searchPlaceholder={`Search ${cfg.title.toLowerCase()}…`}
                empty={{ icon: "inventory_2", title: `No ${cfg.title.toLowerCase()} found` }}
                toolbar={
                    <>
                        <select className="admin-select" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                            <option value="">All statuses</option>
                            <option value="true">Active only</option>
                            <option value="false">Inactive only</option>
                        </select>
                        {kind === "guides" && (
                            <select className="admin-select" value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
                                <option value="">Any verification</option>
                                <option value="true">Verified</option>
                                <option value="false">Unverified</option>
                            </select>
                        )}
                    </>
                }
            />

            {modal && (
                <EntityFormModal
                    title={modal.mode === "create" ? `Add ${cfg.noun}` : `Edit ${cfg.noun}`}
                    subtitle={modal.mode === "edit" ? modal.row.name : `New ${cfg.noun} in the ${cfg.title.toLowerCase()} catalogue`}
                    icon={modal.mode === "create" ? "add_business" : "edit"}
                    fields={cfg.fields}
                    initial={modal.mode === "edit"
                        ? modal.row
                        : { is_active: true }}
                    submitLabel={modal.mode === "create" ? "Create" : "Save changes"}
                    onSubmit={async (payload) => {
                        if (modal.mode === "create") {
                            await toast.run(cfg.create(payload), { success: `${cfg.noun} created`, error: "Create failed" });
                        } else {
                            await toast.run(cfg.update(modal.row.id, payload), { success: "Changes saved", error: "Update failed" });
                        }
                        bump();
                    }}
                    onClose={() => setModal(null)}
                />
            )}

            {del && (
                <ConfirmDialog
                    title={`Delete “${del.name}”?`}
                    message={`This permanently removes the ${cfg.noun} and cascades to its bookings and reviews. This cannot be undone.`}
                    confirmLabel="Delete permanently"
                    reasonLabel="Reason (optional)"
                    onConfirm={async () => {
                        await toast.run(cfg.remove(del.id), { success: `${cfg.noun} deleted`, error: "Delete failed" });
                        bump();
                    }}
                    onClose={() => setDel(null)}
                />
            )}
        </div>
    );
}
