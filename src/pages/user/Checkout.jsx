import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../http-common';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import './css/Checkout.css';

const Checkout = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Obtenemos la reserva devuelta por POST /api/reservations (El state de React Router)
    const [reservation, setReservation] = useState(location.state?.reservation || null);
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutos = 180 segundos
    const [expired, setExpired] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // En producción se buscaría al backend si no existe en local, 
        // pero para seguir el flujo de Epic 4 lo tomamos del push inmediato.
        if (!reservation) {
            alert("No hay reserva activa en el contexto");
            navigate('/packages');
        }
    }, [reservation, navigate]);

    useEffect(() => {
        if (!reservation || expired) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [reservation, expired]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            await api.post(`/api/reservations/${id}/pay`);
            alert('¡Pago existoso! Reserva confirmada.');
            navigate('/my-reservations');
        } catch (err) {
            alert('Error al procesar el pago: ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (!reservation) return null;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="checkout-container container fade-in-up">
            <div className="checkout-main glass-card">
                <div className="checkout-header">
                    <h2>Checkout y Pago</h2>
                    <p>Completa tu pago a la brevedad para asegurar tus cupos recién reservados.</p>
                </div>

                <div className={`countdown-timer ${timeLeft <= 30 ? 'danger' : ''}`}>
                    <Clock size={28} className={timeLeft <= 30 ? 'pulse-fast' : ''} />
                    <span>{formatTime(timeLeft)}</span>
                    <p>Tiempo restante antes de perder la reserva temporal</p>
                </div>

                {expired && (
                    <div className="expired-warning">
                        <AlertTriangle size={32} />
                        <h3>Tiempo Expirado</h3>
                        <p>Hemos liberado tus cupos nuevamente porque el tiempo expiró. Empieza de nuevo por favor.</p>
                        <button className="button button-outline" onClick={() => navigate('/packages')}>Volver a Buscar Viajes</button>
                    </div>
                )}

                {!expired && (
                    <div className="invoice-details">
                        <div className="invoice-row">
                            <span>Paquete:</span>
                            <strong>{reservation.packageName}</strong>
                        </div>
                        <div className="invoice-row">
                            <span>Pasajeros Adjudicados:</span>
                            <strong>{reservation.passengersCount} cupos reservados temporalmente</strong>
                        </div>
                        
                        <hr className="divider" />

                        <div className="invoice-row">
                            <span>Subtotal (Precio Base Original):</span>
                            <span className="price-strike">${reservation.totalAmount.toLocaleString('es-CL')}</span>
                        </div>
                        
                        {reservation.discountPercentage > 0 && (
                            <div className="invoice-row discount-row">
                                <span>Descuentos ({reservation.discountPercentage}% off):<br/><small>{reservation.appliedDiscountsDetails}</small></span>
                                <strong>- ${(reservation.totalAmount - reservation.finalAmount).toLocaleString('es-CL')}</strong>
                            </div>
                        )}

                        <hr className="divider double" />

                        <div className="invoice-row final-total">
                            <span>Monto FINAL neto a Pagar:</span>
                            <span className="gradient-text">${reservation.finalAmount.toLocaleString('es-CL')} CLP</span>
                        </div>

                        <button 
                            className="button button-primary huge-btn pay-btn" 
                            onClick={handlePayment} 
                            disabled={loading || expired}
                        >
                            {loading ? 'Procesando Pago Seguro (Simulado)...' : 'Simular Pago (Confirmar Orden)'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Checkout;
