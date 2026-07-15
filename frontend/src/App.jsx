import { useState, useEffect } from 'react';
import Navbar from "./components/Navbar.jsx";
import './App.css';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [galleryFilter, setGalleryFilter] = useState('all');

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'NAVIGATE') {
        navigate(event.data.path);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // --- Shared Data ---
  const itinerary = [
    {
      days: 'Days 1-3', city: 'Dhaka',
      images: ["https://images.unsplash.com/photo-1590040111840-1a66d2f0cf8f?auto=format&fit=crop&w=400&q=80"],
      details: 'Old Dhaka exploration, Lalbagh Fort, Ahsan Manzil, and local Biryani.',
      activities: ['Explore Lalbagh Fort', 'Rickshaw tour', 'Taste Biryani']
    },
    {
      days: 'Days 4-6', city: 'Sylhet',
      images: ["https://images.unsplash.com/photo-1598514982835-cda9f52f4dc7?auto=format&fit=crop&w=400&q=80"],
      details: 'Tea garden tours, Jaflong boat ride, and Ratargul Swamp Forest.',
      activities: ['Tea gardens in Sreemangal', 'Ratargul swamp forest', '7-color tea']
    }
  ];

  const galleryImages = [
    { title: 'Lalbagh Fort', category: 'culture', desc: '17th-century Mughal fort', url: 'https://images.unsplash.com/photo-1590040111840-1a66d2f0cf8f?auto=format&fit=crop&w=500&q=80' },
    { title: 'Tea Estate', category: 'nature', desc: 'Lush green tea gardens', url: 'https://images.unsplash.com/photo-1598514982835-cda9f52f4dc7?auto=format&fit=crop&w=500&q=80' }
  ];

  const filteredGallery = galleryImages.filter(img => galleryFilter === 'all' || img.category === galleryFilter);

  // --- Subpage Footer Renderer ---
  const renderFooter = () => (
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
      </div>
    </footer>
  );

  // --- Page Router ---
  const renderPageContent = () => {
    switch (currentPath) {
      case '/booking':
        return (
          <div className="iframe-container">
            <iframe srcDoc={BOOKING_HTML} title="Booking" sandbox="allow-scripts allow-same-origin" />
          </div>
        );
      
      case '/vault':
        return (
          <div className="iframe-container">
            <iframe srcDoc={VAULT_HTML} title="Vault" sandbox="allow-scripts allow-same-origin" />
          </div>
        );

      case '/itinerary':
        return (
          <div className="page-wrapper">
            <main className="subpage-content">
              <h2>Your Adventure Itinerary</h2>
              <p className="subpage-subtitle">A curated 10-day journey exploring Bangladesh.</p>
              <div className="itinerary-details-grid">
                {itinerary.map((item) => (
                  <article key={item.city} className="itinerary-detail-card">
                    <div className="itinerary-info">
                      <span className="days-badge">{item.days}</span>
                      <h3>{item.city}</h3>
                      <p>{item.details}</p>
                      <h4>Highlights</h4>
                      <ul>
                        {item.activities.map((act, idx) => <li key={idx}>{act}</li>)}
                      </ul>
                    </div>
                    <div className="itinerary-images-grid">
                      {item.images.map((img, idx) => <img key={idx} src={img} alt={item.city} />)}
                    </div>
                  </article>
                ))}
              </div>
            </main>
            {renderFooter()}
          </div>
        );

      case '/gallery':
        return (
          <div className="page-wrapper">
            <main className="subpage-content">
              <h2>Photo Gallery</h2>
              <div className="gallery-filter-tabs">
                <button className={`gallery-tab-btn ${galleryFilter === 'all' ? 'active' : ''}`} onClick={() => setGalleryFilter('all')}>All</button>
                <button className={`gallery-tab-btn ${galleryFilter === 'nature' ? 'active' : ''}`} onClick={() => setGalleryFilter('nature')}>Nature</button>
                <button className={`gallery-tab-btn ${galleryFilter === 'culture' ? 'active' : ''}`} onClick={() => setGalleryFilter('culture')}>Culture</button>
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
            {renderFooter()}
          </div>
        );

      default: // HOME PAGE
        return (
          <div className="page-wrapper">
            <header className="hero">
              <div className="hero-overlay" />
              <div className="hero-title-wrap">
                <h1>BANGLADESH</h1>
              </div>
              <div className="preview-strip">
                <button className="book-main-btn" onClick={() => navigate('/booking')}>START BOOKING</button>
              </div>
            </header>
            <main className="content">
              <section className="about">
                <h2>ABOUT THE TOUR</h2>
                <p>We've planned a simple and convenient itinerary. Enjoy the journey.</p>
              </section>
            </main>
            {renderFooter()}
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Navbar currentPath={currentPath} navigate={navigate} />
      {renderPageContent()}
    </div>
  );
}

// --- Stripped HTML Iframes (Removed internal navbars and adjusted padding) ---

const BOOKING_HTML = `<!DOCTYPE html><html lang="en"><head><script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet"><script id="tailwind-config">tailwind.config={theme:{extend:{colors:{primary:"#005d90",surface:"#f7f9fb","on-surface":"#191c1e"},fontFamily:{"body-md":["Plus Jakarta Sans"]}}}}</script></head><body class="bg-surface text-on-surface font-body-md min-h-screen">
<main class="flex-grow pt-8 pb-24 px-4 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-12">
<section class="flex flex-col gap-6">
<h1 class="text-3xl md:text-5xl font-bold mb-2">Find your next anchor.</h1>
<div class="bg-white rounded-2xl p-4 shadow-sm flex gap-4 w-full max-w-4xl border border-gray-200">
<input type="text" placeholder="Where to?" class="flex-1 bg-gray-50 rounded-lg px-4 py-3 border-none">
<button class="bg-primary text-white px-8 py-3 rounded-lg font-bold">Search</button>
</div>
</section>
<div class="grid grid-cols-1 md:grid-cols-12 gap-6">
<div class="md:col-span-12 relative rounded-2xl overflow-hidden h-[400px]">
<img class="absolute inset-0 w-full h-full object-cover" src="https://images.unsplash.com/photo-1596633608169-0d6b8f9f5d77?auto=format&fit=crop&w=1800&q=80">
<div class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-6 flex justify-between items-center">
<div><h3 class="text-2xl font-bold">Azure Bay Eco Retreat</h3><p>St. Martin's Island</p></div>
<div class="text-right"><div class="text-2xl font-bold text-primary">$280/night</div></div>
</div>
</div>
</div>
</main>
</body></html>`;

const VAULT_HTML = `<!DOCTYPE html><html lang="en"><head><script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet"><script id="tailwind-config">tailwind.config={theme:{extend:{colors:{primary:"#005d90",surface:"#f7f9fb","on-surface":"#191c1e"},fontFamily:{"body-md":["Plus Jakarta Sans"]}}}}</script></head><body class="bg-surface text-on-surface font-body-md min-h-screen">
<main class="pt-8 px-4 md:px-12 max-w-7xl mx-auto">
<header class="mb-12"><h1 class="text-3xl md:text-5xl font-bold text-primary mb-2">Secure Vault</h1><p class="text-gray-600">Your encrypted digital safe for travel documents.</p></header>
<section class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
<div class="md:col-span-12 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
<h3 class="text-xl font-bold mb-4">Storage Used</h3>
<div class="w-full bg-gray-200 rounded-full h-3"><div class="bg-primary h-3 rounded-full" style="width: 4%"></div></div>
</div>
</section>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><h4 class="font-bold text-lg">Primary Passport</h4><p class="text-gray-500">Expires: Oct 2028</p></div>
<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><h4 class="font-bold text-lg">Schengen Visa</h4><p class="text-gray-500">Multiple Entry</p></div>
<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-dashed flex items-center justify-center cursor-pointer hover:border-primary"><h4 class="font-bold text-lg text-primary">+ Upload Document</h4></div>
</div>
</main>
</body></html>`;

export default App;