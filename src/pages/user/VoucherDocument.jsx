import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../http-common';
import { Compass, Clock, Ticket, Printer, CheckCircle2, XCircle } from 'lucide-react';
import './css/VoucherDocument.css'; // Will be created next

const VoucherDocument = () => {
    const { id } = useParams();
    const [res, setRes] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtenemos solo la de me() y la filtramos para simplificar. 
        // Si el admin tambiên requiere ver el voucher, podría usar /all
        // Haremos un fetch a /api/reservations/me e intersecamos. Si no, usamos all.
        const fetchReceipt = async () => {
            try {
                // To support both ADMIN and CLIENT without complex endpoints,
                // Client gets by `me`, ADMIN gets by `all`. Since this is a simple mock, 
                // we'll hit `/api/reservations/me` first. If it fails or is not found, we fallback to `/api/reservations/all`.
                let data = [];
                try {
                    const meRes = await api.get('/api/reservations/me');
                    data = meRes.data;
                } catch (e) { }

                if (!data.find(r => r.id === Number(id))) {
                    try {
                        const allRes = await api.get('/api/reservations/all');
                        data = allRes.data;
                    } catch (e) { }
                }

                const found = data.find(r => r.id === Number(id));
                setRes(found);

                if (found) {
                    setTimeout(() => window.print(), 500); // Auto-open print dialog
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchReceipt();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Generando Comprobante...</div>;
    if (!res) return <div style={{ textAlign: 'center', marginTop: '5rem', color: 'red' }}>Error: No se encontró la reserva o no tienes permisos.</div>;

    return (
        <div className="voucher-container">
            {/* The Print Layout */}
            <div className="voucher-paper">

                <div className="voucher-header">
                    <div className="brand">
                        <Compass size={40} color="#2563eb" />
                        <h2>TravelAgency</h2>
                    </div>
                    <div className="voucher-title">
                        <h1>COMPROBANTE DE RESERVA</h1>
                        <p style={{ color: '#64748b' }}>ID de Reserva: #{res.id}</p>
                    </div>
                </div>

                <div className="voucher-status">
                    <div>
                        <strong>ESTADO ACTUAL: </strong>
                        <span className={`v-status-badge ${res.status.toLowerCase()}`}>
                            {res.status === 'CONFIRMADA' ? <Ticket size={16} /> : null}
                            {res.status === 'PAGADA' ? <CheckCircle2 size={16} /> : null}
                            {res.status === 'CANCELADA' ? <XCircle size={16} /> : null}
                            {res.status}
                        </span>
                    </div>
                    <div>
                        <strong>Fecha Emisión: </strong> {new Date().toLocaleDateString('es-CL')}
                    </div>
                </div>

                <div className="voucher-grid">
                    <div className="v-section">
                        <h3>Detalles del Viaje</h3>
                        <p><strong>Paquete:</strong> {res.packageName}</p>
                        <p><strong>Destino Aprox.:</strong> {res.destination}</p>
                        <p><strong>Desde:</strong> {res.startDate?.substring(0,10).split('-').reverse().join('-')}</p>
                        <p><strong>Hasta:</strong> {res.endDate?.substring(0,10).split('-').reverse().join('-')}</p>
                    </div>

                    <div className="v-section">
                        <h3>Detalles del Cliente</h3>
                        <p><strong>Titular BD (KUID):</strong> {res.keycloakUserId}</p>
                        <p><strong>Cantidad Pasajeros:</strong> {res.passengersCount}</p>
                        {res.passengers && res.passengers[0] && (
                            <p><strong>A. Nombre Principal:</strong> {res.passengers[0].fullName}</p>
                        )}
                    </div>
                </div>

                <div className="v-section v-finances">
                    <h3>Resumen Financiero</h3>
                    <table className="v-finance-table">
                        <tbody>
                            <tr>
                                <td>Subtotal Base</td>
                                <td>${res.totalAmount.toLocaleString('es-CL')} CLP</td>
                            </tr>
                            <tr>
                                <td>Descuentos Aplicados ({res.discountPercentage}%)</td>
                                <td>- ${(res.totalAmount - res.finalAmount).toLocaleString('es-CL')} CLP</td>
                            </tr>
                            <tr className="v-finance-total">
                                <td>Total Cancelado</td>
                                <td>${res.finalAmount.toLocaleString('es-CL')} CLP</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="voucher-footer">
                    <p>Este documento es un comprobante válido generado por el sistema de Travel Agency. Proteja sus datos y que tenga un feliz viaje con nosotros.</p>
                </div>
            </div>

            <div className="print-controls hide-on-print">
                <button className="button button-primary" onClick={() => window.print()}>
                    <Printer size={20} /> Imprimir / Guardar PDF
                </button>
            </div>

            {/* Inject a global style to hide navbar/footer during print or layout mode */}
            <style>{`
                nav.navbar, footer { display: none !important; }
                body { background: #e2e8f0; }
            `}</style>
        </div>
    );
};

export default VoucherDocument;
