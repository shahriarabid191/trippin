import { useEffect, useState } from "react";

// Base modal shell. Closes on Esc / overlay click.
export function Modal({ title, subtitle, icon, danger, wide, onClose, children, footer }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="admin-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
            <div className={`admin-modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true">
                <div className="admin-modal-head">
                    {icon && (
                        <span className={`icon-badge ${danger ? "danger" : ""}`}>
                            <span className="material-symbols-outlined">{icon}</span>
                        </span>
                    )}
                    <div>
                        <h3>{title}</h3>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    <button className="x" onClick={onClose} aria-label="Close">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="admin-modal-body">{children}</div>
                {footer && <div className="admin-modal-foot">{footer}</div>}
            </div>
        </div>
    );
}

// Confirmation dialog for destructive / high-stakes actions.
// `reasonLabel` — when set, shows a required-ish text box whose value is
// passed to onConfirm(reason).
export function ConfirmDialog({
    title,
    message,
    confirmLabel = "Confirm",
    tone = "danger",
    icon = "warning",
    reasonLabel,
    reasonRequired = false,
    onConfirm,
    onClose,
}) {
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);

    const run = async () => {
        if (reasonRequired && !reason.trim()) return;
        setBusy(true);
        try {
            await onConfirm(reason.trim());
            onClose();
        } catch {
            setBusy(false); // error toast is handled upstream
        }
    };

    return (
        <Modal
            title={title}
            icon={icon}
            danger={tone === "danger"}
            onClose={busy ? undefined : onClose}
            footer={
                <>
                    <button className="admin-btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
                    <button
                        className={`admin-btn ${tone === "danger" ? "danger-solid" : "primary"}`}
                        onClick={run}
                        disabled={busy || (reasonRequired && !reason.trim())}
                    >
                        {busy ? "Working…" : confirmLabel}
                    </button>
                </>
            }
        >
            {message && <p style={{ margin: "0 0 12px", color: "var(--a-text-2)", fontSize: 13.5 }}>{message}</p>}
            {reasonLabel && (
                <div className="admin-field" style={{ margin: 0 }}>
                    <label>{reasonLabel}{reasonRequired && " *"}</label>
                    <textarea
                        autoFocus
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Recorded on the audit trail"
                    />
                </div>
            )}
        </Modal>
    );
}

// Schema-driven create/edit form.
// fields: [{ name, label, type, required, min, max, step, placeholder, hint,
//            options:[{value,label}], full:boolean }]
export function EntityFormModal({ title, subtitle, icon = "edit", fields, initial = {}, submitLabel = "Save", onSubmit, onClose }) {
    const [values, setValues] = useState(() => {
        const v = {};
        fields.forEach((f) => {
            v[f.name] = initial[f.name] ?? (f.type === "checkbox" ? false : "");
        });
        return v;
    });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (name, value) => setValues((v) => ({ ...v, [name]: value }));

    const validate = () => {
        const e = {};
        fields.forEach((f) => {
            const val = values[f.name];
            if (f.required && (val === "" || val === null || val === undefined)) {
                e[f.name] = `${f.label} is required`;
            } else if (f.type === "number" && val !== "" && val !== null) {
                const n = Number(val);
                if (Number.isNaN(n)) e[f.name] = "Must be a number";
                else if (f.min != null && n < f.min) e[f.name] = `Must be ≥ ${f.min}`;
                else if (f.max != null && n > f.max) e[f.name] = `Must be ≤ ${f.max}`;
            } else if (f.type === "url" && val) {
                try { new URL(val); } catch { e[f.name] = "Must be a valid URL"; }
            }
        });
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        const payload = {};
        fields.forEach((f) => {
            let v = values[f.name];
            if (f.type === "number") v = v === "" ? null : Number(v);
            payload[f.name] = v;
        });
        setBusy(true);
        try {
            await onSubmit(payload);
            onClose();
        } catch {
            setBusy(false);
        }
    };

    return (
        <Modal
            title={title}
            subtitle={subtitle}
            icon={icon}
            wide
            onClose={busy ? undefined : onClose}
            footer={
                <>
                    <button type="button" className="admin-btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
                    <button type="submit" form="entity-form" className="admin-btn primary" disabled={busy}>
                        {busy ? "Saving…" : submitLabel}
                    </button>
                </>
            }
        >
            <form id="entity-form" onSubmit={submit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                    {fields.map((f) => (
                        <div
                            key={f.name}
                            className="admin-field"
                            style={{ gridColumn: f.full || f.type === "textarea" || f.type === "checkbox" ? "1 / -1" : "auto" }}
                        >
                            {f.type === "checkbox" ? (
                                <label className="admin-check">
                                    <input type="checkbox" checked={!!values[f.name]} onChange={(e) => set(f.name, e.target.checked)} />
                                    {f.label}
                                </label>
                            ) : (
                                <>
                                    <label>{f.label}{f.required && " *"}</label>
                                    {f.type === "textarea" ? (
                                        <textarea value={values[f.name]} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
                                    ) : f.type === "select" ? (
                                        <select value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}>
                                            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                                            value={values[f.name]}
                                            placeholder={f.placeholder}
                                            step={f.step}
                                            onChange={(e) => set(f.name, e.target.value)}
                                        />
                                    )}
                                </>
                            )}
                            {f.hint && <div className="admin-field-hint">{f.hint}</div>}
                            {errors[f.name] && <div className="err">{errors[f.name]}</div>}
                        </div>
                    ))}
                </div>
            </form>
        </Modal>
    );
}
