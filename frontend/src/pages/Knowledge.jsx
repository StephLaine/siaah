import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Truck, MapPin, HelpCircle, Search, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Knowledge = () => {
    const [activeSection, setActiveSection] = useState('code');
    const [openFaq, setOpenFaq] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const sections = [
        { id: 'code', label: 'Code de la Route', icon: <BookOpen className="h-5 w-5" /> },
        { id: 'transport', label: 'Transport des Biens', icon: <Truck className="h-5 w-5" /> },
        { id: 'stations', label: 'Stations de Services', icon: <MapPin className="h-5 w-5" /> },
        { id: 'faqs', label: 'FAQs', icon: <HelpCircle className="h-5 w-5" /> },
    ];

    const roadCodeArticles = [
        {
            article: 'Article R221-4',
            category: 'Catégorie B',
            title: 'Véhicules légers',
            content: 'Véhicules dont le poids total autorisé en charge (PTAC) n\'excède pas 3,5 tonnes, affectés au transport de personnes et comportant, outre le siège du conducteur, huit places assises au maximum, ou affectés au transport de marchandises.'
        },
        {
            article: 'Article R222-1',
            category: 'Vitesse',
            title: 'Limitations de vitesse',
            content: 'En agglomération, la vitesse maximale autorisée est de 50 km/h. Sur les routes nationales, la vitesse est limitée à 80 km/h. Sur les autoroutes, la limite est de 120 km/h sauf indication contraire.'
        },
        {
            article: 'Article R412-1',
            category: 'Alcool',
            title: 'Conduite en état d\'ivresse',
            content: 'Il est strictement interdit de conduire sous l\'emprise de l\'alcool. Le taux légal d\'alcoolémie autorisé est de 0.5g/L dans le sang. Toute infraction est passible d\'une amende et du retrait du permis de conduire.'
        },
        {
            article: 'Article R415-2',
            category: 'Priorité',
            title: 'Règles de priorité',
            content: 'Tout conducteur doit céder le passage aux véhicules venant de droite. Les véhicules d\'urgence (ambulances, pompiers, police) disposent d\'une priorité absolue et doivent être facilités en toutes circonstances.'
        },
        {
            article: 'Article R243-1',
            category: 'Ceinture',
            title: 'Port de la ceinture de sécurité',
            content: 'Le port de la ceinture de sécurité est obligatoire pour le conducteur et tous les passagers, aussi bien à l\'avant qu\'à l\'arrière du véhicule. Le non-respect de cette règle expose à une amende.'
        },
    ];

    const transportInfo = [
        {
            title: 'Transport Routier',
            content: 'Le transport routier est le mode de transport prédominant en Haïti. Il comprend le transport de marchandises par camions et semi-remorques sur l\'ensemble du réseau routier national.',
            rules: ['Permis de conduire valide de catégorie appropriée', 'Attestation d\'assurance en cours de validité', 'Carnet de transport pour véhicules de marchandises', 'Contrôle technique obligatoire chaque année'],
        },
        {
            title: 'Transport Maritime',
            content: 'Le transport maritime joue un rôle important dans la connexion entre les différentes régions côtières d\'Haïti et les îles environnantes.',
            rules: ['Permis de navigation délivré par les autorités maritimes', 'Manuel de sécurité à bord obligatoire', 'Limite de charge respectée en toutes circonstances'],
        },
        {
            title: 'Transport Aérien',
            content: 'Haïti dispose de plusieurs aéroports, dont l\'aéroport international de Port-au-Prince et de Cap-Haïtien, permettant les liaisons nationales et internationales.',
            rules: ['Accréditation IATA pour les agents de voyage', 'Respect des normes OACI', 'Déclaration obligatoire des marchandises'],
        },
    ];

    const stations = [
        { name: 'Station SIAAH Pétionville', address: 'Route de Delmas, Pétionville', status: 'Ouvert', hours: '7h - 22h' },
        { name: 'Station SIAAH Delmas 30', address: 'Delmas 30, Port-au-Prince', status: 'Ouvert', hours: '6h - 23h' },
        { name: 'Station SIAAH Tabarre', address: 'Avenue Flamboyant, Tabarre', status: 'Fermé', hours: '— ' },
        { name: 'Station SIAAH Canapé Vert', address: 'Route de Canapé Vert', status: 'Ouvert', hours: '8h - 20h' },
    ];

    const faqs = [
        {
            q: 'Comment immatriculer mon véhicule pour la première fois ?',
            a: 'Pour immatriculer votre véhicule, vous devez fournir : la facture d\'achat certifiée, le procès-verbal de dédouanement, une pièce d\'identité valide (CIN ou Passeport), et une attestation d\'assurance OAVCT. Connectez-vous à votre espace citoyen SIAAH pour initier la démarche en ligne.',
        },
        {
            q: 'Quelle est la durée de validité d\'un permis de conduire en Haïti ?',
            a: 'Le permis de conduire haïtien est valable pour une durée de 5 ans à compter de la date de délivrance. Il doit être renouvelé avant son expiration afin d\'éviter les pénalités.',
        },
        {
            q: 'Comment fonctionne l\'assurance OAVCT obligatoire ?',
            a: 'L\'assurance OAVCT (Office d\'Assurance Véhicules Contre Tiers) est obligatoire pour tout véhicule circulant sur le territoire haïtien. Elle couvre la responsabilité civile envers les tiers en cas d\'accident. Elle se renouvelle chaque année et est matérialisée par une vignette apposée sur le véhicule.',
        },
        {
            q: 'Que faire en cas de perte de ma plaque d\'immatriculation ?',
            a: 'En cas de perte ou de vol de votre plaque, vous devez d\'abord établir une déclaration auprès de la DCPJ. Ensuite, vous pouvez effectuer une demande de remplacement en ligne via le portail SIAAH en soumettant la déclaration de perte et votre pièce d\'identité.',
        },
        {
            q: 'Comment payer une contravention routière en ligne ?',
            a: 'Pour payer une contravention, connectez-vous à votre espace citoyen SIAAH, accédez à la section "Contraventions", saisissez le numéro de PV (Procès-Verbal) indiqué sur votre avis de contravention, puis procédez au paiement via MonCash, Natcash ou carte bancaire.',
        },
        {
            q: 'Quels sont les documents nécessaires pour le transfert d\'un véhicule ?',
            a: 'Pour le transfert de propriété d\'un véhicule, il faut : un acte de vente notarié et légalisé, la carte grise originale du vendeur, les pièces d\'identité des deux parties (vendeur et acheteur), et une attestation d\'assurance au nom du nouvel acquéreur.',
        },
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="font-sans bg-white">
            {/* Hero */}
            <section className="bg-[#0d1440] py-20 text-center text-white">
                <div className="container mx-auto px-4 space-y-4">
                    <p className="text-[#60a5fa] text-xs font-bold uppercase tracking-widest">Centre de Ressources</p>
                    <h1 className="text-4xl md:text-5xl font-black">Tout Savoir</h1>
                    <p className="text-slate-300 text-lg max-w-xl mx-auto font-medium">Code de la route, règles de transport, stations de service et questions fréquentes.</p>
                </div>
            </section>

            {/* Breadcrumb */}
            <div className="bg-slate-50 border-b border-slate-200 py-3">
                <div className="container mx-auto px-4 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Link to="/" className="hover:text-[#3b5998] transition-colors">Accueil</Link>
                    <span>/</span>
                    <span className="text-[#3b5998]">Tout Savoir</span>
                </div>
            </div>

            {/* Main */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 shrink-0">
                        <nav className="bg-white border border-slate-200 rounded-2xl overflow-hidden sticky top-4 shadow-sm">
                            {sections.map(sec => (
                                <button
                                    key={sec.id}
                                    onClick={() => setActiveSection(sec.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-left transition-all border-b border-slate-100 last:border-0 ${activeSection === sec.id ? 'bg-[#3b5998] text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-[#3b5998]'}`}
                                >
                                    {sec.icon} {sec.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {/* Code de la Route */}
                            {activeSection === 'code' && (
                                <motion.div key="code" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                    <div className="flex items-center gap-3 mb-8">
                                        <BookOpen className="h-7 w-7 text-[#3b5998]" />
                                        <h2 className="text-3xl font-black text-[#0d1440]">Code de la Route</h2>
                                    </div>
                                    {roadCodeArticles.map((art, i) => (
                                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition hover:border-[#3b5998]/30">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <span className="bg-[#eff6ff] text-[#3b5998] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">{art.article}</span>
                                                <span className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">{art.category}</span>
                                            </div>
                                            <h3 className="text-lg font-black text-[#0d1440] mb-2">{art.title}</h3>
                                            <p className="text-slate-600 font-medium text-sm leading-relaxed">{art.content}</p>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Transport */}
                            {activeSection === 'transport' && (
                                <motion.div key="transport" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Truck className="h-7 w-7 text-[#3b5998]" />
                                        <h2 className="text-3xl font-black text-[#0d1440]">Transport des Biens et Matériels</h2>
                                    </div>
                                    <div className="bg-[#eff6ff] rounded-2xl p-6 mb-6 border border-[#bfdbfe]">
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                            Le transport est une fonction clé du Ministère des Travaux Publics, Transports et Communications (MTPTC). Il englobe le transport terrestre, aérien et maritime. Ces modes de transport doivent répondre aux besoins fondamentaux de la population haïtienne.
                                        </p>
                                    </div>
                                    {transportInfo.map((item, i) => (
                                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                                            <h3 className="text-xl font-black text-[#0d1440] mb-3">{item.title}</h3>
                                            <p className="text-slate-600 font-medium text-sm leading-relaxed mb-4">{item.content}</p>
                                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                                <p className="text-xs font-black uppercase tracking-wider text-[#3b5998] mb-3">Règles applicables :</p>
                                                {item.rules.map((rule, j) => (
                                                    <div key={j} className="flex items-start gap-2 text-sm font-medium text-slate-600">
                                                        <ChevronRight className="h-4 w-4 text-[#3b5998] shrink-0 mt-0.5" />
                                                        {rule}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Stations */}
                            {activeSection === 'stations' && (
                                <motion.div key="stations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                    <div className="flex items-center gap-3 mb-8">
                                        <MapPin className="h-7 w-7 text-[#3b5998]" />
                                        <h2 className="text-3xl font-black text-[#0d1440]">Stations de Services Partenaires</h2>
                                    </div>
                                    <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-5 mb-2">
                                        <p className="text-sm text-slate-700 font-medium">Nos stations partenaires offrent des services d'inspection technique et de renouvellement de vignette OAVCT sur place.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {stations.map((s, i) => (
                                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition hover:border-[#3b5998]/30">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="font-black text-[#0d1440] text-base">{s.name}</h3>
                                                        <p className="text-slate-500 text-sm font-medium">{s.address}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.status === 'Ouvert' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{s.status}</span>
                                                </div>
                                                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                    <MapPin className="h-4 w-4" /> Horaires: <span className="font-bold text-slate-700">{s.hours}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center pt-4">
                                        <button className="bg-[#3b5998] text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition flex items-center gap-2 mx-auto">
                                            <MapPin className="h-4 w-4" /> Voir toutes les stations
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* FAQs */}
                            {activeSection === 'faqs' && (
                                <motion.div key="faqs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <HelpCircle className="h-7 w-7 text-[#3b5998]" />
                                        <h2 className="text-3xl font-black text-[#0d1440]">Questions Fréquentes</h2>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher une question..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3b5998] focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        {filteredFaqs.length === 0 && (
                                            <p className="text-center text-slate-500 py-8 font-medium">Aucun résultat trouvé.</p>
                                        )}
                                        {filteredFaqs.map((faq, i) => (
                                            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                                                <button
                                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                                    className={`w-full flex items-center justify-between px-6 py-4 text-left font-bold text-sm transition-all ${openFaq === i ? 'bg-[#3b5998] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'}`}
                                                >
                                                    {faq.q}
                                                    <ChevronDown className={`h-4 w-4 shrink-0 ml-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {openFaq === i && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-6 py-5 bg-[#f8faff] text-slate-600 text-sm font-medium leading-relaxed border-t border-[#bfdbfe]">
                                                                {faq.a}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                                        <p className="text-slate-600 font-medium text-sm">Vous ne trouvez pas réponse à votre question ?</p>
                                        <Link to="/contact" className="inline-flex items-center gap-2 bg-[#3b5998] text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition">
                                            Contactez-nous <ExternalLink className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Knowledge;
