import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import NouvelleDemande from './components/NouvelleDemande';
import StatutDemandes from './components/StatutDemandes';
import Paiements from './components/Paiements';
import SidebarContent from './components/SidebarContent';

function App() {
  const [currentPage, setCurrentPage] = useState('accueil');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSidebarContent, setSelectedSidebarContent] = useState(null);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setSelectedSidebarContent(null); // Reset sidebar content when navigating
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarContentSelect = (contentId) => {
    setSelectedSidebarContent(contentId);
    setCurrentPage('sidebar-content'); // Switch to sidebar content view
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'nouvelle-demande':
        return <NouvelleDemande />;
      case 'statut':
        return <StatutDemandes />;
      case 'paiements':
        return <Paiements />;
      case 'sidebar-content':
        return <SidebarContent selectedContent={selectedSidebarContent} />;
      case 'accueil':
      default:
        return <MainContent />;
    }
  };

  return (
    <div className="App">
      <Header onNavigate={handleNavigation} currentPage={currentPage} />
      <div className="app-body">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar} 
          onContentSelect={handleSidebarContentSelect}
        />
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
