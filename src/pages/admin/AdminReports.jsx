import { useEffect, useState } from 'react';
import api from '../../http-common';
import { Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import './css/AdminReports.css';

const AdminReports = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Date states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [includeCancelled, setIncludeCancelled] = useState(false);

    // Error validation
    const [errorMsg, setErrorMsg] = useState('');

    // Generated reports
    const [report1, setReport1] = useState(null);
    const [report2, setReport2] = useState(null);

    useEffect(() => {
        api.get('/api/reservations/all')
            .then(res => setReservations(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleGenerate = () => {
        if (!startDate || !endDate) {
            setErrorMsg("Debe seleccionar ambas fechas.");
            return;
        }
        const startObj = new Date(startDate);
        startObj.setHours(0, 0, 0, 0);
        const endObj = new Date(endDate);
        endObj.setHours(23, 59, 59, 999);

        if (startObj > endObj) {
            setErrorMsg("La fecha de inicio NO puede ser posterior a la fecha de término.");
            return;
        }
        setErrorMsg('');

        // --- First report (Chronological view) ---
        const rep1 = reservations.filter(r => {
            let operationDateObj;
            if (r.status === 'CANCELADA') {
                if (!includeCancelled) return false;
                operationDateObj = new Date(r.createdAt);
            } else if (r.status === 'PENDIENTE') {
                return false; // Never paid and not cancelled
            } else {
                if (!r.paidAt) return false;
                operationDateObj = new Date(r.paidAt);
            }
            return operationDateObj >= startObj && operationDateObj <= endObj;
        }).map(r => ({
            id: r.id,
            operationDate: r.status === 'CANCELADA' ? r.createdAt : r.paidAt,
            clientName: (r.passengers && r.passengers[0]) ? r.passengers[0].fullName : r.keycloakUserId,
            packageName: r.packageName,
            passengersCount: r.passengersCount,
            totalAmount: r.totalAmount,
            finalAmount: r.finalAmount,
            status: r.status
        })).sort((a, b) => new Date(b.operationDate) - new Date(a.operationDate));

        setReport1(rep1);

        // --- Second report (Sales ranking) ---
        const validReservations = reservations.filter(r => {
            if (r.status === 'CANCELADA' || r.status === 'PENDIENTE') return false;
            if (!r.paidAt) return false;
            const opDate = new Date(r.paidAt);
            return opDate >= startObj && opDate <= endObj;
        });

        const packageMap = {};
        validReservations.forEach(r => {
            if (!packageMap[r.packageId]) {
                packageMap[r.packageId] = {
                    packageId: r.packageId,
                    packageName: r.packageName,
                    qtyReservations: 0,
                    totalPassengers: 0,
                    totalRevenue: 0
                };
            }
            packageMap[r.packageId].qtyReservations += 1;
            packageMap[r.packageId].totalPassengers += r.passengersCount;
            packageMap[r.packageId].totalRevenue += r.finalAmount;
        });

        // Sorted by number of reservations from highest to lowest, tie-breaker is total amount sold.
        const rep2 = Object.values(packageMap).sort((a, b) => {
            if (b.qtyReservations !== a.qtyReservations) return b.qtyReservations - a.qtyReservations;
            return b.totalRevenue - a.totalRevenue;
        });

        setReport2(rep2);
    };

    return (
        <div className="admin-reports-page container fade-in-up">
            <div className="admin-header">
                <h1>Panel de <span className="text-gradient">Reportes</span></h1>
                <p>Genera informes operacionales y rankings de venta de la agencia.</p>
            </div>

            <div className="reports-controls glass-card">
                <div className="date-picker-group">
                    <div className="form-group">
                        <label>Fecha de Inicio del Período</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Fecha de Término del Período</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input" />
                    </div>
                </div>

                <div className="checkbox-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#2e2e2fff', fontWeight: '500' }}>
                        <input type="checkbox" checked={includeCancelled} onChange={e => setIncludeCancelled(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                        Incluir reservas en estado CANCELADA (Exclusivo para el Reporte Detallado de Transacciones)
                    </label>
                </div>

                {errorMsg && (
                    <div className="alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', background: '#fee2e2', padding: '0.8rem', borderRadius: '8px', marginTop: '1.5rem' }}>
                        <AlertTriangle size={18} /> {errorMsg}
                    </div>
                )}

                <button className="button button-primary huge-btn" style={{ marginTop: '2rem', width: '100%' }} onClick={handleGenerate} disabled={loading}>
                    {loading ? 'Sincronizando Bóveda de Datos...' : 'GENERAR REPORTES'}
                </button>
            </div>

            {report1 && report2 && (
                <div className="reports-results">

                    <section className="report-section glass-card fade-in-up">
                        <h2><Calendar size={24} /> 1. Reporte Detallado de Transacciones</h2>
                        <p className="text-muted">Desglose cronológico de operaciones financieras en el sistema.</p>
                        <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Fecha Operación</th>
                                        <th>Cliente Asociado</th>
                                        <th>Paquete Turístico</th>
                                        <th>Cant. Pasajeros</th>
                                        <th>Monto Total (Reserva)</th>
                                        <th>Monto Pagado (Final)</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report1.length > 0 ? report1.map(r => (
                                        <tr key={r.id}>
                                            <td>{new Date(r.operationDate).toLocaleString('es-CL')}</td>
                                            <td>{r.clientName}</td>
                                            <td>{r.packageName}</td>
                                            <td>{r.passengersCount} pax</td>
                                            <td>${r.totalAmount.toLocaleString('es-CL')}</td>
                                            <td><strong>${r.finalAmount.toLocaleString('es-CL')}</strong></td>
                                            <td>
                                                <span className={`status-badge ${r.status.toLowerCase()}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No hubieron operaciones en este periodo de tiempo.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="report-section glass-card fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <h2><TrendingUp size={24} /> 2. Ranking de Paquetes Vendidos</h2>
                        <p className="text-muted">Los productos con mayor demanda (no incluye reservaciones canceladas).</p>
                        <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th># Rank</th>
                                        <th>Paquete Turístico</th>
                                        <th>Cant. Reservas</th>
                                        <th>Total Pasajeros</th>
                                        <th>Monto Generado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report2.length > 0 ? report2.map((p, idx) => (
                                        <tr key={p.packageId}>
                                            <td><strong style={{ color: '#2563eb' }}>#{idx + 1}</strong></td>
                                            <td><strong>{p.packageName}</strong></td>
                                            <td>{p.qtyReservations} reservas</td>
                                            <td>{p.totalPassengers} pax</td>
                                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>${p.totalRevenue.toLocaleString('es-CL')}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No hay ventas válidas en este periodo para rankear.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>
            )}
        </div>
    );
};
export default AdminReports;
