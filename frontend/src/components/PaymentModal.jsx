import { useState, useMemo } from 'react';

const API_BASE = 'http://localhost:5050/api/payments';

const todayStr = () => new Date().toISOString().split('T')[0];

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#08151f',
  border: '1px solid #4f5c69',
  borderRadius: '8px',
  color: '#fff',
  padding: '10px',
  fontSize: '14px',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block',
  color: '#b7d7ef',
  fontSize: '13px',
  marginBottom: '6px',
};

/**
 * PaymentModal
 * Props:
 *   hotel   - the hotel object being booked ({ id, name, price_per_night, ... })
 *   user    - the logged-in user ({ email, ... })
 *   onClose - callback to close the modal
 */
export default function PaymentModal({ hotel, user, onClose }) {
  const [checkIn, setCheckIn] = useState(todayStr());
  const [checkOut, setCheckOut] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const n = Math.round(ms / (1000 * 60 * 60 * 24));
    return n > 0 ? n : 0;
  }, [checkIn, checkOut]);

  const total = nights * Number(hotel?.price_per_night || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (nights < 1) {
      setError('Check-out must be at least one day after check-in.');
      return;
    }
    if (paymentMethod === 'card' && cardNumber.replace(/\s/g, '').length < 12) {
      setError('Please enter a valid card number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hotel_id: hotel.id,
          user_email: user.email,
          check_in: checkIn,
          check_out: checkOut,
          payment_method: paymentMethod,
          // Card number is sent to the mock gateway only; it is never stored.
          card_number: cardNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      setConfirmation(data);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3, 10, 18, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0b1e30',
          border: '1px solid #4f5c69',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 20px',
            borderBottom: '1px solid #1b2f42',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
            {confirmation ? 'Booking Confirmed' : `Reserve ${hotel?.name}`}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8da2b5', display: 'flex' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {confirmation ? (
          /* ---------- Success state ---------- */
          <div style={{ padding: '28px 20px', textAlign: 'center' }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '56px', color: '#4ade80' }}
            >
              check_circle
            </span>
            <h4 style={{ color: '#fff', margin: '12px 0 6px', fontSize: '20px' }}>Payment Successful</h4>
            <p style={{ color: '#b7d7ef', fontSize: '14px', margin: '0 0 16px' }}>
              Your stay at {hotel?.name} is booked.
            </p>

            <div
              style={{
                background: '#08151f',
                border: '1px solid #1b2f42',
                borderRadius: '10px',
                padding: '14px 16px',
                textAlign: 'left',
                fontSize: '14px',
                color: '#dfeaf3',
              }}
            >
              <Row label="Transaction ID" value={confirmation.transaction_id} mono />
              <Row label="Nights" value={confirmation.nights} />
              <Row label="Total charged" value={`$${Number(confirmation.total_amount).toFixed(2)}`} />
              <Row label="Status" value={confirmation.booking?.status || 'completed'} />
            </div>

            <button
              onClick={onClose}
              style={{
                marginTop: '20px',
                background: '#fff',
                color: '#0b1e30',
                border: 'none',
                padding: '11px 22px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          /* ---------- Payment form ---------- */
          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  min={todayStr()}
                  onChange={(e) => setCheckIn(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || todayStr()}
                  onChange={(e) => setCheckOut(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Payment method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={inputStyle}
              >
                <option value="card">Credit / Debit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {paymentMethod === 'card' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Card number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  style={inputStyle}
                />
                <p style={{ color: '#6b7d8f', fontSize: '12px', margin: '6px 0 0' }}>
                  Test mode — no real charge is made.
                </p>
              </div>
            )}

            {/* Price summary */}
            <div
              style={{
                background: '#08151f',
                border: '1px solid #1b2f42',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#dfeaf3',
              }}
            >
              <Row label={`$${hotel?.price_per_night} × ${nights} night${nights === 1 ? '' : 's'}`} value={`$${total.toFixed(2)}`} />
              <div style={{ borderTop: '1px solid #1b2f42', margin: '8px 0' }} />
              <Row label="Total" value={`$${total.toFixed(2)}`} bold />
            </div>

            {error && <p style={{ color: '#ffdad6', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: '#fff',
                color: '#0b1e30',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
      <span style={{ color: '#8da2b5' }}>{label}</span>
      <span
        style={{
          color: '#fff',
          fontWeight: bold ? 'bold' : 'normal',
          fontFamily: mono ? 'monospace' : 'inherit',
          fontSize: mono ? '12px' : 'inherit',
        }}
      >
        {value}
      </span>
    </div>
  );
}
