import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#0d1440] text-white pt-16 pb-8 font-sans">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
                    {/* Brand & Partners */}
                    <div className="space-y-8 md:col-span-1">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight text-white">SIAAH</h2>
                            <p className="text-[10px] uppercase font-bold tracking-tighter text-slate-400 leading-tight">
                                société d'immatriculation et d'assurance <br /> des vehicules Haitienne
                            </p>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Nos Partenaires</h3>
                            <div className="space-y-2 text-[11px] font-medium text-slate-400 leading-relaxed">
                                <p>Ministère de l'Économie et des Finances (MEF)</p>
                                <p>Direction Générale des Impôts (DGI)</p>
                                <p>Office d'Assurance Véhicules Contre Tiers (OAVCT)</p>
                                <p>Direction Circulation &amp; Police Judiciaire (DCPJ)</p>
                            </div>
                        </div>
                        {/* Social */}
                        <div className="flex items-center gap-4 pt-2">
                            {[Linkedin, Facebook, Twitter, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#3b5998] transition-colors">
                                    <Icon className="h-3.5 w-3.5 text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Services Links */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Services</h3>
                        <div className="flex flex-col gap-3 text-sm font-medium text-slate-300">
                            <Link to="/services/immatriculation" className="hover:text-white hover:translate-x-1 transition-all duration-200">Immatriculation</Link>
                            <Link to="/services/permis" className="hover:text-white hover:translate-x-1 transition-all duration-200">Permis de conduire</Link>
                            <Link to="/services/assurances" className="hover:text-white hover:translate-x-1 transition-all duration-200">Assurance véhicule</Link>
                            <Link to="/services/permis/contraventions" className="hover:text-white hover:translate-x-1 transition-all duration-200">Contraventions</Link>
                            <Link to="/appointment" className="hover:text-white hover:translate-x-1 transition-all duration-200">Prendre rendez-vous</Link>
                        </div>
                    </div>

                    {/* Info Links */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Informations</h3>
                        <div className="flex flex-col gap-3 text-sm font-medium text-slate-300">
                            <Link to="/about" className="hover:text-white hover:translate-x-1 transition-all duration-200">À Propos de Nous</Link>
                            <Link to="/actualites" className="hover:text-white hover:translate-x-1 transition-all duration-200">Actualités</Link>
                            <Link to="/knowledge" className="hover:text-white hover:translate-x-1 transition-all duration-200">Code de la Route</Link>
                            <Link to="/knowledge/faqs" className="hover:text-white hover:translate-x-1 transition-all duration-200">FAQs</Link>
                            <Link to="/contact" className="hover:text-white hover:translate-x-1 transition-all duration-200">Contacts</Link>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Coordonnées</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                                <MapPin className="h-4 w-4 text-[#3b5998] shrink-0 mt-0.5" />
                                <span>319, Av Jean Paul 2, Haut Turgeau,<br />Port-au-Prince, Haïti</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                                <Phone className="h-4 w-4 text-[#3b5998] shrink-0" />
                                <span>+509 28 85-5555</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                                <Mail className="h-4 w-4 text-[#3b5998] shrink-0" />
                                <span>contact@siaah.gouv.ht</span>
                            </div>
                        </div>
                        <Link
                            to="/appointment"
                            className="inline-block bg-[#3b5998] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg hover:bg-blue-700 transition mt-2"
                        >
                            Prendre RDV →
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[9px] font-medium uppercase tracking-widest text-slate-500">
                        <Link to="/about" className="hover:text-slate-300 transition-colors">À Propos</Link>
                        <Link to="#" className="hover:text-slate-300 transition-colors">Accessibilité</Link>
                        <Link to="#" className="hover:text-slate-300 transition-colors">Données Privées</Link>
                        <Link to="#" className="hover:text-slate-300 transition-colors">Sécurité</Link>
                        <Link to="#" className="hover:text-slate-300 transition-colors">Support Technique</Link>
                    </div>
                    <p className="text-[9px] font-medium uppercase tracking-widest text-slate-500">SIAAH V2.0-BETA © 2026 OFFICIAL SITE</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
