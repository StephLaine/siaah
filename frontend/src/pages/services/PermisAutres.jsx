import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Globe, Shield, Pointer, Briefcase, GraduationCap, MapPin } from 'lucide-react';
import licenseImg from '../../assets/images/Liscence.png';
import ServiceFormDownload from '../../components/ServiceFormDownload';

const PermisAutres = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
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
                        <Link to="/services/permis/contraventions" className="hover:text-[#3b5998] transition-colors">Les contraventions</Link>
                        <Link to="/services/permis/autres" className="text-[#3b5998] border-b-2 border-[#3b5998] pb-1">autres</Link>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-3/4 space-y-12">
                        <motion.header variants={fadeInUp} className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight uppercase">
                                Autres Services de Permis
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                Découvrez nos services spécialisés pour les professionnels, les étudiants et les voyageurs internationaux. SIAAH facilite toutes les démarches administratives liées à votre conduite.
                            </p>
                        </motion.header>

                        {/* Other Services Grid */}
                        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all group">
                                <Globe className="h-12 w-12 text-[#3b5998] mb-6 group-hover:rotate-[360deg] duration-1000 transition-transform" />
                                <h4 className="font-black text-xl text-[#1a1a1a] uppercase tracking-tight mb-4">Permis International</h4>
                                <p className="text-gray-600 mb-6 font-medium">Demandez une extension internationale de votre permis haïtien pour conduire légalement à l'étranger.</p>
                                <button className="text-[#3b5998] font-black uppercase text-xs tracking-widest border-b-2 border-[#3b5998] pb-1">En savoir plus</button>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all group">
                                <Briefcase className="h-12 w-12 text-[#3b5998] mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-xl text-[#1a1a1a] uppercase tracking-tight mb-4">Permis Professionnel</h4>
                                <p className="text-gray-600 mb-6 font-medium">Services dédiés aux transporteurs de marchandises et de voyageurs (Type B & P).</p>
                                <button className="text-[#3b5998] font-black uppercase text-xs tracking-widest border-b-2 border-[#3b5998] pb-1">Consulter</button>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all group">
                                <GraduationCap className="h-12 w-12 text-[#3b5998] mb-6 group-hover:-rotate-12 transition-transform" />
                                <h4 className="font-black text-xl text-[#1a1a1a] uppercase tracking-tight mb-4">Permis Apprenti</h4>
                                <p className="text-gray-600 mb-6 font-medium">Autorisation temporaire pour l'apprentissage de la conduite sous supervision certifiée.</p>
                                <button className="text-[#3b5998] font-black uppercase text-xs tracking-widest border-b-2 border-[#3b5998] pb-1">Postuler</button>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all group">
                                <MapPin className="h-12 w-12 text-[#3b5998] mb-6 group-hover:bounce transition-all" />
                                <h4 className="font-black text-xl text-[#1a1a1a] uppercase tracking-tight mb-4">Changement d'Adresse</h4>
                                <p className="text-gray-600 mb-6 font-medium">Mise à jour officielle de vos coordonnées sur votre titre de conduite.</p>
                                <button className="text-[#3b5998] font-black uppercase text-xs tracking-widest border-b-2 border-[#3b5998] pb-1">Modifier</button>
                            </motion.div>
                        </motion.div>

                        {/* Common Image Overlay */}
                        <div className="pt-12">
                            <motion.div variants={fadeInUp} className="relative rounded-2xl overflow-hidden border-8 border-white shadow-2xl group transition-all duration-500 hover:shadow-primary-600/20">
                                <img src={licenseImg} alt="Permis" className="w-full h-auto object-contain" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d1440]/90 via-[#0d1440]/40 to-transparent flex flex-col justify-end p-10">
                                    <h3 className="text-white text-3xl font-black uppercase tracking-tighter max-w-2xl">
                                        Tous vos services de permis sur une seule plateforme.
                                    </h3>
                                </div>
                            </motion.div>
                        </div>

                        <div className="pt-8 w-full max-w-lg mx-auto lg:mx-0">
                            <ServiceFormDownload serviceName="services spéciaux" />
                        </div>
                    </div>

                    {/* Simple Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-[#3b5998] text-white p-10 rounded-3xl shadow-2xl space-y-8 sticky top-8">
                            <h3 className="text-xl font-black uppercase tracking-tight border-b border-white/20 pb-4">Assistance</h3>
                            <p className="text-sm font-bold opacity-80 leading-relaxed">Besoin d'aide pour un cas spécifique ? Notre support technique est disponible 24/7 pour vous guider.</p>
                            <button className="w-full bg-white text-[#3b5998] py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">Contacter le support</button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PermisAutres;
