import React, { useState } from 'react';
import './StatutDemandes.css';

const StatutDemandes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [currentPage, setCurrentPage] = useState(1);

  const demandes = [
    {
      id: 1,
      numero: 'IM21020001',
      service: 'Immatriculation',
      operation: 'Nouvelle demande',
      dateEnvoi: '21/02/2025',
      statut: 'Validée',
      statutColor: 'green'
    },
    {
      id: 2,
      numero: 'LI21020002',
      service: 'Licence',
      operation: 'Obtention',
      dateEnvoi: '21/02/2025',
      statut: 'Rejetée',
      statutColor: 'red'
    },
    {
      id: 3,
      numero: 'AS21020003',
      service: 'Assurance',
      operation: 'Renouvellement',
      dateEnvoi: '21/02/2025',
      statut: 'En attente',
      statutColor: 'yellow'
    }
  ];

  const filteredDemandes = demandes.filter(demande =>
    demande.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.operation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusDot = (color) => {
    return <span className={`status-dot status-${color}`}></span>;
  };

  return (
    <main className="statut-demandes">
      {/* Header Section */}
      <div className="statut-header">
        <div className="statut-title-section">
          <h1>Statut des Demandes</h1>
          <span className="chat-icon">💬</span>
          <button className="close-button">✕</button>
        </div>
        <h2>Liste de Demandes envoyées</h2>
      </div>

      {/* Search and Controls */}
      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Nom Document"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ✓
          </button>
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ⊞
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container">
        <table className="demandes-table">
          <thead>
            <tr>
              <th>
                Numéro de demande
                <span className="sort-arrows">↕</span>
              </th>
              <th>
                Service
                <span className="sort-arrows">↕</span>
              </th>
              <th>
                Opération
                <span className="sort-arrows">↕</span>
              </th>
              <th>
                Date d'envoie
                <span className="sort-arrows">↕</span>
              </th>
              <th>
                Statut de demande
                <span className="sort-arrows">↕</span>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDemandes.map((demande) => (
              <tr key={demande.id}>
                <td className="numero-cell">{demande.numero}</td>
                <td className="service-cell">{demande.service}</td>
                <td className="operation-cell">{demande.operation}</td>
                <td className="date-cell">{demande.dateEnvoi}</td>
                <td className="statut-cell">
                  {getStatusDot(demande.statutColor)}
                  {demande.statut}
                </td>
                <td className="action-cell">
                  <button className="select-button">
                    Sélectionner
                    <span className="dropdown-arrow">▼</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          className="pagination-btn"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        >
          ← Précédent
        </button>
        <span className="page-info">{currentPage}/1</span>
        <button 
          className="pagination-btn"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Suivant →
        </button>
      </div>
    </main>
  );
};

export default StatutDemandes;
