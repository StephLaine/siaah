import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Appointment from './pages/Appointment';
import Knowledge from './pages/Knowledge';
import Actualites from './pages/Actualites';
import PermisConduire from './pages/services/PermisConduire';
import PermisRenouveler from './pages/services/PermisRenouveler';
import PermisRemplacer from './pages/services/PermisRemplacer';
import PermisContraventions from './pages/services/PermisContraventions';
import PermisAutres from './pages/services/PermisAutres';
import Immatriculation from './pages/services/Immatriculation';
import ImmatRemplacer from './pages/services/ImmatRemplacer';
import ImmatRenouveler from './pages/services/ImmatRenouveler';
import ImmatTransfert from './pages/services/ImmatTransfert';
import Assurances from './pages/services/Assurances';
import AssurRemplacer from './pages/services/AssurRemplacer';
import AssurRenouveler from './pages/services/AssurRenouveler';
import AssurTransfert from './pages/services/AssurTransfert';
import AssurSinistre from './pages/services/AssurSinistre';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';

// User Pages
import UserProfile from './pages/user/Profile';
import UserApplications from './pages/user/Applications';
import UserDashboard from './pages/user/UserDashboard';
import StatutDemandes from './pages/user/StatutDemandes';
import Paiements from './pages/user/Paiements';
import PaymentSuccess from './pages/user/PaymentSuccess';
import PaymentCancelled from './pages/user/PaymentCancelled';


// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import EntitesManager from './pages/superadmin/EntitesManager';
import BureauxManager from './pages/superadmin/BureauxManager';
import UtilisateursManager from './pages/superadmin/UtilisateursManager';
import ServicesManager from './pages/superadmin/ServicesManager';
import ServiceSummary from './pages/superadmin/ServiceSummary';

/**
 * ══════════════════════════════════════════════════
 *  ROLE MAPPING
 * ══════════════════════════════════════════════════
 *  role_id = 1  →  Super Admin   →  /superadmin
 *  role_id = 2  →  Admin (entité)→  /admin
 *  role_id = 3  →  Employé       →  /admin
 *  role_id = 4  →  Citoyen/User  →  /user
 * ══════════════════════════════════════════════════
 */

/**
 * SmartLoginRedirect — si l'utilisateur est déjà connecté et accède à /login ou /register,
 * le rediriger automatiquement vers sa page d'accueil correspondante.
 */
const SmartLoginRedirect = ({ children }) => {
    const { user, token, loading } = useAuth();

    if (loading) return null; // Attendre la résolution du token

    if (token && user) {
        if (user.role_id === 1)  return <Navigate to="/superadmin/dashboard" replace />;
        if (user.role_id === 2)  return <Navigate to="/admin/dashboard" replace />;
        if (user.role_id === 3)  return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/user" replace />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Router>
            <ScrollToTop />
            <Routes>

                {/* ══════════════════════════════════ */}
                {/*  PUBLIC ROUTES (pas de token requis) */}
                {/* ══════════════════════════════════ */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />

                    {/* Login/Register : redirige si déjà connecté */}
                    <Route path="/login"    element={<SmartLoginRedirect><Login /></SmartLoginRedirect>} />
                    <Route path="/register" element={<SmartLoginRedirect><Register /></SmartLoginRedirect>} />

                    <Route path="/services/permis"                     element={<PermisConduire />} />
                    <Route path="/services/permis/renouveler"          element={<PermisRenouveler />} />
                    <Route path="/services/permis/remplacer"           element={<PermisRemplacer />} />
                    <Route path="/services/permis/contraventions"      element={<PermisContraventions />} />
                    <Route path="/services/permis/autres"              element={<PermisAutres />} />
                    <Route path="/services/immatriculation"            element={<Immatriculation />} />
                    <Route path="/services/immatriculation/remplacer"  element={<ImmatRemplacer />} />
                    <Route path="/services/immatriculation/renouveler" element={<ImmatRenouveler />} />
                    <Route path="/services/immatriculation/transfert"  element={<ImmatTransfert />} />
                    <Route path="/services/assurances"                 element={<Assurances />} />
                    <Route path="/services/assurances/remplacer"       element={<AssurRemplacer />} />
                    <Route path="/services/assurances/renouveler"      element={<AssurRenouveler />} />
                    <Route path="/services/assurances/transfert"       element={<AssurTransfert />} />
                    <Route path="/services/assurances/sinistre"        element={<AssurSinistre />} />
                    <Route path="/about"                               element={<About />} />
                    <Route path="/contact"                             element={<Contact />} />
                    <Route path="/appointment"                         element={<Appointment />} />
                    <Route path="/knowledge"                           element={<Knowledge />} />
                    <Route path="/knowledge/code"                      element={<Knowledge />} />
                    <Route path="/knowledge/transport"                 element={<Knowledge />} />
                    <Route path="/knowledge/stations"                  element={<Knowledge />} />
                    <Route path="/knowledge/faqs"                      element={<Knowledge />} />
                    <Route path="/actualites"                          element={<Actualites />} />
                    <Route path="/services/contravention"              element={<Knowledge />} />
                </Route>

                {/* ══════════════════════════════════ */}
                {/*  USER ROUTES — rôle 4 (Citoyen) UNIQUEMENT */}
                {/*  Les rôles 1, 2, 3 sont redirigés vers leur dashboard */}
                {/* ══════════════════════════════════ */}
                <Route
                    path="/user"
                    element={
                        <ProtectedRoute allowedRoles={[4]} >
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<UserDashboard />} />
                    <Route path="profile"           element={<UserProfile />} />
                    <Route path="nouvelle-demande"  element={<UserApplications />} />
                    <Route path="statut"            element={<StatutDemandes />} />
                    <Route path="paiements"         element={<Paiements />} />
                    
                    <Route path="payment-success"    element={<PaymentSuccess />} />
                    <Route path="payment-cancelled" element={<PaymentCancelled />} />
                </Route>

                {/* ══════════════════════════════════ */}
                {/*  ADMIN ROUTES — rôles 2 et 3 UNIQUEMENT */}
                {/*  role_id=1 (SuperAdmin) → redirigé vers /superadmin */}
                {/*  role_id=4 (Citoyen)   → redirigé vers /user */}
                {/* ══════════════════════════════════ */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={[2, 3]}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="dashboard" element={<Dashboard />} />
                    {/* Route index de /admin → redirige vers le dashboard */}
                    <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* ══════════════════════════════════ */}
                {/*  SUPER ADMIN ROUTES — rôle 1 UNIQUEMENT */}
                {/*  Tout autre rôle est redirigé vers sa page d'accueil */}
                {/* ══════════════════════════════════ */}
                <Route
                    path="/superadmin"
                    element={
                        <ProtectedRoute allowedRoles={[1]}>
                            <SuperAdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard"    element={<SuperAdminDashboard />} />
                    <Route path="services"     element={<ServicesManager />} />
                    <Route path="services-summary" element={<ServiceSummary />} />
                    <Route path="entites"      element={<EntitesManager />} />
                    <Route path="bureaux"      element={<BureauxManager />} />
                    <Route path="utilisateurs" element={<UtilisateursManager />} />
                </Route>

                {/* ══════════════════════════════════ */}
                {/*  CATCH-ALL — page 404 → accueil */}
                {/* ══════════════════════════════════ */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </Router>
    );
};

export default AppRoutes;
