import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../http-common';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import './css/Checkout.css';

const Checkout = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Get the reservation returned by POST /api/reservations (React Router state)
    const [reservation, setReservation] = useState(location.state?.reservation || null);
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds
    const [expired, setExpired] = useState(false);
    const [loading, setLoading] = useState(false);

    // Gateway Mock State
    const [cardData, setCardData] = useState({
        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        paymentMethod: 'CREDIT_CARD'
    });

    const handleInput = (e) => {
        setCardData({ ...cardData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        // In production we would search the backend if it doesn't exist locally, 
        // but to follow the Epic 4 flow we take it from the immediate push.
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
        // Validation required by Epic 5
        if (cardData.cardNumber.length !== 16) return alert("Formato de número de tarjeta inválido (requiere 16 dígitos)");
        if (cardData.cvv.length !== 3) return alert("CVV inválido (requiere 3 dígitos)");
        if (!cardData.cardHolderName || !cardData.expiryDate) return alert("Debe completar todos los datos para pagar");

        setLoading(true);
        try {
            // The backend receives the payload, simulates validation and saves transaction returning the voucher
            const response = await api.post(`/api/reservations/${id}/pay`, cardData);
            navigate(`/checkout/success/${id}`, { state: { receipt: response.data } });
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
                                <span>Descuentos ({reservation.discountPercentage}% off):<br /><small>{reservation.appliedDiscountsDetails}</small></span>
                                <strong>-${(reservation.totalAmount - reservation.finalAmount).toLocaleString('es-CL')}</strong>
                            </div>
                        )}

                        <hr className="divider double" />

                        <div className="invoice-row final-total">
                            <span>Monto FINAL neto a Pagar:</span>
                            <span className="gradient-text">${reservation.finalAmount.toLocaleString('es-CL')} CLP</span>
                        </div>

                        <div className="payment-gateway-form" style={{ marginTop: '2rem', marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1e293b' }}>Datos de Tarjeta (Medio Simulado)</h3>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Medio de Pago</label>
                                <select className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }} name="paymentMethod" value={cardData.paymentMethod} onChange={handleInput}>
                                    <option value="CREDIT_CARD">Tarjeta de Crédito</option>
                                    <option value="DEBIT_CARD">Tarjeta de Débito</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre del Titular</label>
                                <input type="text" className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }} name="cardHolderName" placeholder="Ej. Juan Pérez" value={cardData.cardHolderName} onChange={handleInput} required />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Número de Tarjeta (16 dígitos)</label>
                                <input type="text" className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', letterSpacing: '2px' }} name="cardNumber" maxLength="16" placeholder="0000 0000 0000 0000" value={cardData.cardNumber} onChange={handleInput} required />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Expiración</label>
                                    <input type="text" className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }} name="expiryDate" placeholder="12/28" value={cardData.expiryDate} onChange={handleInput} required />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>CVV</label>
                                    <input type="password" className="form-input" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }} name="cvv" maxLength="3" placeholder="***" value={cardData.cvv} onChange={handleInput} required />
                                </div>
                            </div>
                        </div>

                        <button
                            className="button button-primary huge-btn pay-btn"
                            onClick={handlePayment}
                            disabled={loading || expired}
                        >
                            {loading ? 'Procesando Transacción cifrada...' : 'PAGAR DE FORMA SEGURA'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Checkout;
