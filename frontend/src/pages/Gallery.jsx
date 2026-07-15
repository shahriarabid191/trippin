import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Gallery() {
  const [galleryFilter, setGalleryFilter] = useState('all');
  const navigate = useNavigate();

  const galleryImages = [
    { title: 'Lalbagh Fort', category: 'culture', desc: '17th-century Mughal fort complex in Dhaka', url: 'https://images.unsplash.com/photo-1590040111840-1a66d2f0cf8f?auto=format&fit=crop&w=500&q=80' },
    { title: 'Tea Estate of Sylhet', category: 'nature', desc: 'Lush green tea gardens spreading over hills', url: 'https://images.unsplash.com/photo-1598514982835-cda9f52f4dc7?auto=format&fit=crop&w=500&q=80' },
    { title: "Cox's Bazar Sunset", category: 'nature', desc: 'Scenic golden hour at the world\'s longest beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80' },
    { title: 'Ahsan Manzil', category: 'culture', desc: 'The beautiful Pink Palace of Dhaka royals', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=500&q=80' },
    { title: 'Ratargul Swamp Forest', category: 'nature', desc: 'The only freshwater swamp forest in Bangladesh', url: 'https://images.unsplash.com/photo-1585123334904-845d60e97b29?auto=format&fit=crop&w=500&q=80' },
    { title: 'Saint Martin\'s Island', category: 'nature', desc: 'Stunning coral island in the northeastern Bay of Bengal', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=500&q=80' }
  ];

  const filteredGallery = galleryImages.filter(
    img => galleryFilter === 'all' || img.category === galleryFilter
  );

  return (
    <div className="page">
      <main className="subpage-content">
        <h2>Bangladesh Photo Gallery</h2>
        <p className="subpage-subtitle">Vivid memories and landscape captures from our amazing tour destinations.</p>
        
        <div className="gallery-filter-tabs">
          <button className={`gallery-tab-btn ${galleryFilter === 'all' ? 'active' : ''}`} onClick={() => setGalleryFilter('all')}>All Destinations</button>
          <button className={`gallery-tab-btn ${galleryFilter === 'nature' ? 'active' : ''}`} onClick={() => setGalleryFilter('nature')}>Beaches & Nature</button>
          <button className={`gallery-tab-btn ${galleryFilter === 'culture' ? 'active' : ''}`} onClick={() => setGalleryFilter('culture')}>Heritage & Culture</button>
        </div>

        <div className="gallery-photo-grid">
          {filteredGallery.map((img, idx) => (
            <article key={idx} className="gallery-photo-card">
              <img src={img.url} alt={img.title} />
              <div className="gallery-photo-info">
                <h4>{img.title}</h4>
                <p>{img.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="footer" style={{ marginTop: '0', minHeight: 'auto', padding: '60px 48px 24px' }}>
        <div className="footer-overlay" />
        <div className="footer-bottom" style={{ marginTop: '0', borderTop: 'none', paddingTop: '0' }}>
          <strong style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>◉ TRIPPIN</strong>
          <div className="footer-links">
            <a href="/booking" onClick={(e) => { e.preventDefault(); navigate('/booking'); }}>Booking</a>
            <a href="/itinerary" onClick={(e) => { e.preventDefault(); navigate('/itinerary'); }}>Itinerary</a>
            <a href="/vault" onClick={(e) => { e.preventDefault(); navigate('/vault'); }}>Vault</a>
            <a href="/gallery" onClick={(e) => { e.preventDefault(); navigate('/gallery'); }}>Gallery</a>
          </div>
          <div style={{ width: 80 }} />
        </div>
      </footer>
    </div>
  );
}