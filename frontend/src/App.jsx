import { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import './App.css'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [galleryFilter, setGalleryFilter] = useState('all')

  // Listen to popstate for browser back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  // Listen to messages from the Booking page iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'NAVIGATE') {
        navigate(event.data.path)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  const previewCards = [
    {
      title: '3 cities in Bangladesh',
      image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: '10 days',
      subtitle: 'Full itinerary',
      isTextCard: true,
    },
    {
      title: 'gigabytes of photos',
      image: "https://images.unsplash.com/photo-1593691509543-c55fb32caea3?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: 'eat local delicacies',
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: 'enjoy the vibe',
      image: "https://images.unsplash.com/photo-1596633608169-0d6b8f9f5d77?auto=format&fit=crop&w=500&q=80",
    },
  ]

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
  ]

  const includes = [
    {
      icon: '👥',
      title: 'Guides',
      description: '2 awesome guides who know everything about Bangladesh!',
    },
    {
      icon: '✈️',
      title: 'Flights',
      description: 'Routes: Dhaka — Sylhet, Sylhet — Cox’s Bazar',
    },
    {
      icon: '🚌',
      title: 'Transfers',
      description: 'Comfortable AC transport from airports to hotels and sites.',
    },
    {
      icon: '🏨',
      title: 'Hotels',
      description: 'Comfortable accommodation, 2 people per room, breakfast included.',
    },
  ]

  const galleryImages = [
    { title: 'Lalbagh Fort', category: 'culture', desc: '17th-century Mughal fort complex in Dhaka', url: 'https://images.unsplash.com/photo-1590040111840-1a66d2f0cf8f?auto=format&fit=crop&w=500&q=80' },
    { title: 'Tea Estate of Sylhet', category: 'nature', desc: 'Lush green tea gardens spreading over hills', url: 'https://images.unsplash.com/photo-1598514982835-cda9f52f4dc7?auto=format&fit=crop&w=500&q=80' },
    { title: "Cox's Bazar Sunset", category: 'nature', desc: 'Scenic golden hour at the world\'s longest beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80' },
    { title: 'Ahsan Manzil', category: 'culture', desc: 'The beautiful Pink Palace of Dhaka royals', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=500&q=80' },
    { title: 'Ratargul Swamp Forest', category: 'nature', desc: 'The only freshwater swamp forest in Bangladesh', url: 'https://images.unsplash.com/photo-1585123334904-845d60e97b29?auto=format&fit=crop&w=500&q=80' },
    { title: 'Saint Martin\'s Island', category: 'nature', desc: 'Stunning coral island in the northeastern Bay of Bengal', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=500&q=80' }
  ]

  const filteredGallery = galleryImages.filter(
    img => galleryFilter === 'all' || img.category === galleryFilter
  )

  const renderSubpageFooter = () => (
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
  )

  const renderPageContent = () => {
    switch (currentPath) {
      case '/booking':
        return (
          <div className="iframe-page-container">
            <iframe srcDoc={BOOKING_HTML} title="Trippin Booking" sandbox="allow-scripts allow-same-origin" />
          </div>
        )
      case '/vault':
        return (
          <div className="iframe-page-container">
            <iframe srcDoc={VAULT_HTML} title="Trippin Vault" sandbox="allow-scripts allow-same-origin" />
          </div>
        )
      case '/itinerary':
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
                        {item.activities.map((act, idx) => <li key={idx}>{act}</li>)}
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
            {renderSubpageFooter()}
          </div>
        )
      case '/gallery':
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
            {renderSubpageFooter()}
          </div>
        )
      default:
        return (
          <div className="page">
            <header className="hero">
              <div className="hero-overlay" />
              <div className="hero-title-wrap">
                <img
                  className="map-overlay"
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Bangladesh_location_map.svg/512px-Bangladesh_location_map.svg.png"
                  alt="Bangladesh map"
                />
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
        )
    }
  }

  return (
    <div className="root-layout">
      <Navbar currentPath={currentPath} navigate={navigate} />
      {renderPageContent()}
    </div>
  )
}

