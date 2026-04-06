import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye,
  History,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './MonPermis.css';

const MonPermis = () => {
  const { user, token } = useAuth();
  const [activeLicense, setActiveLicense] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // For now using mock data as requested
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulating API call
        setTimeout(() => {
          const mockLicense = {
            number: 'P-22-09876',
            category: 'Type B',
            lastName: user?.last_name || 'Dieudonne',
            firstName: user?.first_name || 'Sarah',
            issueDate: '15/05/2023',
            expiryDate: '15/05/2028',
            status: 'Active' // Active, Expire, Hors circulation
          };

          const mockHistory = [
            { id: 1, number: 'P-18-01234', category: 'Type B', issueDate: '12/04/2018', expiryDate: '12/04/2023', status: 'Expire' }
          ];

          setActiveLicense(mockLicense);
          setHistory(mockHistory);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError("Impossible de charger vos informations de permis.");
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const getStatusStyle = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'expire': return 'status-expired';
      case 'hors circulation': return 'status-revoked';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return <CheckCircle2 size={16} />;
      case 'expire': return <XCircle size={16} />;
      case 'hors circulation': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  if (loading) return (
    <div className="permis-loading-container">
      <div className="permis-spinner"></div>
      <p>Chargement de vos informations...</p>
    </div>
  );

  return (
    <div className="mon-permis-container animate-fade-in">
      <div className="permis-header-info">
        <div>
          <h1 className="permis-page-title">Mon Permis de Conduire</h1>
          <p className="permis-page-subtitle">Visualisez et gérez votre titre de conduite officiel.</p>
        </div>
        <div className="permis-badge-official">
          <ShieldCheck size={18} />
          <span>Document Officiel</span>
        </div>
      </div>

      {error && (
        <div className="permis-error-msg">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {activeLicense ? (
        <div className="permis-view-grid">
          {/* Card Preview */}
          <div className="permis-card-perspective">
            <div className="license-card-visual">
              <div className="card-top-bar">
                <div className="haiti-flag-mini"></div>
                <div className="republique-haiti-text">RÉPUBLIQUE D'HAÏTI</div>
              </div>
              
              <div className="card-body-visual">
                <div className="user-photo-placeholder">
                  <User size={60} color="#cbd5e1" />
                </div>
                
                <div className="card-details-overlay">
                  <div className="card-field-visual">
                    <span className="field-label-visual">NOM / LAST NAME</span>
                    <span className="field-value-visual">{activeLicense.lastName}</span>
                  </div>
                  <div className="card-field-visual">
                    <span className="field-label-visual">PRÉNOM / FIRST NAME</span>
                    <span className="field-value-visual">{activeLicense.firstName}</span>
                  </div>
                  <div className="card-field-visual">
                    <span className="field-label-visual">CATÉGORIE / CLASS</span>
                    <span className="field-value-visual">{activeLicense.category}</span>
                  </div>
                  <div className="card-row-visual">
                    <div className="card-field-visual">
                      <span className="field-label-visual">ÉMISSION</span>
                      <span className="field-value-visual">{activeLicense.issueDate}</span>
                    </div>
                    <div className="card-field-visual">
                      <span className="field-label-visual">EXPIRATION</span>
                      <span className="field-value-visual">{activeLicense.expiryDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-bottom-bar">
                <div className="license-number-visual">{activeLicense.number}</div>
                <div className="siaah-logo-mini">SIAAH</div>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="permis-details-card">
            <div className="details-header">
              <h3>Détails du Permis</h3>
              <div className={`status-pill ${getStatusStyle(activeLicense.status)}`}>
                {getStatusIcon(activeLicense.status)}
                {activeLicense.status}
              </div>
            </div>

            <div className="details-rows">
              <div className="detail-row">
                <span className="row-label">Numéro du permis</span>
                <span className="row-value font-mono">{activeLicense.number}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Catégorie</span>
                <span className="row-value">{activeLicense.category}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Titulaire</span>
                <span className="row-value">{activeLicense.firstName} {activeLicense.lastName}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Date d'émission</span>
                <span className="row-value">{activeLicense.issueDate}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Date d'expiration</span>
                <span className="row-value">{activeLicense.expiryDate}</span>
              </div>
            </div>

            <div className="permis-actions-footer">
              <button className="btn-view-full">
                <Eye size={18} /> Voir le permis complet
              </button>
              <button className="btn-download-copy">
                <Download size={18} /> Télécharger copie PDF
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-license-state">
          <CreditCard size={64} color="#94a3b8" />
          <h2>Aucun permis actif</h2>
          <p>Vous n'avez pas encore de permis de conduire attribué ou votre dossier est en cours de traitement.</p>
          <button className="btn-start-request">Démarrer une demande</button>
        </div>
      )}

      {/* History Section */}
      <div className="permis-history-section">
        <div className="history-header">
          <History size={20} />
          <h2>Historique de permis</h2>
        </div>

        {history.length > 0 ? (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>N° Permis</th>
                  <th>Catégorie</th>
                  <th>Émission</th>
                  <th>Expiration</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id}>
                    <td className="font-mono">{item.number}</td>
                    <td>{item.category}</td>
                    <td>{item.issueDate}</td>
                    <td>{item.expiryDate}</td>
                    <td>
                      <span className={`status-pill-small ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-action-small">Voir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="history-empty">
            <p>Aucun historique disponible.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonPermis;
