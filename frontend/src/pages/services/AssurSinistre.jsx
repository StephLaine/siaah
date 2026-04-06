import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Pointer, AlertTriangle, Phone, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import licenseImg from '../../assets/images/Liscence.png';
import ServiceFormDownload from '../../components/ServiceFormDownload';

const AssurSinistre = () => {
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
                        <Link to="/services/assurances" className="hover:text-[#3b5998] transition-colors">Demande</Link>
                        <Link to="/services/assurances/renouveler" className="hover:text-[#3b5998] transition-colors">Renouveler</Link>
                        <Link to="/services/assurances/sinistre" className="text-[#3b5998] border-b-2 border-[#3b5998] pb-1">Déclaration Sinistre</Link>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-3/4 space-y-12">
                        <motion.header variants={fadeInUp} className="space-y-6 text-center lg:text-left">
                            <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight uppercase">
                                DÉCLARATION DE SINISTRE
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                Un accident ? Restez calme. SIAAH vous aide à documenter votre sinistre et à lancer votre dossier de réclamation auprès de l'OAVCT de manière structurée.
                            </p>
                        </motion.header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div variants={fadeInUp} className="bg-red-50 p-8 rounded-3xl border border-red-100 flex gap-6 group">
                                <AlertTriangle className="h-12 w-12 text-red-500 shrink-0 group-hover:shake transition-all" />
                                <div className="space-y-2">
                                    <h4 className="font-black text-[#1a1a1a] uppercase tracking-tight">Urgence</h4>
                                    <p className="text-gray-600 text-sm">Sécurisez la zone et contactez les secours avant toute démarche administrative.</p>
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex gap-6 group">
                                <Phone className="h-12 w-12 text-[#3b5998] shrink-0 group-hover:scale-110 transition-transform" />
                                <div className="space-y-2">
                                    <h4 className="font-black text-[#1a1a1a] uppercase tracking-tight">Assistance 24/7</h4>
                                    <p className="text-gray-600 text-sm">Appelez notre numéro d'urgence pour une assistance sur les lieux de l'accident.</p>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div variants={fadeInUp} className="border border-slate-200 rounded-sm overflow-hidden" {...attentionPulse}>
                            <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-[#3b5998] text-white px-6 py-4 flex items-center justify-between hover:bg-[#2d4373] transition-all group">
                                <span className="font-bold text-base md:text-lg tracking-wide uppercase">Que faire en cas d'accident ?</span>
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                    <ChevronDown className="h-5 w-5" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.8 }} className="overflow-hidden">
                                        <div className="bg-[#eff6ff]/30 p-8 space-y-6 text-gray-800 font-medium">
                                            <p>1. Prenez des photos dégâts et de la position des véhicules.</p>
                                            <p>2. Remplissez le constat à l'amiable ou attendez le rapport de police.</p>
                                            <p>3. Déclarez le sinistre au SIAAH dans les 48 heures ouvrables.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <div className="pt-3">
                            <motion.div variants={fadeInUp} className="relative rounded-2xl overflow-hidden border-8 border-white shadow-2xl group transition-all duration-500 hover:shadow-primary-600/20">
                                <img src={licenseImg} alt="Sinistre" className="w-full h-auto object-contain blur-[2px] grayscale" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1440]/90 via-[#0d1440]/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                                    <h3 className="text-white text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight max-w-2xl">
                                        Accompagnement total après l'imprévisible.
                                    </h3>
                                </div>
                            </motion.div>
                        </div>

                        <div className="pt-12 flex flex-col items-center lg:items-start gap-6">
                            <motion.div variants={fadeInUp} {...attentionPulse} className="relative group">
                                <Link to="/contact" className="bg-[#C1272D] text-white px-12 py-5 rounded-xl font-black text-base uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3">
                                    Déclarer un sinistre
                                </Link>
                                <motion.div animate={{ x: [-10, 0, -10], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:block">
                                    <Pointer className="h-10 w-10 text-amber-400 rotate-90 fill-amber-400/10" />
                                </motion.div>
                            </motion.div>

                            <div className="w-full max-w-md">
                                <ServiceFormDownload serviceName="déclaration de sinistre" />
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/4">
                        <div className="bg-[#3b5998] text-white p-10 rounded-3xl shadow-2xl space-y-12 sticky top-8">
                            <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">Numéros Utiles</h3>
                            <ul className="space-y-6 text-sm font-bold opacity-90">
                                <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-amber-400" /> Sapeurs-Pompiers: 115</li>
                                <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-amber-400" /> Police Secours: 114</li>
                                <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-amber-400" /> Ambulance: 116</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AssurSinistre;
