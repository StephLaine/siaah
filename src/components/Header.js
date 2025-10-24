import React from 'react';
import './Header.css';

const Header = ({ onNavigate, currentPage }) => {
  const handleNavClick = (e, page) => {
    e.preventDefault();
    onNavigate(page);
  };

  return (
    <div>
      {/* Top Header */}
      <header className="top-header">
        <div className="header-container">
                 <div className="logo-section">
                   <div className="logo">
                     <img src="/images/Coat_of_arms_of_Haiti.svg" alt="Coat of Arms of Haiti" className="haiti-coat-of-arms" />
                     <span className="logo-text">SIAAH</span>
                   </div>
                 </div>
          
          <div className="search-section">
            <div className="search-bar">
              <input type="text" placeholder="Rechercher" />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="language-selector">
              <span className="lang-icon">🌐</span>
              <span className="lang-text">Français</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            <button className="signup-btn">S'inscrire</button>
          </div>
        </div>
      </header>
      
      {/* Secondary Navigation */}
      <nav className="secondary-nav">
        <div className="nav-container">
          <a 
            href="#accueil" 
            className={`nav-item ${currentPage === 'accueil' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'accueil')}
          >
            Accueil
          </a>
          <a 
            href="#nouvelle-demande" 
            className={`nav-item ${currentPage === 'nouvelle-demande' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'nouvelle-demande')}
          >
            Nouvelle Demande
          </a>
          <a 
            href="#statut" 
            className={`nav-item ${currentPage === 'statut' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'statut')}
          >
            Statut des Demandes
          </a>
          <a 
            href="#paiements" 
            className={`nav-item ${currentPage === 'paiements' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'paiements')}
          >
            Paiements
          </a>
          <a 
            href="#administration" 
            className={`nav-item ${currentPage === 'administration' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'administration')}
          >
            Administration
          </a>
          <a href="#a-propos" className="nav-item">A Propos</a>
        </div>
      </nav>
    </div>
  );
};

export default Header;
