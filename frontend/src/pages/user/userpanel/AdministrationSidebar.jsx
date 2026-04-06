import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  ShieldCheck,
  X,
  Car,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdministrationSidebar.css';

const AdministrationSidebar = ({ isOpen, onToggle, onSectionSelect, activeSection }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({ 'suivi-demandes': true });

  // Dynamic modules base on mapping
  const moduleMap = {
    'Immatriculation': {
      id: 'immatriculation',
      icon: <FileText size={20} />,
      label: 'Immatriculation',
      subItems: [
        { id: 'reception-demandes', label: 'Nouvelles Demandes' },
        { id: 'documents-analyse',  label: 'Analyse En Cours' },
        { id: 'dossiers-traites',   label: 'Dossiers Traités' },
        { id: 'dossiers-refuses',   label: 'Dossiers Refusés' },
      ]
    },
    'Permis de Conduire': {
      id: 'permis-de-conduire',
      icon: <FileText size={20} />,
      label: 'Permis de Conduire',
      subItems: [
        { id: 'nouvelle-demande-permis', label: 'Nouvelle demande' },
        { id: 'analyse-en-cours-permis',  label: 'Analyse en cours' },
        { id: 'dossier-traite-permis',   label: 'Dossier traité' },
        { id: 'dossier-refuse-permis',   label: 'Dossier Refusé' },
        { id: 'paiement-permis',         label: 'Paiement' },
        ...(user?.role_id === 1 ? [{ id: 'config-categories', label: 'Config Catégories' }] : [])
      ]
    },
    'Assurances': {
      id: 'assurances',
      icon: <FileText size={20} />,
      label: 'Assurances',
      subItems: []
    },
    'Contraventions': {
      id: 'contraventions',
      icon: <FileText size={20} />,
      label: 'Contraventions',
      subItems: []
    },
    'Code de la route': {
      id: 'code-de-la-route',
      icon: <FileText size={20} />,
      label: 'Code de la Route',
      subItems: []
    },
    'Station de services': {
      id: 'station-de-services',
      icon: <FileText size={20} />,
      label: 'Station de Services',
      subItems: []
    },
    'Accidents de la route': {
      id: 'accidents-de-la-route',
      icon: <FileText size={20} />,
      label: 'Accidents de la Route',
      subItems: []
    },
    'Gestion des véhicules': {
        id: 'gestion-vehicules',
        icon: <Car size={20} />,
        label: 'Gestion des Véhicules',
        subItems: [
          { id: 'flotte-vehicules', label: 'Flotte de Véhicules' },
          { id: 'config-marques',   label: 'Marques & Modèles' },
          { id: 'config-couleurs',  label: 'Couleurs' },
        ],
    }
  };

  const getDynamicModules = () => {
    let names = [];
    
    if (user?.role_id === 1) {
      // SuperAdmin see all base modules
      return [
        moduleMap['Immatriculation'], 
        moduleMap['Permis de Conduire'], 
        moduleMap['Gestion des véhicules']
      ];
    }

    if (user?.role_id === 2) {
      names = user?.entity_services || [];
      // Admins always see Gestion des véhicules
      if (!names.includes('Gestion des véhicules')) {
        names.push('Gestion des véhicules');
      }
    } else if (user?.role_id === 3) {
      names = user?.assigned_services || [];
      // Employees should NOT see Gestion des véhicules unless specifically assigned?
      // User says "administrateur uniquement et les supermadmin"
      names = names.filter(n => n !== 'Gestion des véhicules');
    }
    
    // Sort names to ensure the requested order: Immatriculation -> Permis -> Gestion Véhicules
    const priority = {
        'Immatriculation': 1,
        'Permis de Conduire': 2,
        'Gestion des véhicules': 3,
        'Assurances': 4,
        'Contraventions': 5
    };

    const sortedNames = [...names].sort((a, b) => (priority[a] || 99) - (priority[b] || 99));
    
    // Map names to module objects
    return sortedNames.map(name => moduleMap[name]).filter(m => !!m);
  };

  const dynamicModules = getDynamicModules();

  const menuItems = [
    {
      id: 'tableau-de-bord',
      icon: <LayoutDashboard size={20} />,
      label: 'Tableau de Bord',
      subItems: [],
      // Visible pour tout le monde (admin et employé)
    },
    ...dynamicModules,
    {
      id: 'gestion-usagers',
      icon: <Users size={20} />,
      label: 'Usagers',
      subItems: [],
      adminOnly: true
    },
    {
      id: 'gestion-employes',
      icon: <ShieldCheck size={20} />,
      label: 'Employés',
      subItems: [],
      adminOnly: true
    },
    {
      id: 'rendez-vous',
      icon: <CalendarCheck size={20} />,
      label: 'Rendez-vous',
      subItems: []
    },
    {
      id: 'rapport',
      icon: <BarChart3 size={20} />,
      label: 'Rapports',
      subItems: []
    },
    {
      id: 'parametres',
      icon: <Settings size={20} />,
      label: 'Paramètres',
      subItems: []
    }
  ];

  // Filtrer selon le rôle (1=SuperAdmin, 2=Admin, 3=Employé)
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && user?.role_id !== 1 && user?.role_id !== 2) return false;
    return true;
  });

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (roleId) => {
    if (roleId === 1) return 'Super Admin';
    if (roleId === 2) return 'Administrateur';
    if (roleId === 3) return 'Employé';
    return 'Utilisateur';
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>

      {/* ── En-tête sidebar ─────────────────── */}
      <div className="sidebar-header">
        <button className="hamburger-menu" onClick={onToggle} title={isOpen ? 'Menu' : 'Ouvrir'}>
          <Menu size={20} />
        </button>
      </div>

      {/* ── Navigation ──────────────────────── */}
      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => (
          <div key={item.id} className="nav-section">
            <div
              className={`nav-item ${activeSection === item.id || (item.subItems.length > 0 && item.subItems.some(s => s.id === activeSection)) ? 'active' : ''}`}
              onClick={() => {
                if (item.subItems.length > 0) {
                  toggleExpanded(item.id);
                } else {
                  onSectionSelect(item.id);
                }
              }}
              title={!isOpen ? item.label : ''}
            >
              <span className="nav-icon-container">{item.icon}</span>
              {isOpen && <span className="nav-label-text">{item.label}</span>}
              {isOpen && item.subItems.length > 0 && (
                <span className="expand-chevron">
                  <ChevronDown
                    size={14}
                    style={{
                      transform: expandedItems[item.id] ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s'
                    }}
                  />
                </span>
              )}
            </div>

            {item.subItems.length > 0 && isOpen && (
              <div className={`sub-items ${expandedItems[item.id] ? 'expanded' : ''}`}>
                {item.subItems.map((subItem) => (
                  <div
                    key={subItem.id}
                    className={`sub-item ${activeSection === subItem.id ? 'active' : ''}`}
                    onClick={() => onSectionSelect(subItem.id)}
                  >
                    <span className="sub-bullet"><ChevronRight size={12} /></span>
                    <span className="sub-label">{subItem.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ── Bouton Déconnexion (en bas) ──────── */}
      <div className="sidebar-footer">
        <button
          className="sidebar-logout-btn"
          onClick={handleLogout}
          title="Déconnexion"
        >
          <LogOut size={18} />
          {isOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdministrationSidebar;
