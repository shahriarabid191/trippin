// =====================================================================
// Shared helpers for the admin list endpoints.
//
// Every admin table endpoint accepts the same query string:
//   ?page=1&limit=25&search=foo&sort=created_at&order=desc
// and returns the same envelope:
//   { data: [...], page, limit, total, totalPages }
// so the frontend <DataTable> can stay generic.
// =====================================================================

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

// Parse + clamp pagination / sort / search params off req.query.
// `allowedSort` is a whitelist — anything outside it is ignored so the
// caller can safely interpolate the column name into the ORDER BY.
export const parseListParams = (query, { allowedSort = [], defaultSort = null } = {}) => {

    let page = parseInt(query.page, 10);
    if (!Number.isFinite(page) || page < 1) page = 1;

    let limit = parseInt(query.limit, 10);
    if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const search = typeof query.search === "string" ? query.search.trim() : "";

    let sort = defaultSort;
    if (typeof query.sort === "string" && allowedSort.includes(query.sort)) {
        sort = query.sort;
    }

    const order = String(query.order).toLowerCase() === "asc" ? "ASC" : "DESC";

    return {
        page,
        limit,
        offset: (page - 1) * limit,
        search,
        sort,
        order,
    };
};

// Wrap a page of rows + a total count in the standard envelope.
export const listEnvelope = (rows, total, { page, limit }) => {
    const totalNum = Number(total) || 0;
    return {
        data: rows,
        page,
        limit,
        total: totalNum,
        totalPages: Math.max(1, Math.ceil(totalNum / limit)),
    };
};

// Tiny async wrapper so route handlers don't each need a try/catch.
export const wrap = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error(`[admin] ${req.method} ${req.originalUrl} failed:`, error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server error" });
        }
    }
};
