import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
    LayoutDashboard, Building2, MapPin, Users, ChevronLeft,
    ChevronRight, LogOut, Menu, ShieldCheck, Bell, Settings, Layers
} from 'lucide-react';

import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Sécurité gérée par ProtectedRoute dans routes.jsx

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
                <div className="sa-sidebar-header">
                    <div className="sa-logo">

                        {sidebarOpen && <div className="sa-logo-text"><span>SIAAH</span><small>Super Admin</small></div>}
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

                <div className="sa-sidebar-footer">
                    <button className="sa-logout-btn" onClick={handleLogout} title="Déconnexion">
                        <LogOut size={18} />
                        {sidebarOpen && <span>Déconnexion</span>}
                    </button>
                </div>
            </aside>

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
                        <button className="sa-header-icon-btn"><Bell size={18} /></button>
                        <button className="sa-header-icon-btn"><Settings size={18} /></button>
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
