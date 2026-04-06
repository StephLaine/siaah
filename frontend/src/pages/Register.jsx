import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, CreditCard, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        nif: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData);
            navigate('/user');
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-['Inter',sans-serif]">
            {/* Main Content Container */}
            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-2 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

                {/* Left Side: Register Form */}
                <div className="max-w-md w-full mx-auto lg:ml-0">
                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-[#1a1a1a] uppercase tracking-tight mb-2">
                            Créer un compte
                        </h1>
                        <div className="h-[2px] w-full bg-slate-100 relative">
                            <div className="absolute left-0 top-0 h-full w-24 bg-[#C1272D]"></div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100"
                            >
                                {error}
                            </motion.p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#4a4a4a] uppercase tracking-wide">
                                    Prénom
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="first_name"
                                        className="w-full bg-[#f4f1f1] border-none rounded-lg px-4 py-3 text-base placeholder:text-[#b5a7a7] focus:ring-2 focus:ring-[#3b5998]/20 transition-all outline-none"
                                        placeholder="Jean"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-[#4a4a4a] uppercase tracking-wide">
                                    Nom
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="w-full bg-[#f4f1f1] border-none rounded-lg px-4 py-3 text-base placeholder:text-[#b5a7a7] focus:ring-2 focus:ring-[#3b5998]/20 transition-all outline-none"
                                        placeholder="Dupont"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-[#4a4a4a] uppercase tracking-wide">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full bg-[#f4f1f1] border-none rounded-lg px-4 py-3 text-base placeholder:text-[#b5a7a7] focus:ring-2 focus:ring-[#3b5998]/20 transition-all outline-none"
                                    placeholder="jean.dupont@exemple.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-[#4a4a4a] uppercase tracking-wide">
                                NIF / Matricule
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="nif"
                                    className="w-full bg-[#f4f1f1] border-none rounded-lg px-4 py-3 text-base placeholder:text-[#b5a7a7] focus:ring-2 focus:ring-[#3b5998]/20 transition-all outline-none"
                                    placeholder="000-000-000-0"
                                    value={formData.nif}
                                    onChange={handleChange}
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
                                    name="password"
                                    className="w-full bg-[#f4f1f1] border-none rounded-lg px-4 py-3 text-base placeholder:text-[#b5a7a7] focus:ring-2 focus:ring-[#3b5998]/20 transition-all outline-none"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
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

                        <div className="flex flex-col gap-4 pt-4">
                            <button
                                type="submit"
                                className="w-full bg-[#3b5998] text-white py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-[#2d4373] transition-all shadow-lg active:scale-95"
                            >
                                S'inscrire
                            </button>
                            <p className="text-center text-sm font-bold text-[#4a4a4a]">
                                Vous avez déjà un compte ?{' '}
                                <Link to="/login" className="text-[#3b5998] hover:underline">
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Right Side: Hero Image & Info */}
                <div className="hidden lg:flex flex-col gap-8">
                    <div className="relative rounded-2xl overflow-hidden shadow-4xl">
                        <img
                            src="src/assets/images/Liscence.png"
                            alt="Rejoignez SIAAH"
                            className="w-full h-auto aspect-[4/3] object-cover scale-x-[-1]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    <div className="space-y-3 px-2">
                        <Link to="/advantages" className="block text-[#4a4a4a] text-sm font-bold hover:text-black hover:underline transition">
                            Découvrez les avantages de nos services numériques
                        </Link>
                        <Link to="/terms" className="block text-[#4a4a4a] text-sm font-bold hover:text-black hover:underline transition">
                            Engagement de confidentialité et conditions
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Register;
