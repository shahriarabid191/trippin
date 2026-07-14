import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

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
    setProfileOpen(false)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Vault state
  const [vaultChecklist, setVaultChecklist] = useState({
    passport: true,
    visa: false,
    tickets: true,
    hotel: false,
    insurance: false,
    powerbank: true,
    repellent: false,
    umbrella: true,
  })

  const toggleChecklist = (key) => {
    setVaultChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Gallery state
  const [galleryFilter, setGalleryFilter] = useState('all')

  const previewCards = [
    {
      title: '3 cities in Bangladesh',
      image:
        "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: '10 days',
      subtitle: 'Full itinerary',
      isTextCard: true,
    },
    {
      title: 'gigabytes of photos',
      image:
        "https://images.unsplash.com/photo-1593691509543-c55fb32caea3?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: 'eat local delicacies',
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: 'enjoy the vibe',
      image:
        "https://images.unsplash.com/photo-1596633608169-0d6b8f9f5d77?auto=format&fit=crop&w=500&q=80",
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
    {
      title: 'Lalbagh Fort',
      category: 'culture',
      desc: '17th-century Mughal fort complex in Dhaka',
      url: 'https://images.unsplash.com/photo-1590040111840-1a66d2f0cf8f?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Tea Estate of Sylhet',
      category: 'nature',
      desc: 'Lush green tea gardens spreading over hills',
      url: 'https://images.unsplash.com/photo-1598514982835-cda9f52f4dc7?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: "Cox's Bazar Sunset",
      category: 'nature',
      desc: 'Scenic golden hour at the world\'s longest beach',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Ahsan Manzil',
      category: 'culture',
      desc: 'The beautiful Pink Palace of Dhaka royals',
      url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Ratargul Swamp Forest',
      category: 'nature',
      desc: 'The only freshwater swamp forest in Bangladesh',
      url: 'https://images.unsplash.com/photo-1585123334904-845d60e97b29?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Saint Martin\'s Island',
      category: 'nature',
      desc: 'Stunning coral island in the northeastern Bay of Bengal',
      url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=500&q=80'
    }
  ]

  const filteredGallery = galleryImages.filter(
    img => galleryFilter === 'all' || img.category === galleryFilter
  )

  // Navigation Links Component to render consistent menus
  const renderNavLinks = () => (
    <>
      <a href="/booking" onClick={(e) => { e.preventDefault(); navigate('/booking'); }} className={currentPath === '/booking' ? 'active' : ''}>Booking</a>
      <a href="/itinerary" onClick={(e) => { e.preventDefault(); navigate('/itinerary'); }} className={currentPath === '/itinerary' ? 'active' : ''}>Itinerary</a>
      <a href="/vault" onClick={(e) => { e.preventDefault(); navigate('/vault'); }} className={currentPath === '/vault' ? 'active' : ''}>Vault</a>
      <a href="/gallery" onClick={(e) => { e.preventDefault(); navigate('/gallery'); }} className={currentPath === '/gallery' ? 'active' : ''}>Gallery</a>
      <a href="/translation" onClick={(e) => { e.preventDefault(); navigate('/translation'); }} className={currentPath === '/translation' ? 'active' : ''}>Translation</a>
    </>
  )

  // Profile Dropdown
  const renderProfileDropdown = () => (
    <div className="profile-dropdown">
      <button className="profile-dropdown-item" onClick={() => navigate('/gallery')}>
        <span className="pd-icon"></span> My Gallery
      </button>
      <button className="profile-dropdown-item" onClick={() => navigate('/vault')}>
        <span className="pd-icon"></span> My Vault
      </button>
      <button className="profile-dropdown-item" onClick={() => navigate('/journals')}>
        <span className="pd-icon"></span> My Journals
      </button>
      <div className="profile-dropdown-divider" />
      <button className="profile-dropdown-item" onClick={() => navigate('/todo')}>
        <span className="pd-icon"></span> To Do List
      </button>
      <button className="profile-dropdown-item" onClick={() => navigate('/bachao')}>
        <span className="pd-icon"></span> Bachao System
      </button>
    </div>
  )

  // Nav Icons (bell + person)
  const renderNavIcons = () => (
    <div className="nav-icons">
      <button className="nav-icon-btn" title="Notifications">
        🔔
      </button>
      <div style={{ position: 'relative' }} ref={profileRef}>
        <button className="nav-icon-btn" title="Profile" onClick={() => setProfileOpen(o => !o)}>
          👤
        </button>
        {profileOpen && renderProfileDropdown()}
      </div>
    </div>
  )

  // Subpage header layout
  const renderSubpageHeader = () => (
    <header className="subpage-header">
      <nav className="top-nav">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img
            src="https://images.unsplash.com/photo-1596633608169-0d6b8f9f5d77?auto=format&fit=crop&w=60&h=60&q=80"
            alt=""
            style={{ display: 'none' }}
          />
          ◉ TRIPPIN
        </div>
        <div className="menu-links">
          {renderNavLinks()}
        </div>
        {renderNavIcons()}
      </nav>
    </header>
  )

  // Subpage footer layout
  const renderSubpageFooter = () => (
    <footer className="footer" style={{ marginTop: '0', minHeight: 'auto', padding: '60px 48px 24px' }}>
      <div className="footer-overlay" />
      <div className="footer-bottom" style={{ marginTop: '0', borderTop: 'none', paddingTop: '0' }}>
        <strong style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>◉ TRIPPIN</strong>
        <div className="footer-links">
          {renderNavLinks()}
        </div>
        <div style={{ width: 80 }} />
      </div>
    </footer>
  )

  // 1. BOOKING PAGE (IFRAME)
  if (currentPath === '/booking') {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
        <iframe
          srcDoc={BOOKING_HTML}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Trippin Booking"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    )
  }

  // 2. ITINERARY PAGE
  if (currentPath === '/itinerary') {
    return (
      <div className="page">
        {renderSubpageHeader()}
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
        {renderSubpageFooter()}
      </div>
    )
  }

  // 3. VAULT PAGE (IFRAME)
  if (currentPath === '/vault') {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
        <iframe
          srcDoc={VAULT_HTML}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Trippin Vault"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    )
  }

  // 4. GALLERY PAGE
  if (currentPath === '/gallery') {
    return (
      <div className="page">
        {renderSubpageHeader()}
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
  }

  // 5. TRANSLATION PAGE (IFRAME)
  if (currentPath === '/translation') {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
        <iframe
          srcDoc={TRANSLATION_HTML}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Trippin Translation"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    )
  }

  // 6. TODO PAGE (IFRAME)
  if (currentPath === '/todo') {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
        <iframe
          srcDoc={TODO_HTML}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Trippin To-Do List"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    )
  }

  // 7. BACHAO SYSTEM PAGE (IFRAME)
  if (currentPath === '/bachao') {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
        <iframe
          srcDoc={BACHAO_HTML}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Trippin Bachao System"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    )
  }

  // 8. JOURNALS PAGE (placeholder)
  if (currentPath === '/journals') {
    return (
      <div className="page">
        {renderSubpageHeader()}
        <main className="subpage-content">
          <h2>My Journals</h2>
          <p className="subpage-subtitle">Your personal travel diary — document every memory of your journey.</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: 16, color: '#4f5c69' }}>
            <span style={{ fontSize: 64 }}>📓</span>
            <p style={{ fontSize: 18, textAlign: 'center' }}>No journal entries yet. Start writing your first travel story!</p>
            <button style={{ background: '#005d90', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              + New Entry
            </button>
          </div>
        </main>
        {renderSubpageFooter()}
      </div>
    )
  }

  // 9. DEFAULT HOME PAGE (/)

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-overlay" />
        <nav className="top-nav">
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>◉ TRIPPIN</div>
          <div className="menu-links">
            {renderNavLinks()}
          </div>
          {renderNavIcons()}
        </nav>

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
            {previewCards.map((card) => (
              <article key={card.title} className="preview-card">
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
              <p>
                We&apos;ve planned a simple and convenient 10-day itinerary for your
                trip to Bangladesh.
              </p>
              <p>
                You&apos;ll visit three key regions:
                <span> Dhaka, Sylhet, and Cox&apos;s Bazar.</span>
              </p>
              <p>
                No need to worry about routes and schedules — everything is
                organized. You can simply <span>enjoy the journey.</span>
              </p>
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
            {includes.map((item) => (
              <article key={item.title} className="include-card">
                <h3>
                  <span>{item.icon}</span> {item.title}
                </h3>
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
          <form>
            <input type="text" placeholder="Your name" />
            <input type="tel" placeholder="Phone number" />
            <input type="text" placeholder="Comment" />
            <button type="button">Send</button>
          </form>
        </section>

        <div className="footer-bottom">
          <strong style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>◉ TRIPPIN</strong>
          <div className="footer-links">
            {renderNavLinks()}
          </div>
          <div style={{ width: 80 }} />
        </div>
      </footer>
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
<!-- Atmospheric Background -->
<div class="fixed inset-0 z-[-1] bg-ocean-gradient opacity-60"></div>
<!-- TopNavBar Shared Component -->
<header class="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20">
<div class="w-full max-w-container-max mx-auto flex justify-between items-center">
<div class="font-headline-md text-headline-md font-bold text-primary tracking-tight cursor-pointer" onclick="window.parent.postMessage({ type: 'NAVIGATE', path: '/' }, '*')">
                Trippin
            </div>
<nav class="hidden md:flex items-center gap-8">
<a href="/booking" class="font-body-md text-body-md text-primary border-b-2 border-primary pb-1 transition-colors duration-200">Booking</a>
<a href="/itinerary" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">Itinerary</a>
<a href="/vault" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">Vault</a>
<a href="/gallery" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">Gallery</a>
</nav>
<div class="flex items-center gap-4">
<button class="text-on-surface-variant hover:text-primary active:scale-95 transition-all duration-200">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary active:scale-95 transition-all duration-200">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">account_circle</span>
</button>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-grow pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-12">
<!-- Header & Search -->
<section class="flex flex-col gap-6">
<div class="max-w-2xl">
<h1 class="font-display-lg-mobile md:font-display-lg text-on-surface mb-2">Find your next anchor.</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant">Seamlessly book your stay, transport, and local guides in one place.</p>
</div>
<!-- Search Bar (Glassmorphic) -->
<div class="glass-panel rounded-[1rem] p-2 md:p-4 shadow-[0_4px_30px_rgba(0,0,0,0.05)] w-full max-w-4xl flex flex-col md:flex-row gap-4 relative z-10">
<div class="flex-1 flex items-center bg-surface rounded-lg px-4 py-3 border border-outline-variant/30 hover:border-primary/50 transition-colors">
<span class="material-symbols-outlined text-secondary mr-3">location_on</span>
<input type="text" placeholder="Where to?" class="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md text-on-surface placeholder:text-on-surface-variant/70">
</div>
<div class="flex-1 flex items-center bg-surface rounded-lg px-4 py-3 border border-outline-variant/30 hover:border-primary/50 transition-colors">
<span class="material-symbols-outlined text-secondary mr-3">calendar_month</span>
<input type="text" placeholder="Check in - Check out" class="w-full bg-transparent border-none focus:ring-0 p-0 text-body-md text-on-surface placeholder:text-on-surface-variant/70">
</div>
<button class="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap">
                    Search
                </button>
</div>
</section>
<!-- Filters & Categories -->
<section class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 sticky top-20 bg-surface/80 backdrop-blur-md py-4 -mx-margin-mobile md:-mx-margin-desktop px-margin-mobile md:px-margin-desktop border-b border-outline-variant/20">
<!-- Category Tabs -->
<div class="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
<button class="px-6 py-2 rounded-full font-label-sm text-label-sm bg-primary text-on-primary shadow-sm flex items-center gap-2 whitespace-nowrap">
<span class="material-symbols-outlined text-[18px]">hotel</span> Hotels
                </button>
<button class="px-6 py-2 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface hover:bg-secondary-fixed transition-colors flex items-center gap-2 whitespace-nowrap border border-outline-variant/30">
<span class="material-symbols-outlined text-[18px]">directions_car</span> Transport
                </button>
<button class="px-6 py-2 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface hover:bg-secondary-fixed transition-colors flex items-center gap-2 whitespace-nowrap border border-outline-variant/30">
<span class="material-symbols-outlined text-[18px]">person_pin_circle</span> Guides
                </button>
</div>
<!-- Detailed Filters -->
<div class="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
<button class="px-4 py-2 rounded-full font-label-sm text-label-sm bg-surface-container-lowest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 border border-outline-variant/50 whitespace-nowrap">
                    Budget <span class="material-symbols-outlined text-[16px]">expand_more</span>
</button>
<button class="px-4 py-2 rounded-full font-label-sm text-label-sm bg-surface-container-lowest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 border border-outline-variant/50 whitespace-nowrap">
                    4.5+ Rating <span class="material-symbols-outlined text-[16px]">star</span>
</button>
<button class="px-4 py-2 rounded-full font-label-sm text-label-sm bg-surface-container-lowest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 border border-outline-variant/50 whitespace-nowrap">
                    Filters <span class="material-symbols-outlined text-[16px]">tune</span>
</button>
</div>
</section>
<!-- Bento Grid Content -->
<section class="grid grid-cols-1 md:grid-cols-12 gap-6 z-10">
<!-- Featured Large Card (Spans 8 cols) -->
<div class="md:col-span-8 relative overflow-hidden rounded-2xl group h-[400px] md:h-[500px]">
<img class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="A luxurious, modern eco-resort nestled on a pristine tropical coastline. The architecture features clean lines, expansive glass windows reflecting the clear blue sky, and natural wood accents. The scene is bathed in bright, soft sunlight, highlighting the turquoise waters of a private infinity pool blending seamlessly with the ocean horizon. The aesthetic is high-end, serene, and inviting, perfectly capturing a premium coastal getaway in a modern light-mode style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgGkvTdIHG7-oHYAkdO85lEHOGxoQSRPK7wXrIYkvq1fc6Fmq1WHoRpuYkuP5vZNYpUo3eBU_noAKQhid8j32QVBoHQmafX56z9vdC6DVb4_nEHVHWfjUC0WZ9xKK-D66tZG2VTamf9ie6sjuDNWRoGQhDnif7BG05VY4BssKnRqs3LTb59ucm9wRZxOG9Ad1NVIWdgY3YMLPN6aZPCjhmOvr9PNURRxgjfPdiVnjuoEra_ZSckK5zgBdRhr_8H9vACqi1UYMK1JL0">
<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
<div class="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-label-sm text-label-sm text-primary flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">star</span> 4.9
                </div>
<!-- Floating Glass Label -->
<div class="absolute bottom-4 left-4 right-4 glass-panel rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shadow-lg transition-transform duration-300 group-hover:translate-y-[-4px]">
<div>
<h3 class="font-headline-md text-headline-md text-on-surface mb-1">Azure Bay Eco Retreat</h3>
<p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]">location_on</span> St. Martin's Island
                        </p>
</div>
<div class="flex flex-col items-start md:items-end w-full md:w-auto">
<div class="font-headline-md text-headline-md text-primary mb-2">$280<span class="font-body-md text-body-md text-on-surface-variant font-normal">/night</span></div>
<button class="w-full md:w-auto bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container px-6 py-3 rounded-lg font-label-sm text-label-sm transition-colors shadow-md active:scale-95">
                            Book Now
                        </button>
</div>
</div>
</div>
<!-- Standard Card 1 (Spans 4 cols) -->
<div class="md:col-span-4 relative overflow-hidden rounded-2xl group h-[400px] md:h-[500px]">
<img class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="A modern, elegant boutique hotel room with a direct view of a calm, blue ocean. The room features a minimalist design with soft white bedding, light oak furniture, and large floor-to-ceiling windows letting in bright natural light. A small balcony with glass railings overlooks the water. The mood is serene, high-end, and trustworthy, fitting a modern travel application." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiPujGuuVJrb4EdQZPGDf72VUjSKHER7xNaFFHDrjD3y7FBasD7Y5K1MINZqCLtfKXJ0YhrdeEAyXzu6SjQd9lCuECx4EAroCni7xOg9YowfLoq72rnxK00w3tzm1rgzShCeeYYD4y7G9APhsHCdab9_JZIF0Okmu8ZlWFwz0TMre42e8TbhnOZg7s_-TsRcwTkSFxi1FZ3fauOjlTUd-X6QrOjXMakazQkotixyo0Kw8KNdDKI2oV-SO5bumvIDaZKFHDgW7M3KOd">
<div class="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-label-sm text-label-sm text-primary flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">star</span> 4.7
                </div>
<!-- Floating Glass Label -->
<div class="absolute bottom-4 left-4 right-4 glass-panel rounded-xl p-5 flex flex-col justify-between items-start gap-4 shadow-lg">
<div class="w-full">
<h3 class="font-headline-md text-headline-md text-on-surface mb-1 truncate">Coastal Haven Inn</h3>
<p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 text-sm truncate">
<span class="material-symbols-outlined text-[16px]">location_on</span> Cox's Bazar
                        </p>
</div>
<div class="flex justify-between items-center w-full">
<div class="font-headline-md text-headline-md text-primary">$145<span class="text-sm text-on-surface-variant font-normal">/nt</span></div>
<button class="bg-surface-container-highest hover:bg-secondary-fixed text-on-surface px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors">
                            Details
                        </button>
</div>
</div>
</div>
<!-- Secondary Category (Cars & Guides) row -->
<div class="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
<!-- Car Option Horizontal Card -->
<div class="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-6 items-center hover:border-primary/40 transition-colors group cursor-pointer">
<div class="w-full sm:w-48 h-32 rounded-xl overflow-hidden relative shrink-0">
<img class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A sleek, modern premium SUV parked on a scenic coastal highway overlooking a vast, sparkling blue ocean. The vehicle is finished in a metallic silver that catches the bright, natural sunlight. The background features gentle rolling hills and a clear, cloudless sky, conveying a sense of freedom and comfortable exploration. The overall mood is high-end, trustworthy, and adventurous, fitting perfectly within a clean, modern travel interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuOmMld4iS4Z_sbSPvwss4myktgvO3z13HKIEDdWFBkL_g3JCVWSTwON2iJa11xzTogNUof6G2s9mCwXzwUfwXN0Oml9cg0D5IWgfpFTbbimoPbKxC5DIQ8SkfhttIKijaD_PNnHIMmBNasWWl_pDX3ubecrofNTxnM0iEzQifrDFm61ndFHsIFvQTM94KvuIUd3N2wIDC2h2YbxbE_OgTawi3gA8O7TcM1cl0A4ugm-FXgKcOMhuLAB6Z7vLdy9efSMLjZk2w1_Rv">
</div>
<div class="flex-grow flex flex-col justify-between w-full">
<div class="flex justify-between items-start mb-2">
<div>
<h4 class="font-headline-md text-[20px] text-on-surface leading-tight mb-1">Premium SUV</h4>
<div class="flex gap-2">
<span class="px-2 py-0.5 rounded bg-surface text-on-surface-variant text-[10px] font-label-sm border border-outline-variant/30">Auto</span>
<span class="px-2 py-0.5 rounded bg-surface text-on-surface-variant text-[10px] font-label-sm border border-outline-variant/30">5 Seats</span>
</div>
</div>
<div class="text-right">
<span class="font-headline-md text-[20px] text-primary">$65</span>
<p class="text-[12px] text-on-surface-variant">/day</p>
</div>
</div>
<div class="flex justify-between items-end mt-4">
<p class="font-body-md text-sm text-tertiary flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">verified</span> Top rated fleet
                            </p>
<button class="bg-transparent border border-primary text-primary hover:bg-primary/5 px-4 py-1.5 rounded-lg font-label-sm text-label-sm transition-colors">
                                Select
                            </button>
</div>
</div>
</div>
<!-- Guide-->
<div class="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-6 items-center hover:border-primary/40 transition-colors group cursor-pointer">
<div class="w-full sm:w-32 h-32 rounded-full overflow-hidden relative shrink-0 border-4 border-surface shadow-sm">
<img class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A professional, welcoming local tour guide standing on a sun-drenched wooden pier overlooking a vibrant coastal landscape. They are smiling warmly, wearing casual yet polished outdoor attire in subtle navy tones. The background is softly blurred, showing gentle ocean waves and a clear blue sky. The lighting is bright and natural, creating a trustworthy, approachable, and premium atmosphere suited for a high-end travel service." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDe9u84hD0WLMBjp4iDbSG10F6wbyD7AvCvCNp6lNhawvNfwLPPfV8AGOEgv_-_DOpAWEOZnJjM8hbKPgNjUZJIzhG_q_14AYSa9HImQC2V9h1rbr87CkawyusWoohk-_YnGO3DDygZmRRODSrZ3DJg-6tBzieXhIamNZolTeIvYzT1JivWj-ggrivpg3oXq5OgjeyHunbvVvpqKAFwUzGEk2EVNkSo79RxpKsV78WkoAPokJZBBm1fCpVxwt9EyTNSqg6i1RQdJkJ-">
</div>
<div class="flex-grow flex flex-col justify-between w-full">
<div class="flex justify-between items-start mb-2">
<div>
<h4 class="font-headline-md text-[20px] text-on-surface leading-tight mb-1">Tariq Rahman</h4>
<p class="font-body-md text-sm text-on-surface-variant">Heritage &amp; Nature Specialist</p>
</div>
<div class="bg-tertiary-container/30 px-2 py-1 rounded flex items-center gap-1">
<span class="material-symbols-outlined text-[14px] text-tertiary">star</span>
<span class="font-label-sm text-[12px] text-on-surface">4.9</span>
</div>
</div>
<p class="font-body-md text-sm text-on-surface-variant line-clamp-2 mt-2">Fluent in English &amp; local dialects. Specializes in hidden coastal trails and historic shipyards.</p>
<div class="flex justify-between items-center mt-4">
<div class="font-headline-md text-[18px] text-primary">$40<span class="text-[12px] text-on-surface-variant font-normal">/half-day</span></div>
<button class="bg-transparent border border-primary text-primary hover:bg-primary/5 px-4 py-1.5 rounded-lg font-label-sm text-label-sm transition-colors">
                                View Profile
                            </button>
</div>
</div>
</div>
</div>
</section>
<!-- Load More -->
<div class="flex justify-center mt-8">
<button class="font-label-sm text-label-sm text-primary hover:text-on-primary-fixed-variant flex items-center gap-2 px-6 py-3 rounded-full hover:bg-primary/5 transition-colors">
                Explore More Options <span class="material-symbols-outlined">arrow_downward</span>
</button>
</div>
</main>
<!-- SideNavBar Shared Component (AI Guide) -->
<div class="fixed bottom-8 right-8 z-50 fixed right-8 bottom-24 rounded-full w-16 h-16 shadow-xl border border-primary/20 bg-surface/80 backdrop-blur-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform group" onclick="window.parent.postMessage({ type: 'NAVIGATE', path: '/vault' }, '*')">
<div class="absolute right-20 bottom-2 bg-surface p-4 rounded-2xl shadow-lg border border-outline-variant/20 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
<h4 class="font-headline-md text-[16px] text-on-surface">Gemini Assistant</h4>
<p class="font-body-md text-[12px] text-on-surface-variant mb-2">Your coastal guide</p>
<span class="text-primary font-label-sm text-[12px]">Start Chat →</span>
</div>
<button class="w-full h-full bg-primary text-on-primary rounded-full flex items-center justify-center">
<span class="material-symbols-outlined text-[24px]">smart_toy</span>
</button>
</div>
<!-- Footer Shared Component -->
<footer class="w-full bg-surface-container-highest flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-8 gap-6 mt-auto">
<div class="font-headline-md text-headline-md text-on-surface cursor-pointer" onclick="window.parent.postMessage({ type: 'NAVIGATE', path: '/' }, '*')">
            Trippin
        </div>
<div class="flex flex-wrap justify-center gap-6">
<a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary transition-colors" href="/vault">Emergency Rescue (Bachao)</a>
<a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary transition-colors" href="/itinerary">Travel Advisories</a>
<a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary transition-colors" href="/vault">Support</a>
<a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary transition-colors" href="/vault">Privacy</a>
</div>
<div class="font-label-sm text-[10px] text-tertiary">
            © 2024 Trippin Bangladesh. All rights reserved.
        </div>
</footer>
<script>
  // Dynamic navigation routing click interceptor
  document.querySelectorAll('nav a, footer a').forEach(link => {
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
                    "headline-md": [
                            "Plus Jakarta Sans"
                    ],
                    "body-lg": [
                            "Plus Jakarta Sans"
                    ],
                    "label-sm": [
                            "Plus Jakarta Sans"
                    ],
                    "body-md": [
                            "Plus Jakarta Sans"
                    ],
                    "display-lg": [
                            "Plus Jakarta Sans"
                    ],
                    "display-lg-mobile": [
                            "Plus Jakarta Sans"
                    ]
            },
            "fontSize": {
                    "headline-md": [
                            "24px",
                            {
                                    "lineHeight": "32px",
                                    "fontWeight": "600"
                            }
                    ],
                    "body-lg": [
                            "18px",
                            {
                                    "lineHeight": "28px",
                                    "fontWeight": "400"
                            }
                    ],
                    "label-sm": [
                            "12px",
                            {
                                    "lineHeight": "16px",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "600"
                            }
                    ],
                    "body-md": [
                            "16px",
                            {
                                    "lineHeight": "24px",
                                    "fontWeight": "400"
                            }
                    ],
                    "display-lg": [
                            "48px",
                            {
                                    "lineHeight": "56px",
                                    "letterSpacing": "-0.02em",
                                    "fontWeight": "700"
                            }
                    ],
                    "display-lg-mobile": [
                            "32px",
                            {
                                    "lineHeight": "40px",
                                    "letterSpacing": "-0.02em",
                                    "fontWeight": "700"
                            }
                    ]
            }
          }
        }
      }
    }catch(_e){}</script><meta charset="utf-8"></head><body class="bg-background text-on-background font-body-md min-h-screen vault-gradient pb-32 md:pb-0">
<!-- TopNavBar -->
<nav class="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm h-20 transition-all duration-300">
<div class="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-full max-w-container-max mx-auto">
<!-- Brand -->
<div class="font-headline-md text-headline-md font-bold text-primary cursor-pointer" onclick="window.parent.postMessage({ type: 'NAVIGATE', path: '/' }, '*')">
                Trippin
            </div>
<!-- Desktop Nav -->
<div class="hidden md:flex items-center gap-8">
<a href="/booking" class="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200">Booking</a>
<a href="/itinerary" class="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200">Itinerary</a>
<a href="/vault" class="text-primary border-b-2 border-primary pb-1 font-body-md text-body-md hover:text-primary transition-colors duration-200">Vault</a>
<a href="/gallery" class="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors duration-200">Gallery</a>
</div>
<!-- Trailing Icons -->
<div class="flex items-center gap-4 text-primary">
<button class="active:scale-95 transition-transform">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;" data-original-icon="notifications">notifications</span>
</button>
<button class="active:scale-95 transition-transform">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;" data-original-icon="account_circle">account_circle</span>
</button>
</div>
</div>
</nav>
<!-- Main Content -->
<main class="pt-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
<!-- Header Section -->
<header class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<h1 class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">Secure Vault</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Your encrypted digital safe for passports, tickets, and essential travel documents.</p>
</div>
<div class="flex gap-4">
<button class="glass-panel px-6 py-3 rounded-full flex items-center gap-2 text-primary font-label-sm text-label-sm hover:bg-surface-container transition-colors shadow-sm">
<span class="material-symbols-outlined text-[20px]">security</span>
                    Security Settings
                </button>
<button class="bg-primary text-on-primary px-6 py-3 rounded-full flex items-center gap-2 font-label-sm text-label-sm hover:bg-primary-container transition-colors shadow-sm active:scale-95">
<span class="material-symbols-outlined text-[20px]">add</span>
                    Add Document
                </button>
</div>
</header>
<!-- Storage Status (Bento Grid Style) -->
<section class="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
<!-- Encryption Status Widget -->
<div class="md:col-span-4 glass-panel rounded-xl p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
<div class="absolute -right-4 -top-4 w-32 h-32 bg-tertiary-fixed rounded-full blur-3xl opacity-50"></div>
<div>
<div class="flex items-center gap-2 text-secondary mb-1">
<span class="material-symbols-outlined text-[20px]">shield</span>
<span class="font-label-sm text-label-sm">STATUS</span>
</div>
<h3 class="font-headline-md text-headline-md text-on-surface mb-2">End-to-End Encrypted</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Your documents are secured with military-grade encryption.</p>
</div>
<div class="mt-8 flex items-center gap-3">
<div class="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
<span class="font-label-sm text-label-sm text-secondary">Vault is Locked &amp; Secure</span>
</div>
</div>
<!-- Storage Usage -->
<div class="md:col-span-8 glass-panel rounded-xl p-8 shadow-sm flex flex-col justify-center">
<div class="flex justify-between items-end mb-4">
<div>
<h3 class="font-body-lg text-body-lg text-on-surface">Storage Used</h3>
<p class="font-headline-md text-headline-md text-primary">45 MB <span class="font-body-md text-body-md text-outline">/ 1 GB</span></p>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant">4% Used</span>
</div>
<!-- Progress Bar -->
<div class="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
<div class="bg-primary h-3 rounded-full" style="width: 4%"></div>
</div>
<div class="flex gap-6 mt-6">
<div class="flex items-center gap-2">
<div class="w-3 h-3 rounded-full bg-primary"></div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Passports (20MB)</span>
</div>
<div class="flex items-center gap-2">
<div class="w-3 h-3 rounded-full bg-tertiary-container"></div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Tickets (15MB)</span>
</div>
<div class="flex items-center gap-2">
<div class="w-3 h-3 rounded-full bg-secondary-container"></div>
<span class="font-label-sm text-label-sm text-on-surface-variant">IDs (10MB)</span>
</div>
</div>
</div>
</section>
<!-- Documents Grid -->
<section>
<div class="flex justify-between items-center mb-6">
<h2 class="font-headline-md text-headline-md text-on-surface">My Documents</h2>
<div class="flex gap-2">
<button class="p-2 rounded-full glass-panel text-on-surface hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">filter_list</span>
</button>
<button class="p-2 rounded-full glass-panel text-on-surface hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">search</span>
</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<!-- Document Card 1: Passport -->
<div class="glass-panel rounded-xl p-1 shadow-sm group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
<div class="bg-surface-container-lowest rounded-lg p-6 h-full flex flex-col">
<div class="flex justify-between items-start mb-6">
<div class="p-3 bg-primary-fixed rounded-full text-primary">
<span class="material-symbols-outlined">badge</span>
</div>
<button class="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
<div class="mb-auto">
<h4 class="font-body-lg text-body-lg font-semibold text-on-surface">Primary Passport</h4>
<p class="font-body-md text-body-md text-on-surface-variant">Expires: Oct 2028</p>
</div>
<div class="mt-6 flex gap-2">
<span class="px-3 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface-variant">ID</span>
<span class="px-3 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface-variant">Travel</span>
</div>
</div>
</div>
<!-- Document Card 2: Visa -->
<div class="glass-panel rounded-xl p-1 shadow-sm group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
<div class="bg-surface-container-lowest rounded-lg p-6 h-full flex flex-col">
<div class="flex justify-between items-start mb-6">
<div class="p-3 bg-tertiary-fixed rounded-full text-tertiary">
<span class="material-symbols-outlined">description</span>
</div>
<button class="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
<div class="mb-auto">
<h4 class="font-body-lg text-body-lg font-semibold text-on-surface">Schengen Visa</h4>
<p class="font-body-md text-body-md text-on-surface-variant">Multiple Entry • Active</p>
</div>
<div class="mt-6 flex gap-2">
<span class="px-3 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface-variant">Visa</span>
<span class="px-3 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface-variant">EU</span>
</div>
</div>
</div>
<!-- Document Card 3: Flight Ticket -->
<div class="glass-panel rounded-xl p-1 shadow-sm group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
<div class="bg-surface-container-lowest rounded-lg p-6 h-full flex flex-col">
<div class="flex justify-between items-start mb-6">
<div class="p-3 bg-secondary-container rounded-full text-secondary">
<span class="material-symbols-outlined">flight</span>
</div>
<button class="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
<div class="mb-auto">
<h4 class="font-body-lg text-body-lg font-semibold text-on-surface">DAC - DXB Flight</h4>
<p class="font-body-md text-body-md text-on-surface-variant">Emirates EK583</p>
</div>
<div class="mt-6 flex gap-2">
<span class="px-3 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface-variant">Ticket</span>
<span class="px-3 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface-variant">Upcoming</span>
</div>
</div>
</div>
<!-- Add New Card Placeholder -->
<div class="glass-panel rounded-xl border-dashed border-2 border-outline-variant hover:border-primary transition-colors duration-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] group">
<div class="p-4 bg-surface-container rounded-full text-on-surface-variant group-hover:bg-primary-fixed group-hover:text-primary transition-colors mb-4">
<span class="material-symbols-outlined text-[32px]">add_circle</span>
</div>
<h4 class="font-body-lg text-body-lg font-semibold text-on-surface">Upload Document</h4>
<p class="font-body-md text-body-md text-on-surface-variant mt-1">PDF, JPG, PNG up to 10MB</p>
</div>
</div>
</section>
</main>
<!-- SideNavBar (AI Assistant) -->
<div class="fixed right-8 bottom-24 rounded-full w-16 h-16 shadow-xl border border-primary/20 bg-surface/80 backdrop-blur-2xl z-50 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" onclick="window.parent.postMessage({ type: 'NAVIGATE', path: '/vault' }, '*')">
<div class="bg-primary text-on-primary rounded-full w-full h-full flex items-center justify-center">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
</div>
</div>
<!-- Footer -->
<footer class="w-full bg-surface-container-lowest mt-24 border-t bg-surface-container-high">
<div class="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-base gap-gutter max-w-container-max mx-auto h-24">
<div class="font-headline-md text-headline-md text-on-surface cursor-pointer" onclick="window.parent.postMessage({ type: 'NAVIGATE', path: '/' }, '*')">
                Trippin
            </div>
<div class="flex gap-6 flex-wrap justify-center">
<a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary cursor-pointer">Emergency Rescue (Bachao)</a>
<a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary cursor-pointer">Travel Advisories</a>
<a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary cursor-pointer">Support</a>
<a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary cursor-pointer" href="#">Privacy</a>
</div>
<div class="font-label-sm text-label-sm text-tertiary">
                © 2024 Trippin Bangladesh. All rights reserved.
            </div>
</div>
</footer>
<script>
  document.querySelectorAll('nav a, footer a').forEach(link => {
    link.addEventListener('click', (e) => {
      const text = link.textContent.trim().toLowerCase();
      let path = '/';
      if (text.includes('booking')) path = '/booking';
      else if (text.includes('itinerary') || text.includes('advisories')) path = '/itinerary';
      else if (text.includes('vault') || text.includes('rescue') || text.includes('support') || text.includes('privacy')) path = '/vault';
      else if (text.includes('gallery') || text.includes('community')) path = '/gallery';
      
      e.preventDefault();
      window.parent.postMessage({ type: 'NAVIGATE', path: path }, '*');
    });
  });
</script>
</body></html>`

const TRANSLATION_HTML = `<!DOCTYPE html><html lang="en" class="light"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet"><script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script><meta charset="utf-8"><script id="tailwind-config">try{tailwind.config={darkMode:"class",theme:{extend:{"colors":{"tertiary-fixed":"#b3ebff","on-error-container":"#93000a","on-primary-fixed-variant":"#004b74","tertiary-container":"#007c95","secondary-container":"#aee9f5","surface-container-high":"#e6e8ea","inverse-primary":"#94ccff","primary-fixed-dim":"#94ccff","on-secondary-fixed":"#001f24","on-secondary-fixed-variant":"#054e58","surface-variant":"#e0e3e5","on-tertiary-fixed":"#001f27","outline-variant":"#bfc7d1","on-primary-container":"#f3f7ff","on-primary-fixed":"#001d32","secondary-fixed":"#b1ecf8","error-container":"#ffdad6","surface-container-highest":"#e0e3e5","secondary":"#2a6671","tertiary":"#006176","inverse-on-surface":"#eff1f3","surface":"#f7f9fb","surface-dim":"#d8dadc","on-tertiary":"#ffffff","error":"#ba1a1a","on-error":"#ffffff","primary":"#005d90","tertiary-fixed-dim":"#4cd6fb","on-surface":"#191c1e","background":"#f7f9fb","outline":"#707881","on-tertiary-container":"#ecf9ff","on-secondary":"#ffffff","surface-container-low":"#f2f4f6","on-tertiary-fixed-variant":"#004e5f","primary-container":"#0077b6","surface-container":"#eceef0","surface-container-lowest":"#ffffff","on-primary":"#ffffff","on-background":"#191c1e","surface-bright":"#f7f9fb","on-surface-variant":"#404850","primary-fixed":"#cde5ff","on-secondary-container":"#2f6b75","inverse-surface":"#2d3133","surface-tint":"#006399","secondary-fixed-dim":"#95d0dc"},"borderRadius":{"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},"spacing":{"margin-mobile":"16px","container-max":"1280px","margin-desktop":"48px","gutter":"24px","base":"8px"},"fontFamily":{"headline-md":["Plus Jakarta Sans"],"body-lg":["Plus Jakarta Sans"],"label-sm":["Plus Jakarta Sans"],"body-md":["Plus Jakarta Sans"],"display-lg":["Plus Jakarta Sans"],"display-lg-mobile":["Plus Jakarta Sans"]},"fontSize":{"headline-md":["24px",{"lineHeight":"32px","fontWeight":"600"}],"body-lg":["18px",{"lineHeight":"28px","fontWeight":"400"}],"label-sm":["12px",{"lineHeight":"16px","letterSpacing":"0.05em","fontWeight":"600"}],"body-md":["16px",{"lineHeight":"24px","fontWeight":"400"}],"display-lg":["48px",{"lineHeight":"56px","letterSpacing":"-0.02em","fontWeight":"700"}],"display-lg-mobile":["32px",{"lineHeight":"40px","letterSpacing":"-0.02em","fontWeight":"700"}]}}}}catch(_e){}</script><style>.glass-card{background:rgba(255,255,255,0.7);backdrop-filter:blur(16px);border:1px solid rgba(191,199,209,0.3)}</style></head><body class="bg-surface text-on-surface antialiased min-h-screen flex flex-col relative overflow-x-hidden"><div class="fixed inset-0 z-[-2] bg-cover bg-center" style="background-image:url('https://images.unsplash.com/photo-1596633608169-0d6b8f9f5d77?auto=format&fit=crop&w=1800&q=80')"></div><div class="fixed inset-0 z-[-1] bg-surface/70 backdrop-blur-[80px]"></div><nav class="bg-surface/70 backdrop-blur-xl fixed top-0 w-full border-b border-outline-variant/30 shadow-sm z-50"><div class="flex justify-between items-center px-margin-desktop h-20 max-w-container-max mx-auto"><div class="flex items-center gap-2 cursor-pointer" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/'},'*')"><span class="material-symbols-outlined text-primary" style="font-variation-settings:'FILL' 1">sailing</span><span class="font-headline-md text-headline-md font-bold text-primary tracking-tight">Trippin</span></div><div class="hidden md:flex items-center gap-8"><a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/booking'},'*');return false">Booking</a><a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/itinerary'},'*');return false">Itinerary</a><a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/vault'},'*');return false">Vault</a><a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/gallery'},'*');return false">Gallery</a><a class="font-body-md text-body-md text-primary border-b-2 border-primary pb-1" href="#">Translation</a></div><div class="flex items-center gap-3"><button class="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"><span class="material-symbols-outlined text-[20px]">notifications</span></button><button class="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"><span class="material-symbols-outlined text-[20px]">account_circle</span></button></div></div></nav><main class="flex-grow pt-32 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-8"><div class="flex flex-col items-center text-center max-w-2xl mx-auto mb-4"><h1 class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-4">Translation Tool</h1><p class="font-body-lg text-body-lg text-on-surface-variant">Break down language barriers instantly. Type or upload an image to translate text into Bengali.</p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-gutter w-full"><div class="glass-card rounded-xl p-6 flex flex-col shadow-sm relative overflow-hidden group"><div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-container to-surface-container-lowest"></div><div class="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant/30"><select class="bg-transparent border-none font-headline-md text-headline-md text-on-surface focus:ring-0 cursor-pointer p-0 pr-8"><option>Detect Language</option><option>English</option><option>French</option><option>Spanish</option></select><button class="text-primary hover:bg-primary-container/10 p-2 rounded-full transition-colors"><span class="material-symbols-outlined">mic</span></button></div><textarea class="w-full flex-grow min-h-[240px] bg-transparent border-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 resize-none p-0" placeholder="Type or paste text here to translate..."></textarea><div class="flex flex-wrap items-center justify-between mt-4 gap-4 pt-4 border-t border-outline-variant/30"><button class="flex items-center gap-2 px-4 py-2 bg-secondary-container/40 text-on-secondary-container rounded-full font-label-sm text-label-sm hover:bg-secondary-container/60 transition-colors border border-secondary-container/50 shadow-sm active:scale-95"><span class="material-symbols-outlined text-[18px]">add_a_photo</span>Upload Image</button><span class="font-label-sm text-label-sm text-outline">0 / 5000</span></div><button class="w-full mt-6 bg-primary text-on-primary py-3 rounded-lg font-headline-md text-[16px] leading-[24px] font-semibold shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] flex justify-center items-center gap-2"><span class="material-symbols-outlined">translate</span> Translate</button></div><div class="glass-card rounded-xl p-6 flex flex-col shadow-sm relative overflow-hidden group"><div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-fixed to-tertiary-fixed"></div><div class="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant/30"><div class="font-headline-md text-headline-md text-primary font-semibold flex items-center gap-2">Bengali<span class="material-symbols-outlined text-[20px] text-primary/70">check_circle</span></div><div class="flex items-center gap-2"><button class="text-on-surface-variant hover:text-primary hover:bg-primary-container/10 p-2 rounded-full transition-colors" title="Listen"><span class="material-symbols-outlined">volume_up</span></button><button class="text-on-surface-variant hover:text-primary hover:bg-primary-container/10 p-2 rounded-full transition-colors" title="Copy"><span class="material-symbols-outlined">content_copy</span></button></div></div><div class="w-full flex-grow min-h-[240px] bg-transparent font-body-md text-body-md text-on-surface/60 italic p-0 flex items-start">Translation will appear here...</div><div class="mt-auto flex justify-end pt-4 border-t border-outline-variant/30 opacity-50"><span class="material-symbols-outlined text-[32px] text-surface-variant">forum</span></div></div></div><div class="mt-8 bg-surface-container-low/50 backdrop-blur-md rounded-xl p-6 border border-outline-variant/20 flex items-start gap-4 max-w-3xl mx-auto w-full"><div class="bg-tertiary-container/20 text-tertiary p-2 rounded-full flex-shrink-0 mt-1"><span class="material-symbols-outlined">lightbulb</span></div><div><h4 class="font-headline-md text-[18px] text-on-surface mb-1">Pro Tip for Travelers</h4><p class="font-body-md text-body-md text-on-surface-variant">Use the <strong>Upload Image</strong> feature to quickly translate restaurant menus, street signs, or historical plaques while exploring.</p></div></div></main><footer class="w-full bg-surface-container-high"><div class="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-base gap-gutter max-w-container-max mx-auto w-full"><div class="font-headline-md text-headline-md text-on-surface cursor-pointer" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/'},'*')">Trippin</div><div class="flex flex-wrap justify-center gap-6"><a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary cursor-pointer">Emergency Rescue (Bachao)</a><a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary cursor-pointer">Travel Advisories</a><a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary cursor-pointer">Support</a><a class="font-label-sm text-label-sm text-on-surface-variant hover:underline hover:text-primary cursor-pointer">Privacy</a></div><div class="font-label-sm text-label-sm text-on-surface-variant">© 2024 Trippin Bangladesh. All rights reserved.</div></div></footer></body></html>`

const TODO_HTML = `<!DOCTYPE html><html lang="en" class="light"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"><script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script><script id="tailwind-config">try{tailwind.config={darkMode:"class",theme:{extend:{colors:{"tertiary-fixed":"#b3ebff","on-error-container":"#93000a","on-primary-fixed-variant":"#004b74","tertiary-container":"#007c95","secondary-container":"#aee9f5","surface-container-high":"#e6e8ea","inverse-primary":"#94ccff","primary-fixed-dim":"#94ccff","on-secondary-fixed":"#001f24","on-secondary-fixed-variant":"#054e58","surface-variant":"#e0e3e5","on-tertiary-fixed":"#001f27","outline-variant":"#bfc7d1","on-primary-container":"#f3f7ff","on-primary-fixed":"#001d32","secondary-fixed":"#b1ecf8","error-container":"#ffdad6","surface-container-highest":"#e0e3e5","secondary":"#2a6671","tertiary":"#006176","inverse-on-surface":"#eff1f3","surface":"#f7f9fb","surface-dim":"#d8dadc","on-tertiary":"#ffffff","error":"#ba1a1a","on-error":"#ffffff","primary":"#005d90","tertiary-fixed-dim":"#4cd6fb","on-surface":"#191c1e","background":"#f7f9fb","outline":"#707881","on-tertiary-container":"#ecf9ff","on-secondary":"#ffffff","surface-container-low":"#f2f4f6","on-tertiary-fixed-variant":"#004e5f","primary-container":"#0077b6","surface-container":"#eceef0","surface-container-lowest":"#ffffff","on-primary":"#ffffff","on-background":"#191c1e","surface-bright":"#f7f9fb","on-surface-variant":"#404850","primary-fixed":"#cde5ff","on-secondary-container":"#2f6b75","inverse-surface":"#2d3133","surface-tint":"#006399","secondary-fixed-dim":"#95d0dc"},borderRadius:{DEFAULT:"0.25rem",lg:"0.5rem",xl:"0.75rem",full:"9999px"},spacing:{"margin-mobile":"16px","container-max":"1280px","margin-desktop":"48px","gutter":"24px","base":"8px"},fontFamily:{"headline-md":["Plus Jakarta Sans"],"body-lg":["Plus Jakarta Sans"],"label-sm":["Plus Jakarta Sans"],"body-md":["Plus Jakarta Sans"],"display-lg":["Plus Jakarta Sans"],"display-lg-mobile":["Plus Jakarta Sans"]},fontSize:{"headline-md":["24px",{lineHeight:"32px",fontWeight:"600"}],"body-lg":["18px",{lineHeight:"28px",fontWeight:"400"}],"label-sm":["12px",{lineHeight:"16px",letterSpacing:"0.05em",fontWeight:"600"}],"body-md":["16px",{lineHeight:"24px",fontWeight:"400"}],"display-lg":["48px",{lineHeight:"56px",letterSpacing:"-0.02em",fontWeight:"700"}],"display-lg-mobile":["32px",{lineHeight:"40px",letterSpacing:"-0.02em",fontWeight:"700"}]}}}}catch(_e){}</script><style>.glass-panel{background:rgba(255,255,255,0.6);backdrop-filter:blur(20px);border:1px solid rgba(191,199,209,0.4)}.progress-bar-fill{transition:width 1s ease-out}.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background-color:#e0e3e5;border-radius:20px}</style><meta charset="utf-8"></head><body class="font-body-md text-body-md antialiased min-h-screen flex flex-col relative"><div class="fixed inset-0 pointer-events-none overflow-hidden z-0"><div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-tertiary-fixed/30 blur-[120px]"></div><div class="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary-container/20 blur-[100px]"></div></div><header class="fixed top-0 w-full bg-surface/70 backdrop-blur-xl shadow-sm border-b border-outline-variant/30 z-50"><div class="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto"><div class="flex items-center gap-2 cursor-pointer" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/'},'*')"><span class="material-symbols-outlined text-primary" style="font-variation-settings:'FILL' 1">sailing</span><span class="font-headline-md text-headline-md font-bold text-primary tracking-tight">Trippin</span></div><nav class="hidden md:flex space-x-gutter"><a href="#" class="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/booking'},'*');return false">Booking</a><a href="#" class="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/itinerary'},'*');return false">Itinerary</a><a href="#" class="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/vault'},'*');return false">Vault</a><a href="#" class="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/gallery'},'*');return false">Gallery</a><a href="#" class="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/translation'},'*');return false">Translation</a></nav><div class="flex items-center space-x-3"><button class="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"><span class="material-symbols-outlined text-[20px]">notifications</span></button><button class="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"><span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1">account_circle</span></button></div></div></header><main class="flex-grow pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full relative z-10"><div class="mb-12"><h1 class="font-display-lg-mobile md:font-display-lg text-on-background mb-2">Welcome Back, Alex</h1><p class="font-body-lg text-on-surface-variant">Your upcoming coastal journey is taking shape.</p></div><div class="grid grid-cols-1 md:grid-cols-12 gap-6"><div class="md:col-span-8 glass-panel rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden"><div class="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><span class="material-symbols-outlined text-9xl">account_balance_wallet</span></div><div><div class="flex items-center justify-between mb-6"><h2 class="font-headline-md text-headline-md text-on-background flex items-center gap-2"><span class="material-symbols-outlined text-tertiary">pie_chart</span>Budget Tracker</h2><button class="bg-surface-container-low text-primary px-4 py-2 rounded-full font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary transition-colors">Manage</button></div><div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"><div><p class="text-on-surface-variant font-body-md text-body-md mb-1">Total Budget</p><p class="font-display-lg-mobile text-on-background">$4,500</p></div><div><p class="text-on-surface-variant font-body-md text-body-md mb-1">Total Spent</p><p class="font-display-lg-mobile text-primary">$1,250</p></div></div></div><div class="space-y-4"><div><div class="flex justify-between text-label-sm font-label-sm text-on-surface-variant mb-1"><span>Flights (40%)</span><span>$1,800 limit</span></div><div class="h-2 w-full bg-surface-container-high rounded-full overflow-hidden"><div class="h-full bg-tertiary progress-bar-fill" style="width:40%"></div></div></div><div><div class="flex justify-between text-label-sm font-label-sm text-on-surface-variant mb-1"><span>Accommodation (65%)</span><span>$1,500 limit</span></div><div class="h-2 w-full bg-surface-container-high rounded-full overflow-hidden"><div class="h-full bg-primary progress-bar-fill" style="width:65%"></div></div></div><div><div class="flex justify-between text-label-sm font-label-sm text-on-surface-variant mb-1"><span>Activities (15%)</span><span>$800 limit</span></div><div class="h-2 w-full bg-surface-container-high rounded-full overflow-hidden"><div class="h-full bg-secondary progress-bar-fill" style="width:15%"></div></div></div></div></div><div class="md:col-span-4 glass-panel rounded-xl p-6 md:p-8 flex flex-col"><div class="flex items-center justify-between mb-6"><h2 class="font-headline-md text-headline-md text-on-background flex items-center gap-2"><span class="material-symbols-outlined text-secondary">checklist</span>To-Do List</h2><button class="text-primary hover:text-primary-container transition-colors"><span class="material-symbols-outlined">add_circle</span></button></div><div class="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar" style="max-height:300px"><label class="flex items-start space-x-3 p-3 bg-surface-container-lowest/50 rounded-lg border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer"><input type="checkbox" class="mt-1 form-checkbox h-5 w-5 text-primary rounded border-outline focus:ring-primary"><span class="font-body-md text-body-md text-on-background select-none">Book Cox's Bazar Resort</span></label><label class="flex items-start space-x-3 p-3 bg-surface-container-lowest/50 rounded-lg border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer opacity-60"><input type="checkbox" checked class="mt-1 form-checkbox h-5 w-5 text-primary rounded border-outline focus:ring-primary"><span class="font-body-md text-body-md text-on-surface-variant line-through select-none">Renew Passport</span></label><label class="flex items-start space-x-3 p-3 bg-surface-container-lowest/50 rounded-lg border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer"><input type="checkbox" class="mt-1 form-checkbox h-5 w-5 text-primary rounded border-outline focus:ring-primary"><span class="font-body-md text-body-md text-on-background select-none">Buy travel insurance</span></label><label class="flex items-start space-x-3 p-3 bg-surface-container-lowest/50 rounded-lg border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer"><input type="checkbox" class="mt-1 form-checkbox h-5 w-5 text-primary rounded border-outline focus:ring-primary"><span class="font-body-md text-body-md text-on-background select-none">Research local seafood spots</span></label></div></div><div class="md:col-span-12 glass-panel rounded-xl p-6 md:p-8"><div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"><h2 class="font-headline-md text-headline-md text-on-background flex items-center gap-2"><span class="material-symbols-outlined text-primary-container">edit_document</span>Pre-Trip Journal</h2><div class="flex items-center space-x-3 bg-surface-container-low rounded-full p-1 border border-outline-variant/20"><button class="px-4 py-1.5 rounded-full bg-surface text-on-surface shadow-sm font-label-sm text-label-sm transition-all">Private</button><button class="px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-all">Public</button></div></div><div class="flex flex-col md:flex-row gap-6"><div class="w-full md:w-1/3 h-48 md:h-auto rounded-lg overflow-hidden relative group"><img alt="Journal cover" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"><button class="absolute bottom-4 right-4 bg-surface/80 backdrop-blur-md p-2 rounded-full text-on-surface hover:text-primary transition-colors shadow-sm"><span class="material-symbols-outlined text-sm">photo_camera</span></button></div><div class="w-full md:w-2/3 flex flex-col"><input class="bg-transparent border-none font-headline-md text-headline-md text-on-background placeholder-on-surface-variant/50 focus:ring-0 p-0 mb-4 w-full" placeholder="Title your thoughts..." type="text"><textarea class="bg-transparent border-none font-body-md text-body-md text-on-surface-variant placeholder-on-surface-variant/50 focus:ring-0 p-0 resize-none flex-grow min-h-[120px] custom-scrollbar" placeholder="What are you looking forward to most? Start typing..."></textarea><div class="flex justify-end mt-4"><button class="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-sm text-label-sm hover:bg-primary-container hover:shadow-md transition-all flex items-center gap-2">Save Entry<span class="material-symbols-outlined text-sm">save</span></button></div></div></div></div></div></main><div class="fixed right-8 bottom-8 w-16 h-16 shadow-xl z-50 bg-primary text-on-primary rounded-full hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"><span class="material-symbols-outlined text-3xl">smart_toy</span></div><footer class="w-full bg-surface-container-high flex flex-col md:flex-row justify-between items-center px-margin-desktop py-base gap-gutter mt-auto z-10 relative"><div class="font-headline-md text-headline-md text-on-surface cursor-pointer" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/'},'*')">Trippin</div><div class="flex flex-wrap justify-center gap-6"><a class="text-on-surface-variant font-label-sm text-label-sm hover:underline hover:text-primary cursor-pointer">Emergency Rescue (Bachao)</a><a class="text-on-surface-variant font-label-sm text-label-sm hover:underline hover:text-primary cursor-pointer">Travel Advisories</a><a class="text-on-surface-variant font-label-sm text-label-sm hover:underline hover:text-primary cursor-pointer">Support</a><a class="text-on-surface-variant font-label-sm text-label-sm hover:underline hover:text-primary cursor-pointer">Privacy</a></div><div class="text-tertiary font-label-sm text-label-sm">© 2024 Trippin Bangladesh. All rights reserved.</div></footer></body></html>`

const BACHAO_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet"><script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script><script id="tailwind-config">try{tailwind.config={darkMode:"class",theme:{extend:{"colors":{"tertiary-fixed":"#b3ebff","on-error-container":"#93000a","on-primary-fixed-variant":"#004b74","tertiary-container":"#007c95","secondary-container":"#aee9f5","surface-container-high":"#e6e8ea","inverse-primary":"#94ccff","primary-fixed-dim":"#94ccff","on-secondary-fixed":"#001f24","on-secondary-fixed-variant":"#054e58","surface-variant":"#e0e3e5","on-tertiary-fixed":"#001f27","outline-variant":"#bfc7d1","on-primary-container":"#f3f7ff","on-primary-fixed":"#001d32","secondary-fixed":"#b1ecf8","error-container":"#ffdad6","surface-container-highest":"#e0e3e5","secondary":"#2a6671","tertiary":"#006176","inverse-on-surface":"#eff1f3","surface":"#f7f9fb","surface-dim":"#d8dadc","on-tertiary":"#ffffff","error":"#ba1a1a","on-error":"#ffffff","primary":"#005d90","tertiary-fixed-dim":"#4cd6fb","on-surface":"#191c1e","background":"#f7f9fb","outline":"#707881","on-tertiary-container":"#ecf9ff","on-secondary":"#ffffff","surface-container-low":"#f2f4f6","on-tertiary-fixed-variant":"#004e5f","primary-container":"#0077b6","surface-container":"#eceef0","surface-container-lowest":"#ffffff","on-primary":"#ffffff","on-background":"#191c1e","surface-bright":"#f7f9fb","on-surface-variant":"#404850","primary-fixed":"#cde5ff","on-secondary-container":"#2f6b75","inverse-surface":"#2d3133","surface-tint":"#006399","secondary-fixed-dim":"#95d0dc"},"borderRadius":{"DEFAULT":"0.25rem","lg":"0.5rem","xl":"0.75rem","full":"9999px"},"spacing":{"margin-mobile":"16px","container-max":"1280px","margin-desktop":"48px","gutter":"24px","base":"8px"},"fontFamily":{"headline-md":["Plus Jakarta Sans"],"body-lg":["Plus Jakarta Sans"],"label-sm":["Plus Jakarta Sans"],"body-md":["Plus Jakarta Sans"],"display-lg":["Plus Jakarta Sans"],"display-lg-mobile":["Plus Jakarta Sans"]},"fontSize":{"headline-md":["24px",{"lineHeight":"32px","fontWeight":"600"}],"body-lg":["18px",{"lineHeight":"28px","fontWeight":"400"}],"label-sm":["12px",{"lineHeight":"16px","letterSpacing":"0.05em","fontWeight":"600"}],"body-md":["16px",{"lineHeight":"24px","fontWeight":"400"}],"display-lg":["48px",{"lineHeight":"56px","letterSpacing":"-0.02em","fontWeight":"700"}],"display-lg-mobile":["32px",{"lineHeight":"40px","letterSpacing":"-0.02em","fontWeight":"700"}]}}}}catch(_e){}</script><style>.glass-panel{background:rgba(255,255,255,0.6);backdrop-filter:blur(20px);border:1px solid rgba(191,199,209,0.3)}@keyframes pulse-sos{0%,100%{box-shadow:0 0 0 0 rgba(186,26,26,0.4)}70%{box-shadow:0 0 0 20px rgba(186,26,26,0)}}.pulse-active{animation:pulse-sos 2s infinite}</style><meta charset="utf-8"></head><body class="bg-surface text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-fixed selection:text-on-primary-fixed"><div class="fixed inset-0 pointer-events-none z-0"><div class="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-error-container/30 blur-[120px] mix-blend-multiply opacity-50"></div><div class="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary-fixed/40 blur-[100px] mix-blend-multiply opacity-60"></div></div><header class="relative z-10 w-full flex items-center justify-between px-margin-mobile md:px-margin-desktop py-gutter"><button class="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors shadow-sm" onclick="window.parent.postMessage({type:'NAVIGATE',path:'/'},'*')"><span class="material-symbols-outlined text-2xl">close</span></button><div class="flex items-center gap-2 text-error"><span class="material-symbols-outlined text-3xl" style="font-variation-settings:'FILL' 1">health_and_safety</span><h1 class="font-headline-md text-headline-md text-on-surface">Bachao System</h1></div><div class="w-12 h-12"></div></header><main class="relative z-10 flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-margin-desktop flex flex-col lg:flex-row gap-gutter"><section class="flex-1 flex flex-col gap-gutter"><div class="glass-panel rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-lg border-t-2 border-t-error/20 relative overflow-hidden"><div class="absolute inset-0 opacity-5" style="background-image:repeating-linear-gradient(45deg,#000 0,#000 2px,transparent 2px,transparent 8px)"></div><h2 class="font-body-lg text-body-lg text-on-surface-variant mb-2 relative z-10">Active Trip Monitored</h2><div class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-error mb-8 relative z-10 tracking-tight" id="countdown-display">00:45:00</div><div class="w-full max-w-md bg-surface-container-low rounded-2xl p-4 mb-10 flex items-center justify-between relative z-10"><button class="w-10 h-10 flex items-center justify-center rounded-full bg-surface text-on-surface shadow-sm hover:bg-surface-variant transition-colors"><span class="material-symbols-outlined">remove</span></button><div class="flex flex-col items-center"><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Add Time</span><span class="font-body-md text-body-md font-bold text-primary">+15 min</span></div><button class="w-10 h-10 flex items-center justify-center rounded-full bg-surface text-on-surface shadow-sm hover:bg-surface-variant transition-colors"><span class="material-symbols-outlined">add</span></button></div><div class="w-full max-w-md flex flex-col gap-6 relative z-10"><button class="w-full py-6 rounded-full bg-error text-on-error font-headline-md text-headline-md shadow-xl pulse-active hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"><span class="material-symbols-outlined text-3xl" style="font-variation-settings:'FILL' 1">sos</span>SEND SOS NOW</button><button class="w-full py-5 rounded-full bg-tertiary text-on-tertiary font-headline-md text-headline-md shadow-md hover:bg-tertiary/90 active:scale-95 transition-all flex items-center justify-center gap-3"><span class="material-symbols-outlined text-2xl">verified</span>I Am Safe</button></div></div><div class="glass-panel rounded-2xl p-6 shadow-sm border border-outline-variant/30"><div class="flex items-center justify-between mb-4"><h3 class="font-body-lg text-body-lg font-semibold text-on-surface">Auto-Dispatch Protocol</h3><span class="material-symbols-outlined text-primary">info</span></div><p class="font-body-md text-body-md text-on-surface-variant mb-4">If the timer expires, an automated message with your last known location will be sent to your emergency contacts.</p><div class="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high"><p class="font-body-md text-body-md text-on-surface italic">"Alert: I have not checked in on the Trippin app. My last known location was Cox's Bazar, coordinates 21.4272° N, 91.9702° E."</p></div></div></section><aside class="w-full lg:w-96 flex flex-col gap-gutter"><div class="glass-panel rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col"><h3 class="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2"><span class="material-symbols-outlined text-tertiary">group</span>My Contacts</h3><div class="flex flex-col gap-4"><div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-surface-container hover:border-primary-fixed transition-colors"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">M</div><div><p class="font-body-md text-body-md font-semibold text-on-surface">Mom</p><p class="font-label-sm text-label-sm text-on-surface-variant">Primary</p></div></div><button class="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-primary-fixed transition-colors"><span class="material-symbols-outlined">call</span></button></div><div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-surface-container hover:border-primary-fixed transition-colors"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">B</div><div><p class="font-body-md text-body-md font-semibold text-on-surface">Brother</p><p class="font-label-sm text-label-sm text-on-surface-variant">Secondary</p></div></div><button class="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-primary-fixed transition-colors"><span class="material-symbols-outlined">call</span></button></div></div></div><div class="glass-panel rounded-2xl p-0 shadow-sm border border-outline-variant/30 flex flex-col overflow-hidden"><div class="h-40 w-full relative bg-surface-variant bg-cover bg-center" style="background-image:url('https://lh3.googleusercontent.com/aida-public/AB6AXuA5gg8wFQzbyg0O2oVpS0dVMaZErIjbdXrJIXtBv8my8K27qEFbrjIhIjfe3HjHIHoNwHBYeHOtJ74bE71lNQCwLULiInaOdi3KnRPtfsbG3dmqtyc_b23MHXDAaOdR117xPIlVeSB4eLM-r40wIKCyO9YnKPpX4AlW7zx_EhVOoTaLJSVhcIbAddIGJpb6LUp15WR15G2F_dqVR95TPlTI1H9mX_3l4mHZvriFpUSGhw-y14S449vCFSK4pRsA0m4lYBTeYcQrVtQp')"><div class="absolute inset-0 bg-gradient-to-t from-surface/90 to-transparent"></div><div class="absolute bottom-4 left-6"><h3 class="font-headline-md text-headline-md text-on-surface flex items-center gap-2"><span class="material-symbols-outlined text-primary">near_me</span>Nearby</h3></div></div><div class="p-6 flex flex-col gap-4 flex-1"><button class="w-full flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest border border-surface-container hover:bg-error-container hover:text-on-error-container transition-colors group"><div class="flex items-center gap-3"><span class="material-symbols-outlined text-error group-hover:text-on-error-container">local_police</span><div class="text-left"><p class="font-body-md text-body-md font-semibold">Tourist Police</p><p class="font-label-sm text-label-sm opacity-80">1.2 km away</p></div></div><span class="material-symbols-outlined">chevron_right</span></button><button class="w-full flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest border border-surface-container hover:bg-tertiary-container hover:text-on-tertiary-container transition-colors group"><div class="flex items-center gap-3"><span class="material-symbols-outlined text-tertiary group-hover:text-on-tertiary-container">local_hospital</span><div class="text-left"><p class="font-body-md text-body-md font-semibold">City Hospital</p><p class="font-label-sm text-label-sm opacity-80">3.5 km away</p></div></div><span class="material-symbols-outlined">chevron_right</span></button><button class="w-full flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest border border-surface-container hover:bg-surface-variant transition-colors"><div class="flex items-center gap-3"><span class="material-symbols-outlined text-outline">shield</span><div class="text-left"><p class="font-body-md text-body-md font-semibold">Embassy Contacts</p></div></div><span class="material-symbols-outlined">open_in_new</span></button></div></div></aside></main><script>document.addEventListener('DOMContentLoaded',()=>{const d=document.getElementById('countdown-display');let s=45*60;function f(t){const h=Math.floor(t/3600),m=Math.floor((t%3600)/60),sec=t%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}setInterval(()=>{if(s>0){s--;if(d)d.innerText=f(s)}},1000)});</script></body></html>`

export default App

