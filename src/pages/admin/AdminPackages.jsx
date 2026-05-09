import { useState, useEffect } from 'react';
import './css/AdminPackages.css';
import api from '../../http-common';
import { Package, MapPin, DollarSign, Calendar, Users, Plane, Sun, Compass, AlignLeft, ListChecks, FileText, AlertTriangle, Activity, Eye } from 'lucide-react';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    price: 0,
    totalSlots: 0,
    includedServices: [],
    conditions: '',
    restrictions: '',
    tripType: 'NACIONAL',
    season: 'ALTA',
    category: 'AVENTURA',
    status: 'DISPONIBLE',
    isVisible: true
  });

  const availableServices = [
    'VUELOS', 'HOTEL', 'TRASLADOS', 'EXCURSIONES', 'SEGURO_MEDICO', 'ALIMENTACION', 'ASISTENCIA_GUIA'
  ];

  const seasons = ['ALTA', 'BAJA', 'VERANO', 'INVIERNO', 'OTOÑO', 'PRIMAVERA'];
  const categories = ['AVENTURA', 'RELAX', 'CULTURAL', 'FAMILIAR', 'ROMANTICO', 'NEGOCIOS', 'DEPORTIVO'];
  const tripTypes = ['NACIONAL', 'INTERNACIONAL'];
  const statuses = ['DISPONIBLE', 'AGOTADO', 'NO_VIGENTE', 'CANCELADO'];

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await api.get('/api/packages');
      setPackages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      name: '', destination: '', description: '', startDate: '', endDate: '',
      price: 0, totalSlots: 0, includedServices: [], conditions: '',
      restrictions: '', tripType: 'NACIONAL', season: 'ALTA',
      category: 'AVENTURA', status: 'DISPONIBLE', isVisible: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setIsEditing(true);
    setCurrentId(pkg.id);
    setFormData({
      ...pkg,
      startDate: pkg.startDate.substring(0, 10), // Ensure format YYYY-MM-DD
      endDate: pkg.endDate.substring(0, 10)
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (name === 'isVisible' ? checked : formData.includedServices) : value
    });
  };

  const handleServiceChange = (service) => {
    const updatedServices = formData.includedServices.includes(service)
      ? formData.includedServices.filter(s => s !== service)
      : [...formData.includedServices, service];
    setFormData({ ...formData, includedServices: updatedServices });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate.includes('T') ? formData.startDate : formData.startDate + 'T00:00:00',
        endDate: formData.endDate.includes('T') ? formData.endDate : formData.endDate + 'T00:00:00'
      };

      if (isEditing) {
        await api.put(`/api/packages/${currentId}`, payload);
      } else {
        await api.post('/api/packages', payload);
      }

      alert(isEditing ? '¡Paquete actualizado!' : '¡Paquete creado!');
      setIsModalOpen(false);
      fetchPackages();
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || 'Error de conexión con el servidor';
      alert(`Error: ${message}`);
    }
  };

  return (
    <div className="admin-packages fade-in-up">
      <div className="admin-header">
        <h1>Administración de <span className="text-gradient">Catálogo</span></h1>
        <button className="button button-primary" onClick={handleOpenCreate}>
          Nuevo Paquete
        </button>
      </div>

      {loading ? (
        <p>Cargando catálogo...</p>
      ) : (
        <div className="packages-table-container">
          <table className="packages-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Destino</th>
                <th>Precio</th>
                <th>Cupos (Disp/Total)</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id}>
                  <td>{pkg.name}</td>
                  <td>{pkg.destination}</td>
                  <td>${pkg.price.toLocaleString('es-CL')}</td>
                  <td>{pkg.availableSlots} / {pkg.totalSlots}</td>
                  <td>
                    <span className={`status-badge status-${pkg.status.toLowerCase()}`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td>
                    <button className="button button-secondary" onClick={() => handleOpenEdit(pkg)}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay fade-in">
          <div className="modal-content glass-card" style={{ maxWidth: '900px', background: 'rgba(255, 255, 255, 0.95)', color: '#0f172a' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1e293b' }}>{isEditing ? 'Editar' : 'Crear'} <span className="text-gradient">Paquete Turístico</span></h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><Package size={16} /> Nombre del Paquete</label>
                  <input className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} name="name" value={formData.name} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><MapPin size={16} /> Destino</label>
                  <input className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} name="destination" value={formData.destination} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><DollarSign size={16} /> Precio (CLP)</label>
                  <input className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><Calendar size={16} /> Fecha de Inicio</label>
                  <input className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><Calendar size={16} /> Fecha de Término</label>
                  <input className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><Users size={16} /> Cupos Totales</label>
                  <input className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} type="number" name="totalSlots" value={formData.totalSlots} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><Plane size={16} /> Tipo de Viaje</label>
                  <select className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} name="tripType" value={formData.tripType} onChange={handleInputChange}>
                    {tripTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><Sun size={16} /> Temporada</label>
                  <select className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} name="season" value={formData.season} onChange={handleInputChange}>
                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><Compass size={16} /> Categoría</label>
                  <select className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><AlignLeft size={16} /> Descripción detallada</label>
                  <textarea className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} name="description" value={formData.description} onChange={handleInputChange} required rows="3"></textarea>
                </div>

                <div className="form-group full-width" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><ListChecks size={16} /> Servicios Incluidos</label>
                  <div className="services-selection" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {availableServices.map(service => (
                      <label key={service} className="service-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#334155', fontWeight: '500' }}>
                        <input
                          type="checkbox"
                          style={{ transform: 'scale(1.2)' }}
                          checked={formData.includedServices.includes(service)}
                          onChange={() => handleServiceChange(service)}
                        />
                        {service.replace('_', ' ')}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><FileText size={16} /> Condiciones</label>
                  <input className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} name="conditions" value={formData.conditions} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><AlertTriangle size={16} /> Restricciones</label>
                  <input className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} name="restrictions" value={formData.restrictions} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}><Activity size={16} /> Estado</label>
                  <select className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }} name="status" value={formData.status} onChange={handleInputChange}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group service-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                  <input type="checkbox" style={{ transform: 'scale(1.5)', cursor: 'pointer' }} name="isVisible" checked={formData.isVisible} onChange={handleInputChange} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: '#1e293b', margin: 0 }}><Eye size={16} /> Visible al Cliente</label>
                </div>
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                <button type="button" className="button button-outline" style={{ color: '#475569', borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="button button-primary">{isEditing ? 'Guardar Cambios' : 'Crear Paquete'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
