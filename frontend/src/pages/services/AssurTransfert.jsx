import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Pointer, Users, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import licenseImg from '../../assets/images/Liscence.png';
import ServiceFormDownload from '../../components/ServiceFormDownload';

const AssurTransfert = () => {
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
                        <Link to="/services/assurances/remplacer" className="hover:text-[#3b5998] transition-colors">Remplacer</Link>
                        <Link to="/services/assurances/renouveler" className="hover:text-[#3b5998] transition-colors">Renouveler</Link>
                        <Link to="/services/assurances/transfert" className="text-[#3b5998] border-b-2 border-[#3b5998] pb-1">Transfert</Link>
                        <Link to="/services/assurances/sinistre" className="hover:text-[#3b5998] transition-colors">Sinistre</Link>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-3/4 space-y-12">
                        <motion.header variants={fadeInUp} className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight uppercase text-center lg:text-left">
                                TRANSFERT DE POLICE D'ASSURANCE
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                Vous changez de véhicule ou cédez votre protection à un tiers ? Transférez votre police d'assurance OAVCT ou privée en toute conformité pour assurer la continuité de la protection.
                            </p>
                        </motion.header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 group">
                                <Users className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-sm uppercase tracking-wider mb-2">Cession de contrat</h4>
                                <p className="text-gray-600 text-sm font-medium">Permet au nouveau propriétaire de bénéficier des mois restants sur la police actuelle.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 group">
                                <Landmark className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-sm uppercase tracking-wider mb-2">Changement de Risque</h4>
                                <p className="text-gray-600 text-sm font-medium">Recalcul de la prime en fonction des caractéristiques du nouveau véhicule.</p>
                            </motion.div>
                        </div>

                        <div className="pt-12 flex flex-col items-center lg:items-start gap-6">
                            <motion.div variants={fadeInUp} {...attentionPulse} className="relative group">
                                <Link to="/services/assurances/demander" className="bg-[#3b5998] text-white px-12 py-5 rounded-xl font-black text-base uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3">
                                    Initier le transfert
                                </Link>
                                <motion.div animate={{ x: [-10, 0, -10], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:block">
                                    <Pointer className="h-10 w-10 text-amber-400 rotate-90 fill-amber-400/10" />
                                </motion.div>
                            </motion.div>

                            <div className="w-full max-w-md">
                                <ServiceFormDownload serviceName="transfert de police" />
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/4">
                        <div className="bg-[#3b5998] text-white p-10 rounded-3xl shadow-2xl space-y-12 sticky top-8">
                            <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">Conditions</h3>
                            <ul className="space-y-6 text-sm font-bold opacity-90">
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Acte de vente</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Nouveau titre</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full"></div>Accord écrit du cédant</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AssurTransfert;