const BOOKING_HTML = `<!DOCTYPE html><html lang="en" class="light"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&amp;display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=block" rel="stylesheet"><script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script><script id="tailwind-config">try{
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "tertiary-fixed": "#b3ebff",
                    "on-error-container": "#93000a",
                    "on-primary-fixed-variant": "#004b74",
                    "tertiary-container": "#007c95",
                    "secondary-container": "#aee9f5",
                    "surface-container-high": "#e6e8ea",
                    "inverse-primary": "#94ccff",
                    "primary-fixed-dim": "#94ccff",
                    "on-secondary-fixed": "#001f24",
                    "on-secondary-fixed-variant": "#054e58",
                    "surface-variant": "#e0e3e5",
                    "on-tertiary-fixed": "#001f27",
                    "outline-variant": "#bfc7d1",
                    "on-primary-container": "#f3f7ff",
                    "on-primary-fixed": "#001d32",
                    "secondary-fixed": "#b1ecf8",
                    "error-container": "#ffdad6",
                    "surface-container-highest": "#e0e3e5",
                    "secondary": "#2a6671",
                    "tertiary": "#006176",
                    "inverse-on-surface": "#eff1f3",
                    "surface": "#f7f9fb",
                    "surface-dim": "#d8dadc",
                    "on-tertiary": "#ffffff",
                    "error": "#ba1a1a",
                    "on-error": "#ffffff",
                    "primary": "#005d90",
                    "tertiary-fixed-dim": "#4cd6fb",
                    "on-surface": "#191c1e",
                    "background": "#f7f9fb",
                    "outline": "#707881",
                    "on-tertiary-container": "#ecf9ff",
                    "on-secondary": "#ffffff",
                    "surface-container-low": "#f2f4f6",
                    "on-tertiary-fixed-variant": "#004e5f",
                    "primary-container": "#0077b6",
                    "surface-container": "#eceef0",
                    "surface-container-lowest": "#ffffff",
                    "on-primary": "#ffffff",
                    "on-background": "#191c1e",
                    "surface-bright": "#f7f9fb",
                    "on-surface-variant": "#404850",
                    "primary-fixed": "#cde5ff",
                    "on-secondary-container": "#2f6b75",
                    "inverse-surface": "#2d3133",
                    "surface-tint": "#006399",
                    "secondary-fixed-dim": "#95d0dc"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "margin-mobile": "16px",
                    "container-max": "1280px",
                    "margin-desktop": "48px",
                    "gutter": "24px",
                    "base": "8px"
            },
            "fontFamily": {
                    "headline-md": ["Plus Jakarta Sans"],
                    "body-lg": ["Plus Jakarta Sans"],
                    "label-sm": ["Plus Jakarta Sans"],
                    "body-md": ["Plus Jakarta Sans"],
                    "display-lg": ["Plus Jakarta Sans"],
                    "display-lg-mobile": ["Plus Jakarta Sans"]
            },
            "fontSize": {
                    "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                    "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
                    "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                    "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                    "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                    "display-lg-mobile": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}]
            }
          }
        }
      }
    }catch(_e){}</script><meta charset="utf-8"></head><body class="bg-surface text-on-surface font-body-md min-h-screen flex flex-col relative overflow-x-hidden">
<div class="fixed inset-0 z-[-1] bg-ocean-gradient opacity-60"></div>
<main class="flex-grow pt-8 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-12">
<section class="flex flex-col gap-6">
<div class="max-w-2xl">
<h1 class="font-display-lg-mobile md:font-display-lg text-on-surface mb-2">Find your next anchor.</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant">Seamlessly book your stay, transport, and local guides in one place.</p>
</div>
<div class="glass-panel rounded-[1rem] p-2 md:p-4 shadow-[0_4px_30px_rgba(0,0,0,0.05)] w-full max-w-4xl flex flex-col md:flex-row gap-4 relative z-10">
<div class="flex-1 flex items-center bg-surface rounded-lg px-4 py-3 border border-outline-variant/30 hover:border-primary/50 transition-colors">
<span class="material-symbols-outlined text-secondary mr-3">location_on</span>
<input type="text" placeholder="Where to?" class="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md text-on-surface placeholder:text-on-surface-variant/70">
</div>
<div class="flex-1 flex items-center bg-surface rounded-lg px-4 py-3 border border-outline-variant/30 hover:border-primary/50 transition-colors">
<span class="material-symbols-outlined text-secondary mr-3">calendar_month</span>
<input type="text" placeholder="Check in - Check out" class="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md text-on-surface placeholder:text-on-surface-variant/70">
</div>
<button class="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap">Search</button>
</div>
</section>
<section class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 sticky top-0 bg-surface/80 backdrop-blur-md py-4 border-b border-outline-variant/20">
<div class="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
<button class="px-6 py-2 rounded-full font-label-sm text-label-sm bg-primary text-on-primary shadow-sm flex items-center gap-2 whitespace-nowrap"><span class="material-symbols-outlined text-[18px]">hotel</span> Hotels</button>
<button class="px-6 py-2 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface hover:bg-secondary-fixed transition-colors flex items-center gap-2 whitespace-nowrap border border-outline-variant/30"><span class="material-symbols-outlined text-[18px]">directions_car</span> Transport</button>
<button class="px-6 py-2 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface hover:bg-secondary-fixed transition-colors flex items-center gap-2 whitespace-nowrap border border-outline-variant/30"><span class="material-symbols-outlined text-[18px]">person_pin_circle</span> Guides</button>
</div>
</nav>
</section>
<section class="grid grid-cols-1 md:grid-cols-12 gap-6 z-10">
<div class="md:col-span-8 relative overflow-hidden rounded-2xl group h-[400px] md:h-[500px]">
<img class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgGkvTdIHG7-oHYAkdO85lEHOGxoQSRPK7wXrIYkvq1fc6Fmq1WHoRpuYkuP5vZNYpUo3eBU_noAKQhid8j32QVBoHQmafX56z9vdC6DVb4_nEHVHWfjUC0WZ9xKK-D66tZG2VTamf9ie6sjuDNWRoGQhDnif7BG05VY4BssKnRqs3LTb59ucm9wRZxOG9Ad1NVIWdgY3YMLPN6aZPCjhmOvr9PNURRxgjfPdiVnjuoEra_ZSckK5zgBdRhr_8H9vACqi1UYMK1JL0">
<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
<div class="absolute bottom-4 left-4 right-4 glass-panel rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shadow-lg">
<div><h3 class="font-headline-md text-headline-md text-on-surface mb-1">Azure Bay Eco Retreat</h3><p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-[18px]">location_on</span> St. Martin's Island</p></div>
<div class="flex flex-col items-start md:items-end w-full md:w-auto"><div class="font-headline-md text-headline-md text-primary mb-2">$280<span class="font-body-md text-body-md text-on-surface-variant font-normal">/night</span></div><button class="w-full md:w-auto bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-lg font-label-sm text-label-sm transition-all shadow-md active:scale-95">Book Now</button></div>
</div>
</div>
<div class="md:col-span-4 relative overflow-hidden rounded-2xl group h-[400px] md:h-[500px]">
<img class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiPujGuuVJrb4EdQZPGDf72VUjSKHER7xNaFFHDrjD3y7FBasD7Y5K1MINZqCLtfKXJ0YhrdeEAyXzu6SjQd9lCuECx4EAroCni7xOg9YowfLoq72rnxK00w3tzm1rgzShCeeYYD4y7G9APhsHCdab9_JZIF0Okmu8ZlWFwz0TMre42e8TbhnOZg7s_-TsRcwTkSFxi1FZ3fauOjlTUd-X6QrOjXMakazQkotixyo0Kw8KNdDKI2oV-SO5bumvIDaZKFHDgW7M3KOd">
<div class="absolute bottom-4 left-4 right-4 glass-panel rounded-xl p-5 flex flex-col justify-between items-start gap-4 shadow-lg"><div class="w-full"><h3 class="font-headline-md text-headline-md text-on-surface mb-1 truncate">Coastal Haven Inn</h3><p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 text-sm truncate"><span class="material-symbols-outlined text-[16px]">location_on</span> Cox's Bazar</p></div>
<div class="flex justify-between items-center w-full"><div class="font-headline-md text-headline-md text-primary">$145<span class="text-sm text-on-surface-variant font-normal">/nt</span></div><button class="bg-surface-container-highest hover:bg-secondary-fixed text-on-surface px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors">Details</button></div></div>
</div>
</section>
</main>
<script>
  document.querySelectorAll('footer a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/')) {
        e.preventDefault();
        window.parent.postMessage({ type: 'NAVIGATE', path: href }, '*');
      }
    });
  });
</script>
</body></html>`

