import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Shield, Pointer, HeartPulse, ShieldCheck, AlertCircle, FileDigit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceFormDownload from '../../components/ServiceFormDownload';

const Assurances = () => {
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

    const staggering = {
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
                        <Link to="/services/assurances" className="text-[#3b5998] border-b-2 border-[#3b5998] pb-1">Demande</Link>
                        <Link to="/services/assurances/remplacer" className="hover:text-[#3b5998] transition-colors">Remplacer</Link>
                        <Link to="/services/assurances/renouveler" className="hover:text-[#3b5998] transition-colors">Renouveler</Link>
                        <Link to="/services/assurances/transfert" className="hover:text-[#3b5998] transition-colors">Transfert</Link>
                        <Link to="/services/assurances/sinistre" className="hover:text-[#3b5998] transition-colors">Sinistre</Link>
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
                                Services d'Assurances Véhicules (OAVCT)
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-medium max-w-4xl mx-auto lg:mx-0">
                                L'assurance est obligatoire pour circuler sur les routes haïtiennes. Le SIAAH travaille en collaboration avec l'OAVCT pour vous offrir un accès simplifié au renouvellement de votre vignette et à la gestion de vos contrats de protection.
                            </p>
                        </motion.header>

                        {/* Assurance Features Grid */}
                        <motion.div
                            variants={staggering}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all group">
                                <ShieldCheck className="h-10 w-10 text-[#3b5998] mb-4 group-hover:rotate-12 transition-transform" />
                                <h4 className="font-black text-[#1a1a1a] uppercase tracking-tight mb-2">Protection OAVCT</h4>
                                <p className="text-gray-600 text-sm font-medium">Assurance responsabilité civile obligatoire couvrant les dommages corporels causés aux tiers.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all group">
                                <HeartPulse className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-[#1a1a1a] uppercase tracking-tight mb-2">Santé & Sécurité</h4>
                                <p className="text-gray-600 text-sm font-medium">Prise en charge des soins d'urgence en cas d'accident sur la voie publique.</p>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all group">
                                <FileDigit className="h-10 w-10 text-[#3b5998] mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-[#1a1a1a] uppercase tracking-tight mb-2">Vignette Digitale</h4>
                                <p className="text-gray-600 text-sm font-medium">Accédez à votre attestation d'assurance en ligne à tout moment depuis votre mobile.</p>
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
                                className="w-full bg-[#3b5998] text-white px-6 py-4 flex items-center justify-between hover:bg-[#2d4373] transition-all group"
                            >
                                <span className="font-bold text-base md:text-lg tracking-wide uppercase">
                                    Comment renouveler mon assurance OAVCT ?
                                </span>
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
                                                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 uppercase tracking-tighter">Guide de renouvellement :</h3>
                                                <div className="space-y-8 pl-2">
                                                    <div className="flex gap-4">
                                                        <span className="font-black text-[#3b5998] text-lg">STEP 1.</span>
                                                        <p className="text-gray-800 font-medium text-lg pt-0.5">Vérifiez la date d'expiration sur votre vignette actuelle collée au pare-brise.</p>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <span className="font-black text-[#3b5998] text-lg">STEP 2.</span>
                                                        <p className="text-gray-800 font-medium text-lg pt-0.5">Préparez votre titre de propriété ou ancienne police d'assurance.</p>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <span className="font-black text-[#3b5998] text-lg">STEP 3.</span>
                                                        <p className="text-gray-800 font-medium text-lg pt-0.5">Effectuez le paiement de la prime annuelle via les canaux autorisés du SIAAH.</p>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <span className="font-black text-[#3b5998] text-lg">STEP 4.</span>
                                                        <p className="text-gray-800 font-medium text-lg pt-0.5">Validez l'inspection physique (si requise) et recevez votre nouvelle vignette.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* CTA with Pointer */}
                        <div className="pt-12 flex flex-col items-center lg:items-start gap-6">
                            <motion.div
                                variants={fadeInUp}
                                {...attentionPulse}
                                className="relative group"
                            >
                                <Link
                                    to="/user/nouvelle-demande?type=assurance"
                                    className="bg-[#3b5998] text-white px-12 py-5 rounded-xl font-black text-base uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3"
                                >
                                    Renouveler mon assurance maintenant
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
                                <ServiceFormDownload serviceName="demande d'assurance" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:w-1/4">
                        <div className="bg-[#3b5998] text-white p-10 rounded-3xl shadow-2xl space-y-12 sticky top-8">
                            <div className="space-y-8">
                                <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-400" />
                                    NB IMPORTANT
                                </h3>
                                <div className="space-y-6 text-sm font-bold opacity-90 leading-relaxed">
                                    <p>Circuler sans une assurance OAVCT valide est une infraction grave passible d'amendes et de saisie du véhicule.</p>
                                    <p>L'assurance OAVCT ne couvre pas les dommages matériels de votre propre véhicule. Pour cela, optez pour une assurance "Tous Risques".</p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="bg-white/10 p-6 rounded-2xl border border-white/5">
                                    <p className="text-amber-400 text-xs font-black uppercase mb-4">Centres de réclamation 24/7</p>
                                    <Link to="/contact" className="text-lg font-black underline decoration-amber-400 underline-offset-4">Signaler un accident</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Assurances;
