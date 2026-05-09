import { Compass, Globe, MessageCircle, Share2 } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-col brand-col">
          <div className="nav-logo">
            <Compass className="logo-icon" />
            <span className="logo-text">Travel<span className="text-gradient">Agency</span></span>
          </div>
          <p className="footer-desc">
            Descubre el mundo con nosotros. Las mejores experiencias de viaje y aventuras inolvidables te esperan.
          </p>
          <div className="social-links">
            <a href="#" className="social-link"><Globe size={20} /></a>
            <a href="#" className="social-link"><MessageCircle size={20} /></a>
            <a href="#" className="social-link"><Share2 size={20} /></a>
          </div>
        </div>
        
        <div className="footer-col">
          <h3>Enlaces Rápidos</h3>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/packages">Paquetes</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Contacto</h3>
          <ul>
            <li>Email: info@travelagency.cl</li>
            <li>Teléfono: 600 666 6767</li>
            <li>Dirección: Av. Apoquindo 1312 ,Las Condes, Santiago de Chile</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Travel Agency. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
