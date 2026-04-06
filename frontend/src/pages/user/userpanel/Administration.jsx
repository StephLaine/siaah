import React, { useState, useEffect } from 'react';
import './Administration.css';
import AdministrationHeader from './AdministrationHeader';
import AdministrationSidebar from './AdministrationSidebar';
import AdministrationMainContent from './AdministrationMainContent';
import { useAuth } from '../../../context/AuthContext';

const Administration = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [activeSection, setActiveSection] = useState('tableau-de-bord');
  const [activeTab, setActiveTab] = useState('nouvelles-demandes');

  // Any redirection logic can be added here if needed, but employees should see Tableau de Board now.


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /* Global Search selection - to allow Header to open a request in MainContent */
  const [selectedGlobalRequest, setSelectedGlobalRequest] = useState(null);

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
    setSelectedGlobalRequest(null); // Clear search selection when changing sections manually

    // Switch to appropriate tab based on sidebar selection
    if (sectionId === 'dossiers-traites' || sectionId === 'dossier-traite-permis') {
      setActiveTab('dossiers-traites');
    } else if (sectionId === 'reception-demandes' || sectionId === 'nouvelle-demande-permis') {
      setActiveTab('nouvelles-demandes');
    } else if (sectionId === 'documents-analyse' || sectionId === 'analyse-en-cours-permis') {
      setActiveTab('documents-analyse');
    } else if (sectionId === 'dossiers-refuses' || sectionId === 'dossier-refuse-permis') {
      setActiveTab('dossiers-refuses');
    } else if (sectionId === 'paiement-permis') {
      setActiveTab('paiements');
    }
  };

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setSelectedGlobalRequest(null);
  };

  const handleGlobalSearchSelect = (request) => {
    setSelectedGlobalRequest(request);
    // Force view to requests if we were on dashboard or elsewhere
    if (activeSection === 'tableau-de-bord' || activeSection === 'gestion-employes') {
      setActiveSection('reception-demandes');
      setActiveTab('nouvelles-demandes');
    }
  };

  return (
    <div className="administration">
      <AdministrationHeader onResultClick={handleGlobalSearchSelect} activeSection={activeSection} />
      <div className="admin-body">
        <AdministrationSidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onSectionSelect={handleSectionSelect}
          activeSection={activeSection}
        />
        <AdministrationMainContent
          activeTab={activeTab}
          onTabSelect={handleTabSelect}
          activeSection={activeSection}
          onSectionSelect={handleSectionSelect}
          externalRequest={selectedGlobalRequest}
        />
      </div>
    </div>
  );
};

export default Administration;
