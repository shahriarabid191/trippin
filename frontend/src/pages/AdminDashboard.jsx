import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Hotel Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [rating, setRating] = useState('5.0');
  const [status, setStatus] = useState('');

  // Protect the route: Kick out non-admins
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleUploadHotel = async (e) => {
    e.preventDefault();
    setStatus('Uploading...');

    try {
      const response = await fetch('http://localhost:5050/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          location, 
          price_per_night: parseFloat(price), 
          image_url: imageUrl, 
          rating: parseFloat(rating) 
        })
      });

      if (response.ok) {
        setStatus('✅ Hotel successfully uploaded!');
        setName(''); setLocation(''); setPrice(''); setImageUrl(''); setRating('5.0');
      } else {
        setStatus('❌ Failed to upload hotel.');
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ Server error.');
    }
  };

  if (!user || user.role !== 'admin') return null; // Prevent flash of content before redirect

  return (
    <div className="page">
      <main className="subpage-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#ba1a1a' }}>admin_panel_settings</span>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', maxWidth: '800px' }}>
          
          {/* Upload Hotel Card */}
          <div className="contact-card" style={{ width: '100%', background: '#0b1e30', border: '1px solid #b7d7ef' }}>
            <h3 style={{ color: '#fff', fontSize: '24px' }}>Upload New Hotel</h3>
            <p style={{ color: '#b7d7ef', marginBottom: '24px' }}>Add a new property to the Booking network.</p>
            
            <form onSubmit={handleUploadHotel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <input type="text" placeholder="Hotel Name (e.g., Coastal Haven Inn)" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4f5c69', background: '#1b2f42', color: '#fff' }} />
              </div>
              
              <input type="text" placeholder="Location (e.g., Sylhet)" value={location} onChange={(e) => setLocation(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4f5c69', background: '#1b2f42', color: '#fff' }} />
              
              <input type="number" placeholder="Price per night ($)" value={price} onChange={(e) => setPrice(e.target.value)} required min="1" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4f5c69', background: '#1b2f42', color: '#fff' }} />
              
              <div style={{ gridColumn: '1 / -1' }}>
                <input type="url" placeholder="Image URL (Unsplash link)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4f5c69', background: '#1b2f42', color: '#fff' }} />
              </div>
              
              <input type="number" placeholder="Rating (1.0 - 5.0)" value={rating} onChange={(e) => setRating(e.target.value)} step="0.1" min="1" max="5" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #4f5c69', background: '#1b2f42', color: '#fff' }} />
              
              <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#fff', color: '#0b1e30', fontWeight: 'bold', cursor: 'pointer' }}>
                  Upload to Database
                </button>
              </div>
            </form>

            {status && <p style={{ marginTop: '16px', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{status}</p>}
          </div>

        </div>
      </main>
    </div>
  );
}