import { useState, useMemo, useEffect } from 'react';

const API_BASE = 'http://localhost:5050/api';

const todayStr = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

// Add N days to a YYYY-MM-DD string using local time (no timezone drift).
const addDaysStr = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
};

const prettyDate = (dateStr) => {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

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
 *   hotel   - the hotel object being booked ({ id, name, price_per_night, total_rooms, ... })
 *   user    - the logged-in user ({ email, ... })
 *   onClose - callback to close the modal
 */
export default function PaymentModal({ hotel, user, onClose }) {
  const [checkIn, setCheckIn] = useState(todayStr());
  const [nights, setNights] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  // Live availability for the currently-selected dates.
  const [availability, setAvailability] = useState(null); // { total_rooms, rooms_available }
  const [availLoading, setAvailLoading] = useState(false);

  const checkOut = useMemo(
    () => (checkIn && nights > 0 ? addDaysStr(checkIn, nights) : ''),
    [checkIn, nights]
  );

  const pricePerNight = Number(hotel?.price_per_night || 0);
  const total = nights * rooms * pricePerNight;

  const roomsAvailable = availability?.rooms_available;
  const soldOut = roomsAvailable === 0;

  // Fetch availability whenever the date range changes.
  useEffect(() => {
    if (!checkIn || nights < 1 || !checkOut) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    setAvailLoading(true);
    fetch(`${API_BASE}/hotels/${hotel.id}/availability?check_in=${checkIn}&check_out=${checkOut}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!cancelled) setAvailability(data); })
      .catch(() => { if (!cancelled) setAvailability(null); })
      .finally(() => { if (!cancelled) setAvailLoading(false); });
    return () => { cancelled = true; };
  }, [hotel.id, checkIn, nights, checkOut]);

  // Keep the room selection within what's actually available.
  useEffect(() => {
    if (typeof roomsAvailable === 'number' && roomsAvailable >= 1 && rooms > roomsAvailable) {
      setRooms(roomsAvailable);
    }
  }, [roomsAvailable, rooms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (nights < 1) {
      setError('Please choose at least 1 night.');
      return;
    }
    if (rooms < 1) {
      setError('Please choose at least 1 room.');
      return;
    }
    if (typeof roomsAvailable === 'number' && rooms > roomsAvailable) {
      setError(
        roomsAvailable === 0
          ? 'No rooms left for these dates. Try different dates.'
          : `Only ${roomsAvailable} room${roomsAvailable === 1 ? '' : 's'} left for these dates.`
      );
      return;
    }
    if (paymentMethod === 'card' && cardNumber.replace(/\s/g, '').length < 12) {
      setError('Please enter a valid card number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hotel_id: hotel.id,
          user_email: user.email,
          check_in: checkIn,
          check_out: checkOut,
          num_rooms: rooms,
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
            <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#4ade80' }}>
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
              <Row label="Check-in" value={prettyDate(checkIn)} />
              <Row label="Check-out" value={prettyDate(checkOut)} />
              <Row label="Nights" value={confirmation.nights} />
              <Row label="Rooms" value={confirmation.num_rooms ?? rooms} />
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
          /* ---------- Booking form ---------- */
          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            {/* Check-in + nights */}
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
              <div style={{ width: '130px' }}>
                <label style={labelStyle}>Nights</label>
                <Stepper
                  value={nights}
                  min={1}
                  max={30}
                  onChange={setNights}
                />
              </div>
            </div>

            {/* Check-out (derived) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#8da2b5',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>event</span>
              Check-out: <strong style={{ color: '#dfeaf3' }}>{prettyDate(checkOut)}</strong>
            </div>

            {/* Rooms */}
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>Rooms</label>
              <Stepper
                value={rooms}
                min={1}
                max={typeof roomsAvailable === 'number' ? Math.max(1, roomsAvailable) : 99}
                onChange={setRooms}
                disabled={soldOut}
              />
            </div>

            {/* Availability line */}
            <div style={{ minHeight: '20px', marginBottom: '16px', fontSize: '13px' }}>
              {availLoading ? (
                <span style={{ color: '#8da2b5' }}>Checking availability…</span>
              ) : availability ? (
                soldOut ? (
                  <span style={{ color: '#f87171', fontWeight: 600 }}>
                    Fully booked for these dates.
                  </span>
                ) : (
                  <span style={{ color: '#4ade80' }}>
                    {availability.rooms_available} of {availability.total_rooms} rooms available for these dates
                  </span>
                )
              ) : null}
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
              <Row
                label={`$${pricePerNight} × ${nights} night${nights === 1 ? '' : 's'} × ${rooms} room${rooms === 1 ? '' : 's'}`}
                value={`$${total.toFixed(2)}`}
              />
              <div style={{ borderTop: '1px solid #1b2f42', margin: '8px 0' }} />
              <Row label="Total" value={`$${total.toFixed(2)}`} bold />
            </div>

            {error && <p style={{ color: '#ffdad6', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}

            <button
              type="submit"
              disabled={submitting || soldOut}
              style={{
                width: '100%',
                background: '#fff',
                color: '#0b1e30',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: submitting || soldOut ? 'not-allowed' : 'pointer',
                opacity: submitting || soldOut ? 0.6 : 1,
              }}
            >
              {submitting ? 'Processing...' : soldOut ? 'Sold out for these dates' : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Small +/- number stepper with a numeric field in the middle.
function Stepper({ value, min = 1, max = 99, onChange, disabled }) {
  const clamp = (n) => Math.max(min, Math.min(max, n));
  const btn = {
    width: '34px',
    height: '38px',
    background: '#1b2f42',
    border: '1px solid #4f5c69',
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '18px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', opacity: disabled ? 0.5 : 1 }}>
      <button
        type="button"
        onClick={() => !disabled && onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        style={{ ...btn, borderRadius: '8px 0 0 8px' }}
        aria-label="decrease"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || min))}
        style={{
          width: '48px',
          textAlign: 'center',
          background: '#08151f',
          border: '1px solid #4f5c69',
          borderLeft: 'none',
          borderRight: 'none',
          color: '#fff',
          fontSize: '15px',
          fontFamily: 'inherit',
          MozAppearance: 'textfield',
        }}
      />
      <button
        type="button"
        onClick={() => !disabled && onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        style={{ ...btn, borderRadius: '0 8px 8px 0' }}
        aria-label="increase"
      >
        +
      </button>
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
