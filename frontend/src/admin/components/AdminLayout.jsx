import { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ToastProvider } from "./Toast";
import { adminApi } from "../../api/adminAPI";
import "../../styles/admin.css";

const NAV = [
    { section: null, items: [
        { to: "/admin", end: true, label: "Overview", icon: "dashboard", adminOnly: true },
        { to: "/admin/emergency", label: "Emergency Alerts", icon: "e911_emergency", emergency: true },
    ]},
    { section: "Marketplace", adminOnly: true, items: [
        { to: "/admin/listings/hotels", label: "Hotels", icon: "hotel" },
        { to: "/admin/listings/guides", label: "Guides", icon: "tour" },
        { to: "/admin/listings/cars", label: "Car & Ride", icon: "directions_car" },
        { to: "/admin/bookings", label: "Bookings", icon: "receipt_long" },
    ]},
    { section: "Content Moderation", items: [
        { to: "/admin/moderation/gallery", label: "Gallery", icon: "photo_library" },
        { to: "/admin/moderation/reviews", label: "Reviews", icon: "reviews" },
        { to: "/admin/moderation/journals", label: "Journals", icon: "menu_book" },
    ]},
    { section: "Platform", adminOnly: true, items: [
        { to: "/admin/users", label: "Users", icon: "group" },
        { to: "/admin/payments", label: "Payments", icon: "payments" },
        { to: "/admin/ai", label: "AI Activity", icon: "smart_toy" },
    ]},
];

function Sidebar({ isAdmin, emergencyCount, onExit, userLabel }) {
    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">
                <span className="dot material-symbols-outlined">travel_explore</span>
                <div>
                    Trippin
                    <small>Ops Console</small>
                </div>
            </div>

            <nav className="admin-nav">
                {NAV.map((group, gi) => {
                    if (group.adminOnly && !isAdmin) return null;
                    const items = group.items.filter((it) => !(it.adminOnly && !isAdmin));
                    if (!items.length) return null;
                    return (
                        <div key={gi}>
                            {group.section && <div className="admin-nav-section">{group.section}</div>}
                            {items.map((it) => (
                                <NavLink
                                    key={it.to}
                                    to={it.to}
                                    end={it.end}
                                    className={({ isActive }) =>
                                        `${isActive ? "active" : ""} ${it.emergency ? "emergency-link" : ""}`
                                    }
                                >
                                    <span className="material-symbols-outlined">{it.icon}</span>
                                    {it.label}
                                    {it.emergency && emergencyCount > 0 && (
                                        <span className="admin-nav-badge">{emergencyCount}</span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    );
                })}
            </nav>

            <div className="admin-sidebar-foot">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_circle</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userLabel}</span>
                <button onClick={onExit} title="Back to site">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                </button>
            </div>
        </aside>
    );
}

const CRUMBS = {
    "/admin": "Overview",
    "/admin/emergency": "Emergency Alerts",
    "/admin/listings/hotels": "Hotels",
    "/admin/listings/guides": "Guides",
    "/admin/listings/cars": "Car & Ride Services",
    "/admin/bookings": "Bookings",
    "/admin/moderation/gallery": "Gallery Moderation",
    "/admin/moderation/reviews": "Review Moderation",
    "/admin/moderation/journals": "Journal Moderation",
    "/admin/users": "Users",
    "/admin/payments": "Payments",
    "/admin/ai": "AI Activity",
};

export default function AdminLayout() {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();
    const [emergencyCount, setEmergencyCount] = useState(0);

    const role = user?.role;
    const isAdmin = role === "admin";
    const isModerator = role === "moderator";
    const allowed = isAdmin || isModerator;

    useEffect(() => {
        if (!allowed) return;
        let active = true;
        const poll = async () => {
            try {
                const s = await adminApi.emergencySummary();
                if (active) setEmergencyCount((s.open || 0) + (s.acknowledged || 0));
            } catch { /* ignore transient */ }
        };
        poll();
        const t = setInterval(poll, 15000);
        return () => { active = false; clearInterval(t); };
    }, [allowed]);

    const crumb = useMemo(() => {
        if (location.pathname.startsWith("/admin/users/")) return "User Detail";
        return CRUMBS[location.pathname] || "Admin";
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="admin-loading-screen">
                <div className="admin-spinner" />
                <span>Checking access…</span>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (!allowed) return <Navigate to="/" replace />;

    // Moderators have no Overview — send them to the emergency board.
    if (isModerator && location.pathname === "/admin") {
        return <Navigate to="/admin/emergency" replace />;
    }

    return (
        <ToastProvider>
            <div className="admin-root">
                <Sidebar
                    isAdmin={isAdmin}
                    emergencyCount={emergencyCount}
                    userLabel={user.username || user.email}
                    onExit={() => { window.location.href = "/"; }}
                />
                <div className="admin-main">
                    <header className="admin-topbar">
                        <span className="material-symbols-outlined" style={{ color: "var(--a-text-3)", fontSize: 18 }}>
                            chevron_right
                        </span>
                        <h1>{crumb}</h1>
                        <div className="admin-topbar-right">
                            {emergencyCount > 0 && (
                                <NavLink to="/admin/emergency" className="pill" style={{ background: "var(--a-danger-bg)", color: "var(--a-danger)" }}>
                                    {emergencyCount} open alert{emergencyCount === 1 ? "" : "s"}
                                </NavLink>
                            )}
                            <span className="pill">{isAdmin ? "Administrator" : "Moderator"}</span>
                        </div>
                    </header>
                    <div className="admin-content">
                        <Outlet context={{ role, isAdmin, isModerator }} />
                    </div>
                </div>
            </div>
        </ToastProvider>
    );
}
