import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const isHome = location.pathname === '/';

  return (
    <header className={isHome ? 'home-navbar' : 'subpage-header'}>
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
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-icons">
          <button className="nav-icon-btn" title="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button className="nav-icon-btn" title="Profile" onClick={() => setProfileOpen(o => !o)}>
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            {profileOpen && (
              <div className="profile-dropdown">
                <button className="profile-dropdown-item" onClick={() => { navigate('/vault'); setProfileOpen(false); }}>
                  <span className="material-symbols-outlined pd-icon" style={{fontSize: '20px', marginRight: '8px'}}>lock</span> My Vault
                </button>
                <button className="profile-dropdown-item" onClick={() => { navigate('/gallery'); setProfileOpen(false); }}>
                  <span className="material-symbols-outlined pd-icon" style={{fontSize: '20px', marginRight: '8px'}}>image</span> My Gallery
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}