import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Pointer, Clock, FileDigit, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import licenseImg from '../../assets/images/Liscence.png';
import ServiceFormDownload from '../../components/ServiceFormDownload';

const AssurRenouveler = () => {
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
                        <Link to="/services/assurances/renouveler" className="text-[#3b5998] border-b-2 border-[#3b5998] pb-1">Renouveler</Link>
                        <Link to="/services/assurances/sinistre" className="hover:text-[#3b5998] transition-colors">Déclaration Sinistre</Link>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-3/4 space-y-12">
                        <motion.header variants={fadeInUp} className="space-y-6 text-center lg:text-left">
                            <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight uppercase">
                                RENOUVELLEMENT D'ASSURANCE OAVCT
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                Ne circulez pas avec une vignette expirée. SIAAH vous permet de renouveler votre protection obligatoire OAVCT en quelques minutes, directement depuis votre espace citoyen.
                            </p>
                        </motion.header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group">
                                <Clock className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-sm uppercase tracking-wider mb-2">Validité Rapide</h4>
                                <p className="text-gray-600 text-sm">Votre nouvelle vignette est validée dès réception du paiement.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group">
                                <FileDigit className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-sm uppercase tracking-wider mb-2">Code QR</h4>
                                <p className="text-gray-600 text-sm">Chaque attestation dispose d'un QR code pour vérification instantanée.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group">
                                <CreditCard className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-sm uppercase tracking-wider mb-2">Multi-Payment</h4>
                                <p className="text-gray-600 text-sm">Utilisez vos cartes de crédit ou services Mobilité Locale (MonCash).</p>
                            </motion.div>
                        </div>

                        <div className="pt-3">
                            <motion.div variants={fadeInUp} className="relative rounded-2xl overflow-hidden border-8 border-white shadow-2xl group transition-all duration-500 hover:shadow-primary-600/20">
                                <img src={licenseImg} alt="Assurance" className="w-full h-auto object-contain opacity-50 saturate-0" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1440]/90 via-[#0d1440]/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                                    <h3 className="text-white text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight max-w-2xl">
                                        Protection continue, route sécurisée.
                                    </h3>
                                </div>
                            </motion.div>
                        </div>

                        <div className="pt-12 flex flex-col items-center lg:items-start gap-6">
                            <motion.div variants={fadeInUp} {...attentionPulse} className="relative group">
                                <Link to="/services/assurances/demander" className="bg-[#3b5998] text-white px-12 py-5 rounded-xl font-black text-base uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3">
                                    Renouveler ma vignette
                                </Link>
                                <motion.div animate={{ x: [-10, 0, -10], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:block">
                                    <Pointer className="h-10 w-10 text-amber-400 rotate-90 fill-amber-400/10" />
                                </motion.div>
                            </motion.div>

                            <div className="w-full max-w-md">
                                <ServiceFormDownload serviceName="renouvellement d'assurance" />
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/4">
                        <div className="bg-[#3b5998] text-white p-10 rounded-3xl shadow-2xl space-y-12 sticky top-8">
                            <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">Checklist</h3>
                            <ul className="space-y-6 text-sm font-bold opacity-90">
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Ancienne police</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Titre de propriété</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Plat de paiement</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AssurRenouveler;
