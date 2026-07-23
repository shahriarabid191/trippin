import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import HotelReviews, { StarRow } from '../components/HotelReviews';

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5050/api/hotels/${id}`);
        if (!res.ok) throw new Error('Hotel not found');
        const data = await res.json();
        setHotel(data);
      } catch (err) {
        console.error('Error fetching hotel:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  // If we arrived via a "Read Reviews" link (#reviews), scroll there once loaded.
  useEffect(() => {
    if (!loading && hotel && window.location.hash === '#reviews') {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, hotel]);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <p style={{ color: '#4f5c69', fontSize: '18px' }}>Loading hotel...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <p style={{ color: '#ba1a1a', fontSize: '18px' }}>❌ {error || 'Hotel not found'}</p>
        <Link to="/booking" style={{ color: '#0d79bd' }}>← Back to all stays</Link>
      </div>
    );
  }

  const avgRating = Number(hotel.avg_rating ?? hotel.rating ?? 0);
  const reviewCount = Number(hotel.review_count ?? 0);

  return (
    <div className="page">
      <main className="subpage-content" style={{ padding: '32px 24px 80px', maxWidth: '1000px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/booking')}
          style={{
            background: 'none',
            border: 'none',
            color: '#0d79bd',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to all stays
        </button>

        {/* Hero image */}
        <div style={{ width: '100%', height: '360px', borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={hotel.image_url}
            alt={hotel.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.75)',
              padding: '6px 12px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#FBBF24' }}>star</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{avgRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Title / location / price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginTop: '28px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: '32px', color: '#0c2135' }}>{hotel.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4f5c69', fontSize: '15px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
              {hotel.location}
            </div>
            {hotel.total_rooms != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4f5c69', fontSize: '15px', marginTop: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>meeting_room</span>
                {hotel.total_rooms} rooms · pick your dates to see live availability
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <StarRow value={Math.round(avgRating)} size={18} />
              <span style={{ color: '#4f5c69', fontSize: '14px' }}>
                {avgRating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div>
              <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#0c2135' }}>${hotel.price_per_night}</span>
              <span style={{ color: '#4f5c69', fontSize: '14px' }}> / night</span>
            </div>
            <button
              onClick={() => {
                if (!user) {
                  alert('Please log in to reserve this stay.');
                  return;
                }
                setShowPayment(true);
              }}
              style={{
                marginTop: '12px',
                background: '#fff',
                color: '#0F172A',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '999px',
                fontWeight: 'bold',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Reserve
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />

        {/* Reviews */}
        <div id="reviews">
          <HotelReviews hotelId={hotel.id} />
        </div>
      </main>

      {showPayment && (
        <PaymentModal hotel={hotel} user={user} onClose={() => setShowPayment(false)} />
      )}
    </div>
  );
}
