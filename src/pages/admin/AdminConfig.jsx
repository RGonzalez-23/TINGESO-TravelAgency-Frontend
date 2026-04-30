import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../http-common';
import { Settings, Save, Megaphone } from 'lucide-react';
import './css/AdminConfig.css';

const AdminConfig = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/api/admin/discount-config')
            .then(res => setConfig(res.data))
            .catch(console.error);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put('/api/admin/discount-config', config);
            alert('Configuración guardada exitosamente');
        } catch (err) {
            alert('Error guardando configuración');
        } finally {
            setLoading(false);
        }
    };

    if (!config) return <div className="container" style={{ padding: '5rem' }}>Cargando motor de descuentos...</div>;

    return (
        <div className="admin-config-container container fade-in-up">
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Settings size={32} className="header-icon" />
                    <h1>Motor de Descuentos</h1>
                    <p>Las reglas que alteres aquí entrarán en vigencia inmediatamente para la siguiente compra.</p>
                </div>
                <button className="button button-outline bounce-on-hover" onClick={() => navigate('/admin/promotions')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#2563eb' }}>
                    <Megaphone size={18} /> Gestionar Promociones Temporales
                </button>
            </div>

            <div className="config-form glass-card">
                <div className="config-grid">

                    <div className="config-card">
                        <h3>Descuento Grupal</h3>
                        <label>Mínimo de Pasajeros</label>
                        <input type="number" name="groupMinPassengers" value={config.groupMinPassengers} onChange={handleChange} />
                        <label>% de Descuento</label>
                        <input type="number" max="100" name="groupDiscountPercentage" value={config.groupDiscountPercentage} onChange={handleChange} />
                    </div>

                    <div className="config-card">
                        <h3>Cliente Frecuente</h3>
                        <label>Reservas Pagadas Exigidas</label>
                        <input type="number" name="frequentClientMinReservations" value={config.frequentClientMinReservations} onChange={handleChange} />
                        <label>% de Descuento VIP</label>
                        <input type="number" max="100" name="frequentClientDiscountPercentage" value={config.frequentClientDiscountPercentage} onChange={handleChange} />
                    </div>

                    <div className="config-card">
                        <h3>Múltiples Compras</h3>
                        <label>Ventana de Tiempo (Días)</label>
                        <input type="number" name="multiPackageDaysWindow" value={config.multiPackageDaysWindow} onChange={handleChange} />
                        <label>% Extra Multicompra</label>
                        <input type="number" max="100" name="multiPackageDiscountPercentage" value={config.multiPackageDiscountPercentage} onChange={handleChange} />
                    </div>

                    <div className="config-card featured-card">
                        <h3>Configuraciones Globales</h3>
                        <label>Porcentaje Máximo de Descuento sobre el Monto Total (%)</label>
                        <input type="number" max="100" name="maxGlobalDiscountPercentageCap" value={config.maxGlobalDiscountPercentageCap} onChange={handleChange} />

                        <div className="toggle-switch">
                            <label>
                                <input type="checkbox" name="areDiscountsAccumulative" checked={config.areDiscountsAccumulative} onChange={handleChange} />
                                ¿Descuentos Acumulativos? (Si es FALSO, solo aplica el más grande)
                            </label>
                        </div>
                    </div>

                </div>

                <div className="config-actions">
                    <button className="button button-primary huge-btn" onClick={handleSave} disabled={loading}>
                        {loading ? 'Guardando...' : <span style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}><Save size={20} /> Guardar Configuración de Descuentos</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default AdminConfig;
