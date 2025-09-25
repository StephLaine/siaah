import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle, onContentSelect }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    { 
      id: 'immatriculation',
      icon: '🚗', 
      label: 'Immatriculation - GUIDE', 
      code: 'XYZ 000',
      arrow: '▶',
      subItems: [
        { label: 'Presentation du Service d\'immatriculation', contentId: 'presentation' },
        { label: 'Type d\'operation dispo - nibles', contentId: 'types-operations' },
        { label: 'Tarifs et Frais', contentId: 'tarifs' },
        { label: 'Etapes du processus', contentId: 'etapes' }
      ]
    },
    { 
      id: 'licence',
      icon: '🆔', 
      label: 'Licence - GUIDE', 
      arrow: '▶',
      subItems: [
        { label: 'Presentation du Service de licence', contentId: 'licence-presentation' },
        { label: 'Type d\'operation dispo - nibles', contentId: 'licence-types-operations' },
        { label: 'Tarifs et Frais', contentId: 'licence-tarifs' },
        { label: 'Etapes du processus', contentId: 'licence-etapes' }
      ]
    },
    { 
      id: 'assurance',
      icon: '🛡️', 
      label: 'Assurance - GUIDE', 
      arrow: '▶',
      subItems: [
        { label: 'Presentation du Service d\'assurance', contentId: 'assurance-presentation' },
        { label: 'Type d\'operation dispo - nibles', contentId: 'assurance-types-operations' },
        { label: 'Tarifs et Frais', contentId: 'assurance-tarifs' },
        { label: 'Etapes du processus', contentId: 'assurance-etapes' }
      ]
    },
    { 
      id: 'rendez-vous',
      icon: '📅', 
      label: 'Prendre rendez-vous - GUIDE', 
      arrow: '▶',
      subItems: [
        { label: 'Presentation du Service de rendez-vous', contentId: 'rendezvous-presentation' },
        { label: 'Type d\'operation dispo - nibles', contentId: 'rendezvous-types-operations' },
        { label: 'Tarifs et Frais', contentId: 'rendezvous-tarifs' },
        { label: 'Etapes du processus', contentId: 'rendezvous-etapes' }
      ]
    }
  ];

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button className="hamburger-menu" onClick={onToggle}>
          {isOpen ? '☰' : '☰'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index} className="nav-section">
            <div 
              className="nav-item" 
              onClick={() => item.subItems.length > 0 && toggleExpanded(item.id)}
            >
              <span className="nav-arrow">
                {item.subItems.length > 0 ? (expandedItems[item.id] ? '▼' : '▶') : item.arrow}
              </span>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.code && <span className="nav-code">{item.code}</span>}
            </div>
            
            {expandedItems[item.id] && item.subItems.length > 0 && (
              <div className="sub-items">
                {item.subItems.map((subItem, subIndex) => (
                  <div 
                    key={subIndex} 
                    className="sub-item"
                    onClick={() => onContentSelect && onContentSelect(subItem.contentId)}
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

      <div className="sidebar-footer">
        <div className="settings-item">
          <span className="settings-icon">⚙️</span>
          <span className="settings-label">Parametres</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
