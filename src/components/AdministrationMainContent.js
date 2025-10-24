import React, { useState } from 'react';
import './AdministrationMainContent.css';
import RequestAnalysis from './RequestAnalysis';

const AdministrationMainContent = ({ activeTab, onTabSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('list');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const nouvellesDemandesData = [
    {
      id: 'AS21020001',
      clientName: 'Pierre Martin',
      operationType: 'Nouveau Contrat',
      plateNumber: 'AB-12345',
      receptionDate: '20/02/2025',
      status: 'En attente',
      statusIcon: '⏳'
    },
    {
      id: 'AS21020002',
      clientName: 'Sophie Laurent',
      operationType: 'Modification',
      plateNumber: 'CD-67890',
      receptionDate: '20/02/2025',
      status: 'En attente',
      statusIcon: '⏳'
    },
    {
      id: 'AS21020004',
      clientName: 'Marc Dubois',
      operationType: 'Renouvellement',
      plateNumber: 'EF-54321',
      receptionDate: '20/02/2025',
      status: 'En attente',
      statusIcon: '⏳'
    }
  ];

  const dossiersTraitesData = [
    {
      id: 'AS21020003',
      clientName: 'Jean Dupont',
      operationType: 'Nouveau Contrat',
      plateNumber: 'AA-12345',
      receptionDate: '21/02/2025',
      status: 'Valide',
      statusIcon: '✓'
    },
    {
      id: 'AS21020005',
      clientName: 'Marie Joseph',
      operationType: 'Modification',
      plateNumber: 'BB-67890',
      receptionDate: '21/02/2025',
      status: 'Refuse',
      statusIcon: '✗'
    },
    {
      id: 'AS21020009',
      clientName: 'Paul Michel',
      operationType: 'Renouvellement',
      plateNumber: 'CC-54321',
      receptionDate: '21/02/2025',
      status: 'Valide',
      statusIcon: '✓'
    }
  ];

  // Get the appropriate data based on active tab
  const tableData = activeTab === 'dossiers-traites' ? dossiersTraitesData : nouvellesDemandesData;

  const handleAnalyzeRequest = (request) => {
    setSelectedRequest(request);
    setShowAnalysis(true);
  };

  const handleBackToList = () => {
    setShowAnalysis(false);
    setSelectedRequest(null);
  };

  const handleValidate = () => {
    console.log('Validate request:', selectedRequest);
    // Add validation logic here
    handleBackToList();
  };

  const handleReject = () => {
    console.log('Reject request:', selectedRequest);
    // Add rejection logic here
    handleBackToList();
  };

  const handleMessage = () => {
    console.log('Send message for request:', selectedRequest);
    // Add message logic here
  };

  // Show analysis interface if a request is selected
  if (showAnalysis && selectedRequest) {
    return (
      <RequestAnalysis
        requestData={selectedRequest}
        onBack={handleBackToList}
        onValidate={handleValidate}
        onReject={handleReject}
        onMessage={handleMessage}
      />
    );
  }

  return (
    <main className="admin-main-content">
      {/* Breadcrumb and Title */}
      <div className="content-header">
        <div className="breadcrumb">
          <span className="breadcrumb-item">Assurance Vehicule</span>
        </div>
        <h1 className="main-title">Gestion des Assurances</h1>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-filter">
          <input 
            type="text" 
            placeholder="Nom Document"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="view-options">
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ☰
          </button>
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ⊞
          </button>
        </div>
        
        <button className="sort-btn">
          Trier par ↓
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        <button
          className={`tab ${activeTab === 'nouvelles-demandes' ? 'active' : ''}`}
          onClick={() => onTabSelect('nouvelles-demandes')}
        >
          Liste des Nouvelles Demandes
        </button>
        <button
          className={`tab ${activeTab === 'dossiers-traites' ? 'active' : ''}`}
          onClick={() => onTabSelect('dossiers-traites')}
        >
          Liste de Dossiers Traites
        </button>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No Dossier</th>
              <th>Nom du Client</th>
              <th>Type d'Operation</th>
              <th>Numero de Plaque</th>
              <th>Date de Reception</th>
              <th>Statut de Dossier</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.id}</td>
                <td>{row.clientName}</td>
                <td>{row.operationType}</td>
                <td>{row.plateNumber}</td>
                <td>{row.receptionDate}</td>
                <td>
                  <span className="status" data-status={row.status.toLowerCase()}>
                    <span className="status-icon">{row.statusIcon}</span>
                    {row.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="action-btn"
                    onClick={() => activeTab === 'nouvelles-demandes' ? handleAnalyzeRequest(row) : null}
                  >
                    {activeTab === 'dossiers-traites' ? 'Selectionner ↓' : 'Analyser'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Controls */}
      <div className="bottom-controls">
        <div className="left-controls">
          <button className="control-btn">🖨️</button>
          <button className="control-btn">⬇️</button>
        </div>
        <div className="pagination">
          <button className="page-btn">‹</button>
          <button className="page-btn">›</button>
        </div>
      </div>
    </main>
  );
};

export default AdministrationMainContent;
