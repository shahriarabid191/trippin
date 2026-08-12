import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarRow } from '../components/HotelReviews';
import { getPublicGallery } from '../api/galleryAPI';
import Footer from '../components/Footer';
import './Home.css';

// "admin@trippin.com" -> "Admin"
const displayNameFromEmail = (email) => {
  if (typeof email !== 'string' || !email.includes('@')) return 'Traveler';
  const name = email.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export default function Home() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const res = await fetch('http://localhost:5050/api/hotels');
        if (!res.ok) return;
        const data = await res.json();
        const top = [...data]
          .sort((a, b) => Number(b.avg_rating) - Number(a.avg_rating))
          .slice(0, 3);
        setHotels(top);
      } catch {
        setHotels([]);
      }
    };

    const loadReviews = async () => {
      try {
        const res = await fetch('http://localhost:5050/api/reviews/highlights');
        if (!res.ok) return;
        setReviews(await res.json());
      } catch {
        setReviews([]);
      }
    };

    const loadPhotos = async () => {
      try {
        const data = await getPublicGallery();
        setPhotos(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch {
        setPhotos([]);
      }
    };

    loadHotels();
    loadReviews();
    loadPhotos();
  }, []);

  const itinerary = [
    {
      days: 'Days 1-3', city: 'Dhaka',
      images: ["https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=400&q=80"],
    },
    {
      days: 'Days 4-6', city: 'Sylhet',
      images: ["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=400&q=80"],
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
          <span className="hero-kicker">◉ Curated Bangladesh journeys</span>
          <h1>Travel Bangladesh,<br />the easy way.</h1>
          <p className="hero-subtitle">
            A fully planned 10-day route through Dhaka, Sylhet and Cox&apos;s Bazar —
            hotels, transfers and guides sorted, so you just show up and enjoy it.
          </p>
          <div className="hero-cta-row">
            <button className="book-main-btn" onClick={() => navigate('/booking')}>
              BOOK NOW
              <span className="material-symbols-outlined book-main-btn-arrow">arrow_forward</span>
            </button>
            <button className="hero-cta-secondary" onClick={() => navigate('/itinerary')}>Build my itinerary</button>
          </div>

          <div className="hero-stats">
            <span>10 Days</span>
            <span className="hero-stats-divider" />
            <span>3 Cities</span>
            <span className="hero-stats-divider" />
            <span>2 Guides</span>
          </div>
        </div>
      </header>

      <main className="content">
        <section id="about" className="about">
          <h2>ABOUT THE TOUR</h2>
          <p className="about-intro">
            A simple, convenient 10-day itinerary through three key regions of Bangladesh —
            from Dhaka&apos;s streets to Sylhet&apos;s tea hills to the shores of Cox&apos;s Bazar.
            Routes and schedules are already sorted, so you can simply <span>enjoy the journey.</span>
          </p>

          <div className="route-strip">
            {itinerary.map((item) => (
              <article key={item.city} className="route-stop">
                <span className="route-node">
                  <span className="route-dot" />
                </span>
                <span className="route-days">{item.days}</span>
                <div className="route-stop-image">
                  {item.images.map((image, index) => (
                    <img key={`${item.city}-${index}`} src={image} alt={item.city} />
                  ))}
                </div>
                <h3>{item.city}</h3>
              </article>
            ))}
          </div>
        </section>

        {hotels.length > 0 && (
          <section id="stays" className="featured-stays">
            <div className="section-heading">
              <h2>FEATURED STAYS</h2>
              <p>Our best-rated hotels, picked by real travelers.</p>
            </div>
            <div className="stays-grid">
              {hotels.map((hotel) => (
                <article
                  key={hotel.id}
                  className="stay-card"
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                >
                  <div className="stay-card-image">
                    <img src={hotel.image_url} alt={hotel.name} />
                  </div>
                  <div className="stay-card-body">
                    <div className="stay-card-top">
                      <h3>{hotel.name}</h3>
                      <span className="stay-card-price">${Number(hotel.price_per_night).toFixed(0)}<small>/night</small></span>
                    </div>
                    <p className="stay-card-location">
                      <span className="material-symbols-outlined">location_on</span>
                      {hotel.location}
                    </p>
                    <div className="stay-card-rating">
                      <StarRow value={Math.round(Number(hotel.avg_rating))} size={15} />
                      <span>{Number(hotel.avg_rating).toFixed(1)} · {hotel.review_count} review{hotel.review_count === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <button className="section-more-link" onClick={() => navigate('/booking')}>
              See all stays →
            </button>
          </section>
        )}

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

        {photos.length > 0 && (
          <section id="moments" className="traveler-moments">
            <div className="section-heading">
              <h2>TRAVELER MOMENTS</h2>
              <p>Real photos, shared by real Trippin travelers.</p>
            </div>
            <div className="moments-grid">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="moment-tile"
                  onClick={() => navigate('/gallery')}
                >
                  <img src={photo.url} alt={photo.caption || 'Traveler photo'} />
                  {photo.caption && <span className="moment-caption">{photo.caption}</span>}
                </div>
              ))}
            </div>
            <button className="section-more-link" onClick={() => navigate('/gallery')}>
              Explore the full gallery →
            </button>
          </section>
        )}

        {reviews.length > 0 && (
          <section id="testimonials" className="testimonials">
            <div className="section-heading">
              <h2>WHAT GUESTS SAY</h2>
              <p>Genuine reviews left by travelers who booked with Trippin.</p>
            </div>
            <div className="testimonials-grid">
              {reviews.map((review) => (
                <article key={review.id} className="testimonial-card">
                  <StarRow value={Number(review.rating)} size={16} />
                  <p className="testimonial-comment">&ldquo;{review.comment}&rdquo;</p>
                  <div className="testimonial-author">
                    <span className="testimonial-name">{displayNameFromEmail(review.user_email)}</span>
                    <span className="testimonial-hotel">stayed at {review.hotel_name}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
