import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import './userpanel/Paiements.css';

const PaymentCancelled = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get('payment_id');

    return (
        <div className="payment-result-page">
            <div className="payment-result-card animate-in fade-in zoom-in duration-500">
                <div className="verify-cancelled">
                    <XCircle className="text-red-500 mb-4" size={80} />
                    <h1>Paiement Annulé</h1>
                    <p>Votre paiement a été interrompu. Vous pouvez réessayer à tout moment.</p>
                    <div className="cancelled-details">
                        <span>Référence (Annulée): PAY-{paymentId}</span>
                    </div>
                    <button className="btn-secondary" onClick={() => navigate('/user/statut')}>
                        <ArrowLeft size={18} /> Retour aux demandes
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/user/paiements')}>
                        Essayer un autre mode
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancelled;
