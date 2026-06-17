import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Ticket,
  CreditCard,
  Settings,
  Info,
  AlertCircle,
  Coins,
  Wallet,
  Loader2,
  Clock,
  ArrowRight
} from 'lucide-react';
import './Paiements.css';
import { useNavigate } from 'react-router-dom';

const Paiements = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const result = await response.json();
        if (result.status === 'success') {
          setRequests(result.data);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const validatedRequests = requests.filter(r => 
    r.status === 'validated' && r.payment_status !== 'paid'
  );

  const services = [
    {
      id: 1,
      name: 'Demandes Validées',
      icon: <CheckCircle size={32} />,
      count: validatedRequests.length,
      description: 'Paiement des demandes approuvées'
    },
    {
      id: 2,
      name: 'Contraventions',
      icon: <Ticket size={32} />,
      count: 0,
      description: 'Paiement des contraventions'
    }
  ];

  const paymentMethods = [
    'Sogebank',
    'Unibank',
    'Moncash',
    'Natcash'
  ];

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleGoToPay = (req) => {
    // Navigate to Status page with payment modal trigger if possible, 
    // or just let them go to Status page where the a-payer section is ready
    navigate('/user/statut-demandes', { state: { openPayment: req.id } });
  };

  return (
    <main className="paiements">
      <div className="paiements-header">
        <div className="paiements-title-section">
          <h1>Paiements & Services</h1>
          <div className="paiements-tab">
            <div className="tab-content">
              <span className="tab-icon"><CreditCard size={16} /></span>
              <span className="tab-text">Guichet Unique</span>
            </div>
            <button className="tab-close" onClick={() => navigate('/user')}>✕</button>
          </div>
        </div>
      </div>

      <div className="paiements-container">
        <div className="paiements-card">
          <div className="card-header">
            <h2>Demandes Validées et Contraventions</h2>
            <div className="card-icons">
              <span className="header-icon-btn"><Settings size={18} /></span>
              <span className="header-icon-btn"><Info size={18} /></span>
            </div>
          </div>

          {!selectedService && (
            <div className="card-message">
              <p>Veuillez choisir un Service pour progresser.</p>
              <span className="exclamation-icon"><AlertCircle size={20} /></span>
            </div>
          )}

          <div className="services-grid">
            {services.map(service => (
              <div
                key={service.id}
                className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                onClick={() => handleServiceSelect(service)}
              >
                <div className="service-icon">{service.icon}</div>
                <div className="service-content">
                  <h3>{service.name}</h3>
                  <span className="service-count">({service.count})</span>
                  <p className="service-desc">{service.description}</p>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center p-10">
               <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            selectedService?.id === 1 && (
              <div className="validated-list-area animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="list-title">Liste des demandes à payer</h3>
                {validatedRequests.length === 0 ? (
                  <div className="empty-list-msg">
                     <Clock size={40} className="text-slate-300 mb-2" />
                     <p>Aucune demande en attente de paiement pour le moment.</p>
                  </div>
                ) : (
                  <div className="payment-list">
                    {validatedRequests.map(req => (
                      <div key={req.id} className="payment-item">
                        <div className="item-info">
                          <span className="item-id">REQ-{req.id}</span>
                          <span className="item-type">{req.type}</span>
                          <span className="item-price">{parseFloat(req.price || 0).toLocaleString()} HTG</span>
                        </div>
                        <button className="btn-pay-now" onClick={() => handleGoToPay(req)}>
                          Payer <ArrowRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          <div className="payment-footer">
            <div className="payment-info">
              <span className="payment-icon"><Coins size={20} /></span>
              <span className="payment-text">
                Modes de Paiement acceptés: {paymentMethods.join(', ')}
              </span>
              <span className="money-icon"><Wallet size={20} /></span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Paiements;
