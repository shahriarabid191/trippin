import { useState, useEffect } from 'react';

export default function Booking() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <p style={{ color: '#b7d7ef', fontSize: '18px' }}>Loading available stays...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <p style={{ color: '#ffdad6', fontSize: '18px' }}>❌ Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="subpage-content" style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Book Your Anchor</h2>
          <p style={{ color: '#b7d7ef' }}>Discover pristine escapes handpicked for your next destination.</p>
        </div>

        {hotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', background: '#0b1e30', borderRadius: '12px', border: '1px dashed #4f5c69' }}>
            <p style={{ color: '#8da2b5', margin: 0 }}>No hotels available at the moment. Admin needs to upload properties!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
            {hotels.map((hotel) => (
              <div 
                key={hotel.id} 
                className="contact-card" 
                style={{ 
                  background: '#0b1e30', 
                  padding: '0', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: '1px solid #4f5c69'
                }}
              >
                {/* Hotel Image */}
                <div style={{ width: '100%', height: '200px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={hotel.image_url} 
                    alt={hotel.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'; // Fallback
                    }}
                  />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(11, 30, 48, 0.85)', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ffb300' }}>star</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{hotel.rating || '5.0'}</span>
                  </div>
                </div>

                {/* Hotel Content */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '20px', color: '#fff' }}>{hotel.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b7d7ef', fontSize: '14px', marginBottom: '16px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                      {hotel.location}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid #1b2f42', paddingTop: '16px' }}>
                    <div>
                      <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>${hotel.price_per_night}</span>
                      <span style={{ color: '#8da2b5', fontSize: '14px' }}> / night</span>
                    </div>
                    <button 
                      style={{ 
                        background: '#fff', 
                        color: '#0b1e30', 
                        border: 'none', 
                        padding: '10px 20px', 
                        borderRadius: '8px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer' 
                      }}
                      onClick={() => alert(`Booking flow for ${hotel.name} coming soon!`)}
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}