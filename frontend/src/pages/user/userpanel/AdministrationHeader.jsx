import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Mail,
  Shield,
  Building2,
  Clock,
  FileText,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import './AdministrationHeader.css';

const getStatusColor = (status) => {
  const map = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    completed: '#22c55e',
    rejected: '#ef4444',
  };
  return map[status] || '#94a3b8';
};

const getRoleLabel = (roleId) => {
  if (roleId === 1) return 'Super Admin';
  if (roleId === 2) return 'Administrateur';
  if (roleId === 3) return 'Employé';
  return 'Utilisateur';
};

const AdministrationHeader = ({ onResultClick, activeSection, onToggleSidebar }) => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const moduleNames = {
    'immatriculation': 'Gestion des Immatriculations',
    'permis-de-conduire': 'Gestion des Permis de Conduire',
    'assurances': 'Gestion des Assurances',
    'contraventions': 'Gestion des Contraventions',
    'code-de-la-route': 'Gestion du Code de la Route',
    'station-de-services': 'Gestion des Stations de Services',
    'accidents-de-la-route': 'Gestion des Accidents de la Route',
    'tableau-de-bord': 'Vue d\'ensemble',
    'gestion-usagers': 'Gestion des Usagers',
    'gestion-employes': 'Gestion des Employés',
    'reception-demandes': 'Nouvelles Demandes',
    'documents-analyse': 'Analyse En Cours',
    'dossiers-traites': 'Dossiers Traités',
    'dossiers-refuses': 'Dossiers Rejetés',
    // Permis
    'nouvelle-demande-permis': 'Nouvelles Demandes',
    'analyse-en-cours-permis': 'Analyse En Cours',
    'dossier-refuse-permis': 'Dossiers Rejetés',
    'paiement-permis': 'Paiements',
    // Vehicle
    'gestion-vehicules': 'Gestion des Véhicules',
    'flotte-vehicules': 'Flotte de Véhicules',
    'config-marques': 'Marques & Modèles',
    'config-couleurs': 'Couleurs'
  };

  const sectionModuleMap = {
    'reception-demandes': 'immatriculation',
    'documents-analyse': 'immatriculation',
    'dossiers-traites': 'immatriculation',
    'dossiers-refuses': 'immatriculation',
    'nouvelle-demande-permis': 'permis de conduire',
    'analyse-en-cours-permis': 'permis de conduire',
    'dossier-refuse-permis': 'permis de conduire',
    'paiement-permis': 'permis de conduire',
    'flotte-vehicules': 'Gestion des Véhicules',
    'config-marques': 'Gestion des Véhicules',
    'config-couleurs': 'Gestion des Véhicules'
  };

  const getFullTitle = () => {
    const parentModule = sectionModuleMap[activeSection];
    const subModule = moduleNames[activeSection];
    if (parentModule && subModule) {
      return `${parentModule} : ${subModule}`;
    }
    return moduleNames[activeSection] || 'Administration';
  };

  const currentModule = getFullTitle();

  // ── User dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // User position/poste
  const userPosition = user?.job_title || getRoleLabel(user?.role_id);

  // ── Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchError, setSearchError] = useState('');
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchTimer = useRef(null);

  // ── Notifications Logic
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Mobile backdrop — true when any admin dropdown is open
  const isAnyAdminDropdownOpen = profileOpen || isNotificationsOpen;

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', {
        headers: authHeader
      });
      if (response.data.status === 'success') {
        setNotifications(response.data.data);
        setUnreadCount(response.data.data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: authHeader
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, {
        headers: authHeader
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const authHeader = { Authorization: `Bearer ${token}` };

  // ── Click outside triggers
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setIsNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Search Logic
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (val.trim().length < 2) {
      setResults([]);
      setSearchOpen(false);
      return;
    }

    setSearching(true);
    setSearchOpen(true);

    searchTimer.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/admin/search?query=${encodeURIComponent(val)}`, {
          headers: authHeader
        });

        // The globalSearch API might return { status, type, data } for single match
        // or a list if refactored. For now, let's normalize to a list for the dropdown.
        const data = res.data;
        let finalResults = [];

        if (data.status === 'success') {
          if (data.allResults) {
            finalResults = data.allResults.map(u => ({ ...u, result_type: 'user' }));
          } else if (data.type === 'request') {
            finalResults = [{ ...data.data, result_type: 'request' }];
          } else if (data.type === 'user') {
            finalResults = [{ ...data.data, result_type: 'user' }];
          }
        }

        setResults(finalResults);
        setSearchError('');
      } catch (err) {
        console.error('Search error:', err);
        setSearchError('Erreur lors de la recherche');
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeAllAdminDropdowns = () => {
    setProfileOpen(false);
    setIsNotificationsOpen(false);
  };

  return (
    <header className="admin-header">
      {/* Mobile blurred backdrop for admin dropdowns */}
      {isAnyAdminDropdownOpen && (
        <div
          className="admin-mobile-sheet-backdrop"
          onClick={closeAllAdminDropdowns}
          aria-hidden="true"
        />
      )}
      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="top-header">
        <button className="admin-hamburger-btn" onClick={onToggleSidebar} title="Menu">
          <Menu size={22} />
        </button>

        {/* Left — Logo (Collé à gauche) */}
        <div className="logo-section">
          <Link to="/user/administration" className="logo">
            <img src="/images/logo_siaah_white.svg" alt="SIAAH Logo" className="header-logo-img" />
          </Link>
        </div>

        {/* Center — Recherche Globale */}
        <div className="search-section" ref={searchRef}>
          <form className="header-search-container" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              onFocus={() => results.length > 0 && setSearchOpen(true)}
              placeholder="Rechercher par N° dossier, nom, email ou NIF..."
              className="header-search-input"
              autoComplete="off"
            />
            {searching ? (
              <div className="header-search-icon search-spinner" />
            ) : query ? (
              <button
                type="button"
                className="header-search-clear"
                onClick={() => { setQuery(''); setResults([]); setSearchOpen(false); }}
              >
                <X size={15} />
              </button>
            ) : (
              <Search className="header-search-icon" size={18} />
            )}
          </form>

          {/* Résultats dropdown */}
          {searchOpen && (
            <div className="search-results-dropdown">
              {searchError ? (
                <div className="search-no-results">{searchError}</div>
              ) : results.length === 0 ? (
                <div className="search-no-results">
                  Aucun résultat pour « {query} »
                </div>
              ) : (
                <>
                  <div className="search-results-header">
                    <span>{results.length} résultat(s) trouvé(s)</span>
                  </div>
                  {results.map((r) => (
                    <div
                      key={`${r.result_type}-${r.id}`}
                      className="search-result-item"
                      onClick={() => {
                        if (onResultClick) {
                          // Pass extra info if it's a user search result
                          onResultClick(r.result_type === 'user' ? { ...r, type: 'user_search' } : r);
                        }
                        setSearchOpen(false);
                        setQuery('');
                        setResults([]);
                      }}
                    >
                      <div className="search-result-icon">
                        {r.result_type === 'user' ? <User size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="search-result-info">
                        <div className="search-result-title">
                          {r.result_type === 'user' ? (
                            <>Profil <strong>{r.first_name} {r.last_name}</strong></>
                          ) : (
                            <>Dossier <strong>#{r.id}</strong> — {r.type}</>
                          )}
                        </div>
                        <div className="search-result-meta">
                          {r.result_type === 'request' && <>{r.first_name} {r.last_name} · </>}
                          {r.email && <>{r.email}</>}
                          {r.nif && <> · NIF: {r.nif}</>}
                        </div>

                        <div className="search-result-meta">
                          {r.office_name && <><Building2 size={10} /> {r.office_name} · </>}
                          <Clock size={10} /> {new Date(r.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <span
                        className="search-result-status"
                        style={{ background: r.result_type === 'user' ? '#1a367c' : getStatusColor(r.status) }}
                      >
                        {r.result_type === 'user' ? 'Usager' :
                          r.status === 'pending' ? 'En attente' :
                            r.status === 'processing' ? 'En analyse' :
                              r.status === 'completed' ? 'Acceptée' :
                                r.status === 'rejected' ? 'Refusée' : r.status}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right — Actions + Profile (Collé à droite) */}
        <div className="header-actions">
          {/* Notification Bell */}
          <div className="notification-bell-wrapper" ref={notificationsRef}>
            <button
              className={`notification-bell ${isNotificationsOpen ? 'active' : ''}`}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isNotificationsOpen && (
              <div className="admin-notification-dropdown">
                <div className="dropdown-header-title">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button className="mark-read-btn" onClick={handleMarkAllRead}>Tout marquer comme lu</button>
                  )}
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="empty-notifications">Aucune notification</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        <div className="notif-content">
                          <p className="notif-title">{notif.title}</p>
                          <p className="notif-message">{notif.message}</p>
                          <span className="notif-time">{new Date(notif.created_at).toLocaleString('fr-FR')}</span>
                        </div>
                        {!notif.is_read && <span className="unread-dot"></span>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── User Profile Dropdown */}
          <div className="user-profile-wrapper" ref={profileRef}>
            <button
              className="user-profile-trigger"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="user-profile-text">
                <span className="user-name-header">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="user-role-badge-small">
                  {userPosition}
                </span>
              </div>
              <div className="user-avatar-circle">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <ChevronDown
                size={14}
                className="profile-chevron"
                style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
              />
            </button>

            {/* Dropdown menu */}
            {profileOpen && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div className="profile-dropdown-info">
                    <div className="profile-dropdown-name">{user?.first_name} {user?.last_name}</div>
                    <div className="profile-dropdown-role">
                      <Shield size={11} />
                      {userPosition}
                    </div>
                  </div>
                </div>

                <div className="profile-dropdown-divider" />

                <div className="profile-dropdown-item info-item">
                  <Mail size={14} />
                  <span>{user?.email}</span>
                </div>
                <div className="profile-dropdown-item info-item">
                  <Building2 size={14} />
                  <span>Bureau: {user?.office_name || 'Central'}</span>
                </div>

                <div className="profile-dropdown-divider" />

                <button className="profile-dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={14} />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Secondary Header ────────────────────────────────────── */}
      <div className="secondary-header">
        <div className="secondary-container">
          <div className="office-title">
            <Building2 size={18} />
            <span>
              SIAAH — {user?.entity_sigle || user?.entity_name || 'DGI'} {user?.office_name ? user.office_name : 'Port-au-Prince'}
              <span className="office-subtitle"> | {currentModule}</span>
            </span>
            <p className="office-subtitle">| {user?.entity_name || 'Direction Générale des Impôts'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdministrationHeader;
