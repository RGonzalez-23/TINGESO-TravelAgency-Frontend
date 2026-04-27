import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Hash, Calendar, DollarSign, CreditCard } from 'lucide-react';
import './css/PaymentSuccess.css';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const receipt = location.state?.receipt;

    if (!receipt) {
        return (
            <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>
                <h2>Voucher no encontrado</h2>
                <button className="button button-primary" onClick={() => navigate('/my-reservations')}>Ir a mis reservas</button>
            </div>
        );
    }

    return (
        <div className="success-container container fade-in-up">
            <div className="success-card glass-card">
                <div className="success-header">
                    <CheckCircle size={64} className="success-icon bounce-in" />
                    <h1>Pago Exitoso</h1>
                    <p>Tu transacción ha sido procesada de manera segura y la reserva está confirmada.</p>
                </div>

                <div className="voucher-details">
                    <div className="voucher-row">
                        <span className="v-label"><Hash size={16} /> N° Transacción:</span>
                        <span className="v-value monospace" style={{ fontSize: '14px' }}>{receipt.transactionHash}</span>
                    </div>
                    <div className="voucher-row">
                        <span className="v-label"><Calendar size={16} /> Fecha y Hora:</span>
                        <span className="v-value">{new Date(receipt.transactionDate).toLocaleString('es-CL')}</span>
                    </div>
                    <div className="voucher-row">
                        <span className="v-label"><CreditCard size={16} /> Medio de Pago:</span>
                        <span className="v-value">{receipt.paymentMethod === 'CREDIT_CARD' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}</span>
                    </div>

                    <div className="voucher-divider"></div>

                    <div className="voucher-row total-row">
                        <span className="v-label"><DollarSign size={20} /> Monto Pagado:</span>
                        <span className="v-value gradient-text">${receipt.amountPaid.toLocaleString('es-CL')} CLP</span>
                    </div>
                </div>

                <div className="success-actions">
                    <button className="button button-primary huge-btn" onClick={() => navigate('/my-reservations')}>
                        Ver Tablero de Reservas
                    </button>
                </div>
            </div>
        </div>
    );
};
export default PaymentSuccess;
