// =====================================================================
// Admin panel API client.
//
// One thin fetch wrapper reusing the app's existing httpOnly cookie
// session (credentials: "include"). Every list call takes the same
// { page, limit, search, sort, order, ...filters } object and returns
// the { data, page, limit, total, totalPages } envelope from the API.
// =====================================================================

const API_ROOT = "http://localhost:5050/api";
const BASE = `${API_ROOT}/admin`;

class AdminApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = "AdminApiError";
        this.status = status;
    }
}

const qs = (params = {}) => {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") usp.append(k, v);
    });
    const s = usp.toString();
    return s ? `?${s}` : "";
};

async function request(path, { method = "GET", body, params } = {}) {
    const opts = { method, credentials: "include" };
    if (body !== undefined) {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = JSON.stringify(body);
    }

    let res;
    try {
        res = await fetch(`${BASE}${path}${qs(params)}`, opts);
    } catch {
        throw new AdminApiError("Network error — is the API running?", 0);
    }

    let payload = null;
    const text = await res.text();
    if (text) {
        try { payload = JSON.parse(text); } catch { payload = { message: text }; }
    }

    if (!res.ok) {
        throw new AdminApiError(payload?.message || payload?.error || `Request failed (${res.status})`, res.status);
    }
    return payload;
}

export { AdminApiError };

export const adminApi = {
    whoami: () => request("/whoami"),

    // ---- Dashboard ----
    stats: () => request("/dashboard/stats"),
    signupsSeries: (days = 30) => request("/dashboard/charts/signups", { params: { days } }),
    bookingsSeries: (days = 30) => request("/dashboard/charts/bookings", { params: { days } }),
    itinerarySeries: (days = 30) => request("/dashboard/charts/itineraries", { params: { days } }),

    // ---- Emergency ----
    emergencySummary: () => request("/emergency/summary"),
    emergencyAlerts: (params) => request("/emergency/alerts", { params }),
    ackAlert: (id) => request(`/emergency/alerts/${id}/acknowledge`, { method: "PATCH" }),
    resolveAlert: (id, note) => request(`/emergency/alerts/${id}/resolve`, { method: "PATCH", body: { note } }),
    reopenAlert: (id) => request(`/emergency/alerts/${id}/reopen`, { method: "PATCH" }),

    // ---- Listings ----
    hotels: (params) => request("/listings/hotels", { params }),
    createHotel: (body) => request("/listings/hotels", { method: "POST", body }),
    updateHotel: (id, body) => request(`/listings/hotels/${id}`, { method: "PUT", body }),
    setHotelActive: (id, is_active) => request(`/listings/hotels/${id}/active`, { method: "PATCH", body: { is_active } }),
    deleteHotel: (id) => request(`/listings/hotels/${id}`, { method: "DELETE" }),

    guides: (params) => request("/listings/guides", { params }),
    createGuide: (body) => request("/listings/guides", { method: "POST", body }),
    updateGuide: (id, body) => request(`/listings/guides/${id}`, { method: "PUT", body }),
    setGuideActive: (id, is_active) => request(`/listings/guides/${id}/active`, { method: "PATCH", body: { is_active } }),
    setGuideVerified: (id, verified) => request(`/listings/guides/${id}/verify`, { method: "PATCH", body: { verified } }),
    deleteGuide: (id) => request(`/listings/guides/${id}`, { method: "DELETE" }),

    cars: (params) => request("/listings/cars", { params }),
    createCar: (body) => request("/listings/cars", { method: "POST", body }),
    updateCar: (id, body) => request(`/listings/cars/${id}`, { method: "PUT", body }),
    setCarActive: (id, is_active) => request(`/listings/cars/${id}/active`, { method: "PATCH", body: { is_active } }),
    deleteCar: (id) => request(`/listings/cars/${id}`, { method: "DELETE" }),

    // ---- SIM / eSIM shops ----
    simShops: (params) => request("/sim-shops", { params }),
    simShopsSummary: () => request("/sim-shops/summary"),
    createSimShop: (body) => request("/sim-shops", { method: "POST", body }),
    updateSimShop: (id, body) => request(`/sim-shops/${id}`, { method: "PUT", body }),
    approveSimShop: (id) => request(`/sim-shops/${id}/approve`, { method: "PATCH" }),
    rejectSimShop: (id, reason) => request(`/sim-shops/${id}/reject`, { method: "PATCH", body: { reason } }),
    setSimShopActive: (id, is_active) => request(`/sim-shops/${id}/active`, { method: "PATCH", body: { is_active } }),
    deleteSimShop: (id) => request(`/sim-shops/${id}`, { method: "DELETE" }),
    // Reference data (districts / operators / services) lives on the public route.
    simShopMeta: () => fetch(`${API_ROOT}/sim-shops/meta`, { credentials: "include" }).then((r) => r.json()),

    // ---- Bookings ----
    bookings: (params) => request("/bookings", { params }),
    bookingsSummary: () => request("/bookings/summary"),
    cancelBooking: (type, id, note) => request(`/bookings/${type}/${id}/cancel`, { method: "PATCH", body: { note } }),
    refundBooking: (type, id, note) => request(`/bookings/${type}/${id}/refund`, { method: "PATCH", body: { note } }),

    // ---- Users ----
    users: (params) => request("/users", { params }),
    user: (id) => request(`/users/${id}`),
    suspendUser: (id, reason) => request(`/users/${id}/suspend`, { method: "PATCH", body: { reason } }),
    unsuspendUser: (id) => request(`/users/${id}/unsuspend`, { method: "PATCH" }),
    setUserRole: (id, role) => request(`/users/${id}/role`, { method: "PATCH", body: { role } }),

    // ---- Moderation ----
    modPhotos: (params) => request("/moderation/gallery", { params }),
    flagPhoto: (id, reason) => request(`/moderation/gallery/${id}/flag`, { method: "PATCH", body: { reason } }),
    unflagPhoto: (id) => request(`/moderation/gallery/${id}/unflag`, { method: "PATCH" }),
    unpublishPhoto: (id, reason) => request(`/moderation/gallery/${id}/unpublish`, { method: "PATCH", body: { reason } }),
    republishPhoto: (id) => request(`/moderation/gallery/${id}/republish`, { method: "PATCH" }),
    deletePhoto: (id) => request(`/moderation/gallery/${id}`, { method: "DELETE" }),

    modComments: (params) => request("/moderation/comments", { params }),
    deleteComment: (id) => request(`/moderation/comments/${id}`, { method: "DELETE" }),

    modReviews: (params) => request("/moderation/reviews", { params }),
    flagReview: (type, id, reason) => request(`/moderation/reviews/${type}/${id}/flag`, { method: "PATCH", body: { reason } }),
    unflagReview: (type, id) => request(`/moderation/reviews/${type}/${id}/unflag`, { method: "PATCH" }),
    deleteReview: (type, id) => request(`/moderation/reviews/${type}/${id}`, { method: "DELETE" }),

    modJournals: (params) => request("/moderation/journals", { params }),
    unpublishJournal: (id, note) => request(`/moderation/journals/${id}/unpublish`, { method: "PATCH", body: { note } }),
    republishJournal: (id) => request(`/moderation/journals/${id}/republish`, { method: "PATCH" }),
    deleteJournal: (id) => request(`/moderation/journals/${id}`, { method: "DELETE" }),

    // ---- AI ----
    aiSummary: () => request("/ai/summary"),
    aiItineraries: (params) => request("/ai/itineraries", { params }),
};
