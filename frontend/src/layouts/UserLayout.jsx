import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import Header from '../pages/user/userpanel/Header';
import Sidebar from '../pages/user/userpanel/Sidebar';
import SidebarContent from '../pages/user/userpanel/SidebarContent';
import '../pages/user/userpanel/SiaahApp.css';

const UserLayout = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // On mobile start closed, on desktop start open
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [selectedSidebarContent, setSelectedSidebarContent] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Track mobile/desktop breakpoint
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    // KEY FIX: When a sidebar item is clicked from ANY page,
    // navigate to the dashboard and show the selected content
    const handleSidebarContentSelect = useCallback((contentId) => {
        setSelectedSidebarContent(contentId);

        // If not already on the dashboard, go there so content shows
        if (location.pathname !== '/user') {
            navigate('/user');
        }

        // On mobile, close sidebar after selection
        if (window.innerWidth <= 768) {
            setSidebarOpen(false);
        }
    }, [location.pathname, navigate]);

    const handleBackToDashboard = useCallback(() => {
        setSelectedSidebarContent(null);
    }, []);

    // Reset sidebar content ONLY when navigating to non-dashboard pages via the top nav links
    // (NOT when a sidebar item forces navigation to /user)
    useEffect(() => {
        if (location.pathname !== '/user') {
            setSelectedSidebarContent(null);
        }
    }, [location.pathname]);

    // Sécurité gérée par ProtectedRoute dans routes.jsx

    const isDashboard = location.pathname === '/user';
    const showSidebarContent = isDashboard && selectedSidebarContent;

    return (
        <div className="App">
            <Header
                onToggleSidebar={toggleSidebar}
                onAccueilClick={handleBackToDashboard}
            />
            <div className="app-body">
                <Sidebar
                    isOpen={sidebarOpen}
                    onToggle={toggleSidebar}
                    onContentSelect={handleSidebarContentSelect}
                    activeContentId={selectedSidebarContent}
                />

                {/* Mobile overlay — only when sidebar is open on mobile */}
                {isMobile && sidebarOpen && (
                    <div className="mobile-overlay" onClick={toggleSidebar}></div>
                )}

                <main className="user-main-content">
                    {showSidebarContent ? (
                        <div className="sidebar-content-wrapper">
                            <button
                                className="back-to-dashboard-btn"
                                onClick={handleBackToDashboard}
                            >
                                ← Retour au tableau de bord
                            </button>
                            <SidebarContent
                                selectedContent={selectedSidebarContent}
                                onSectionChange={setSelectedSidebarContent}
                            />
                        </div>
                    ) : (
                        <div className="outlet-wrapper">
                            <Outlet />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
