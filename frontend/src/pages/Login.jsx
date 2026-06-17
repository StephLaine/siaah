import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Linkedin, Facebook, Twitter, Phone, Send } from 'lucide-react';

import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login, user: currentUser, token } = useAuth();

    // Helper de redirection selon le rôle
    const getHomeByRole = (roleId) => {
        if (roleId === 1) return '/superadmin/dashboard';
        if ([2, 3, 4, 5, 6, 7].includes(roleId)) return '/admin/dashboard';
        return '/user'; // role_id = 8 (Citoyen)
    };

    // Redirige si déjà connecté (géré aussi par SmartLoginRedirect dans routes)
    useEffect(() => {
        if (token && currentUser) {
            navigate(getHomeByRole(currentUser.role_id), { replace: true });
        }
    }, [token, currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const loggedUser = await login(email, password);
            // Redirection sécurisée : si l'utilisateur venait d'une route protégée,
            // on le renvoie là-bas uniquement si son rôle y est autorisé.
            // Sinon, on l'envoie vers sa page d'accueil par défaut.
            const from = location.state?.from?.pathname;
            const home = getHomeByRole(loggedUser.role_id);

            // Sécurité : ne pas accepter un 'from' qui appartient à un autre rôle
            const isSafeRedirect = from && from.startsWith(
                loggedUser.role_id === 1 ? '/superadmin' :
                    [2, 3, 4, 5, 6, 7].includes(loggedUser.role_id) ? '/admin' :
                        '/user'
            );

            navigate(isSafeRedirect ? from : home);
        } catch (err) {
            setError(err.response?.data?.message || 'Identifiants invalides');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-['Inter',sans-serif]">
            {/* Main Content Container */}
            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-2 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

                {/* Left Side: Login Form */}
                <div className="max-w-md w-full mx-auto lg:ml-0">
                    <div className="mb-12">

                        <h1 className="text-3xl font-black text-[#1a1a1a] uppercase tracking-tight mb-2">
                            Se Connecter
                        </h1>
                        <div className="h-[2px] w-full bg-slate-100 relative">
                            <div className="absolute left-0 top-0 h-full w-24 bg-[#C1272D]"></div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100"
                            >
                                {error}
                            </motion.p>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-[#4a4a4a] uppercase tracking-wide">
                                Adresse e-mail
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    className="w-full bg-[#f4f1f1] border-none rounded-lg px-4 py-3 text-base placeholder:text-[#b5a7a7] focus:ring-2 focus:ring-[#3b5998]/20 transition-all outline-none"
                                    placeholder="exemple@mef.ht"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-[#4a4a4a] uppercase tracking-wide">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-[#f4f1f1] border-none rounded-lg px-4 py-3 text-base placeholder:text-[#b5a7a7] focus:ring-2 focus:ring-[#3b5998]/20 transition-all outline-none"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={() => setShowPassword(!showPassword)}
                                    className="w-5 h-5 rounded border-2 border-slate-300 text-[#3b5998] focus:ring-[#3b5998]"
                                />
                                <span className="text-sm font-semibold text-[#4a4a4a] group-hover:text-black transition">
                                    Afficher le mot de passe
                                </span>
                            </label>

                            <Link to="/forgot-password" size="sm" className="block text-sm font-bold text-[#4a4a4a] hover:text-black transition underline decoration-slate-300">
                                Vous avez oublié votre mot de passe.
                            </Link>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button
                                type="submit"
                                className="flex-1 bg-[#3b5998] text-white py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-[#2d4373] transition-all shadow-lg active:scale-95"
                            >
                                Connecter
                            </button>
                            <Link
                                to="/register"
                                className="flex-1 bg-[#e8f0fe] text-[#3b5998] py-4 rounded-lg font-black text-xs uppercase tracking-widest text-center hover:bg-[#d6e4ff] transition-all active:scale-95"
                            >
                                Creer un compte
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Right Side: Hero Image & Info */}
                <div className="hidden lg:flex flex-col gap-8">
                    <div className="relative rounded-2xl overflow-hidden shadow-4xl">
                        <img
                            src="/images/Liscence.png"
                            alt="Souriez, vous êtes en Haïti"
                            className="w-full h-auto aspect-[4/3] object-cover scale-x-[-1]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    <div className="space-y-3 px-2">
                        <Link to="/advantages" className="block text-[#4a4a4a] text-sm font-bold hover:text-black hover:underline transition">
                            Consulter l'avantage de nos service en ligne
                        </Link>
                        <Link to="/terms" className="block text-[#4a4a4a] text-sm font-bold hover:text-black hover:underline transition">
                            Conditions d'utilisation
                        </Link>
                    </div>
                </div>
            </main>


        </div>
    );
};

export default Login;
