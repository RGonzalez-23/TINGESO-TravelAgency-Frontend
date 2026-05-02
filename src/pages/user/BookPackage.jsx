import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import api from '../../http-common';
import { ArrowLeft, Users, FileText, HeartHandshake } from 'lucide-react';
import './css/BookPackage.css';

const BookPackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [passengersCount, setPassengersCount] = useState(1);
  const [passengers, setPassengers] = useState([{ fullName: '', age: '', needsAssistance: false, assistanceDetails: '' }]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);

  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    api.get(`/api/packages/${id}`).then(res => setPkg(res.data)).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (initialized && keycloak?.authenticated) {
      const token = keycloak.tokenParsed;
      // Keycloak saves standard firstName as given_name, and custom attributes directly un-nested if configured or under custom claims
      const firstName = token.given_name || token.preferred_username;
      const firstLastName = token.first_last_name || "";
      const secondLastName = token.second_last_name || "";

      // Assemble the full name based on the custom attributes you specified
      let fullName = `${firstName} ${firstLastName} ${secondLastName}`.trim().replace(/\s+/g, ' ');

      // Fallback just in case those attributes don't exist
      if (!fullName) {
        fullName = token?.name || token?.preferred_username || '';
      }

      setPassengers(prev => {
        const newArr = [...prev];
        // Only auto-fill if it's completely empty during initialization
        if (!newArr[0].fullName && fullName) {
          newArr[0].fullName = fullName;
        }
        return newArr;
      });
    }
  }, [initialized, keycloak]);

  const handlePassengerCountChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    setPassengersCount(count);
    setPassengers(prev => {
      const newArr = [...prev];
      if (count > newArr.length) {
        for (let i = newArr.length; i < count; i++) newArr.push({ fullName: '', age: '', needsAssistance: false, assistanceDetails: '' });
      } else if (count < newArr.length) {
        newArr.length = count;
      }
      return newArr;
    });
  };

  const handlePassengerChange = (index, field, value) => {
    const newArr = [...passengers];
    newArr[index][field] = value;
    setPassengers(newArr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { tourPackageId: id, passengersCount, passengers, specialRequests, preferences };
      const response = await api.post('/api/reservations', payload);
      // Navigate to Checkout passing the full reservation ticket (which includes the calculated discounts)
      navigate(`/checkout/${response.data.id}`, { state: { reservation: response.data } });
    } catch (err) {
      alert(err.response?.data || "Error al crear reserva");
      setLoading(false);
    }
  };

  if (!pkg) return <div className="container" style={{ padding: '5rem' }}>Cargando...</div>;

  return (
    <div className="book-package-container container fade-in-up">
      <button className="button button-outline back-btn" onClick={() => navigate(`/packages/${id}`)}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="book-header">
        <h1 className="gradient-text">Configurar Reserva</h1>
        <p>Estás a punto de embarcarte en: <strong>{pkg.name}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="book-form glass-card">
        <div className="form-group row-group">
          <label><Users size={18} /> Cantidad de Pasajeros (Max {pkg.availableSlots})</label>
          <input type="number" min="1" max={pkg.availableSlots} value={passengersCount} onChange={handlePassengerCountChange} required className="pass-input" />
        </div>

        <div className="passengers-list">
          {passengers.map((p, i) => (
            <div key={i} className="passenger-card">
              <h4>{i === 0 ? 'Titular de la Reserva' : `Acompañante #${i}`}</h4>
              <div className="input-grid">
                <input type="text" placeholder="Nombre completo" value={p.fullName} onChange={e => handlePassengerChange(i, 'fullName', e.target.value)} required />
                <input type="number" placeholder="Edad" value={p.age} onChange={e => handlePassengerChange(i, 'age', e.target.value)} required min="0" />
              </div>
              <div className="assistance-toggle">
                <label>
                  <input type="checkbox" checked={p.needsAssistance} onChange={e => handlePassengerChange(i, 'needsAssistance', e.target.checked)} />
                  ¿Requiere Asistencia Especial?
                </label>
              </div>
              {p.needsAssistance && (
                <textarea placeholder="Describe qué asistencia requiere (Silla de ruedas, médico, etc)..." value={p.assistanceDetails} onChange={e => handlePassengerChange(i, 'assistanceDetails', e.target.value)} required />
              )}
            </div>
          ))}
        </div>

        <div className="extra-info-section">
          <label><FileText size={18} /> Solicitudes Especiales (Opcional)</label>
          <textarea placeholder="Dietas, alergias, requerimientos de ubicación..." value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} />

          <label><HeartHandshake size={18} /> Preferencias del Cliente (Opcional)</label>
          <textarea placeholder="Cama matrimonial, piso alto, vistas..." value={preferences} onChange={e => setPreferences(e.target.value)} />
        </div>

        <button type="submit" disabled={loading} className="button button-primary huge-btn bounce-on-hover">
          {loading ? 'Procesando y Calculando Descuentos...' : 'Ir a Pagar Orden'}
        </button>
      </form>
    </div>
  );
};
export default BookPackage;
