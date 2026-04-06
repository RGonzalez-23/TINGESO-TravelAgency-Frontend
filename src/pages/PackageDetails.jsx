import { useParams, useNavigate } from 'react-router-dom';
import { PACKAGES } from '../data/mockData';
import { MapPin, Calendar, Users, Star, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './PackageDetails.css';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const pkg = PACKAGES.find(p => p.id === parseInt(id));

  if (!pkg) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Paquete no encontrado</h2>
        <button className="button button-primary mt-4" onClick={() => navigate('/packages')}>Volver a Paquetes</button>
      </div>
    );
  }

  return (
    <div className="package-details container fade-in-up">
      <button className="button button-outline back-btn" onClick={() => navigate('/packages')}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="details-header">
        <h1 className="details-title">{pkg.title}</h1>
        <div className="details-rating">
          <Star className="star-icon" size={20} fill="currentColor" />
          <span>{pkg.rating} Excelente</span>
        </div>
      </div>

      <div className="details-gallery">
        <img src={pkg.imageUrl} alt={pkg.title} className="main-image glass" />
      </div>

      <div className="details-content-grid">
        <div className="details-main text-muted">
          <h2>Descripción</h2>
          <p>{pkg.description}</p>
          <br/>
          <p>
            Prepárate para una aventura inolvidable con nuestro paquete de {pkg.duration}. Explorarás {pkg.destination} 
            disfrutando de las comodidades y lujos que solo nosotros ofrecemos. Este es el paquete perfecto 
            para quienes buscan desconectar y sumergirse en una nueva cultura y paisajes deslumbrantes.
          </p>

          <div className="includes-section">
            <h3>¿Qué está incluido?</h3>
            <ul className="includes-list">
              <li><CheckCircle2 size={18} className="check-icon" /> Vuelos de ida y vuelta</li>
              <li><CheckCircle2 size={18} className="check-icon" /> Alojamiento de {pkg.rating > 4.5 ? '5' : '4'} estrellas</li>
              <li><CheckCircle2 size={18} className="check-icon" /> Traslados aeropuerto-hotel</li>
              <li><CheckCircle2 size={18} className="check-icon" /> Desayunos diarios</li>
              <li><CheckCircle2 size={18} className="check-icon" /> Seguro de viaje premium</li>
            </ul>
          </div>
        </div>

        <div className="details-booking">
          <div className="booking-card glass">
            <div className="booking-price">
              <h3>{pkg.price} €</h3>
              <span>por persona</span>
            </div>
            
            <div className="booking-features">
              <div className="feature-row">
                <MapPin size={18} className="text-muted" />
                <span>{pkg.destination}</span>
              </div>
              <div className="feature-row">
                <Calendar size={18} className="text-muted" />
                <span>{pkg.duration}</span>
              </div>
              <div className="feature-row">
                <Users size={18} className="text-muted" />
                <span>Mín. {pkg.people} Personas</span>
              </div>
            </div>

            <button className="button button-primary w-full pulse-animation">
              Reservar Ahora
            </button>
            <p className="booking-note">No se cobrará nada en este momento. Conexión futura con API Java Spring Boot.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
