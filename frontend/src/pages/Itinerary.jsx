import { useNavigate } from 'react-router-dom';

export default function Itinerary() {
  const navigate = useNavigate();

  const itinerary = [
    {
      days: 'Days 1-3',
      city: 'Dhaka',
      images: [
        "https://images.unsplash.com/photo-1590040111840-1a66d2f0cf8f?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80",
      ],
      details: 'Old Dhaka exploration, Lalbagh Fort, Ahsan Manzil, and local Biryani. Dive into the historical heartbeat of Bangladesh.',
      activities: ['Explore Lalbagh Fort & Ahsan Manzil', 'Take a Rickshaw tour of Old Dhaka', 'Savor world-famous Biryani at Nazira Bazar', 'Sailing along the Buriganga river at sunset']
    },
    {
      days: 'Days 4-6',
      city: 'Sylhet',
      images: [
        "https://images.unsplash.com/photo-1598514982835-cda9f52f4dc7?auto=format&fit=crop&w=400&q=80",
      ],
      details: 'Tea garden tours, Jaflong boat ride, Ratargul Swamp Forest, and traditional Sylheti tea. Experience the lush green paradise.',
      activities: ['Stroll through the lush tea gardens in Sreemangal', 'Boat trip through Ratargul freshwater swamp forest', 'Visit Jaflong crystal-clear river & stone collection sites', 'Taste the legendary 7-color tea']
    },
    {
      days: 'Days 7-10',
      city: "Cox's Bazar",
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=400&q=80",
      ],
      details: "Sunset walk on the longest natural beach in the world, Marine Drive cruise, Inani Beach, and fresh local seafood.",
      activities: ['Relax at the world\'s longest sandy beach (120km)', 'Cruise along the scenic Marine Drive highway', 'Explore Himchari National Park and waterfalls', 'Feast on fresh, grilled coastal seafood']
    },
  ];

  return (
    <div className="page">
      <main className="subpage-content">
        <h2>Your Adventure Itinerary</h2>
        <p className="subpage-subtitle">A curated 10-day journey exploring the natural beauty, history, and vibrant culture of Bangladesh.</p>
        
        <div className="itinerary-details-grid">
          {itinerary.map((item) => (
            <article key={item.city} className="itinerary-detail-card">
              <div className="itinerary-info">
                <span className="days-badge">{item.days}</span>
                <h3>{item.city}</h3>
                <p>{item.details}</p>
                <h4>Highlights & Activities</h4>
                <ul>
                  {item.activities.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
              <div className="itinerary-images-grid">
                {item.images.map((image, index) => (
                  <img key={`${item.city}-${index}`} src={image} alt={item.city} />
                ))}
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