import { ArrowRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
// import PackageCard from '../components/PackageCard';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { keycloak, initialized } = useKeycloak();

  const isClient = initialized && keycloak?.authenticated && (keycloak.tokenParsed?.realm_access?.roles || []).includes('CLIENTE');
  const firstName = keycloak?.tokenParsed?.given_name || keycloak?.tokenParsed?.preferred_username || "Explorador";
  const firstLastName = keycloak?.tokenParsed?.first_last_name || "";
  const secondLastName = keycloak?.tokenParsed?.second_last_name || "";

  return (
    <>
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-container">
          <div className="hero-content fade-in-up">
            <h1 className="hero-title" style={{ fontSize: isClient ? '4rem' : undefined, textTransform: isClient ? 'uppercase' : 'none' }}>
              {isClient ? (
                <>HOLA, <span className="text-gradient">{firstName + " " + firstLastName + " " + secondLastName}</span></>
              ) : (
                <>Descubre Tu Próxima <br /><span className="text-gradient">Gran Aventura</span></>
              )}
            </h1>
            <p className="hero-subtitle">
              {isClient
                ? 'El mundo te espera. Comienza a planear tu próxima aventura perfecta revisando nuestros paquetes disponibles para ti.'
                : 'Reserva paquetes turísticos exclusivos con alojamiento, vuelos y experiencias únicas diseñadas solo para ti.'}
            </p>

            <div className="search-bar glass">
              <div className="search-input-group">
                <Search className="search-icon" size={20} />
                <input type="text" placeholder="¿A dónde quieres ir?" className="search-input" />
              </div>
              <button
                className="button button-primary search-btn"
                onClick={() => navigate('/packages')}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section container">
        <div className="section-header">
          <h2>Paquetes <span className="text-gradient">Destacados</span></h2>
          <button
            className="button button-outline"
            onClick={() => navigate('/packages')}
          >
            Ver Todos <ArrowRight size={16} />
          </button>
        </div>

        {/* <div className="packages-grid">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} item={pkg} />
          ))}
        </div> */}
      </section>

      <section className="features-section container">
        <div className="features-grid">
          <div className="feature-item glass">
            <h3>🌎 Destinos Exclusivos</h3>
            <p>Accede a lugares increíbles y apartados donde la naturaleza y la cultura se encuentran.</p>
          </div>
          <div className="feature-item glass">
            <h3>🔒 Reserva Segura</h3>
            <p>Nuestra plataforma garantiza el mejor precio y total seguridad en tus transacciones.</p>
          </div>
          <div className="feature-item glass">
            <h3>🎧 Soporte 24/7</h3>
            <p>Un equipo de expertos siempre listo para ayudarte en cada paso de tu viaje.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
