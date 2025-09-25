import React, { useState } from 'react';
import './Paiements.css';

const Paiements = () => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 1,
      name: 'Demandes Validées',
      icon: '💬',
      count: 3,
      description: 'Paiement des demandes approuvées'
    },
    {
      id: 2,
      name: 'Contraventions',
      icon: '🎫',
      count: 1,
      description: 'Paiement des amendes'
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

  return (
    <main className="paiements">
      {/* Header Section */}
      <div className="paiements-header">
        <div className="paiements-title-section">
          <h1>Nouvelle Demande</h1>
          <div className="paiements-tab">
            <div className="tab-content">
              <span className="tab-icon">🪙</span>
              <span className="tab-text">Paiements</span>
            </div>
            <button className="tab-close">✕</button>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="paiements-container">
        <div className="paiements-card">
          <div className="card-header">
            <h2>Demandes Validées et Contraventions</h2>
            <div className="card-icons">
              <span className="gear-icon">⚙️</span>
              <span className="info-icon">ℹ️</span>
            </div>
          </div>
          
          <div className="card-message">
            <p>Veuillez choisir un Service pour progresser.</p>
            <span className="exclamation">!</span>
          </div>

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
                </div>
              </div>
            ))}
          </div>

          {/* Payment Mode Footer */}
          <div className="payment-footer">
            <div className="payment-info">
              <span className="payment-icon">🪙</span>
              <span className="payment-text">
                Mode de Paiement: {paymentMethods.join(', ')}
              </span>
              <span className="money-icon">💰</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Paiements;