const VAULT_HTML = `<!DOCTYPE html><html lang="en" class="light"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&amp;display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=block" rel="stylesheet"><script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script><script id="tailwind-config">try{
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "primary": "#005d90", "surface": "#f7f9fb", "on-surface": "#191c1e"
            }
          }
        }
      }
    }catch(_e){}</script></head><body class="bg-background text-on-background font-body-md min-h-screen pb-32 md:pb-0">
<main class="pt-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
<header class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
<div><h1 class="text-3xl md:text-5xl font-bold text-primary mb-2">Secure Vault</h1><p class="text-gray-600">Your encrypted safe for travel assets.</p></div>
</header>
<section class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
<div class="md:col-span-12 glass-panel rounded-xl p-8 shadow-sm flex flex-col justify-center border border-gray-200"><h3 class="font-bold text-lg mb-2">Storage Usage</h3><div class="w-full bg-gray-200 rounded-full h-3"><div class="bg-primary h-3 rounded-full" style="width: 4%"></div></div></div>
</section>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><h4 class="font-bold text-lg">Primary Passport</h4><p class="text-gray-500">Expires: Oct 2028</p></div>
<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><h4 class="font-bold text-lg">Schengen Visa</h4><p class="text-gray-500">Multiple Entry</p></div>
<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-dashed flex items-center justify-center cursor-pointer hover:border-primary"><h4 class="font-bold text-lg text-primary">+ Upload Document</h4></div>
</div>
</main>
<script>
  document.querySelectorAll('footer a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.parent.postMessage({ type: 'NAVIGATE', path: '/vault' }, '*');
    });
  });
</script>
</body></html>`

export default App