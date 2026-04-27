import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../http-common';
import { Plus, Edit2, Trash2, ArrowLeft, Tag, Calendar, Percent } from 'lucide-react';
import './css/AdminPromotions.css';

const AdminPromotions = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    startDate: '',
    endDate: '',
    discountPercentage: '',
    isActive: true
  });
  const [modalMode, setModalMode] = useState('CREATE'); // CREATE or EDIT
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPromotions = () => {
    setLoading(true);
    api.get('/api/promotions')
      .then(res => setPromotions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const openCreateModal = () => {
    setModalMode('CREATE');
    setFormData({ id: null, name: '', startDate: '', endDate: '', discountPercentage: '', isActive: true });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    setModalMode('EDIT');
    setFormData({
      id: promo.id,
      name: promo.name,
      startDate: promo.startDate ? promo.startDate.substring(0, 16) : '', // 'YYYY-MM-DDTHH:mm'
      endDate: promo.endDate ? promo.endDate.substring(0, 16) : '',
      discountPercentage: promo.discountPercentage,
      isActive: promo.isActive
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'CREATE') {
        await api.post('/api/promotions', formData);
      } else {
        await api.put(`/api/promotions/${formData.id}`, formData);
      }
      closeModal();
      fetchPromotions();
    } catch (err) {
      setErrorMsg(err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas desactivar lógicamente (eliminar) esta promoción? Esto no borrará la fila de la base de datos, pero la inactivará.")) return;
    try {
      await api.delete(`/api/promotions/${id}`);
      fetchPromotions();
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  return (
    <div className="admin-promotions-page container fade-in-up">
      <button className="button button-outline back-btn" onClick={() => navigate('/admin/discounts')} style={{marginBottom: '1rem', marginTop:'2rem'}}>
        <ArrowLeft size={16} /> Volver a Configuración de Descuentos
      </button>

      <div className="admin-header">
        <h1>Ofertas y <span className="text-gradient">Promociones Temporales</span></h1>
        <p>Administra eventos especiales como Black Friday, Cyber Monday, o campañas festivas.</p>
      </div>

      <div className="actions-bar" style={{marginBottom: '2rem'}}>
        <button className="button button-primary huge-btn bounce-on-hover" onClick={openCreateModal}>
          <Plus size={20} /> Registrar Nueva Promoción
        </button>
      </div>

      {loading ? (
        <div style={{textAlign:'center', padding:'3rem'}}>Cargando bóveda promocional...</div>
      ) : (
        <div className="table-responsive glass-card" style={{padding: '0'}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre de Campaña</th>
                <th>Descuento Fijo</th>
                <th>Ventana de Vigencia</th>
                <th>Estado del Motor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promo => (
                <tr key={promo.id}>
                  <td><strong>#{promo.id}</strong></td>
                  <td>{promo.name}</td>
                  <td><span style={{color: '#10b981', fontWeight:'bold'}}>{promo.discountPercentage}% OFF</span></td>
                  <td>
                    <small>Desde: {promo.startDate?.substring(0,10).split('-').reverse().join('-')} {promo.startDate?.substring(11,16)}</small><br/>
                    <small>Hasta: {promo.endDate?.substring(0,10).split('-').reverse().join('-')} {promo.endDate?.substring(11,16)}</small>
                  </td>
                  <td>
                    <span className={`status-badge ${promo.isActive ? 'disponible' : 'agotado'}`}>
                      {promo.isActive ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cluster">
                      <button className="icon-btn btn-view" onClick={() => openEditModal(promo)} title="Editar Promoción">
                        <Edit2 size={18} />
                      </button>
                      <button className="icon-btn btn-cancel" onClick={() => handleDelete(promo.id)} title="Desactivar (Soft Delete)">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>No hay promociones registradas en el sistema.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay fade-in">
          <div className="modal-content glass-card">
            <h2 style={{marginTop:0, marginBottom:'1.5rem', color:'#1e293b'}}>{modalMode === 'CREATE' ? 'Registrar Promoción' : 'Editar Promoción'}</h2>
            <form onSubmit={handleSave} className="promo-form">
              <div className="form-group" style={{marginBottom:'1.5rem'}}>
                <label style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', fontWeight:'600'}}><Tag size={16}/> Nombre Comercial de la Oferta</label>
                <input type="text" className="form-input" style={{width:'100%', padding:'0.8rem', borderRadius:'8px'}} required placeholder="Ej. CyberDay Chile" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="form-group row-group" style={{display:'flex', gap:'1rem', marginBottom:'1.5rem'}}>
                <div style={{flex:1}}>
                  <label style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', fontWeight:'600'}}><Calendar size={16}/> Fecha y Hora de Inicio</label>
                  <input type="datetime-local" className="form-input" style={{width:'100%', padding:'0.8rem', borderRadius:'8px'}} required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div style={{flex:1}}>
                  <label style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', fontWeight:'600'}}><Calendar size={16}/> Fecha y Hora de Término</label>
                  <input type="datetime-local" className="form-input" style={{width:'100%', padding:'0.8rem', borderRadius:'8px'}} required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>

              <div className="form-group row-group" style={{display:'flex', gap:'1rem', alignItems:'center', marginBottom:'1.5rem'}}>
                <div style={{flex:1}}>
                  <label style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', fontWeight:'600'}}><Percent size={16}/> Porcentaje de Descuento</label>
                  <input type="number" step="0.1" min="1" max="100" className="form-input" style={{width:'100%', padding:'0.8rem', borderRadius:'8px'}} required value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: e.target.value})} />
                </div>
                {modalMode === 'EDIT' && (
                  <div style={{flex:1, display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'1.5rem'}}>
                    <input type="checkbox" style={{transform:'scale(1.5)', cursor:'pointer'}} checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                    <label style={{fontWeight:'600'}}>Promoción Activa</label>
                  </div>
                )}
              </div>

              {errorMsg && <div style={{color:'#dc2626', marginBottom:'1.5rem', padding:'1rem', background:'#fee2e2', borderRadius:'8px'}}>{errorMsg}</div>}

              <div className="modal-actions" style={{display:'flex', gap:'1rem', justifyContent:'flex-end', marginTop:'2rem'}}>
                <button type="button" className="button button-outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="button button-primary">{modalMode === 'CREATE' ? 'Crear Promoción' : 'Guardar Cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPromotions;
