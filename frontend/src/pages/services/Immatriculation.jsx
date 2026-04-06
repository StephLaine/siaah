import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Pointer, FileText, ClipboardCheck, CreditCard, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceFormDownload from '../../components/ServiceFormDownload';

const Immatriculation = () => {
    const [isOpen, setIsOpen] = useState(false);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const attentionPulse = {
        animate: {
            scale: [1, 1.02, 1],
            boxShadow: [
                "0px 0px 0px rgba(59, 89, 152, 0)",
                "0px 0px 20px rgba(59, 89, 152, 0.4)",
                "0px 0px 0px rgba(59, 89, 152, 0)"
            ],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            className="bg-white min-h-screen font-sans pb-20"
        >
            {/* Sub-Navigation Bar */}
            <motion.div
                variants={fadeInUp}
                className="bg-white border-b border-[#3b5998] py-4"
            >
                <div className="container mx-auto px-10">
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-12 md:gap-20 text-[11px] md:text-xs font-bold text-gray-800 uppercase tracking-widest">
                        <Link to="/services/immatriculation" className="text-[#3b5998] border-b-2 border-[#3b5998] pb-1">Immatriculer</Link>
                        <Link to="/services/immatriculation/remplacer" className="hover:text-[#3b5998] transition-colors">Remplacer</Link>
                        <Link to="/services/immatriculation/renouveler" className="hover:text-[#3b5998] transition-colors">Renouveler</Link>
                        <Link to="/services/immatriculation/transfert" className="hover:text-[#3b5998] transition-colors">Transfert</Link>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content (Left) */}
                    <div className="lg:w-3/4 space-y-12">
                        <motion.header
                            variants={fadeInUp}
                            className="space-y-6 text-center lg:text-left"
                        >
                            <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight uppercase">
                                Service d'Immatriculation des Véhicules
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-medium max-w-4xl mx-auto lg:mx-0">
                                L'immatriculation est l'étape essentielle pour l'identification officielle de votre véhicule en Haïti. Le SIAAH facilite l'obtention de votre titre de propriété et de vos plaques d'immatriculation de manière sécurisée et rapide.
                            </p>
                        </motion.header>

                        {/* Info Cards Grid */}
                        <motion.div
                            variants={staggerContainer}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all group">
                                <Car className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-[#1a1a1a] uppercase tracking-tight mb-2">Véhicule Neuf</h4>
                                <p className="text-gray-600 text-sm font-medium">Enregistrement initial pour les véhicules venant de l'étranger ou achetés en concession.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all group">
                                <FileText className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-[#1a1a1a] uppercase tracking-tight mb-2">Titre Officiel</h4>
                                <p className="text-gray-600 text-sm font-medium">Délivrance du titre de propriété certifié par les autorités compétentes.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all group">
                                <CreditCard className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-[#1a1a1a] uppercase tracking-tight mb-2">Taxes DGI</h4>
                                <p className="text-gray-600 text-sm font-medium">Calcul et paiement simplifié des droits d'immatriculation et taxes de circulation.</p>
                            </motion.div>
                        </motion.div>

                        {/* Accordion Component */}
                        <motion.div
                            variants={fadeInUp}
                            className="border border-slate-200 rounded-sm overflow-hidden"
                            {...attentionPulse}
                        >
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full bg-[#3b5998] text-white px-6 py-4 flex items-center justify-between hover:bg-[#2d4373] transition-all group relative overflow-hidden"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-base md:text-lg tracking-wide uppercase">
                                        Comment faire immatriculer mon véhicule ?
                                    </span>
                                </div>
                                <motion.div
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    className="border border-white/30 p-1 rounded"
                                >
                                    <ChevronDown className="h-5 w-5" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-[#eff6ff]/30 p-8 md:p-12 space-y-10">
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 uppercase tracking-tighter">Processus d'immatriculation :</h3>
                                                <div className="space-y-8 pl-2">
                                                    <div className="flex gap-4">
                                                        <span className="font-black text-[#3b5998] text-lg">01.</span>
                                                        <div className="space-y-2">
                                                            <p className="text-gray-800 font-bold text-lg leading-relaxed uppercase tracking-tight">Vérification des documents</p>
                                                            <p className="text-gray-600 font-medium">Document d'achat, dédouanement (pour l'import) et pièce d'identité valide.</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <span className="font-black text-[#3b5998] text-lg">02.</span>
                                                        <div className="space-y-2">
                                                            <p className="text-gray-800 font-bold text-lg leading-relaxed uppercase tracking-tight">Paiement à la DGI</p>
                                                            <p className="text-gray-600 font-medium">Paiement des taxes d'immatriculation calculées selon la puissance du véhicule.</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <span className="font-black text-[#3b5998] text-lg">03.</span>
                                                        <div className="space-y-2">
                                                            <p className="text-gray-800 font-bold text-lg leading-relaxed uppercase tracking-tight">Saisie des données au SIAAH</p>
                                                            <p className="text-gray-600 font-medium">Enregistrement informatique des caractéristiques techniques du véhicule (Châssis, moteur).</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <span className="font-black text-[#3b5998] text-lg">04.</span>
                                                        <div className="space-y-2">
                                                            <p className="text-gray-800 font-bold text-lg leading-relaxed uppercase tracking-tight">Remise des plaques & Titre</p>
                                                            <p className="text-gray-600 font-medium">Récupération des plaques physiques et du titre de propriété définitif.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* CTA with Pointer Animation */}
                        <div className="pt-12 flex flex-col items-center lg:items-start gap-6">
                            <motion.div
                                variants={fadeInUp}
                                {...attentionPulse}
                                className="relative group"
                            >
                                <Link
                                    to="/user/nouvelle-demande?type=immatriculation"
                                    className="bg-[#3b5998] text-white px-12 py-5 rounded-xl font-black text-base uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
                                >
                                    Faire une demande d'immatriculation
                                </Link>

                                <motion.div
                                    animate={{
                                        x: [-10, 0, -10],
                                        opacity: [0.7, 1, 0.7]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:block"
                                >
                                    <Pointer className="h-10 w-10 text-amber-400 rotate-90 fill-amber-400/10" />
                                </motion.div>
                            </motion.div>

                            <div className="w-full max-w-md">
                                <ServiceFormDownload
                                    serviceName="immatriculation"
                                    fileName="transfert-vehicule-haiti.pdf"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:w-1/4">
                        <div className="bg-[#3b5998] text-white p-10 rounded-3xl shadow-2xl space-y-12 sticky top-8">
                            <div className="space-y-8">
                                <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">
                                    DOCUMENTS REQUIS
                                </h3>
                                <ul className="space-y-6 text-sm font-bold opacity-90">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 w-2 h-2 bg-amber-400 rounded-full shrink-0"></div>
                                        Facture d'achat certifiée.
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 w-2 h-2 bg-amber-400 rounded-full shrink-0"></div>
                                        Procès-verbal de dédouanement.
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 w-2 h-2 bg-amber-400 rounded-full shrink-0"></div>
                                        Pièce d'identité (CIN ou Passeport).
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1.5 w-2 h-2 bg-amber-400 rounded-full shrink-0"></div>
                                        Attestation d'assurance OAVCT.
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-8 pt-6">
                                <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">
                                    ASSISTANCE
                                </h3>
                                <p className="text-sm font-bold opacity-80 leading-relaxed italic">
                                    "La sécurité routière commence par un véhicule en règle."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Immatriculation;
