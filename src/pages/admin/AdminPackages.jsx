import { useState, useEffect } from 'react';
import './css/AdminPackages.css';
import api from '../../http-common';

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

  const seasons = ['ALTA', 'BAJA', 'VERANO', 'INVIERNO', 'OTONO', 'PRIMAVERA'];
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
      startDate: pkg.startDate.substring(0, 10), // Asegurar formato YYYY-MM-DD
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
        <div className="modal-overlay">
          <div className="modal-content glass fade-in">
            <h2>{isEditing ? 'Editar' : 'Crear'} <span className="text-gradient">Paquete</span></h2>
            <form onSubmit={handleSubmit} className="admin-form">
              {/* Mismo contenido del formulario anterior ... */}
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre del Paquete</label>
                  <input className="form-input" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Destino</label>
                  <input className="form-input" name="destination" value={formData.destination} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Precio (CLP)</label>
                  <input className="form-input" type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input className="form-input" type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Fecha de Término</label>
                  <input className="form-input" type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Cupos Totales</label>
                  <input className="form-input" type="number" name="totalSlots" value={formData.totalSlots} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label>Tipo de Viaje</label>
                  <select className="form-input" name="tripType" value={formData.tripType} onChange={handleInputChange}>
                    {tripTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Temporada</label>
                  <select className="form-input" name="season" value={formData.season} onChange={handleInputChange}>
                    {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <select className="form-input" name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Descripción detallada</label>
                  <textarea className="form-input" name="description" value={formData.description} onChange={handleInputChange} required rows="3"></textarea>
                </div>

                <div className="form-group full-width">
                  <label>Servicios Incluidos</label>
                  <div className="services-selection">
                    {availableServices.map(service => (
                      <label key={service} className="service-item">
                        <input
                          type="checkbox"
                          checked={formData.includedServices.includes(service)}
                          onChange={() => handleServiceChange(service)}
                        />
                        {service.replace('_', ' ')}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Condiciones</label>
                  <input className="form-input" name="conditions" value={formData.conditions} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Restricciones</label>
                  <input className="form-input" name="restrictions" value={formData.restrictions} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select className="form-input" name="status" value={formData.status} onChange={handleInputChange}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group service-item">
                  <label>Visible al Cliente</label>
                  <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleInputChange} />
                </div>
              </div>

              <div className="button-group">
                <button type="button" className="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="button button-primary">Guardar Paquete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
