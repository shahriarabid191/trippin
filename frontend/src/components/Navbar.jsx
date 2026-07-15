import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Import your auth state

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pull the current user and logout function from Context
  const { user, logout } = useContext(AuthContext); 

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

        <div className="nav-icons" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Conditional Rendering: Logged In vs Logged Out */}
          {!user ? (
            <>
              <button 
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')}
                style={{ background: '#fff', color: '#0b1e30', border: 'none', padding: '8px 20px', borderRadius: '999px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button className="nav-icon-btn" title="Notifications">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button className="nav-icon-btn" title="Profile" onClick={() => setProfileOpen(o => !o)}>
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
                
                {profileOpen && (
                  <div className="profile-dropdown">
                    {/* Admin Only Link */}
                    {user.role === 'admin' && (
                      <>
                        <button className="profile-dropdown-item" onClick={() => { navigate('/admin'); setProfileOpen(false); }}>
                          <span className="material-symbols-outlined pd-icon" style={{fontSize: '20px', marginRight: '8px', color: '#ba1a1a'}}>admin_panel_settings</span> Admin Dashboard
                        </button>
                        <div className="profile-dropdown-divider" />
                      </>
                    )}
                    
                    <button className="profile-dropdown-item" onClick={() => { navigate('/vault'); setProfileOpen(false); }}>
                      <span className="material-symbols-outlined pd-icon" style={{fontSize: '20px', marginRight: '8px'}}>lock</span> My Vault
                    </button>
                    <button className="profile-dropdown-item" onClick={() => { navigate('/gallery'); setProfileOpen(false); }}>
                      <span className="material-symbols-outlined pd-icon" style={{fontSize: '20px', marginRight: '8px'}}>image</span> My Gallery
                    </button>
                    
                    <div className="profile-dropdown-divider" />
                    
                    <button className="profile-dropdown-item" onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}>
                      <span className="material-symbols-outlined pd-icon" style={{fontSize: '20px', marginRight: '8px', color: '#4f5c69'}}>logout</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}