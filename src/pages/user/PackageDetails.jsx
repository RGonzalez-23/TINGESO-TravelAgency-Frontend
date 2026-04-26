import { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Star, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../http-common';
import './css/PackageDetails.css';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageDetail = async () => {
      try {
        const response = await api.get(`/api/packages/${id}`);
        setPkg(response.data);
      } catch (error) {
        console.error("Error connecting to backend", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackageDetail();
  }, [id]);

  if (loading) {
    return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}><h3>Cargando información del paquete en tiempo real...</h3></div>;
  }

  if (!pkg) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Paquete no encontrado</h2>
        <button className="button button-primary mt-4" onClick={() => navigate('/packages')}>Volver a Paquetes</button>
      </div>
    );
  }

  const isSoldOut = pkg.status === 'AGOTADO';

  const handleReserve = () => {
    if (!keycloak?.authenticated) {
      alert('Debe iniciar sesión para continuar con su reserva');
      keycloak?.login();
      return;
    }
    const tokenRoles = keycloak?.tokenParsed?.realm_access?.roles || [];
    if (tokenRoles.includes('CLIENTE')) {
      navigate(`/packages/${id}/book`);
      return;
    }
    alert('Solo usuarios con rol CLIENTE pueden reservar.');
  };

  return (
    <div className="package-details container fade-in-up" style={{ marginTop: '5rem' }}>
      <button className="button button-outline back-btn" onClick={() => navigate('/packages')}>
        <ArrowLeft size={16} /> Volver a Búsqueda
      </button>

      <div className="details-header">
        <h1 className="details-title">{pkg.name}</h1>
        <div className="details-rating">
          <Star className="star-icon" size={20} fill="currentColor" />
          <span>4.9 Excelente</span>
          {isSoldOut && (
            <span style={{ marginLeft: '1rem', background: '#dc3545', color: '#fff', padding: '0.2rem 0.8rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              AGOTADO
            </span>
          )}
        </div>
      </div>

      <div className="details-gallery">
        <img src={`https://source.unsplash.com/1200x600/?${pkg.destination.replace(' ', '+')}`} alt={pkg.name} className="main-image glass" style={{ opacity: isSoldOut ? 0.7 : 1 }} />
      </div>

      <div className="details-content-grid">
        <div className="details-main text-muted">
          <h2>Descripción y Detalles de la Experiencia</h2>
          <p>{pkg.description}</p>
          <br />
          <p>
            Prepárate para una aventura inolvidable. Explorarás <strong>{pkg.destination}</strong> ({pkg.tripType})
            dentro de la categoría <strong>{pkg.category}</strong> durante la temporada <strong>{pkg.season}</strong>.
            Nuestro itinerario base comienza el <strong>{pkg.startDate.substring(0, 10)}</strong> y culmina el <strong>{pkg.endDate.substring(0, 10)}</strong>.
          </p>

          <div className="includes-section">
            <h3>¿Qué está incluido?</h3>
            <ul className="includes-list">
              {pkg.includedServices && pkg.includedServices.length > 0 ? (
                pkg.includedServices.map((service, index) => (
                  <li key={index}><CheckCircle2 size={18} className="check-icon" /> {service.replace('_', ' ')}</li>
                ))
              ) : (
                <li>No hay servicios detallados aún.</li>
              )}
            </ul>
          </div>

          <div className="restrictions-section" style={{ marginTop: '2rem', background: 'rgba(255, 165, 0, 0.1)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid orange' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'orange' }}><AlertTriangle size={20} /> Restricciones e Información Vital</h3>
            <p style={{ marginTop: '0.5rem' }}><strong>Condiciones: </strong>{pkg.conditions || 'Ninguna condición especial.'}</p>
            <p><strong>Restricciones: </strong>{pkg.restrictions || 'Ninguna restricción reportada.'}</p>
          </div>
        </div>

        <div className="details-booking">
          <div className="booking-card glass">
            <div className="booking-price">
              <h3>${pkg.price.toLocaleString('es-CL')} CLP</h3>
              <span>por persona (Precio Vigente)</span>
            </div>

            <div className="booking-features">
              <div className="feature-row">
                <MapPin size={18} className="text-muted" />
                <span>{pkg.destination}</span>
              </div>
              <div className="feature-row">
                <Calendar size={18} className="text-muted" />
                <span>{pkg.durationDays} Días Totales</span>
              </div>
              <div className="feature-row">
                <Users size={18} className="text-muted" />
                <span>
                  Cupos Disponibles: {pkg.availableSlots} / {pkg.totalSlots}
                </span>
              </div>
            </div>

            <button
              className={`button w-full ${isSoldOut ? 'button-secondary' : 'button-primary pulse-animation'}`}
              disabled={isSoldOut}
              onClick={handleReserve}
            >
              {isSoldOut ? 'No Disponible para Reservar' : 'Reservar Ahora'}
            </button>
            <p className="booking-note">Datos actualizados al segundo exacto según la central de disponibilidad.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetails;
