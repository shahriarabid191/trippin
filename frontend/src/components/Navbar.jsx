import { useState, useRef, useEffect } from 'react';

export default function Navbar({ currentPath, navigate }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { path: '/booking', label: 'Booking' },
    { path: '/itinerary', label: 'Itinerary' },
    { path: '/vault', label: 'Vault' },
    { path: '/gallery', label: 'Gallery' }
  ];

  return (
    <header className="global-navbar">
      <nav className="top-nav">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          ◉ TRIPPIN
        </div>
        
        <div className="menu-links">
          {navLinks.map((link) => (
            <a
              key={link.path}
              href={link.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(link.path);
              }}
              className={currentPath === link.path ? 'active' : ''}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-icons">
          <button className="nav-icon-btn" title="Notifications">🔔</button>
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button className="nav-icon-btn" title="Profile" onClick={() => setProfileOpen(o => !o)}>
              👤
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <button className="profile-dropdown-item" onClick={() => { navigate('/vault'); setProfileOpen(false); }}>
                  <span className="pd-icon">🔒</span> My Vault
                </button>
                <button className="profile-dropdown-item" onClick={() => { navigate('/gallery'); setProfileOpen(false); }}>
                  <span className="pd-icon">🖼️</span> My Gallery
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}