import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const previewCards = [
    { title: '3 cities in Bangladesh', image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=500&q=80" },
    { title: '10 days', subtitle: 'Full itinerary', isTextCard: true },
    { title: 'gigabytes of photos', image: "https://images.unsplash.com/photo-1593691509543-c55fb32caea3?auto=format&fit=crop&w=500&q=80" },
    { title: 'eat local delicacies', image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80" },
    { title: 'enjoy the vibe', image: "https://images.unsplash.com/photo-1596633608169-0d6b8f9f5d77?auto=format&fit=crop&w=500&q=80" },
  ];

  const itinerary = [
    {
      days: 'Days 1-3', city: 'Dhaka',
      images: ["https://images.unsplash.com/photo-1590040111840-1a66d2f0cf8f?auto=format&fit=crop&w=400&q=80"],
    },
    {
      days: 'Days 4-6', city: 'Sylhet',
      images: ["https://images.unsplash.com/photo-1598514982835-cda9f52f4dc7?auto=format&fit=crop&w=400&q=80"],
    },
    {
      days: 'Days 7-10', city: "Cox's Bazar",
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"],
    },
  ];

  const includes = [
    { icon: '👥', title: 'Guides', description: '2 awesome guides who know everything about Bangladesh!' },
    { icon: '✈️', title: 'Flights', description: 'Routes: Dhaka — Sylhet, Sylhet — Cox’s Bazar' },
    { icon: '🚌', title: 'Transfers', description: 'Comfortable AC transport from airports to hotels and sites.' },
    { icon: '🏨', title: 'Hotels', description: 'Comfortable accommodation, 2 people per room, breakfast included.' },
  ];

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-overlay" />
        <div className="hero-title-wrap">
          <img className="map-overlay" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Bangladesh_location_map.svg/512px-Bangladesh_location_map.svg.png" alt="Bangladesh map" />
          <h1>BANGLADESH</h1>
        </div>
        
        <div className="preview-strip">
          <div className="preview-cards">
            {previewCards.map((card, idx) => (
              <article key={idx} className="preview-card">
                {card.isTextCard ? (
                  <div className="text-card">
                    <strong>{card.title}</strong>
                    <span>{card.subtitle}</span>
                  </div>
                ) : (
                  <>
                    <img src={card.image} alt={card.title} />
                    <div className="card-gradient" />
                    <p>{card.title}</p>
                  </>
                )}
              </article>
            ))}
          </div>
          <button className="book-main-btn" onClick={() => navigate('/booking')}>BOOK</button>
        </div>
      </header>

      <main className="content">
        <section id="about" className="about">
          <h2>ABOUT THE TOUR</h2>
          <div className="about-grid">
            <div className="about-text">
              <p>We&apos;ve planned a simple and convenient 10-day itinerary for your trip to Bangladesh.</p>
              <p>You&apos;ll visit three key regions: <span> Dhaka, Sylhet, and Cox&apos;s Bazar.</span></p>
              <p>No need to worry about routes and schedules — everything is organized. You can simply <span>enjoy the journey.</span></p>
            </div>
            <div className="timeline">
              {itinerary.map((item) => (
                <article key={item.city} className="timeline-item">
                  <span className="days">{item.days}</span>
                  <h3>{item.city}</h3>
                  <div className="timeline-images">
                    {item.images.map((image, index) => (
                      <img key={`${item.city}-${index}`} src={image} alt={item.city} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="included" className="included">
          <h2>WHAT&apos;S INCLUDED</h2>
          <div className="include-grid">
            {includes.map((item, idx) => (
              <article key={idx} className="include-card">
                <h3><span>{item.icon}</span> {item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer id="contacts" className="footer">
        <div className="footer-overlay" />
        <section className="contact-card">
          <h3>Want to join us,</h3>
          <p>Leave a request</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Your name" />
            <input type="tel" placeholder="Phone number" />
            <input type="text" placeholder="Comment" />
            <button type="button">Send</button>
          </form>
        </section>

        <div className="footer-bottom">
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