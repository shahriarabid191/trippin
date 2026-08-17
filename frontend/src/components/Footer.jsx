import { useNavigate } from 'react-router-dom';

const links = [
  { path: '/booking', label: 'Booking' },
  { path: '/itinerary', label: 'Itinerary' },
  { path: '/vault', label: 'Vault' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/translate', label: 'Translate' },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="site-footer">
      <div className="site-footer-brand" onClick={() => navigate('/')}>◉ TRIPPIN</div>

      <nav className="site-footer-links">
        {links.map((link) => (
          <a
            key={link.path}
            href={link.path}
            onClick={(e) => { e.preventDefault(); navigate(link.path); }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="site-footer-copyright">
        © {new Date().getFullYear()} TRIPPIN. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}
