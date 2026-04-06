import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Globe,
  Bell,
  User,
  LogOut,
  ExternalLink,
  ChevronDown,
  Mail,
  Menu,
  X,
  Home,
  Briefcase,
  Layers,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import './Header.css';

const Header = ({ onToggleSidebar, onAccueilClick }) => {
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const profileRef = useRef(null);
  const langRef = useRef(null);
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: 'Demande validée',
      message: 'Votre demande d\'immatriculation a été validée.',
      time: 'Il y a 10 min',
      unread: true
    },
    {
      id: 2,
      title: 'Paiement reçu',
      message: 'Nous avons bien reçu votre paiement pour le permis.',
      time: 'Il y a 1 heure',
      unread: false
    },
    {
      id: 3,
      title: 'Rendez-vous',
      message: 'Votre rendez-vous est demain à 9h00.',
      time: 'Il y a 3 heures',
      unread: true
    }
  ];

  const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Utilisateur';

  const languages = [
    { code: 'FR', label: 'Français', flag: '🇫🇷' },
    { code: 'EN', label: 'English', flag: '🇺🇸' },
    { code: 'KH', label: 'Kreyòl HT', flag: '🇭🇹' }
  ];

  const services = [
    { name: 'Guide Immatriculation', path: '/user/nouvelle-demande' },
    { name: 'Immatriculer un véhicule', path: '/user/nouvelle-demande' },
    { name: 'Renouveler une plaque', path: '/user/nouvelle-demande' },
    { name: 'Transférer un véhicule', path: '/user/nouvelle-demande' },
    { name: 'Remplacer une plaque', path: '/user/nouvelle-demande' },
    { name: 'Faire une demande de permis', path: '/user/nouvelle-demande' },
    { name: 'Renouveler un permis', path: '/user/nouvelle-demande' },
    { name: 'Payer une contravention', path: '/user/paiements' },
    { name: 'Statut des demandes', path: '/user/statut' },
    { name: 'Prendre un rendez-vous', path: '/user/statut' },
    { name: 'Tableau de bord', path: '/user' },
    { name: 'Profil utilisateur', path: '/user/profile' },
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.trim()) {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleServiceSelect = (path) => {
    setSearchValue('');
    setShowResults(false);
    navigate(path);
  };

  return (
    <div className="header-wrapper">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-container">
          <div className="header-left-side">
            <button className="mobile-menu-btn" onClick={() => onToggleSidebar && onToggleSidebar()}>
              <Menu size={24} />
            </button>
            <Link to="/user" className="logo">
              <div className="logo-titles">
                <span className="logo-text">SIAAH</span>
              </div>
            </Link>
          </div>

          <div className="search-section" ref={searchRef}>
            <div className="search-bar">
              <Search size={18} className="search-icon-header" />
              <input
                type="text"
                placeholder="Rechercher un service, un dossier..."
                value={searchValue}
                onChange={handleSearch}
                onFocus={() => searchValue && searchResults.length > 0 && setShowResults(true)}
              />
              {showResults && searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="search-result-item"
                      onClick={() => handleServiceSelect(result.path)}
                    >
                      <Search size={14} style={{ marginRight: '10px', opacity: 0.6 }} />
                      {result.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="header-actions">
            {/* Language Selector */}
            <div className="action-item" ref={langRef}>
              <button
                className="lang-btn"
                onClick={() => setIsLangOpen(!isLangOpen)}
              >
                <Globe size={20} />
                <span className="current-lang-code">{currentLangObj.code}</span>
                <ChevronDown size={14} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="dropdown-menu lang-dropdown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`dropdown-item ${language === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                    >
                      <span className="lang-flag">{lang.flag}</span>
                      <span className="lang-name">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="action-item" ref={notificationsRef}>
              <button
                className="notification-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </button>

              {isNotificationsOpen && (
                <div className="dropdown-menu notification-dropdown">
                  <div className="dropdown-header-title">
                    <h3>Notifications</h3>
                    <button className="mark-read-btn">Tout marquer comme lu</button>
                  </div>
                  <div className="notification-list">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                        <div className="notif-content">
                          <p className="notif-title">{notif.title}</p>
                          <p className="notif-message">{notif.message}</p>
                          <span className="notif-time">{notif.time}</span>
                        </div>
                        {notif.unread && <span className="unread-dot"></span>}
                      </div>
                    ))}
                  </div>
                  <button className="view-all-notifs">Voir toutes les notifications</button>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="action-item" ref={profileRef}>
              <button
                className="profile-trigger"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="profile-user-info">
                  <span className="user-name-header">{userName}</span>
                </div>
                <div className="profile-avatar">
                  <User size={20} />
                </div>
                <ChevronDown size={14} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="dropdown-menu profile-dropdown">
                  <div className="profile-header-dropdown">
                    <div className="profile-avatar-large">
                      <User size={24} />
                    </div>
                    <div className="profile-user-details">
                      <span className="full-name-dropdown">{userName}</span>
                      <span className="email-dropdown">{user?.email || 'user@example.com'}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/user/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    <User size={18} />
                    Mon Profil
                  </Link>
                  <Link to="/" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    <ExternalLink size={18} />
                    Retour sur le site
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item logout-item"
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                  >
                    <LogOut size={18} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Header */}
      <nav className="secondary-nav">
        <div className="nav-container">
          <NavLink
            to="/user"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onAccueilClick && onAccueilClick()}
          >
            <Home className="nav-icon-mobile" size={18} />
            <span className="nav-text-desktop">Accueil</span>
          </NavLink>
          <NavLink to="/user/nouvelle-demande" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Briefcase className="nav-icon-mobile" size={18} />
            <span className="nav-text-desktop">Services</span>
          </NavLink>
          <NavLink to="/user/statut" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Layers className="nav-icon-mobile" size={18} />
            <span className="nav-text-desktop">Mes Dossiers</span>
          </NavLink>
          <NavLink to="/user/paiements" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <CreditCard className="nav-icon-mobile" size={18} />
            <span className="nav-text-desktop">Paiements</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Header;
