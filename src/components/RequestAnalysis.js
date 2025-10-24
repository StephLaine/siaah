import React, { useState } from 'react';
import './RequestAnalysis.css';
import FormulaireDetail from './FormulaireDetail';

const RequestAnalysis = ({ requestData, onBack, onValidate, onReject, onMessage }) => {
  const [showFormulaire, setShowFormulaire] = useState(false);
  const documents = [
    { name: 'Formulaire', status: 'warning', hasPdf: false },
    { name: 'Carte d\'Identite', status: 'valid', hasPdf: true },
    { name: 'Control Technique', status: 'valid', hasPdf: true },
    { name: 'Justificatif de Residence', status: 'valid', hasPdf: true },
    { name: 'Carte Grise', status: 'invalid', hasPdf: true }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return '✓';
      case 'invalid': return '✗';
      case 'warning': return '⚠';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return '#10b981';
      case 'invalid': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleFormulaireClick = () => {
    setShowFormulaire(true);
  };

  const handleCloseFormulaire = () => {
    setShowFormulaire(false);
  };

  return (
    <div className="request-analysis">
      {/* Header Section */}
      <div className="analysis-header">
        <div className="nav-tab">
          <button className="back-btn" onClick={onBack}>
            ←
          </button>
          <span className="tab-text">Liste des Demandes en Cours d'Analyse</span>
          <div className="header-actions">
            <button className="action-btn validate-btn" onClick={onValidate}>
              <span className="btn-icon">✓</span>
              Valider
            </button>
            <button className="action-btn reject-btn" onClick={onReject}>
              <span className="btn-icon">✗</span>
              Refuser
            </button>
            <button className="action-btn message-btn" onClick={onMessage}>
              <span className="btn-icon">✉</span>
              Message
            </button>
          </div>
        </div>
      </div>

      <div className="analysis-content">
        {/* Left Content */}
        <div className="left-content">
          {/* Case Overview */}
          <div className="case-overview">
            <div className="case-info">
              <span className="case-label">Numero Dossier :</span>
              <span className="case-value">AS21020003</span>
            </div>
            <div className="case-info">
              <span className="case-label">Etat :</span>
              <span className="case-value status-en-analyse">En Analyse</span>
            </div>
          </div>

          {/* Client Information */}
          <div className="info-section">
            <h3 className="section-title">Information du Client</h3>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Nom :</span>
                <span className="info-value">Jean Louis</span>
              </div>
              <div className="info-row">
                <span className="info-label">NIF :</span>
                <span className="info-value">+509 4567 8901</span>
              </div>
              <div className="info-row">
                <span className="info-label">Telephone :</span>
                <span className="info-value">+509 4567 8901</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email :</span>
                <span className="info-value">+509 4567 8901</span>
              </div>
            </div>
          </div>

          {/* Operation Details */}
          <div className="info-section">
            <h3 className="section-title">Details de l'Operation</h3>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Type :</span>
                <span className="info-value">Renouvellement</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date de demande :</span>
                <span className="info-value">16/09/2025</span>
              </div>
              <div className="info-row">
                <span className="info-label">Etat actuel :</span>
                <span className="info-value">En analyse</span>
              </div>
              <div className="info-row">
                <span className="info-label">Agent Assigne :</span>
                <span className="info-value">Marie Paul</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="bottom-actions">
            <button className="action-icon-btn">
              <span className="action-icon">🖨</span>
            </button>
            <button className="action-icon-btn">
              <span className="action-icon">⬇</span>
            </button>
          </div>
        </div>

        {/* Right Content - Documents or Form */}
        <div className="right-content">
          {showFormulaire ? (
            <div className="formulaire-content">
              <div className="formulaire-header">
                <div className="header-info">
                  <span className="dossier-number">Numero Dossier : AS21020003</span>
                  <span className="status">Etat : En Analyse</span>
                </div>
                <button className="close-btn" onClick={handleCloseFormulaire}>×</button>
              </div>

              <div className="form-content">
                {/* Official Header */}
                <div className="official-header">
                  <div className="coat-of-arms">
                    <div className="haiti-emblem">🇭🇹</div>
                    <div className="motto">L'UNION FAIT LA FORCE</div>
                  </div>
                  <div className="official-titles">
                    <h1>RÉPUBLIQUE D'HAITI</h1>
                    <h2>MINISTERE DE L'ÉCONOMIE ET DES FINANCES</h2>
                    <h3>SOCIÉTÉ DE L'IMMATRICULATION ET DE L'ASSURANCE AUTOMOBILE EN HAÏTI</h3>
                  </div>
                  <div className="document-title">
                    <h2>Certificat de Souscription a une Nouvelle Assurance</h2>
                  </div>
                </div>

                {/* Titulaire Section */}
                <div className="section">
                  <div className="section-header">
                    <h3>Titulaire</h3>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>NIF</label>
                      <input type="text" value="096-002-156-1" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Telephone</label>
                      <div className="phone-inputs">
                        <input type="text" value="+509" readOnly />
                        <input type="text" value="48607457" readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="section">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nom</label>
                      <input type="text" value="Dieudonne" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Prenom</label>
                      <input type="text" value="Sarah" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value="sarai.dieudonne@uniq.edu" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Date de Naissance</label>
                      <div className="date-inputs">
                        <input type="text" value="06" readOnly />
                        <input type="text" value="11" readOnly />
                        <input type="text" value="2001" readOnly />
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label>Adresse</label>
                      <input type="text" value="Fontamara 43 rue sassine # 156" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Sexe</label>
                      <input type="text" value="Female" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Lieu de Naissance</label>
                      <div className="birth-place-inputs">
                        <input type="text" value="Carrefour" readOnly />
                        <input type="text" value="Port-au-Prince" readOnly />
                        <input type="text" value="Haïti" readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Section */}
                <div className="section">
                  <div className="section-header">
                    <h3>Vehicule</h3>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Numero de Chassis</label>
                      <input type="text" value="1HGCM82633A004352" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Marque du Vehicule</label>
                      <input type="text" value="Toyota" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Modele du Vehicule</label>
                      <input type="text" value="Toyota Land Cruiser" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Type de Vehicule</label>
                      <input type="text" value="Voiture" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Couleur du Vehicule</label>
                      <input type="text" value="Noir (e)" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Poids total Autorise en charge (Camion)</label>
                      <input type="text" value="3 100 kg" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Usage du Vehicule</label>
                      <input type="text" value="Privé" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Annee de Fabrication</label>
                      <input type="text" value="2023" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Type de Carburant</label>
                      <input type="text" value="Gazoline" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Nombre de passagers</label>
                      <input type="text" value="8" readOnly />
                    </div>
                  </div>
                </div>

                {/* Contractual Information */}
                <div className="section">
                  <div className="section-header">
                    <h3>Informations Contractuelles</h3>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Categorie de Licence</label>
                      <input type="text" value="Responsabilite Civile" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Type de Transmission</label>
                      <input type="text" value="1 an" readOnly />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="documents-header">
                <h3 className="documents-title">DOCUMENTS (4)</h3>
              </div>
              <div className="documents-section">
                <div className="documents-list">
                  {documents.map((doc, index) => (
                    <div key={index} className="document-item">
                      <div className="document-info">
                        <span 
                          className="document-status-icon"
                          style={{ color: getStatusColor(doc.status) }}
                        >
                          {getStatusIcon(doc.status)}
                        </span>
                        <span className="document-name">{doc.name}</span>
                        {doc.hasPdf && <span className="pdf-label">PDF</span>}
                      </div>
                      <button 
                        className="view-btn"
                        onClick={doc.name === 'Formulaire' ? handleFormulaireClick : undefined}
                      >
                        <span className="view-icon">👁</span>
                        Voir
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="documents-footer">
                  <div className="progress-section">
                    <span className="valid-docs-text">Documents Valides</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '60%' }}></div>
                    </div>
                    <span className="progress-text">3/5</span>
                  </div>
                  <button className="close-btn">
                    Fermer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestAnalysis;
