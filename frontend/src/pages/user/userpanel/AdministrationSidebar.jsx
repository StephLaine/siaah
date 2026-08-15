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
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({ 'suivi-demandes': true });
  const [counts, setCounts] = useState({
    pending: 0,
    processing: 0,
    validated: 0,
    to_deliver: 0,
    appointments: 0
  });

  // Fetch counts for badges
  const fetchCounts = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/entity-admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success' && data.data.stats) {
        setCounts({
          pending: data.data.stats.pending || 0,
          processing: data.data.stats.processing || 0,
          validated: data.data.stats.validated || 0,
          to_deliver: data.data.stats.to_deliver || 0,
          appointments: data.data.stats.appointments?.pending || 0
        });
      }
    } catch (err) {
      console.error('Error fetching sidebar counts:', err);
    }
  };

  React.useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [token]);

  // Dynamic modules base on mapping
  const moduleMap = {
    'Immatriculation': {
      id: 'immatriculation',
      icon: <FileText size={20} />,
      label: 'Immatriculation',
      subItems: [
        { id: 'reception-demandes', label: 'Nouvelles Demandes', badge: counts.pending },
        { id: 'documents-analyse',  label: 'Analyse En Cours', badge: counts.processing },
        { id: 'a-assigner', label: 'À assigner' },
        { id: 'a-livrer', label: 'À livrer' },
        { id: 'dossiers-traites',   label: 'Dossiers Traités' },
        { id: 'dossiers-refuses',   label: 'Dossiers Refusés' },
      ]
    },
    'Permis de Conduire': {
      id: 'permis-de-conduire',
      icon: <FileText size={20} />,
      label: 'Permis de Conduire',
      subItems: [
        { id: 'nouvelle-demande-permis', label: 'Nouvelle demande', badge: counts.pending },
        { id: 'analyse-en-cours-permis',  label: 'Analyse en cours', badge: counts.processing },
        { id: 'dossier-traite-permis',   label: 'Dossier traité' },
        { id: 'dossier-refuse-permis',   label: 'Dossier Refusé' },
        { id: 'paiement-permis',         label: 'Paiement', badge: counts.validated },
        { id: 'a-assigner-permis', label: 'À assigner' },
        { id: 'a-livrer-permis', label: 'À livrer' },
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
      // SuperAdmin voit tous les modules de base
      return [
        moduleMap['Immatriculation'], 
        moduleMap['Permis de Conduire'], 
        moduleMap['Gestion des véhicules']
      ];
    }

    if (user?.role_id === 2) {
      // Admin Entité : modules assignés à son entité
      names = user?.entity_services || [];
    } else if (user?.role_id === 3) {
      // Employé : modules assignés individuellement
      names = user?.assigned_services || [];
    } else if (user?.role_id === 4) {
      // Agent Immatriculation : uniquement le module Immatriculation
      names = ['Immatriculation'];
    } else if (user?.role_id === 5) {
      // Agent Assurance : uniquement le module Assurances
      names = ['Assurances'];
    } else if (user?.role_id === 6) {
      // Agent Permis : uniquement le module Permis de Conduire
      names = ['Permis de Conduire'];
    } else if (user?.role_id === 7) {
      // Agent Routier : uniquement le module Contraventions
      names = ['Contraventions'];
    }

    // S'assurer que names est un tableau
    if (typeof names === 'string') {
        try {
            names = JSON.parse(names);
        } catch (e) {
            console.error("Error parsing user services:", e);
            names = [];
        }
    }
    
    if (!Array.isArray(names)) {
        names = [];
    }

    // Normaliser les noms de service de la base de données vers les clés du moduleMap
    const normalizeServiceName = (name) => {
        if (!name) return '';
        const lower = name.toLowerCase().trim();
        if (lower.includes('immatriculation')) return 'Immatriculation';
        if (lower.includes('permis')) return 'Permis de Conduire';
        if (lower.includes('assurance')) return 'Assurances';
        if (lower.includes('amende') || lower.includes('contravention')) return 'Contraventions';
        if (lower.includes('code')) return 'Code de la route';
        if (lower.includes('station')) return 'Station de services';
        if (lower.includes('accident')) return 'Accidents de la route';
        if (lower.includes('véhicule') || lower.includes('vehicule')) return 'Gestion des véhicules';
        return name;
    };

    names = names.map(normalizeServiceName);

    if (user?.role_id === 2) {
      // Les admins voient Gestion des véhicules uniquement s'ils ont le service Immatriculation
      if (names.includes('Immatriculation') && !names.includes('Gestion des véhicules')) {
        names.push('Gestion des véhicules');
      }
    } else if (user?.role_id === 3) {
      // Les employés ne voient pas Gestion des véhicules sauf si spécifiquement assigné
      names = names.filter(n => n !== 'Gestion des véhicules');
    }
    
    // Tri par priorité
    const priority = {
        'Immatriculation': 1,
        'Permis de Conduire': 2,
        'Gestion des véhicules': 3,
        'Assurances': 4,
        'Contraventions': 5
    };

    const sortedNames = [...names].sort((a, b) => (priority[a] || 99) - (priority[b] || 99));
    
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
      id: 'demarches-superadmin',
      icon: <FileText size={20} />,
      label: 'Gestion des Démarches',
      subItems: [],
      adminOnly: true
    },
    {
      id: 'rendez-vous',
      icon: <CalendarCheck size={20} />,
      label: 'Rendez-vous',
      subItems: [],
      badge: counts.appointments
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

  // Filtrer selon le rôle
  const filteredMenuItems = menuItems.filter(item => {
    // adminOnly : visible uniquement pour les rôles 1 (SuperAdmin) et 2 (Admin Entité)
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
    const labels = {
      1: 'Super Admin',
      2: 'Administrateur',
      3: 'Employé',
      4: 'Agent Immatriculation',
      5: 'Agent Assurance',
      6: 'Agent Permis',
      7: 'Agent Routier',
      8: 'Utilisateur',
    };
    return labels[roleId] || 'Utilisateur';
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>

      {/* ── En-tête sidebar ─────────────────── */}
      <div className="sidebar-header">
        <button className="hamburger-menu" onClick={onToggle} title={isOpen ? 'Menu' : 'Ouvrir'}>
          <Menu size={20} />
        </button>
        {isOpen && (
          <div className="sidebar-logo-container">
             <img src="/images/logo_siaah_white.svg" alt="SIAAH" className="sidebar-logo-img" />
          </div>
        )}
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
              {item.badge > 0 && isOpen && !item.subItems.length && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
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
