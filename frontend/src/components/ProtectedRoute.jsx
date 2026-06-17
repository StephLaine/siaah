import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ROLE MAP COMPLET:
 *  1 → Super Admin            → /superadmin
 *  2 → Admin (entité)         → /admin
 *  3 → Employé                → /admin
 *  4 → Agent Immatriculation  → /admin  (module immat)
 *  5 → Agent Assurance        → /admin  (module assurances)
 *  6 → Agent Permis           → /admin  (module permis)
 *  7 → Agent Routier          → /admin  (module contraventions)
 *  8 → User/Citoyen           → /user
 */
const getDefaultRoute = (roleId) => {
    switch (roleId) {
        case 1:  return '/superadmin/dashboard';
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:  return '/admin/dashboard';
        default: return '/user'; // role_id = 8 ou inconnu
    }
};

/**
 * ProtectedRoute
 * @param {React.ReactNode} children   — composant à rendre si autorisé
 * @param {number[]}  allowedRoles     — rôles autorisés (ex: [2, 3]). Vide = tout utilisateur connecté.
 * @param {number[]}  forbiddenRoles   — rôles explicitement interdits (redirection douce)
 */
const ProtectedRoute = ({ children, allowedRoles, forbiddenRoles }) => {
    const { user, token, loading } = useAuth();
    const location = useLocation();

    // 1. Attendre la vérification du token
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#3b5998] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#3b5998] font-bold uppercase tracking-widest text-sm">
                        Vérification de l'accès...
                    </p>
                </div>
            </div>
        );
    }

    // 2. Non connecté → login
    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Rôle interdit → redirection douce vers sa page d'accueil
    if (forbiddenRoles && forbiddenRoles.includes(user.role_id)) {
        return <Navigate to={getDefaultRoute(user.role_id)} replace />;
    }

    // 4. Rôle non autorisé → redirection vers sa page d'accueil (pas vers '/')
    if (allowedRoles && !allowedRoles.includes(user.role_id)) {
        return <Navigate to={getDefaultRoute(user.role_id)} replace />;
    }

    return children;
};

export default ProtectedRoute;
