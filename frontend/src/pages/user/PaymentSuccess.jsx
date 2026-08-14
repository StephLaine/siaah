import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import './userpanel/Paiements.css';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null); // 'success' | 'pending' | 'error'
    const [retryCount, setRetryCount] = useState(0);

    // MonCash returns ?orderId=XX, Stripe returns ?payment_id=XX or ?session_id=XX
    const paymentId = searchParams.get('payment_id') || searchParams.get('orderId');

    useEffect(() => {
        if (!paymentId) {
            setStatus('error');
            setLoading(false);
            return;
        }

        const verify = async () => {
            try {
                const response = await fetch(`/api/payments/verify/${paymentId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();

                if (result.success && result.status === 'completed') {
                    setStatus('success');
                    setLoading(false);
                } else if (retryCount < 4) {
                    // MonCash webhook may not have fired yet — retry after 2s
                    setTimeout(() => setRetryCount(c => c + 1), 2000);
                } else {
                    // After 4 retries (~8s), assume payment went through and show pending
                    setStatus('pending');
                    setLoading(false);
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus('pending');
                setLoading(false);
            }
        };

        verify();
    }, [paymentId, retryCount]);

    return (
        <div className="payment-result-page">
            <div className="payment-result-card animate-in fade-in zoom-in duration-500">
                {loading ? (
                    <div className="verify-loading">
                        <Loader2 className="animate-spin text-blue-600" size={64} />
                        <h2>Vérification de votre paiement...</h2>
                        <p>Merci de patienter un instant{retryCount > 0 ? ` (tentative ${retryCount + 1}/5)` : ''}.</p>
                    </div>
                ) : status === 'success' ? (
                    <div className="verify-success">
                        <CheckCircle className="text-green-500 mb-4" size={80} />
                        <h1>Paiement Réussi !</h1>
                        <p>Votre service est maintenant en cours de traitement par nos agents.</p>
                        <div className="success-details">
                            <span>Référence: PAY-{paymentId}</span>
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/user/statut')}>
                            Voir mes demandes <ArrowRight size={18} />
                        </button>
                    </div>
                ) : status === 'pending' ? (
                    <div className="verify-success">
                        <AlertCircle style={{ color: '#f59e0b', marginBottom: '1rem' }} size={80} />
                        <h1>Paiement en Attente de Confirmation</h1>
                        <p>Votre paiement MonCash a été soumis. Notre système est en train de le valider automatiquement. Votre dossier sera mis à jour sous peu.</p>
                        <div className="success-details">
                            <span>Référence: PAY-{paymentId}</span>
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/user/statut')}>
                            Voir mes demandes <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="verify-error">
                        <div className="error-icon">×</div>
                        <h2>ID de paiement manquant</h2>
                        <p>Impossible d'identifier votre paiement. Contactez le support si le montant a été débité.</p>
                        <button className="btn-primary" onClick={() => navigate('/user/statut')}>
                            Retour aux demandes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
