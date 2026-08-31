import { Link } from "react-router-dom";
import { NoteBox } from "../components/primitives";

// Placeholder. Per the build decision, a real Payments ledger is out of
// scope until the schema has a dedicated transactions table — right now
// a "payment" is just a free-text `transaction_id` on the hotel bookings
// row with no status history. The nav item is kept so the structure
// matches the spec and the section is ready to fill in later.
export default function Payments() {
    return (
        <div className="admin-page">
            <div className="admin-page-head">
                <h2>Payments <span className="admin-badge amber" style={{ verticalAlign: "middle" }}>Simulated</span></h2>
                <p>Simulated payment ledger — no real payment processor is connected.</p>
            </div>

            <div className="admin-card">
                <div className="admin-card-body" style={{ padding: 40, textAlign: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 44, color: "var(--a-text-3)" }}>account_balance</span>
                    <h3 style={{ margin: "12px 0 6px" }}>No transaction ledger yet</h3>
                    <p style={{ maxWidth: 460, margin: "0 auto 16px", color: "var(--a-text-2)", fontSize: 13.5 }}>
                        The current schema records a payment only as a free-text reference on the hotel
                        booking row, with no amount history or status transitions to oversee. Once a
                        dedicated <code>transactions</code> table exists, this screen becomes the
                        ledger with per-row refund / fail overrides.
                    </p>
                    <NoteBox icon="lightbulb">
                        In the meantime, booking-level cancel &amp; refund actions live on the{" "}
                        <Link to="/admin/bookings" style={{ fontWeight: 700, color: "var(--a-accent-ink)" }}>Bookings</Link> screen.
                        See <code>ADMIN_PANEL_NOTES.md</code> for the schema this section needs.
                    </NoteBox>
                </div>
            </div>
        </div>
    );
}
