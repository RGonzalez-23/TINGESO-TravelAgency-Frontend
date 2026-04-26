import { useEffect, useState } from 'react';
import api from '../../http-common';
import { Ticket, CheckCircle2, XCircle, Clock } from 'lucide-react';
import './css/MyReservations.css';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/reservations/me')
      .then(res => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAGADA': return <CheckCircle2 className="status-icon success" />;
      case 'CANCELADA': return <XCircle className="status-icon error" />;
      case 'PENDIENTE': return <Clock className="status-icon pending" />;
      default: return <Ticket className="status-icon neutral" />;
    }
  };

  if (loading) return <div className="container" style={{padding:'5rem'}}>Cargando historial de reservas...</div>;

  return (
    <div className="reservations-container container fade-in-up">
      <div className="reservations-header">
        <h1 className="gradient-text">Mis Viajes y Reservas</h1>
        <p>Tu historial completo. Si tienes 3 o más reservas PAGADAS serás considerado Cliente Frecuente VIP automáticamente.</p>
      </div>

      {reservations.length === 0 ? (
        <div className="empty-state glass-card">
          <Ticket size={48} className="text-muted" />
          <h3>No tienes reservas aún</h3>
          <p>Explora nuestros paquetes turísticos y comienza tu aventura.</p>
        </div>
      ) : (
        <div className="reservations-grid">
          {reservations.map(res => (
            <div key={res.id} className="reservation-card glass-card">
              <div className="card-header">
                <h3>{res.packageName}</h3>
                <span className={`status-badge ${res.status.toLowerCase()}`}>
                  {getStatusIcon(res.status)} {res.status}
                </span>
              </div>
              
              <div className="card-body">
                <p><strong>Fecha Reserva:</strong> {new Date(res.createdAt).toLocaleString('es-CL')}</p>
                <p><strong>Pasajeros:</strong> {res.passengersCount}</p>
                
                <div className="prices-box">
                  <div className="price-item">
                    <span>Costo Original:</span>
                    <span>${res.totalAmount.toLocaleString('es-CL')}</span>
                  </div>
                  {res.discountPercentage > 0 && (
                    <div className="price-item discount">
                      <span>Descuento Aplicado ({res.discountPercentage}%):<br/><small>{res.appliedDiscountsDetails}</small></span>
                      <span>- ${(res.totalAmount - res.finalAmount).toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  <div className="price-item final">
                    <span>Costo Final Pagado:</span>
                    <span>${res.finalAmount.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyReservations;
