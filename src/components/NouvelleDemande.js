import React from 'react';
import './NouvelleDemande.css';

const NouvelleDemande = () => {
  const services = [
    {
      id: 1,
      name: 'Immatriculation',
      icon: '🚗',
      code: 'XYZ 000',
      description: 'Enregistrement de véhicule'
    },
    {
      id: 2,
      name: 'Permis de Conduire',
      icon: '🆔',
      code: '',
      description: 'Demande de permis de conduire'
    },
    {
      id: 3,
      name: 'Assurance Véhicule',
      icon: '🛡️',
      code: '',
      description: 'Assurance automobile'
    }
  ];

  return (
    <main className="nouvelle-demande">
      {/* Header Section */}
      <div className="demande-header">
        <h1>Nouvelle Demande</h1>
        <div className="demande-tab">
          <div className="tab-content">
            <span className="tab-icon">💬</span>
            <span className="tab-text">Nouvelle demande</span>
          </div>
          <button className="tab-close">✕</button>
        </div>
      </div>

      {/* Services Section */}
      <div className="services-container">
        <div className="services-card">
          <div className="services-header">
            <h2>Services disponibles</h2>
            <div className="services-icons">
              <span className="gear-icon">⚙️</span>
              <span className="gear-icon">⚙️</span>
            </div>
          </div>
          
          <div className="services-message">
            <p>Veuillez choisir un Service pour progresser.</p>
            <span className="exclamation">!</span>
          </div>

          <div className="services-list">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <div className="service-content">
                  <h3>{service.name}</h3>
                  {service.code && <span className="service-code">{service.code}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Step Indicators */}
          <div className="step-indicators">
            <div className="step-dots">
              <div className="step-dot active"></div>
              <div className="step-dot"></div>
              <div className="step-dot"></div>
            </div>
            <div className="step-labels">
              <span>Services</span>
              <span>Opérations</span>
              <span>Demandes</span>
            </div>
          </div>

          <div className="services-footer">
            <button className="next-button">
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NouvelleDemande;
