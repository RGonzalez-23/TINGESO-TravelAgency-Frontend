import { useEffect, useState } from 'react';
import api from '../../http-common';
import { Search, Eye, XCircle, CheckCircle, Clock, TicketCheck, ClockAlert } from 'lucide-react';
import './css/AdminReservations.css';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReservations = () => {
    setLoading(true);
    api.get('/api/reservations/all')
      .then(res => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`¿Seguro que deseas cambiar el estado de la reserva #${id} a ${newStatus}?`)) return;
    try {
      await api.put(`/api/reservations/${id}/status`, { newStatus });
      fetchReservations();
    } catch (err) {
      alert("Error al actualizar la reserva. Asegurate que no rompe las reglas de negocio. Detalles: " + (err.response?.data || err.message));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAGADA': return <CheckCircle className="status-icon success" size={16} />;
      case 'EXPIRADA': return <ClockAlert className="status-icon expired" size={16} />;
      case 'CONFIRMADA': return <TicketCheck className="status-icon success" size={16} />;
      case 'CANCELADA': return <XCircle className="status-icon error" size={16} />;
      case 'PENDIENTE': return <Clock className="status-icon pending" size={16} />;
      default: return null;
    }
  };

  const filteredReservations = reservations.filter(r => {
    const matchName = r.passengers?.some(p => p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchId = r.id.toString() === searchTerm;
    const matchStatus = r.status.toLowerCase().includes(searchTerm.toLowerCase());
    return matchName || matchId || matchStatus || searchTerm === '';
  });

  return (
    <div className="admin-reservations-page container fade-in-up">
      <div className="admin-header">
        <h1>Gestión de <span className="text-gradient">Reservas</span></h1>
        <p>Busca, analiza y gestiona todas las operaciones registradas en el sistema.</p>
      </div>

      <div className="search-bar glass glass-card" style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', padding: '1rem 1.5rem' }}>
        <Search size={20} className="search-icon" style={{ marginRight: '1rem', color: '#64748b' }} />
        <input
          type="text"
          placeholder="Buscar por ID, Estado, o Nombre de Cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>Cargando bóveda de reservas...</div>
      ) : (
        <div className="table-responsive glass-card" style={{ padding: '0' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente Titular</th>
                <th>Paquete</th>
                <th>Monto Final</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length > 0 ? filteredReservations.map(res => (
                <tr key={res.id}>
                  <td><strong>#{res.id}</strong></td>
                  <td>
                    {res.passengers && res.passengers[0] ? res.passengers[0].fullName : res.keycloakUserId.substring(0, 8) + '...'}
                    <br /><small style={{ color: '#2563eb' }}>{res.passengersCount} ocupantes</small>
                  </td>
                  <td>{res.packageName}</td>
                  <td>${res.finalAmount.toLocaleString('es-CL')}</td>
                  <td>
                    <span className={`status-badge ${res.status.toLowerCase()}`}>
                      {getStatusIcon(res.status)} {res.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cluster">
                      <button className="icon-btn btn-view" title="Ver Voucher" onClick={() => window.open(`/receipt/${res.id}`, '_blank')}>
                        <Eye size={18} />
                      </button>
                      <button className="icon-btn btn-confirm" title="Forzar a Confirmada" onClick={() => handleUpdateStatus(res.id, 'CONFIRMADA')}>
                        <CheckCircle size={18} />
                      </button>
                      <button className="icon-btn btn-cancel" title="Cancelar Forzadamente" onClick={() => handleUpdateStatus(res.id, 'CANCELADA')}>
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron reservas con ese criterio.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AdminReservations;
