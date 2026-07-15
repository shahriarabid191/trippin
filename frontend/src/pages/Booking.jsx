import { useNavigate } from 'react-router-dom';

export default function Booking() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <main className="subpage-content">
        <h2>Book Your Trip</h2>
        <p className="subpage-subtitle">Plan flights, stays, and transport for your Bangladesh itinerary.</p>

        <section className="about-grid">
          <div className="about-text">
            <p>Use this space to collect travel details and confirm the trip you want to take.</p>
            <p>Choose dates, review your route, and move forward when you are ready.</p>
          </div>

          <div className="timeline">
            <article className="timeline-item">
              <span className="days">Step 1</span>
              <h3>Choose travel dates</h3>
              <p>Pick the dates that work best for your trip.</p>
            </article>
            <article className="timeline-item">
              <span className="days">Step 2</span>
              <h3>Review your package</h3>
              <p>Confirm your route, hotels, and transport preferences.</p>
            </article>
            <article className="timeline-item">
              <span className="days">Step 3</span>
              <h3>Submit booking request</h3>
              <p>Send the request once everything looks right.</p>
            </article>
          </div>
        </section>
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