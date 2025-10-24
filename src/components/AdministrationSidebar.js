import React, { useState } from 'react';
import './AdministrationSidebar.css';

const AdministrationSidebar = ({ isOpen, onToggle, onSectionSelect, activeSection }) => {
  const [expandedItems, setExpandedItems] = useState({
    'assurance-vehicule': true
  });

  const menuItems = [
    {
      id: 'assurance-vehicule',
      icon: '🚗',
      label: 'Assurance Vehicule',
      subItems: [
        { id: 'reception-demandes', label: 'Reception de Nouvelles Demandes' },
        { id: 'documents-analyse', label: 'Documents en Cours d\'Analyse' },
        { id: 'dossiers-traites', label: 'Dossiers Traites' },
        { id: 'statistiques', label: 'Statistiques' }
      ]
    },
    {
      id: 'rapport',
      icon: '📊',
      label: 'Rapport',
      subItems: []
    },
    {
      id: 'parametres',
      icon: '⚙️',
      label: 'Parametres',
      subItems: []
    }
  ];

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button className="hamburger-menu" onClick={onToggle}>
          ☰
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="nav-section">
            <div 
              className="nav-item"
              onClick={() => {
                if (item.subItems.length > 0) {
                  toggleExpanded(item.id);
                } else {
                  onSectionSelect(item.id);
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
            
            {item.subItems.length > 0 && (
              <div className={`sub-items ${expandedItems[item.id] ? 'expanded' : ''}`}>
                {item.subItems.map((subItem) => (
                  <div 
                    key={subItem.id}
                    className={`sub-item ${activeSection === subItem.id ? 'active' : ''}`}
                    onClick={() => onSectionSelect(subItem.id)}
                  >
                    <span className="sub-bullet">•</span>
                    <span className="sub-label">{subItem.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdministrationSidebar;
