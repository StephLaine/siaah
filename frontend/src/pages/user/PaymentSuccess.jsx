import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import './userpanel/Paiements.css';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await fetch(`/api/payments/verify/${paymentId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const result = await response.json();
                if (result.success && result.status === 'completed') {
                    setLoading(false);
                } else {
                    setError("Le paiement n'a pas pu être vérifié immédiatement. Veuillez consulter votre statut plus tard.");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Verification error:", err);
                setError("Erreur lors de la vérification du paiement.");
                setLoading(false);
            }
        };

        if (paymentId) {
            verify();
        } else {
            setLoading(false);
            setError("ID de paiement manquant.");
        }
    }, [paymentId]);

    return (
        <div className="payment-result-page">
            <div className="payment-result-card animate-in fade-in zoom-in duration-500">
                {loading ? (
                    <div className="verify-loading">
                        <Loader2 className="animate-spin text-blue-600" size={64} />
                        <h2>Vérification de votre paiement...</h2>
                        <p>Merci de patienter un instant.</p>
                    </div>
                ) : error ? (
                    <div className="verify-error">
                        <div className="error-icon">×</div>
                        <h2>Oups !</h2>
                        <p>{error}</p>
                        <button className="btn-primary" onClick={() => navigate('/user/statut')}>
                            Retour aux demandes
                        </button>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
