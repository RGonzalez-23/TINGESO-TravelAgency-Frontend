import { useEffect, useState } from 'react';
import api from '../../http-common';
import { Ticket, CheckCircle2, XCircle, Clock } from 'lucide-react';
import './css/MyReservations.css';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchMyReservations = () => {
    setLoading(true);
    api.get('/api/reservations/me')
      .then(res => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const handleConfirm = async (id) => {
    try {
      await api.put(`/api/reservations/${id}/status`, { newStatus: 'CONFIRMADA' });
      fetchMyReservations();
    } catch (err) {
      alert("Error al confirmar: " + (err.response?.data || err.message));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAGADA': return <CheckCircle2 className="status-icon success" />;
      case 'CANCELADA': return <XCircle className="status-icon error" />;
      case 'PENDIENTE': return <Clock className="status-icon pending" />;
      case 'CONFIRMADA': return <Ticket className="status-icon neutral" />;
      default: return <Ticket className="status-icon neutral" />;
    }
  };

  if (loading) return <div className="container" style={{ padding: '5rem' }}>Cargando historial de reservas...</div>;

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
            <div key={res.id} className="reservation-card glass-card" style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === res.id ? null : res.id)}>
              <div className="card-header">
                <h3>{res.packageName}</h3>
                <span className={`status-badge ${res.status.toLowerCase()}`}>
                  {getStatusIcon(res.status)} {res.status}
                </span>
              </div>

              <div className="card-body">
                <p><strong>ID Reserva:</strong> #{res.id}</p>
                <p><strong>Fecha Reserva:</strong> {new Date(res.createdAt).toLocaleString('es-CL')}</p>
                <p><strong>Pasajeros:</strong> {res.passengersCount}</p>

                {expandedId === res.id && (
                  <div className="expanded-details fade-in-up" style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.4)', padding: '1rem', borderRadius: '12px' }}>
                    <hr style={{ margin: '0.5rem 0', borderColor: 'rgba(0,0,0,0.1)' }} />
                    <p><strong>Destino:</strong> {res.destination}</p>
                    <p><strong>Inicio Tramo:</strong> {res.startDate?.substring(0, 10).split('-').reverse().join('-')}</p>
                    <p><strong>Fin Tramo:</strong> {res.endDate?.substring(0, 10).split('-').reverse().join('-')}</p>

                    <h5 style={{ marginTop: '1rem', color: '#334155' }}>Pasajeros Registrados:</h5>
                    <ul style={{ fontSize: '0.9rem', color: '#475569', paddingLeft: '1.2rem' }}>
                      {res.passengers?.map((p, idx) => (
                        <li key={idx}>
                          {p.fullName} ({p.age} años) {p.needsAssistance && <span style={{ color: '#d97706' }}> - Asistencia Especial Requerida</span>}
                        </li>
                      ))}
                    </ul>

                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {res.status === 'PAGADA' && (
                        <button className="button button-primary" onClick={(e) => { e.stopPropagation(); handleConfirm(res.id); }}>
                          Confirmar Mi Viaje
                        </button>
                      )}
                      {(res.status === 'PAGADA' || res.status === 'CONFIRMADA') && (
                        <button className="button button-outline" style={{ color: '#2563eb', backgroundColor: '#ffffffff' }} onClick={(e) => { e.stopPropagation(); window.open(`/receipt/${res.id}`, '_blank'); }}>
                          Descargar Comprobante
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="prices-box" style={{ marginTop: '1.5rem' }}>
                  <div className="price-item" style={{ color: '#0f172a' }}>
                    <span>Monto Original:</span>
                    <span>${res.totalAmount.toLocaleString('es-CL')}</span>
                  </div>
                  {res.discountPercentage > 0 && (
                    <div className="price-item discount" style={{ color: '#0f172a' }}>
                      <span>Descuento Aplicado ({res.discountPercentage}%):<br /><small>{res.appliedDiscountsDetails}</small></span>
                      <span>-${(res.totalAmount - res.finalAmount).toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  <div className="price-item final">
                    <span>Monto Final Cancelado:</span>
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
