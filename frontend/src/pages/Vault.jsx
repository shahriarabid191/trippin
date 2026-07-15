import { useNavigate } from 'react-router-dom';

export default function Vault() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <main className="subpage-content">
        <h2>Secure Vault</h2>
        <p className="subpage-subtitle">Store travel documents and other important trip assets in one place.</p>

        <section className="about-grid">
          <div className="about-text">
            <p>This vault page can hold passports, visas, tickets, and any other files you want close at hand.</p>
            <p>Keep everything organized so you can find it when you need it.</p>
          </div>

          <div className="timeline">
            <article className="timeline-item">
              <span className="days">Storage</span>
              <h3>Travel documents</h3>
              <p>Keep important documents in a single secure location.</p>
            </article>
            <article className="timeline-item">
              <span className="days">Access</span>
              <h3>Fast retrieval</h3>
              <p>Open the files you need without digging through folders.</p>
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