import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Pointer, HelpCircle, AlertTriangle, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import licenseImg from '../../assets/images/Liscence.png';
import ServiceFormDownload from '../../components/ServiceFormDownload';

const PermisRemplacer = () => {
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
                        <Link to="/services/permis/remplacer" className="text-[#3b5998] border-b-2 border-[#3b5998] pb-1">Remplacer votre carte</Link>
                        <Link to="/services/permis/contraventions" className="hover:text-[#3b5998] transition-colors">Les contraventions</Link>
                        <Link to="/services/permis/autres" className="hover:text-[#3b5998] transition-colors">autres</Link>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-3/4 space-y-12">
                        <motion.header variants={fadeInUp} className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">
                                REMPLACEMENT DE PERMIS (PERTE OU VOL)
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                Vous avez perdu votre permis de conduire ou il a été volé ? Il est impératif de demander un duplicata immédiatement pour éviter toute sanction lors d'un contrôle routier.
                            </p>
                        </motion.header>

                        {/* Critical Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div variants={fadeInUp} className="bg-red-50 p-6 rounded-2xl border border-red-100 group">
                                <AlertTriangle className="h-10 w-10 text-red-500 mb-4 group-hover:rotate-12 transition-transform" />
                                <h4 className="font-black text-sm uppercase text-red-700 mb-2">Déclaration</h4>
                                <p className="text-gray-600 text-sm">Une déclaration de perte ou de vol à la police est obligatoire.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group">
                                <HelpCircle className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-sm uppercase tracking-wider mb-2">Duplicata</h4>
                                <p className="text-gray-600 text-sm">Le duplicata conserve la date d'expiration originale de votre permis.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group">
                                <FileCheck className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-sm uppercase tracking-wider mb-2">Validation</h4>
                                <p className="text-gray-600 text-sm">Production rapide via les services sécurisés du SIAAH.</p>
                            </motion.div>
                        </div>

                        {/* Accordion Steps */}
                        <motion.div variants={fadeInUp} className="border border-slate-200 rounded-sm overflow-hidden" {...attentionPulse}>
                            <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-[#3b5998] text-white px-6 py-4 flex items-center justify-between hover:bg-[#2d4373] transition-all group">
                                <span className="font-bold text-base md:text-lg tracking-wide uppercase">Comment obtenir un duplicata ?</span>
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                    <ChevronDown className="h-5 w-5" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.8 }} className="overflow-hidden">
                                        <div className="bg-[#eff6ff]/30 p-8 space-y-8">
                                            <div className="space-y-4">
                                                <p className="font-bold text-[#3b5998] text-lg uppercase">Étape 1 : Police</p>
                                                <p className="text-gray-700 font-medium">Obtenez un procès-verbal de déclaration de perte ou de vol au commissariat le plus proche.</p>
                                            </div>
                                            <div className="h-px bg-slate-200"></div>
                                            <div className="space-y-4">
                                                <p className="font-bold text-[#3b5998] text-lg uppercase">Étape 2 : DGI</p>
                                                <p className="text-gray-700 font-medium">Payez les frais de duplicata à la DGI muni du procès-verbal.</p>
                                            </div>
                                            <div className="h-px bg-slate-200"></div>
                                            <div className="space-y-4">
                                                <p className="font-bold text-[#3b5998] text-lg uppercase">Étape 3 : SIAAH</p>
                                                <p className="text-gray-700 font-medium">Soumettez votre demande en ligne pour recevoir votre nouvelle carte physique.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Image Overlay */}
                        <div className="pt-3">
                            <motion.div variants={fadeInUp} className="relative rounded-2xl overflow-hidden border-8 border-white shadow-2xl group transition-all duration-500 hover:shadow-primary-600/20">
                                <img src={licenseImg} alt="Permis" className="w-full h-auto object-contain" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1440]/90 via-[#0d1440]/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                                    <h3 className="text-white text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight max-w-2xl">
                                        Perdu ou volé ? Votre duplicata est à portée de main.
                                    </h3>
                                </div>
                            </motion.div>
                        </div>

                        {/* CTA */}
                        <div className="pt-12 flex flex-col items-center lg:items-start gap-6">
                            <motion.div variants={fadeInUp} {...attentionPulse} className="relative group">
                                <Link to="/services/permis/demander" className="bg-[#3b5998] text-white px-12 py-5 rounded-xl font-black text-base uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3">
                                    Déclarer & Remplacer
                                </Link>
                                <motion.div animate={{ x: [-10, 0, -10], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:block">
                                    <Pointer className="h-10 w-10 text-amber-400 rotate-90 fill-amber-400/10" />
                                </motion.div>
                            </motion.div>

                            <div className="w-full max-w-md">
                                <ServiceFormDownload serviceName="remplacement de permis" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-[#3b5998] text-white p-10 rounded-3xl shadow-2xl space-y-12 sticky top-8">
                            <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">Requis</h3>
                            <ul className="space-y-6 text-sm font-bold opacity-90">
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Procès-verbal Police</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Copie CIN</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Quittance DGI</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PermisRemplacer;
