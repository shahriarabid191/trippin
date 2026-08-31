import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let seq = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((t) => t.filter((x) => x.id !== id));
    }, []);

    const push = useCallback((toast) => {
        const id = ++seq;
        const entry = { id, type: "info", ttl: 4200, ...toast };
        setToasts((t) => [...t, entry]);
        if (entry.ttl) setTimeout(() => dismiss(id), entry.ttl);
        return id;
    }, [dismiss]);

    const api = {
        success: (title, message) => push({ type: "success", title, message }),
        error: (title, message) => push({ type: "error", title, message }),
        info: (title, message) => push({ type: "info", title, message }),
        // Wrap an async action with automatic success / error toasts.
        run: async (promise, { success, error } = {}) => {
            try {
                const result = await promise;
                if (success) push({ type: "success", title: success });
                return result;
            } catch (e) {
                push({ type: "error", title: error || "Action failed", message: e.message });
                throw e;
            }
        },
    };

    const icon = { success: "check_circle", error: "error", info: "info" };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="admin-toasts">
                {toasts.map((t) => (
                    <div key={t.id} className={`admin-toast ${t.type}`}>
                        <span className="material-symbols-outlined">{icon[t.type]}</span>
                        <div className="body">
                            <div className="title">{t.title}</div>
                            {t.message && <div style={{ color: "var(--a-text-2)", marginTop: 2 }}>{t.message}</div>}
                        </div>
                        <button className="x" onClick={() => dismiss(t.id)}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
};
