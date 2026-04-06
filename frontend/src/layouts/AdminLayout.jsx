import { Outlet } from 'react-router-dom';

/**
 * AdminLayout — accessible aux rôles 2 (Admin) et 3 (Employé).
 * La sécurité est gérée par ProtectedRoute dans routes.jsx.
 */
const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-slate-100">
            <Outlet />
        </div>
    );
};

export default AdminLayout;
