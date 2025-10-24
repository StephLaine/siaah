import React, { useState } from 'react';
import './Administration.css';
import AdministrationHeader from './AdministrationHeader';
import AdministrationSidebar from './AdministrationSidebar';
import AdministrationMainContent from './AdministrationMainContent';

const Administration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('reception-demandes');
  const [activeTab, setActiveTab] = useState('nouvelles-demandes');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
    
    // Switch to appropriate tab based on sidebar selection
    if (sectionId === 'dossiers-traites') {
      setActiveTab('dossiers-traites');
    } else if (sectionId === 'reception-demandes') {
      setActiveTab('nouvelles-demandes');
    }
  };

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="administration">
      <AdministrationHeader />
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
        />
      </div>
    </div>
  );
};

export default Administration;
