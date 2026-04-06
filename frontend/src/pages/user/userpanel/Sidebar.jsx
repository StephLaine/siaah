import React, { useState } from 'react';
import {
  Car,
  Contact,
  ShieldCheck,
  FileWarning,
  CalendarDays,
  Settings,
  ChevronRight,
  ChevronDown,
  Menu,
  User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.css';

const menuItems = [
  {
    id: 'immatriculation',
    icon: Car,
    label: 'Immatriculation',
    subItems: [
      { label: 'Guide', contentId: 'guide-immatriculation' },
      { label: 'Immatriculer un véhicule', contentId: 'nouvelle-immatriculation' },
      { label: "Renouveler une plaque", contentId: 'renouvellement-plaque' },
      { label: 'Transférer un Véhicule', contentId: 'transfert-vehicule' },
      { label: 'Remplacer une Plaque', contentId: 'remplacement-plaque' },
      { label: 'Dossiers Rejetés', path: '/user/statut?type=immatriculation&status=rejected' },
    ]
  },
  {
    id: 'mes-vehicules',
    icon: Car,
    label: 'Mes Véhicules',
    subItems: []
  },
  {
    id: 'permis',
    icon: Contact,
    label: 'Permis de Conduire',
    subItems: [
      { label: 'Guide', contentId: 'guide-permis' },
      { label: 'Nouveau permis de conduire', contentId: 'nouvelle-demande-permis' },
      { label: 'Remplacer un permis de conduire', contentId: 'remplacer-permis' },
      { label: 'Renouveler un permis de conduire', contentId: 'renouveler-permis' },
      { label: 'Corriger un permis de conduire', contentId: 'corriger-permis' },
      { label: 'Mon permis', contentId: 'mon-permis' },
    ]
  },
  {
    id: 'assurance',
    icon: ShieldCheck,
    label: 'Assurance',
    subItems: [
      { label: 'Guide', contentId: 'guide-assurance' },
      { label: "Faire une demande d'assurance", contentId: 'nouvelle-assurance' },
      { label: 'Renouveler une assurance', contentId: 'renouvellement-assurance' },
    ]
  },
  {
    id: 'contraventions',
    icon: FileWarning,
    label: 'Contraventions',
    subItems: [
      { label: 'Guide', contentId: 'guide-contraventions' },
      { label: 'Voir Mes Contraventions', contentId: 'liste-contraventions' },
      { label: 'Payer une contravention', contentId: 'paiement-contravention' },
    ]
  },
  {
    id: 'rendez-vous',
    icon: CalendarDays,
    label: 'Prendre un rendez-vous',
    subItems: []
  },
];

const Sidebar = ({ isOpen, onToggle, onContentSelect, activeContentId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Utilisateur';

  const [expandedItems, setExpandedItems] = useState({
    immatriculation: true,
    permis: true,
    assurance: false,
    contraventions: false,
  });

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Auto-expand parent if a sub-item is active
  React.useEffect(() => {
    if (activeContentId) {
      const parentItem = menuItems.find(item =>
        item.subItems.some(sub => sub.contentId === activeContentId)
      );
      if (parentItem && !expandedItems[parentItem.id]) {
        setExpandedItems(prev => ({ ...prev, [parentItem.id]: true }));
      }
    }
  }, [activeContentId]);

  const handleSubItemClick = (e, subItem) => {
    e.stopPropagation();
    if (subItem.path) {
      navigate(subItem.path);
    } else if (subItem.contentId) {
      onContentSelect && onContentSelect(subItem.contentId);
    }
  };

  const handleParentClick = (item) => {
    if (item.subItems.length > 0) {
      const isExpanded = expandedItems[item.id];
      const hasActiveChild = item.subItems.some(s => s.contentId === activeContentId);

      // Always expand
      if (!isExpanded) {
        setExpandedItems(prev => ({ ...prev, [item.id]: true }));
      }

      // Navigate to the guide (first sub-item) unless already on a sub-item of this category
      if (!hasActiveChild) {
        onContentSelect && onContentSelect(item.subItems[0].contentId);
      }

      // If already expanded AND already on a child, just collapse/expand
      if (isExpanded && hasActiveChild) {
        toggleExpanded(item.id);
      }
    } else {
      onContentSelect && onContentSelect(item.id);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Toggle button */}
      <div className="sidebar-header">
        <button className="hamburger-menu" onClick={onToggle} title="Masquer/Afficher le menu">
          <Menu size={20} />
        </button>
        {isOpen && <span className="sidebar-title">Menu</span>}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems[item.id];
          const hasActiveChild = item.subItems.some(s => s.contentId === activeContentId);
          const isDirectActive = !item.subItems.length && activeContentId === item.id;
          const isParentActive = hasActiveChild || isDirectActive;

          return (
            <div key={item.id} className={`nav-section ${isParentActive ? 'section-active' : ''}`}>
              {/* Parent item */}
              <div
                className={`nav-item
                  ${isExpanded ? 'expanded' : ''}
                  ${isParentActive ? 'active' : ''}
                `}
                onClick={() => handleParentClick(item)}
                title={item.label}
              >
                {/* Chevron indicator */}
                <span className="nav-arrow" style={{ visibility: item.subItems.length > 0 ? 'visible' : 'hidden' }}>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>

                {/* Icon */}
                <span className={`nav-icon ${isParentActive ? 'icon-active' : ''}`}>
                  <Icon size={20} />
                </span>

                {/* Label */}
                <span className="nav-label">{item.label}</span>

                {/* Active indicator dot */}
                {isParentActive && <span className="active-dot" />}
              </div>

              {/* Sub-items list */}
              {item.subItems.length > 0 && (
                <div
                  className={`sub-items-container ${isExpanded ? 'show' : 'hide'}`}
                  style={{
                    maxHeight: isExpanded ? `${item.subItems.length * 56}px` : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {item.subItems.map((subItem, idx) => {
                    const isSubActive = activeContentId === subItem.contentId;
                    return (
                      <div
                        key={`${item.id}-${idx}`}
                        className={`sub-item ${isSubActive ? 'active' : ''}`}
                        onClick={(e) => handleSubItemClick(e, subItem)}
                        title={subItem.label}
                      >
                        <span className={`sub-indicator ${isSubActive ? 'active' : ''}`} />
                        <span className="sub-label">{subItem.label}</span>
                        {isSubActive && <span className="sub-active-marker" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer: User & Settings */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card" onClick={() => onContentSelect && onContentSelect('settings')}>
          <div className="user-avatar-small">
            <UserIcon size={18} />
          </div>
          {isOpen && (
            <div className="user-info-mini">
              <span className="user-name-mini">{userName}</span>
              <span className="user-role-mini">Citoyen</span>
            </div>
          )}
        </div>

        <div
          className={`settings-item ${activeContentId === 'settings' ? 'active' : ''}`}
          onClick={() => onContentSelect && onContentSelect('settings')}
          title="Paramètres"
        >
          <span className={`settings-icon ${activeContentId === 'settings' ? 'icon-active' : ''}`}>
            <Settings size={20} />
          </span>
          <span className="settings-label">Paramètres</span>
          {activeContentId === 'settings' && <span className="active-dot" />}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
