import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import NouvelleDemande from './components/NouvelleDemande';
import StatutDemandes from './components/StatutDemandes';
import Paiements from './components/Paiements';
import SidebarContent from './components/SidebarContent';
import Administration from './components/Administration';

function App() {
  const [currentPage, setCurrentPage] = useState('accueil');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSidebarContent, setSelectedSidebarContent] = useState(null);

  // Handle URL-based routing
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      console.log('Route change detected:', { path, hash }); // Debug log
      
      // Handle direct URL navigation
      if (path === '/administration') {
        setCurrentPage('administration');
      } else if (hash) {
        // Handle hash-based navigation
        const page = hash.substring(1); // Remove the # symbol
        if (['accueil', 'nouvelle-demande', 'statut', 'paiements', 'administration'].includes(page)) {
          setCurrentPage(page);
        }
      } else if (path === '/') {
        // Default to accueil if at root
        setCurrentPage('accueil');
      } else {
        // For any other path, try to extract the page name
        const page = path.substring(1); // Remove the leading /
        if (['accueil', 'nouvelle-demande', 'statut', 'paiements', 'administration'].includes(page)) {
          setCurrentPage(page);
        } else {
          setCurrentPage('accueil');
        }
      }
    };

    // Initial route check
    handleRouteChange();

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Update URL when page changes
  useEffect(() => {
    if (currentPage === 'administration') {
      window.history.pushState({}, '', '/administration');
    } else if (currentPage !== 'accueil') {
      window.history.pushState({}, '', `#${currentPage}`);
    } else {
      window.history.pushState({}, '', '/');
    }
  }, [currentPage]);

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

  // If administration page, render it with its own layout
  if (currentPage === 'administration') {
    return <Administration />;
  }

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
