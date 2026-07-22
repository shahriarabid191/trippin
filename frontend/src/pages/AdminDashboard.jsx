import { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API = 'http://localhost:5050/api';

// --- Design tokens (dark cards on the site's light page background) ---
const CARD = '#0b1e30';
const FIELD = '#1b2f42';
const BORDER = '#4f5c69';
const LIGHT = '#b7d7ef';

const fieldStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: `1px solid ${BORDER}`,
  background: FIELD,
  color: '#fff',
};

const primaryBtn = {
  padding: '12px 20px',
  borderRadius: '8px',
  border: 'none',
  background: '#fff',
  color: CARD,
  fontWeight: 'bold',
  cursor: 'pointer',
};

const th = {
  textAlign: 'left',
  padding: '12px',
  color: LIGHT,
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: `1px solid ${BORDER}`,
  whiteSpace: 'nowrap',
};

const td = {
  padding: '12px',
  color: '#e8eef4',
  fontSize: '14px',
  borderBottom: '1px solid #1b2f42',
  verticalAlign: 'middle',
};

function StatusBadge({ status }) {
  const map = {
    completed: { bg: 'rgba(34,197,94,0.15)', fg: '#4ade80', label: 'Completed' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', fg: '#f87171', label: 'Cancelled' },
    pending: { bg: 'rgba(251,191,36,0.15)', fg: '#fbbf24', label: 'Pending' },
  };
  const s = map[status] || { bg: 'rgba(148,163,184,0.15)', fg: '#94a3b8', label: status || '—' };
  return (
    <span style={{ background: s.bg, color: s.fg, padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
const fmtMoney = (n) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab] = useState('bookings');

  // --- Data ---
  const [bookings, setBookings] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({ bookings: false, hotels: false, users: false });

  // --- Hotel form (create or edit) ---
  const emptyHotel = { name: '', location: '', price: '', imageUrl: '', rating: '5.0', rooms: '10' };
  const [form, setForm] = useState(emptyHotel);
  const [editingId, setEditingId] = useState(null); // null => creating
  const [status, setStatus] = useState('');

  // Protect the route: kick out non-admins
  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  // --- Fetchers ---
  const loadBookings = useCallback(async () => {
    setLoading((l) => ({ ...l, bookings: true }));
    try {
      const res = await fetch(`${API}/admin/bookings`, { credentials: 'include' });
      setBookings(res.ok ? await res.json() : []);
    } catch (e) {
      console.error(e);
      setBookings([]);
    } finally {
      setLoading((l) => ({ ...l, bookings: false }));
    }
  }, []);

  const loadHotels = useCallback(async () => {
    setLoading((l) => ({ ...l, hotels: true }));
    try {
      const res = await fetch(`${API}/hotels`, { credentials: 'include' });
      setHotels(res.ok ? await res.json() : []);
    } catch (e) {
      console.error(e);
      setHotels([]);
    } finally {
      setLoading((l) => ({ ...l, hotels: false }));
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading((l) => ({ ...l, users: true }));
    try {
      const res = await fetch(`${API}/admin/users`, { credentials: 'include' });
      setUsers(res.ok ? await res.json() : []);
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setLoading((l) => ({ ...l, users: false }));
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    if (tab === 'bookings') loadBookings();
    if (tab === 'hotels') loadHotels();
    if (tab === 'users') loadUsers();
  }, [tab, user, loadBookings, loadHotels, loadUsers]);

  // --- Actions ---
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking? The record is kept but marked cancelled.')) return;
    try {
      const res = await fetch(`${API}/admin/bookings/${id}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status: updated.status } : b)));
      } else {
        alert('Failed to cancel booking.');
      }
    } catch (e) {
      console.error(e);
      alert('Server error.');
    }
  };

  const handleSubmitHotel = async (e) => {
    e.preventDefault();
    setStatus(editingId ? 'Saving…' : 'Uploading…');

    const payload = {
      name: form.name,
      location: form.location,
      price_per_night: parseFloat(form.price),
      image_url: form.imageUrl,
      rating: parseFloat(form.rating),
      total_rooms: parseInt(form.rooms, 10) || 1,
    };

    try {
      const res = await fetch(
        editingId ? `${API}/admin/hotels/${editingId}` : `${API}/hotels`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setStatus(editingId ? '✅ Hotel updated!' : '✅ Hotel uploaded!');
        setForm(emptyHotel);
        setEditingId(null);
        loadHotels();
      } else {
        setStatus('❌ Save failed.');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ Server error.');
    }
  };

  const startEditHotel = (h) => {
    setEditingId(h.id);
    setForm({
      name: h.name || '',
      location: h.location || '',
      price: h.price_per_night != null ? String(h.price_per_night) : '',
      imageUrl: h.image_url || '',
      rating: h.rating != null ? String(h.rating) : '5.0',
      rooms: h.total_rooms != null ? String(h.total_rooms) : '10',
    });
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyHotel);
    setStatus('');
  };

  const handleDeleteHotel = async (h) => {
    if (!window.confirm(`Delete "${h.name}"? This also removes its bookings and reviews. This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/admin/hotels/${h.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setHotels((hs) => hs.filter((x) => x.id !== h.id));
        if (editingId === h.id) cancelEdit();
      } else {
        alert('Failed to delete hotel.');
      }
    } catch (e) {
      console.error(e);
      alert('Server error.');
    }
  };

  if (!user || user.role !== 'admin') return null; // prevent flash before redirect

  const TabButton = ({ id, icon, label }) => {
    const active = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '999px',
          border: active ? '1px solid #b7d7ef' : '1px solid transparent',
          background: active ? CARD : 'transparent',
          color: active ? '#fff' : '#4f5c69',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
        {label}
      </button>
    );
  };

  return (
    <div className="page">
      <main className="subpage-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#ba1a1a' }}>admin_panel_settings</span>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <TabButton id="bookings" icon="receipt_long" label="Bookings" />
          <TabButton id="hotels" icon="hotel" label="Hotels" />
          <TabButton id="users" icon="group" label="Users" />
        </div>

        {/* ============================= BOOKINGS ============================= */}
        {tab === 'bookings' && (
          <div className="contact-card" style={{ width: '100%', maxWidth: '1100px', background: CARD, border: `1px solid ${LIGHT}`, overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '22px', margin: 0 }}>All Bookings</h3>
                <p style={{ color: LIGHT, margin: '4px 0 0' }}>Who paid, for which hotel, and on what dates.</p>
              </div>
              <button onClick={loadBookings} style={{ ...primaryBtn, background: FIELD, color: '#fff', border: `1px solid ${BORDER}` }}>Refresh</button>
            </div>

            {loading.bookings ? (
              <p style={{ color: LIGHT, padding: '16px 0' }}>Loading bookings…</p>
            ) : bookings.length === 0 ? (
              <p style={{ color: LIGHT, padding: '16px 0' }}>No bookings yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
                <thead>
                  <tr>
                    <th style={th}>Guest</th>
                    <th style={th}>Hotel</th>
                    <th style={th}>Check-in</th>
                    <th style={th}>Check-out</th>
                    <th style={th}>Rooms</th>
                    <th style={th}>Paid</th>
                    <th style={th}>Status</th>
                    <th style={th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td style={td}>{b.user_email}</td>
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>{b.hotel_name || '(deleted hotel)'}</div>
                        {b.hotel_location && <div style={{ color: '#8da2b5', fontSize: '12px' }}>{b.hotel_location}</div>}
                      </td>
                      <td style={td}>{fmtDate(b.check_in)}</td>
                      <td style={td}>{fmtDate(b.check_out)}</td>
                      <td style={td}>{b.num_rooms ?? 1}</td>
                      <td style={td}>{fmtMoney(b.total_amount)}</td>
                      <td style={td}><StatusBadge status={b.status} /></td>
                      <td style={td}>
                        {b.status === 'cancelled' ? (
                          <span style={{ color: '#8da2b5', fontSize: '13px' }}>—</span>
                        ) : (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ============================= HOTELS ============================= */}
        {tab === 'hotels' && (
          <div style={{ display: 'grid', gap: '32px', maxWidth: '1100px' }}>
            {/* Add / Edit form */}
            <div className="contact-card" style={{ width: '100%', background: CARD, border: `1px solid ${LIGHT}` }}>
              <h3 style={{ color: '#fff', fontSize: '24px', margin: 0 }}>{editingId ? 'Edit Hotel' : 'Upload New Hotel'}</h3>
              <p style={{ color: LIGHT, marginBottom: '24px' }}>
                {editingId ? 'Update this property’s details.' : 'Add a new property to the Booking network.'}
              </p>

              <form onSubmit={handleSubmitHotel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <input type="text" placeholder="Hotel Name (e.g., Coastal Haven Inn)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={fieldStyle} />
                </div>
                <input type="text" placeholder="Location (e.g., Sylhet)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required style={fieldStyle} />
                <input type="number" placeholder="Price per night ($)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="1" style={fieldStyle} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <input type="url" placeholder="Image URL (Unsplash link)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required style={fieldStyle} />
                </div>
                <input type="number" placeholder="Rating (1.0 - 5.0)" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} step="0.1" min="1" max="5" required style={fieldStyle} />
                <input type="number" placeholder="Total rooms" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} min="1" required style={fieldStyle} />
                <div style={{ gridColumn: '1 / -1', marginTop: '12px', display: 'flex', gap: '12px' }}>
                  <button type="submit" style={{ ...primaryBtn, flex: 1, padding: '14px' }}>
                    {editingId ? 'Save Changes' : 'Upload to Database'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} style={{ padding: '14px 20px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {status && <p style={{ marginTop: '16px', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{status}</p>}
            </div>

            {/* Existing hotels list */}
            <div className="contact-card" style={{ width: '100%', background: CARD, border: `1px solid ${LIGHT}`, overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ color: '#fff', fontSize: '22px', margin: 0 }}>Existing Hotels</h3>
                <button onClick={loadHotels} style={{ ...primaryBtn, background: FIELD, color: '#fff', border: `1px solid ${BORDER}` }}>Refresh</button>
              </div>

              {loading.hotels ? (
                <p style={{ color: LIGHT, padding: '16px 0' }}>Loading hotels…</p>
              ) : hotels.length === 0 ? (
                <p style={{ color: LIGHT, padding: '16px 0' }}>No hotels yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                  <thead>
                    <tr>
                      <th style={th}>Hotel</th>
                      <th style={th}>Location</th>
                      <th style={th}>Price / night</th>
                      <th style={th}>Rooms</th>
                      <th style={th}>Rating</th>
                      <th style={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotels.map((h) => (
                      <tr key={h.id}>
                        <td style={td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {h.image_url && <img src={h.image_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />}
                            <span style={{ fontWeight: 600 }}>{h.name}</span>
                          </div>
                        </td>
                        <td style={td}>{h.location}</td>
                        <td style={td}>{fmtMoney(h.price_per_night)}</td>
                        <td style={td}>{h.total_rooms ?? '—'}</td>
                        <td style={td}>★ {Number(h.avg_rating ?? h.rating ?? 0).toFixed(1)}</td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => startEditHotel(h)} style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${BORDER}`, background: 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => handleDeleteHotel(h)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ============================= USERS ============================= */}
        {tab === 'users' && (
          <div className="contact-card" style={{ width: '100%', maxWidth: '800px', background: CARD, border: `1px solid ${LIGHT}`, overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '22px', margin: 0 }}>Registered Users</h3>
                <p style={{ color: LIGHT, margin: '4px 0 0' }}>{users.length} account{users.length === 1 ? '' : 's'}</p>
              </div>
              <button onClick={loadUsers} style={{ ...primaryBtn, background: FIELD, color: '#fff', border: `1px solid ${BORDER}` }}>Refresh</button>
            </div>

            {loading.users ? (
              <p style={{ color: LIGHT, padding: '16px 0' }}>Loading users…</p>
            ) : users.length === 0 ? (
              <p style={{ color: LIGHT, padding: '16px 0' }}>No users found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '420px' }}>
                <thead>
                  <tr>
                    <th style={th}>ID</th>
                    <th style={th}>Email</th>
                    <th style={th}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={td}>{u.id}</td>
                      <td style={td}>{u.email}</td>
                      <td style={td}>
                        <span style={{ background: u.role === 'admin' ? 'rgba(186,26,26,0.18)' : 'rgba(148,163,184,0.15)', color: u.role === 'admin' ? '#f87171' : '#94a3b8', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
