import { useNavigate } from 'react-router-dom';
import { PackageSearch, PercentDiamond, LayoutDashboard, Bookmark, FileBarChart } from 'lucide-react';
import './css/AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard container fade-in-up">
            <div className="dashboard-header">
                <LayoutDashboard size={48} className="gradient-icon" />
                <h1 className="gradient-text">Panel Central de Administración</h1>
                <p>Selecciona el módulo que deseas gestionar hoy.</p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-module glass-card bounce-on-hover" onClick={() => navigate('/admin/packages')}>
                    <PackageSearch size={64} className="module-icon text-primary" />
                    <h2>Catálogo de Paquetes</h2>
                    <p>Crea, edita, o desactiva destinos y controla el inventario de cupos para tus clientes.</p>
                    <button className="button button-outline mt-3">Ir a Paquetes</button>
                </div>

                <div className="dashboard-module glass-card bounce-on-hover" onClick={() => navigate('/admin/discounts')}>
                    <PercentDiamond size={64} className="module-icon text-success" />
                    <h2>Reglas de Descuentos</h2>
                    <p>Ajusta el porcentaje de clientes frecuentes, ofertas grupales y promociones globales del sistema.</p>
                    <button className="button button-outline mt-3">Ir a Descuentos</button>
                </div>

                <div className="dashboard-module glass-card bounce-on-hover" onClick={() => navigate('/admin/reservations')}>
                    <Bookmark size={64} className="module-icon" style={{ color: '#f59e0b' }} />
                    <h2>Gestión de Reservas</h2>
                    <p>Supervisa, cancela o confirma el historial de reservas activas emitidas en la plataforma.</p>
                    <button className="button button-outline mt-3">Ver Reservas</button>
                </div>

                <div className="dashboard-module glass-card bounce-on-hover" onClick={() => navigate('/admin/reports')}>
                    <FileBarChart size={64} className="module-icon" style={{ color: '#8b5cf6' }} />
                    <h2>Visor de Reportes</h2>
                    <p>Accede a estadísticas consolidadas, rankings de ventas y operaciones financieras de la agencia.</p>
                    <button className="button button-outline mt-3">Generar Reportes</button>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;
