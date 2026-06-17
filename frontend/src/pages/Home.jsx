import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, Calendar, Shield, CreditCard, ArrowUp,
    MapPin, Phone, Mail, BookOpen, Clock, Users, Zap,
    FileDown, Send, Facebook, Twitter, Linkedin
} from 'lucide-react';

const Home = () => {
    const [showScroll, setShowScroll] = useState(false);

    useEffect(() => {
        const checkScrollTop = () => {
            if (!showScroll && window.pageYOffset > 400) {
                setShowScroll(true);
            } else if (showScroll && window.pageYOffset <= 400) {
                setShowScroll(false);
            }
        };
        window.addEventListener('scroll', checkScrollTop);
        return () => window.removeEventListener('scroll', checkScrollTop);
    }, [showScroll]);

    const scrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const results = [
        { label: 'Permis de conduire', value: '100. K' },
        { label: 'Immatriculation', value: '100. K' },
        { label: 'Assurances', value: '100. K' },
        { label: 'Utilisateurs', value: '100. K' },
    ];

    const actualites = [
        {
            title: 'SIAAH vous accompagne au quotidien',
            image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800'
        },
        {
            title: 'SIAAH vous accompagne au quotidien',
            image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800'
        },
        {
            title: 'SIAAH vous accompagne au quotidien',
            image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800'
        },
    ];

    const reasons = [
        { title: 'Disponible', detail: '24/7', icon: <Clock className="h-8 w-8 text-[#3b5998]" /> },
        { title: 'Equipe', detail: 'Dynamique', icon: <Users className="h-8 w-8 text-[#3b5998]" /> },
        { title: 'Service', detail: 'Rapides', icon: <Zap className="h-8 w-8 text-[#3b5998]" /> },
        { title: 'Service', detail: 'Rapides', icon: <Zap className="h-8 w-8 text-[#3b5998]" /> },
    ];

    return (
        <div className="flex flex-col min-h-screen font-sans bg-slate-50 relative overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative bg-[#0d1440] min-h-[500px] lg:min-h-[600px] flex items-center justify-center py-20 overflow-hidden">
                <div
                    className="absolute  w-[100%] h-full opacity-10 bg-contain"

                    style={{ backgroundImage: "url('/images/Coat_of_arms_of_Haiti.svg')" }}
                ></div>
                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <div className="max-w-5xl mx-auto space-y-12">
                        <h3 className="text-7xl md:text-8xl font-extrabold tracking-tight leading-[1.45]">
                            Simplifiez vos <br /> démarches <br /> automobiles en Haïti
                        </h3>
                        <p className="text-lg md:text-xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed opacity-90">
                            Gérez votre permis de conduire, l'immatriculation de votre véhicule, votre assurance automobile et les Contaventions en toute simplicité. Service officiel du Ministère de l'Économie et des Finances  SIAAH.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
                            <Link to="/services" className="w-full sm:w-auto bg-[#3b5998] text-white px-8 py-4 rounded font-bold text-sm uppercase tracking-widest hover:bg-slate-700 transition flex items-center justify-center gap-3">
                                <FileText className="h-5 w-5" /> <span>DECOUVREZ NOS SERVICES</span>
                            </Link>
                            <Link to="/appointment" className="w-full sm:w-auto border border-white text-white px-8 py-4 rounded font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition flex items-center justify-center gap-3">
                                <Calendar className="h-5 w-5" /> <span>PRENDRE UN RENDEZ-VOUS</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24 bg-white" style={{ scrollMarginTop: '100px' }}>
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-4xl mx-auto mb-16 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0d1440]">Services</h2>
                        <p className="text-slate-800 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
                            Avec la modernisation des services administratifs, toutes vos démarches d'Immatriculation, d'Assurances et de permis de conduire se font désormais en ligne !
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <FileText className="h-6 w-6" />, title: 'Permis de conduire', text: 'Obtenez, renouvelez ou Remplacer votre permis de conduire', link: '/services/permis' },
                            { icon: <CreditCard className="h-6 w-6" />, title: 'Immatriculation', text: 'Immatriculer votre véhicule ou renouveler votre permis plaque', link: '/services/immatriculation' },
                            { icon: <Shield className="h-6 w-6" />, title: 'Assurance', text: 'Souscrivez vous ou Renouveler votre assurance', link: '/services/assurances' },
                            { icon: <Calendar className="h-6 w-6" />, title: 'Prise de rendez-vous', text: 'Reservez un rendez-vous pour vos démarche en ligne', link: '/appointment' },
                        ].map((s, idx) => (
                            <div key={idx} className="p-8 bg-white border border-slate-100 rounded-lg text-left shadow-sm hover:shadow-md transition flex flex-col h-full group">
                                <div className="bg-[#e0f2fe] w-12 h-12 rounded flex items-center justify-center text-[#38bdf8] mb-6">{s.icon}</div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{s.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">{s.text}</p>
                                <Link to={s.link} className="text-[#3b5998] text-sm font-bold flex items-center gap-2 hover:underline">En savoir plus</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-8">
                            <h2 className="text-4xl font-extrabold text-[#0d1440]">A propos de nous</h2>
                            <div className="space-y-6 text-slate-600 leading-relaxed font-medium text-sm md:text-base">
                                <p className="font-bold text-black italic">Une initiative nationale</p>
                                <p>La Société de l’Immatriculation et de l’Assurance Automobile en Haïti (SIAAH) est une initiative du Ministère de l’Économie et des Finances visant à moderniser les services liés à l’automobile.</p>
                                <div className="space-y-4">
                                    <p><span className="font-extrabold text-black">1 - Simplification des démarches.</span> Nous rendons accessibles en ligne les services précédemment disponibles uniquement en personne.</p>
                                    <p><span className="font-extrabold text-black">2 - Intégration des systèmes.</span> SIAAH relie les systèmes de l’OAVCT et de la DGI pour une gestion unifiée de vos documents.</p>
                                    <p><span className="font-extrabold text-black">3 - Sécurité et transparence.</span> Tous les documents sont sécurisés, vérifiables, et traçables à travers notre système.</p>
                                </div>
                                <button className="bg-[#3b5998] text-white px-8 py-3 rounded font-bold text-sm uppercase">En savoir plus</button>
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" alt="About" className="rounded-2xl shadow-xl w-full h-[350px] object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="lg:w-1/2 space-y-8">
                            <h2 className="text-4xl font-extrabold text-[#0d1440]">Notre Mission</h2>
                            <div className="space-y-6 text-slate-600 leading-relaxed font-medium text-sm md:text-base">
                                <p>Centraliser et gérer les données relatives à l’immatriculation des véhicules.</p>
                                <ul className="space-y-3 list-disc pl-5">
                                    <li>Faciliter les démarches administratives pour les citoyens et les professionnels.</li>
                                    <li>Garantir la conformité des véhicules aux normes en vigueur.</li>
                                    <li>Lutter contre la fraude et l’utilisation de plaques d’immatriculation illégales.</li>
                                </ul>
                                <button className="bg-[#3b5998] text-white px-10 py-3 rounded font-bold text-sm uppercase">Voir Plus</button>
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" alt="Mission" className="rounded-2xl shadow-xl w-full h-[350px] object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-extrabold text-[#0d1440] text-center mb-16">Actualités</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {actualites.map((news, idx) => (
                            <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                                <img src={news.image} alt="News" className="w-full h-48 object-cover" />
                                <div className="p-6 text-center space-y-4">
                                    <p className="text-sm text-slate-600 font-medium">{news.title}</p>
                                    <button className="bg-[#3b5998] text-white px-6 py-2 rounded text-[10px] font-bold uppercase">Voir Plus</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-extrabold text-[#0d1440] text-center mb-16">Nos Resultat</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {results.map((r, idx) => (
                            <div key={idx} className="bg-[#eff6ff] p-8 text-center rounded-lg space-y-2">
                                <p className="text-2xl font-black text-[#0d1440]">{r.value}</p>
                                <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">{r.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-extrabold text-[#0d1440] text-center mb-16">Pourquoi choisir la SIAAH ?</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {reasons.map((reason, idx) => (
                            <div key={idx} className="bg-[#eff6ff] p-6 rounded-lg flex flex-col items-center justify-center text-center space-y-3">
                                {reason.icon}
                                <div className="space-y-1">
                                    <p className="text-slate-600 text-xs font-bold uppercase">{reason.title}</p>
                                    <p className="text-[#0d1440] text-xl font-black uppercase">{reason.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Downloads Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-3xl font-extrabold text-[#0d1440] text-center mb-2">Télécharger un formulaire</h2>
                        <p className="text-center text-slate-00 text-sm mb-12">Tous les formulaires sont au format PDF et vous avez la possibilité de les remplir directement sur votre ordinateur et de les imprimer.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
                            {Array(8).fill(0).map((_, i) => (
                                <div key={i} className="flex flex-col items-center text-center space-y-3 group cursor-pointer">
                                    <div className="relative">
                                        <FileDown className="h-10 w-10 text-[#3b5998] group-hover:scale-110 transition" />
                                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold px-1 rounded">PDF</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-700 leading-tight">Télécharger le <br /> formulaire xx</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contacts Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="bg-[#eff6ff] p-8 lg:p-16 rounded-3xl flex flex-col lg:flex-row gap-16">
                        <div className="lg:w-1/3 space-y-10">
                            <h2 className="text-4xl font-extrabold text-[#0d1440]">Contacts</h2>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <MapPin className="h-6 w-6 text-[#3b5998] shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-extrabold text-black uppercase text-xs">Address:</p>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">319, Av Jean Paul 2, Haut Turgeau, Port-au-Prince, Haïti</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Phone className="h-6 w-6 text-[#3b5998] shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-extrabold text-black uppercase text-xs">Téléphone:</p>
                                        <p className="text-sm text-slate-600 font-medium tracking-wider">+509 28 85-5555</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-2/3">
                            <form className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input type="text" placeholder="Comment vous appelez-vous ?" className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#3b5998] outline-none" />
                                    <input type="email" placeholder="Votre Adresse E-mail" className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#3b5998] outline-none" />
                                </div>
                                <textarea rows="4" placeholder="Votre Message" className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#3b5998] outline-none resize-none"></textarea>
                                <button className="w-full bg-[#3b5998] text-white py-4 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-700 transition">
                                    <span>Envoyer un message</span> <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scroll Top Button */}
            {showScroll && (
                <button
                    onClick={scrollTop}
                    className="fixed bottom-8 right-8 z-50 bg-[#C1272D] p-4 rounded-xl text-white shadow-2xl hover:bg-red-700 transition-all hover:scale-110 active:scale-95 animate-bounce"
                >
                    <ArrowUp className="h-6 w-6" />
                </button>
            )}
        </div>
    );
};

export default Home;
