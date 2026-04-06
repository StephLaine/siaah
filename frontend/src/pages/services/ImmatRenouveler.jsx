import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Pointer, Clock, FileText, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import licenseImg from '../../assets/images/Liscence.png';
import ServiceFormDownload from '../../components/ServiceFormDownload';

const ImmatRenouveler = () => {
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
                        <Link to="/services/immatriculation" className="hover:text-[#3b5998] transition-colors">Immatriculer</Link>
                        <Link to="/services/immatriculation/remplacer" className="hover:text-[#3b5998] transition-colors">Remplacer</Link>
                        <Link to="/services/immatriculation/renouveler" className="text-[#3b5998] border-b-2 border-[#3b5998] pb-1">Renouveler</Link>
                        <Link to="/services/immatriculation/transfert" className="hover:text-[#3b5998] transition-colors">Transfert</Link>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-3/4 space-y-12">
                        <motion.header variants={fadeInUp} className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight uppercase text-center lg:text-left">
                                RENOUVELLEMENT D'IMMATRICULATION
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                Le renouvellement annuel de votre immatriculation est obligatoire pour circuler légalement. SIAAH facilite vos démarches de paiement de taxes de circulation et de validation annuelle.
                            </p>
                        </motion.header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group">
                                <Clock className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-sm uppercase tracking-wider mb-2">Annuel</h4>
                                <p className="text-gray-600 text-sm">La validation fiscale doit être renouvelée chaque année.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group">
                                <FileText className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-sm uppercase tracking-wider mb-2">Taxes</h4>
                                <p className="text-gray-600 text-sm">Le montant varie selon le type et l'usage du véhicule.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group">
                                <CreditCard className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-sm uppercase tracking-wider mb-2">Paiement</h4>
                                <p className="text-gray-600 text-sm">Réglez vos frais directement en ligne via notre plateforme sécurisée.</p>
                            </motion.div>
                        </div>

                        <motion.div variants={fadeInUp} className="border border-slate-200 rounded-sm overflow-hidden" {...attentionPulse}>
                            <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-[#3b5998] text-white px-6 py-4 flex items-center justify-between hover:bg-[#2d4373] transition-all group">
                                <span className="font-bold text-base md:text-lg tracking-wide uppercase">Comment renouveler ?</span>
                                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                    <ChevronDown className="h-5 w-5" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.8 }} className="overflow-hidden">
                                        <div className="bg-[#eff6ff]/30 p-8 space-y-6 text-gray-800 font-medium">
                                            <p>1. Vérifiez vos arriérés fiscaux éventuels.</p>
                                            <p>2. Procédez au paiement des frais en ligne.</p>
                                            <p>3. Recevez votre attestation numérique instantanément.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <div className="pt-3">
                            <motion.div variants={fadeInUp} className="relative rounded-2xl overflow-hidden border-8 border-white shadow-2xl group transition-all duration-500 hover:shadow-primary-600/20">
                                <img src={licenseImg} alt="Immatriculation" className="w-full h-auto object-contain opacity-50" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1440]/90 via-[#0d1440]/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                                    <h3 className="text-white text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight max-w-2xl">
                                        Renouvelez aujourd'hui pour éviter les pénalités de retard.
                                    </h3>
                                </div>
                            </motion.div>
                        </div>

                        <div className="pt-12 flex flex-col items-center lg:items-start gap-6">
                            <motion.div variants={fadeInUp} {...attentionPulse} className="relative group">
                                <Link to="/services/immatriculation/demander" className="bg-[#3b5998] text-white px-12 py-5 rounded-xl font-black text-base uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3">
                                    Payer ma taxe
                                </Link>
                                <motion.div animate={{ x: [-10, 0, -10], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:block">
                                    <Pointer className="h-10 w-10 text-amber-400 rotate-90 fill-amber-400/10" />
                                </motion.div>
                            </motion.div>

                            <div className="w-full max-w-md">
                                <ServiceFormDownload serviceName="renouvellement d'immatriculation" />
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/4">
                        <div className="bg-[#3b5998] text-white p-10 rounded-3xl shadow-2xl space-y-12 sticky top-8">
                            <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">Info Fiscale</h3>
                            <ul className="space-y-6 text-sm font-bold opacity-90">
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Titre de propriété valide</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Contrôle technique à jour</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Vignette OAVCT</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ImmatRenouveler;
