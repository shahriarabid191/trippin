import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { StarRow } from '../components/HotelReviews';

const NAVY = '#0F172A';
const GOLD = '#FBBF24';

export default function Booking() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null); // hotel being booked (opens PaymentModal)

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('http://localhost:5050/api/booking');
        if (!response.ok) {
          throw new Error('Failed to fetch hotels from server');
        }
        const data = await response.json();
        setHotels(data);
      } catch (err) {
        console.error('Error fetching hotels:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <p style={{ color: '#4f5c69', fontSize: '18px' }}>Loading available stays...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <p style={{ color: '#ba1a1a', fontSize: '18px' }}>❌ Error: {error}</p>
      </div>
    );
  }

  const goToHotel = (hotel, hash = '') => navigate(`/hotels/${hotel.id}${hash}`);

  return (
    <div className="page">
      <main className="subpage-content" style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Book Your Anchor</h2>
          <p style={{ color: '#4f5c69' }}>Discover pristine escapes handpicked for your next destination.</p>
        </div>

        {hotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', background: NAVY, borderRadius: '12px', border: '1px dashed #4f5c69' }}>
            <p style={{ color: '#8da2b5', margin: 0 }}>No hotels available at the moment. Admin needs to upload properties!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '28px' }}>
            {hotels.map((hotel) => {
              const avgRating = Number(hotel.avg_rating ?? hotel.rating ?? 0);
              const reviewCount = Number(hotel.review_count ?? 0);

              return (
                <div
                  key={hotel.id}
                  onClick={() => goToHotel(hotel)}
                  style={{
                    background: NAVY,
                    borderRadius: '18px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    aspectRatio: '2 / 3',
                    maxWidth: '320px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  {/* Hero image — top 40% */}
                  <div style={{ flex: '0 0 40%', width: '100%', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={hotel.image_url}
                      alt={hotel.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        padding: '4px 9px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: GOLD }}>star</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{avgRating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Content — bottom 60% */}
                  <div style={{ flex: '1 1 60%', padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 0 }}>
                    <div>
                      <h3 style={{ margin: '0 0 6px', fontSize: '19px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{hotel.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8', fontSize: '13px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>location_on</span>
                        {hotel.location}
                      </div>
                    </div>

                    <div>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '10px 0' }} />

                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontSize: '21px', fontWeight: 'bold', color: '#fff' }}>${hotel.price_per_night}</span>
                          <span style={{ color: '#94A3B8', fontSize: '12px' }}> / night</span>
                        </div>
                      </div>

                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '12px' }}
                        onClick={(e) => { e.stopPropagation(); goToHotel(hotel, '#reviews'); }}
                      >
                        <StarRow value={Math.round(avgRating)} size={13} />
                        <span style={{ color: '#94A3B8', fontSize: '12px' }}>
                          {avgRating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); goToHotel(hotel, '#reviews'); }}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.3)',
                            padding: '9px 0',
                            borderRadius: '999px',
                            fontWeight: 600,
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Read Reviews
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!user) {
                              alert('Please log in to reserve this stay.');
                              return;
                            }
                            setSelectedHotel(hotel);
                          }}
                          style={{
                            flex: 1,
                            background: '#fff',
                            color: NAVY,
                            border: 'none',
                            padding: '9px 0',
                            borderRadius: '999px',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Payment / booking modal */}
      {selectedHotel && (
        <PaymentModal
          hotel={selectedHotel}
          user={user}
          onClose={() => setSelectedHotel(null)}
        />
      )}
    </div>
  );
}
