import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Building2, MapPin, Users, ChevronLeft,
    ChevronRight, LogOut, Menu, ShieldCheck, Bell, Settings, Layers, Sun, Moon
} from 'lucide-react';

import './SuperAdminLayout.css';
import './theme.css';

const SuperAdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Apply theme class to html element
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark-theme');
        } else {
            root.classList.remove('dark-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    // On mobile start closed, on desktop start open
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/superadmin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/superadmin/services', icon: <Layers size={20} />, label: 'Services' },
        { to: '/superadmin/entites', icon: <Building2 size={20} />, label: 'Entités' },
        { to: '/superadmin/bureaux', icon: <MapPin size={20} />, label: 'Bureaux' },
        { to: '/superadmin/utilisateurs', icon: <Users size={20} />, label: 'Utilisateurs' },
    ];

    return (
        <div className={`superadmin-app ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
            {/* Sidebar */}
            <aside className="sa-sidebar">
                <div className="sa-sidebar-header glass-card">
                    <div className="sa-logo">
                        <img src="/images/logo_siaah_white.svg" alt="SIAAH" className="sa-logo-img-header" style={{ height: '75px', width: 'auto', objectFit: 'contain' }} />

                    </div>
                    <button className="sa-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                <div className="sa-mef-badge">
                    {sidebarOpen ? (
                        <div className="sa-mef-label">
                            <span>Ministère de l'Économie</span>
                            <span>et des Finances</span>
                        </div>
                    ) : <Building2 size={16} />}
                </div>

                <nav className="sa-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `sa-nav-item ${isActive ? 'active' : ''}`}
                            title={!sidebarOpen ? item.label : ''}
                        >
                            <span className="sa-nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="sa-nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sa-sidebar-footer glass-card">
                    <button className="sa-logout-btn" onClick={handleLogout} title="Déconnexion">
                        <LogOut size={18} />
                        {sidebarOpen && <span>Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile overlay — only when sidebar is open on mobile */}
            {isMobile && sidebarOpen && (
                <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Main Content */}
            <div className="sa-main">
                <header className="sa-header">
                    <div className="sa-header-left">
                        <button className="sa-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <Menu size={22} />
                        </button>
                        <div className="sa-header-title">
                            <h1>Panneau Super Administrateur</h1>
                            <p>Ministère de l'Économie et des Finances — MEF</p>
                        </div>
                    </div>
                    <div className="sa-header-right">
                        <button className="sa-header-icon-btn" aria-label="Toggle Theme" onClick={toggleTheme}>
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                        <button className="sa-header-icon-btn" aria-label="Notifications"><Bell size={18} /></button>
                        <button className="sa-header-icon-btn" aria-label="Settings"><Settings size={18} /></button>
                        <div className="sa-user-badge">
                            <div className="sa-user-avatar">SA</div>
                            <div className="sa-user-info">
                                <span>{user?.first_name} {user?.last_name}</span>
                                <small>Super Administrateur</small>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="sa-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
