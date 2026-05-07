import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X } from 'lucide-react';
import { useKeycloak } from '@react-keycloak/web';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled glass' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <Compass className="logo-icon" />
          <span className="logo-text">Travel<span className="text-gradient">Agency</span></span>
        </Link>
        
        <div className={`nav-links ${isOpen ? 'open glass' : ''}`}>
          {(!initialized || !keycloak || !keycloak.authenticated || !(keycloak.tokenParsed?.realm_access?.roles || []).includes('ADMIN')) && (
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Inicio</Link>
          )}
          <Link to="/packages" className={`nav-link ${location.pathname.startsWith('/packages') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Paquetes</Link>
          <a href="#about" className="nav-link" onClick={() => setIsOpen(false)}>Nosotros</a>
          {initialized && keycloak && keycloak.authenticated && (
            <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Perfil</Link>
          )}
          {initialized && keycloak && (keycloak.tokenParsed?.realm_access?.roles || []).includes('CLIENTE') && (
            <Link to="/my-reservations" className={`nav-link ${location.pathname === '/my-reservations' ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Mis Reservas</Link>
          )}
          {initialized && keycloak && (keycloak.tokenParsed?.realm_access?.roles || []).includes('ADMIN') && (
            <Link to="/admin/dashboard" className="button button-outline nav-cta" onClick={() => setIsOpen(false)}>Panel Admin</Link>
          )}
          {!initialized || !keycloak || !keycloak.authenticated ? (
            <>
              <button className="button button-outline nav-cta" onClick={() => keycloak?.register()}>
                Crear Cuenta
              </button>
              <button className="button button-primary nav-cta" onClick={() => keycloak?.login()}>
                Iniciar Sesión
              </button>
            </>
          ) : (
            <button className="button button-secondary nav-cta" onClick={() => keycloak?.logout()}>
              Salir
            </button>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
