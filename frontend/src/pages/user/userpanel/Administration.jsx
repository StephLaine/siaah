import React, { useState, useEffect } from 'react';
import './Administration.css';
import AdministrationHeader from './AdministrationHeader';
import AdministrationSidebar from './AdministrationSidebar';
import AdministrationMainContent from './AdministrationMainContent';
import { useAuth } from '../../../context/AuthContext';

const Administration = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [activeSection, setActiveSection] = useState('tableau-de-bord');
  const [activeTab, setActiveTab] = useState('nouvelles-demandes');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /* Global Search selection - to allow Header to open a request in MainContent */
  const [selectedGlobalRequest, setSelectedGlobalRequest] = useState(null);

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
    setSelectedGlobalRequest(null); // Clear search selection when changing sections manually

    // Close sidebar on mobile after selecting section
    if (isMobile) {
      setSidebarOpen(false);
    }

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
    <div className={`administration ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <AdministrationHeader 
        onResultClick={handleGlobalSearchSelect} 
        activeSection={activeSection} 
        onToggleSidebar={toggleSidebar} 
      />
      <div className="admin-body">
        <AdministrationSidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onSectionSelect={handleSectionSelect}
          activeSection={activeSection}
        />
        {isMobile && sidebarOpen && (
          <div className="admin-mobile-overlay" onClick={toggleSidebar}></div>
        )}
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
