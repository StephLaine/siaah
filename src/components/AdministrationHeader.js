import React from 'react';
import './AdministrationHeader.css';

const AdministrationHeader = () => {
  return (
    <div className="admin-header">
      {/* Top Header */}
      <div className="top-header">
        <div className="header-container">
          {/* Left side - Logo */}
          <div className="logo-section">
            <div className="logo">
              <span className="logo-text">SIAAH</span>
              <span className="truck-icon">🚛</span>
            </div>
          </div>

          {/* Center - Search */}
          <div className="search-section">
            <div className="search-bar">
              <input type="text" placeholder="Hinted search text" />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="header-actions">
            <div className="language-selector">
              <span className="lang-text">文A</span>
            </div>
            <div className="notification-bell">
              <span className="bell-icon">🔔</span>
              <span className="notification-badge">1</span>
            </div>
            <div className="user-profile">
              <span className="profile-icon">👤</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Header */}
      <div className="secondary-header">
        <div className="secondary-container">
          <div className="office-title">
            Office Assurance Véhicules Contre Tiers - OAVCT
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministrationHeader;
