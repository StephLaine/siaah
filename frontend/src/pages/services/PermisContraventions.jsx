import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Pointer, Info, Gavel, Search, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceFormDownload from '../../components/ServiceFormDownload';

const PermisContraventions = () => {
    const [isOpen, setIsOpen] = useState(false);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const attentionPulse = {
        animate: {
            scale: [1, 1.02, 1],
            boxShadow: ["0px 0px 0px rgba(59, 89, 152, 0)", "0px 0px 20px rgba(59, 89, 152, 0.4)", "0px 0px 0px rgba(59, 89, 152, 0)"],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
    };

    return (
        <motion.div initial="hidden" animate="visible" className="bg-white min-h-screen font-sans pb-20">
            {/* Sub-Navigation Bar */}
            <motion.div variants={fadeInUp} className="bg-white border-b border-[#3b5998] py-4">
                <div className="container mx-auto px-10">
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-12 md:gap-20 text-[11px] md:text-xs font-bold text-gray-800 uppercase tracking-widest">
                        <Link to="/services/permis" className="hover:text-[#3b5998] transition-colors">Demander un permis</Link>
                        <Link to="/services/permis/renouveler" className="hover:text-[#3b5998] transition-colors">Renouveler votre permis</Link>
                        <Link to="/services/permis/remplacer" className="hover:text-[#3b5998] transition-colors">Remplacer votre carte</Link>
                        <Link to="/services/permis/contraventions" className="text-[#3b5998] border-b-2 border-[#3b5998] pb-1">Les contraventions</Link>
                        <Link to="/services/permis/autres" className="hover:text-[#3b5998] transition-colors">autres</Link>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-3/4 space-y-12">
                        <motion.header variants={fadeInUp} className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">
                                GESTION DES CONTRAVENTIONS
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                Consultez, contestez ou payez vos amendes de circulation en ligne. SIAAH centralise vos contraventions pour une gestion simplifiée et transparente de votre dossier de conducteur.
                            </p>
                        </motion.header>

                        {/* Search Bar Placeholder */}
                        <motion.div variants={fadeInUp} className="bg-slate-900 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10 space-y-6">
                                <h4 className="text-white text-xl font-black uppercase tracking-tight">Vérifier mon dossier</h4>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            type="text"
                                            placeholder="Numéro de permis ou matricule fiscal"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                                        />
                                    </div>
                                    <button className="bg-amber-400 text-slate-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-amber-300 transition-colors">
                                        Rechercher
                                    </button>
                                </div>
                            </div>
                            <Shield className="absolute -right-20 -bottom-20 h-80 w-80 text-white/5" />
                        </motion.div>

                        {/* Contravention Types */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex gap-6">
                                <Gavel className="h-12 w-12 text-[#3b5998] shrink-0" />
                                <div className="space-y-2">
                                    <h4 className="font-black text-[#1a1a1a] uppercase tracking-tight">Amendes Fixes</h4>
                                    <p className="text-gray-600 text-sm">Contraventions standard (stationnement, excès de vitesse léger).</p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex gap-6">
                                <Info className="h-12 w-12 text-[#3b5998] shrink-0" />
                                <div className="space-y-2">
                                    <h4 className="font-black text-[#1a1a1a] uppercase tracking-tight">Contestation</h4>
                                    <p className="text-gray-600 text-sm">Vous disposez de 15 jours pour contester une amende injustifiée.</p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="pt-8 w-full max-w-lg mx-auto lg:mx-0">
                            <ServiceFormDownload serviceName="contestation d'amende" />
                        </div>

                        {/* Steps Accordion */}
                        <motion.div variants={fadeInUp} className="border border-slate-200 rounded-sm overflow-hidden" {...attentionPulse}>
                            <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-[#3b5998] text-white px-6 py-4 flex items-center justify-between hover:bg-[#2d4373] transition-all group">
                                <span className="font-bold text-base md:text-lg tracking-wide uppercase">Comment payer mon amende ?</span>
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                    <ChevronDown className="h-5 w-5" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.8 }} className="overflow-hidden">
                                        <div className="bg-[#eff6ff]/30 p-8 space-y-6">
                                            <div className="flex items-start gap-4">
                                                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                                                <p className="text-gray-800 font-medium">Connectez-vous à votre espace citoyen SIAAH.</p>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                                                <p className="text-gray-800 font-medium">Sélectionnez la contravention dans l'onglet "Mes Dossiers".</p>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                                                <p className="text-gray-800 font-medium">Payez en ligne de manière sécurisée par carte ou MonCash.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-[#3b5998] text-white p-10 rounded-3xl shadow-2xl space-y-12 sticky top-8">
                            <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">Conséquences</h3>
                            <ul className="space-y-6 text-sm font-bold opacity-90">
                                <li className="flex items-start gap-3"><div className="w-2 h-2 bg-red-400 rounded-full shrink-0 mt-1.5"></div>Suspension de permis</li>
                                <li className="flex items-start gap-3"><div className="w-2 h-2 bg-red-400 rounded-full shrink-0 mt-1.5"></div>Majoration des frais</li>
                                <li className="flex items-start gap-3"><div className="w-2 h-2 bg-red-400 rounded-full shrink-0 mt-1.5"></div>Points de pénalité</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PermisContraventions;
