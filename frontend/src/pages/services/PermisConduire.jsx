import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import licenseImg from '../../assets/images/Liscence.png';
import ServiceFormDownload from '../../components/ServiceFormDownload';

const PermisConduire = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Animation variants
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

    const pointerBounce = {
        animate: {
            x: [0, 10, 0],
            transition: {
                duration: 1.5,
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
                        <Link to="/services/permis" className="text-[#3b5998] border-b-2 border-[#3b5998] pb-1">Demander un permis</Link>
                        <Link to="/services/permis/renouveler" className="hover:text-[#3b5998] transition-colors">Renouveler votre permis</Link>
                        <Link to="/services/permis/remplacer" className="hover:text-[#3b5998] transition-colors">Remplacer votre carte</Link>
                        <Link to="/services/permis/contraventions" className="hover:text-[#3b5998] transition-colors">Les contraventions</Link>
                        <Link to="/services/permis/autres" className="hover:text-[#3b5998] transition-colors">autres</Link>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12 md:py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content (Left) */}
                    <div className="lg:w-3/4 space-y-12">
                        <motion.header
                            variants={fadeInUp}
                            className="space-y-6"
                        >
                            <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">
                                SERVICE DE PERMIS CONDUIRE
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-medium max-w-4xl">
                                Le permis de conduire est un droit administratif donnant autorisation de conduire certains véhicules motorisés tels que automobile, motocyclette, cyclomoteur, camion ou autobus, dans un ensemble de pays. Il comprend deux épreuves : le code et la conduite.
                            </p>
                        </motion.header>

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
                                        Voir les démarches pour obtention d’un permis de conduire
                                    </span>
                                    {!isOpen && (
                                        <motion.div
                                            variants={pointerBounce}
                                            animate="animate"
                                            className="hidden md:block"
                                        >
                                            <Shield className="h-5 w-5 text-amber-400 fill-amber-400/20" />
                                        </motion.div>
                                    )}
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
                                                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Étapes légales 35 :</h3>
                                                <div className="space-y-8 pl-2">
                                                    <div className="flex gap-4">
                                                        <span className="font-black text-gray-900 text-lg">1.</span>
                                                        <p className="text-gray-800 font-medium text-lg leading-relaxed pt-0.5">Inscription en auto-école : Formation théorique (Code de la route) et pratique.</p>
                                                    </div>

                                                    <div className="space-y-5">
                                                        <div className="flex gap-4">
                                                            <span className="font-black text-gray-900 text-lg">2.</span>
                                                            <p className="text-gray-800 font-bold text-lg leading-relaxed pt-0.5">Dossier du candidat :</p>
                                                        </div>
                                                        <ul className="pl-14 space-y-3 text-gray-700 font-semibold text-lg list-disc marker:text-[#3b5998]">
                                                            <li>Certificat d'auto-école.</li>
                                                            <li>Matricule fiscal (50 gourdes).</li>
                                                            <li>Photo prise au Ministère des Finances.</li>
                                                        </ul>
                                                    </div>

                                                    <div className="space-y-5">
                                                        <div className="flex gap-4">
                                                            <span className="font-black text-gray-900 text-lg">3.</span>
                                                            <p className="text-gray-800 font-bold text-lg leading-relaxed pt-0.5">Examens :</p>
                                                        </div>
                                                        <ul className="pl-14 space-y-3 text-gray-700 font-semibold text-lg list-disc marker:text-[#3b5998]">
                                                            <li>Théorique : 19/25 points minimum pour réussir.</li>
                                                            <li>Pratique : Réussite après formation en auto-école.</li>
                                                        </ul>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <span className="font-black text-gray-900 text-lg">4.</span>
                                                        <p className="text-gray-800 font-medium text-lg leading-relaxed pt-0.5">Paiement des taxes : À la Direction Générale des Impôts (DGI).</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6 pt-10 border-t border-gray-200">
                                                <h3 className="text-xl font-bold text-gray-900">Documents requis 511 :</h3>
                                                <ul className="pl-8 space-y-3 text-gray-700 font-semibold text-lg list-disc marker:text-[#3b5998]">
                                                    <li>Carte d'Identification Nationale (CIN).</li>
                                                    <li>Certificat audiovisuel (examen médical).</li>
                                                    <li>Autorisation parentale pour les mineurs.</li>
                                                </ul>
                                            </div>

                                            <div className="pt-6 flex flex-col gap-6">
                                                <Link
                                                    to="/user/nouvelle-demande?type=permis"
                                                    className="inline-block bg-[#3b5998] text-white px-10 py-4 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition shadow-xl w-fit"
                                                >
                                                    Demander votre permis de conduire
                                                </Link>

                                                <div className="max-w-md">
                                                    <ServiceFormDownload serviceName="demande de permis" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Types of Licenses section */}
                        <motion.section
                            variants={fadeInUp}
                            className="space-y-6 pt-8"
                        >
                            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] uppercase tracking-tight">
                                Types de Permis de Conduire en Haïti
                            </h2>
                            <div className="space-y-3">
                                <p className="text-base font-bold text-gray-900 italic opacity-80">Le Code de la route haïtien classe les permis en 5 catégories 5 :</p>
                                <motion.ul
                                    variants={staggerContainer}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-base font-semibold"
                                >
                                    <motion.li variants={fadeInUp} className="bg-slate-50 p-4 border-l-4 border-[#3b5998] font-bold">• <span className="text-[#3b5998]">Type A :</span> Véhicules légers (≤ 3,5 tonnes)</motion.li>
                                    <motion.li variants={fadeInUp} className="bg-slate-50 p-4 border-l-4 border-[#3b5998] font-bold">• <span className="text-[#3b5998]">Type B :</span> Véhicules lourds (&gt; 3,5 tonnes)</motion.li>
                                    <motion.li variants={fadeInUp} className="bg-slate-50 p-4 border-l-4 border-[#3b5998] font-bold">• <span className="text-[#3b5998]">Type C :</span> Motocyclettes</motion.li>
                                    <motion.li variants={fadeInUp} className="bg-slate-50 p-4 border-l-4 border-[#3b5998] font-bold">• <span className="text-[#3b5998]">Type D :</span> Véhicules à traction animale</motion.li>
                                    <motion.li variants={fadeInUp} className="bg-slate-50 p-4 border-l-4 border-[#3b5998] font-bold">• <span className="text-[#3b5998]">Type E :</span> Engins de chantier</motion.li>
                                </motion.ul>
                            </div>
                        </motion.section>

                        {/* Consolidated Motivating License Holder Image */}
                        <div className="pt-3">
                            <motion.div
                                variants={fadeInUp}
                                className="relative rounded-2xl overflow-hidden border-8 border-white shadow-2xl group transition-all duration-500 hover:shadow-primary-600/20"
                            >
                                <img
                                    src={licenseImg}
                                    alt="Licence de conduite officielle"
                                    className="w-full h-auto object-contain"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1440]/90 via-[#0d1440]/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                                    <div className="space-y-4">
                                        <motion.h3
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3, duration: 0.8 }}
                                            className="text-white text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight max-w-2xl"
                                        >
                                            Faites comme des milliers d'Haïtiens, obtenez votre permis dès aujourd'hui !
                                        </motion.h3>
                                        <div className="flex items-center gap-4">
                                            <div className="h-1 w-12 bg-amber-400"></div>
                                            <p className="text-amber-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">Service Rapide & Sécurisé</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Certification Badge */}
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="absolute top-6 right-6 bg-white p-2 md:p-3 rounded-full shadow-lg flex items-center justify-center border-2 md:border-4 border-[#3b5998] hidden md:flex"
                                >
                                    <Shield className="h-5 w-5 md:h-8 md:w-8 text-[#3b5998]" />
                                </motion.div>
                            </motion.div>
                        </div>


                        {/* CTA Button Bottom */}
                        <motion.div
                            variants={fadeInUp}
                            className="pt-12 flex justify-center lg:justify-start"
                            {...attentionPulse}
                        >
                            <div className="flex flex-col gap-6 w-full lg:w-fit">
                                <Link
                                    to="/user/nouvelle-demande?type=permis"
                                    className="bg-[#3b5998] text-white px-12 py-5 rounded-xl font-black text-base uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl hover:scale-105 active:scale-95 text-center"
                                >
                                    Demander un permis de conduire
                                </Link>
                                <ServiceFormDownload serviceName="demande de permis" />
                            </div>
                        </motion.div>                    </div>

                    {/* Sidebar (Right) */}
                    <motion.div
                        variants={fadeInUp}
                        className="lg:w-1/4"
                    >
                        <div className="bg-[#3b5998] text-white p-10 rounded-3xl shadow-2xl space-y-12 sticky top-8">
                            <div className="space-y-8">
                                <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">
                                    DOCUMENTS À FOURNIR
                                </h3>
                                <ul className="space-y-6 text-sm font-bold opacity-90">
                                    <li className="flex items-start gap-3">
                                        <motion.span whileHover={{ scale: 1.5 }} className="mt-1.5 w-2 h-2 bg-amber-400 rounded-full shrink-0"></motion.span>
                                        Carte d'Identification Nationale (CIN).
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <motion.span whileHover={{ scale: 1.5 }} className="mt-1.5 w-2 h-2 bg-amber-400 rounded-full shrink-0"></motion.span>
                                        Certificat audiovisuel (examen médical).
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <motion.span whileHover={{ scale: 1.5 }} className="mt-1.5 w-2 h-2 bg-amber-400 rounded-full shrink-0"></motion.span>
                                        Autorisation parentale (mineurs).
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <motion.span whileHover={{ scale: 1.5 }} className="mt-1.5 w-2 h-2 bg-amber-400 rounded-full shrink-0"></motion.span>
                                        Numéro de matricule fiscal.
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-8 pt-6">
                                <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">
                                    FRAIS ET COÛTS
                                </h3>
                                <div className="space-y-6">
                                    <motion.div whileHover={{ x: 10 }} className="bg-white/10 p-4 rounded-xl border border-white/5">
                                        <p className="text-amber-400 text-xs font-black uppercase mb-1">Type A/B</p>
                                        <p className="text-xl font-black">2 500 HTG</p>
                                        <p className="text-[10px] opacity-60">~ 51 $CAD</p>
                                    </motion.div>
                                    <motion.div whileHover={{ x: 10 }} className="bg-white/10 p-4 rounded-xl border border-white/5">
                                        <p className="text-amber-400 text-xs font-black uppercase mb-1">Type C</p>
                                        <p className="text-xl font-black">1 000 HTG</p>
                                    </motion.div>
                                    <motion.div whileHover={{ x: 10 }} className="bg-white/10 p-4 rounded-xl border border-white/5">
                                        <p className="text-amber-400 text-xs font-black uppercase mb-1">Frais Dossier DGI</p>
                                        <p className="text-xl font-black">2 500 HTG</p>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default PermisConduire;
