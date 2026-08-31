import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState } from "./primitives";

// Reusable server-driven table.
//   columns: [{ key, header, sortable, align, width, render(row) }]
//   load(params) -> { data, page, limit, total, totalPages }
//     params = { page, limit, search, sort, order, ...extraParams }
//   extraParams   : filter values owned by the parent (object)
//   refreshToken  : change it to force a reload (after a mutation)
//   toolbar       : node rendered next to the search box (filter <select>s)
export function DataTable({
    columns,
    load,
    extraParams = {},
    refreshToken,
    toolbar,
    searchPlaceholder = "Search…",
    rowKey = (r) => r.id,
    initialSort,
    initialOrder = "desc",
    limit = 25,
    empty,
    onRowClick,
}) {
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [sort, setSort] = useState(initialSort || null);
    const [order, setOrder] = useState(initialOrder);
    const [page, setPage] = useState(1);

    const [state, setState] = useState({ rows: [], total: 0, totalPages: 1, loading: true, error: null });
    const reqId = useRef(0);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(search.trim()), 300);
        return () => clearTimeout(t);
    }, [search]);

    // Reset to page 1 when the query narrows.
    useEffect(() => { setPage(1); }, [debounced, JSON.stringify(extraParams), sort, order]);

    const run = useCallback(async () => {
        const id = ++reqId.current;
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            const res = await load({ page, limit, search: debounced, sort, order, ...extraParams });
            if (id !== reqId.current) return;
            setState({
                rows: res.data || [],
                total: res.total ?? 0,
                totalPages: res.totalPages ?? 1,
                loading: false,
                error: null,
            });
        } catch (e) {
            if (id !== reqId.current) return;
            setState({ rows: [], total: 0, totalPages: 1, loading: false, error: e.message });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, page, limit, debounced, sort, order, JSON.stringify(extraParams)]);

    useEffect(() => { run(); }, [run, refreshToken]);

    const toggleSort = (key) => {
        if (sort === key) setOrder((o) => (o === "asc" ? "desc" : "asc"));
        else { setSort(key); setOrder("desc"); }
    };

    const { rows, total, totalPages, loading, error } = state;

    return (
        <div>
            <div className="admin-toolbar">
                <div className="admin-search">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={searchPlaceholder}
                    />
                </div>
                {toolbar}
                <div style={{ flex: 1 }} />
                <button className="admin-btn ghost sm" onClick={run} title="Refresh">
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </div>

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            {columns.map((c) => (
                                <th
                                    key={c.key}
                                    className={c.sortable ? "sortable" : ""}
                                    style={{ width: c.width, textAlign: c.align }}
                                    onClick={c.sortable ? () => toggleSort(c.key) : undefined}
                                >
                                    {c.header}
                                    {c.sortable && sort === c.key && (
                                        <span className="material-symbols-outlined">
                                            {order === "asc" ? "arrow_upward" : "arrow_downward"}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading &&
                            Array.from({ length: 6 }).map((_, i) => (
                                <tr key={`s${i}`}>
                                    {columns.map((c) => (
                                        <td key={c.key}><span className="admin-skel" style={{ width: `${40 + ((i * 13 + c.key.length * 7) % 45)}%` }} /></td>
                                    ))}
                                </tr>
                            ))}

                        {!loading && error && (
                            <tr><td colSpan={columns.length}>
                                <EmptyState icon="cloud_off" title="Couldn’t load this data">{error}</EmptyState>
                            </td></tr>
                        )}

                        {!loading && !error && rows.length === 0 && (
                            <tr><td colSpan={columns.length}>
                                <EmptyState icon={empty?.icon} title={empty?.title}>{empty?.children}</EmptyState>
                            </td></tr>
                        )}

                        {!loading && !error && rows.map((row) => (
                            <tr
                                key={rowKey(row)}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                style={onRowClick ? { cursor: "pointer" } : undefined}
                            >
                                {columns.map((c) => (
                                    <td key={c.key} style={{ textAlign: c.align }}>
                                        {c.render ? c.render(row) : row[c.key] ?? "—"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="admin-pagination">
                <span>{total.toLocaleString()} record{total === 1 ? "" : "s"}</span>
                <div className="spacer" />
                <button className="admin-btn ghost sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span>Page {page} / {totalPages}</span>
                <button className="admin-btn ghost sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </div>
    );
}
