import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield, Target, BarChart3, Users, Clock, Zap, Globe, Award,
    CheckCircle, ArrowRight, Building2, FileText, Car, Code2, Palette, Layers,
    Mail, GraduationCap, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const About = () => {
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, []);

    const results = [
        { label: 'Permis Délivrés', value: '240K+', icon: <FileText className="h-6 w-6" /> },
        { label: 'Véhicules Immatriculés', value: '580K+', icon: <Car className="h-6 w-6" /> },
        { label: 'Assurances Actives', value: '310K+', icon: <Shield className="h-6 w-6" /> },
        { label: 'Utilisateurs Enregistrés', value: '120K+', icon: <Users className="h-6 w-6" /> },
    ];

    const reasons = [
        { title: 'Disponible', detail: '24h/7j', icon: <Clock className="h-8 w-8 text-[#3b5998]" />, desc: 'Accès à vos démarches à toute heure, depuis n\'importe quel appareil.' },
        { title: 'Équipe', detail: 'Dynamique', icon: <Users className="h-8 w-8 text-[#3b5998]" />, desc: 'Une équipe de professionnels dédiés au service citoyen.' },
        { title: 'Service', detail: 'Rapide', icon: <Zap className="h-8 w-8 text-[#3b5998]" />, desc: 'Traitement accéléré de vos demandes grâce à la digitalisation.' },
        { title: 'Portée', detail: 'Nationale', icon: <Globe className="h-8 w-8 text-[#3b5998]" />, desc: 'Présence dans toutes les régions d\'Haïti avec des bureaux dédiés.' },
    ];

    const partners = [
        { name: 'Ministère de l\'Économie et des Finances (MEF)' },
        { name: 'Direction Générale des Impôts (DGI)' },
        { name: 'Office d\'Assurance Véhicules Contre Tiers (OAVCT)' },
        { name: 'Direction de la Circulation et de la Police Judiciaire (DCPJ)' },
        { name: 'Ministère des Travaux Publics, Transports et Communications (MTPTC)' },
    ];

    return (
        <div className="font-sans bg-white">
            {/* Hero */}
            <section className="relative bg-[#0d1440] py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1200')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto space-y-6">
                        <motion.p variants={fadeInUp} className="text-[#3b5998] text-xs font-bold uppercase tracking-widest">À Propos de Nous</motion.p>
                        <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                            Moderniser les services <br className="hidden md:block" /> automobiles en Haïti
                        </motion.h1>
                        <motion.p variants={fadeInUp} className="text-slate-300 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                            Le SIAAH est l'institution nationale chargée de simplifier et de digitaliser toutes les démarches liées aux véhicules automobiles en Haïti.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Breadcrumb */}
            <div className="bg-slate-50 border-b border-slate-200 py-3">
                <div className="container mx-auto px-4 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Link to="/" className="hover:text-[#3b5998] transition-colors">Accueil</Link>
                    <span>/</span>
                    <span className="text-[#3b5998]">À Propos</span>
                </div>
            </div>

            {/* Intro Section */}
            <section id="intro" className="py-24 bg-white scroll-mt-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                            className="lg:w-1/2 space-y-8"
                        >
                            <motion.div variants={fadeInUp} className="space-y-2">
                                <p className="text-[#3b5998] text-xs font-bold uppercase tracking-widest">Une Initiative Nationale</p>
                                <h2 className="text-4xl font-extrabold text-[#0d1440]">A propos de nous</h2>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="space-y-5 text-slate-600 font-medium text-sm md:text-base leading-relaxed">
                                <p className="font-bold text-black italic">La SIAAH — au service des citoyens haïtiens</p>
                                <p>La Société de l'Immatriculation et de l'Assurance Automobile en Haïti (SIAAH) est une initiative du Ministère de l'Économie et des Finances visant à moderniser les services liés à l'automobile.</p>
                                <div className="space-y-4">
                                    {[
                                        { num: '1', title: 'Simplification des démarches.', text: 'Nous rendons accessibles en ligne les services précédemment disponibles uniquement en personne.' },
                                        { num: '2', title: 'Intégration des systèmes.', text: 'SIAAH relie les systèmes de l\'OAVCT et de la DGI pour une gestion unifiée de vos documents.' },
                                        { num: '3', title: 'Sécurité et transparence.', text: 'Tous les documents sont sécurisés, vérifiables, et traçables à travers notre système.' },
                                    ].map(item => (
                                        <div key={item.num} className="flex gap-4">
                                            <div className="w-8 h-8 shrink-0 rounded-full bg-[#3b5998] text-white flex items-center justify-center text-xs font-black">{item.num}</div>
                                            <p><span className="font-extrabold text-black">{item.title}</span> {item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div variants={fadeInUp}>
                                <Link to="/services" className="inline-block bg-[#3b5998] text-white px-8 py-3 rounded font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition">
                                    Nos Services
                                </Link>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                            className="lg:w-1/2"
                        >
                            <img
                                src="/src/assets/images/Liscence.png"
                                alt="À Propos du SIAAH"
                                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section id="mission" className="py-24 bg-[#0d1440] scroll-mt-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                            className="lg:w-1/2 space-y-8"
                        >
                            <motion.div variants={fadeInUp} className="space-y-2">
                                <p className="text-[#60a5fa] text-xs font-bold uppercase tracking-widest">Notre Raison d'Être</p>
                                <h2 className="text-4xl font-extrabold text-white">Notre Mission</h2>
                            </motion.div>
                            <motion.div variants={fadeInUp} className="space-y-6 font-medium leading-relaxed text-slate-300 text-sm md:text-base">
                                <p>Centraliser et gérer les données relatives à l'immatriculation des véhicules, conformément aux standards internationaux.</p>
                                <ul className="space-y-4">
                                    {[
                                        'Faciliter les démarches administratives pour les citoyens et les professionnels.',
                                        'Garantir la conformité des véhicules aux normes en vigueur.',
                                        'Lutter contre la fraude et l\'utilisation de plaques d\'immatriculation illégales.',
                                        'Renforcer la sécurité routière par une meilleure gouvernance des données véhicules.',
                                        'Assurer une couverture d\'assurance obligatoire pour tous les véhicules en circulation.',
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-[#60a5fa] shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                            <motion.div variants={fadeInUp}>
                                <Link to="/services" className="inline-flex items-center gap-2 border border-white text-white px-8 py-3 rounded font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-[#0d1440] transition">
                                    Voir nos services <ArrowRight className="h-4 w-4" />
                                </Link>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                            className="lg:w-1/2"
                        >
                            <img
                                src="../images/logo_siaah_white.svg"
                                alt="Notre Mission"
                                className="rounded-2xl shadow-2xl w-full h-[300px] object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="py-16 bg-slate-50 border-b border-slate-200">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-[#3b5998] text-xs font-bold uppercase tracking-widest mb-4">Institutions Partenaires</p>
                    <h2 className="text-3xl font-extrabold text-[#0d1440] mb-12">Nos Partenaires Institutionnels</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {partners.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition hover:border-[#3b5998] flex items-center gap-3"
                            >
                                <Building2 className="h-5 w-5 text-[#3b5998] shrink-0" />
                                <span className="text-xs font-bold text-slate-700">{p.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section id="results" className="py-24 bg-white scroll-mt-20">
                <div className="container mx-auto px-4 text-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.p variants={fadeInUp} className="text-[#3b5998] text-xs font-bold uppercase tracking-widest mb-4">Chiffres Clés</motion.p>
                        <motion.h2 variants={fadeInUp} className="text-4xl font-extrabold text-[#0d1440] mb-16">Nos Résultats</motion.h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {results.map((r, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={fadeInUp}
                                    className="bg-[#eff6ff] p-8 rounded-2xl text-center space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all group"
                                >
                                    <div className="flex justify-center text-[#3b5998] group-hover:scale-110 transition-transform">{r.icon}</div>
                                    <p className="text-4xl font-black text-[#0d1440]">{r.value}</p>
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{r.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Why Choose */}
            <section id="why" className="py-24 bg-slate-50 scroll-mt-20">
                <div className="container mx-auto px-4">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
                        <motion.p variants={fadeInUp} className="text-[#3b5998] text-xs font-bold uppercase tracking-widest mb-4">Nos Atouts</motion.p>
                        <motion.h2 variants={fadeInUp} className="text-4xl font-extrabold text-[#0d1440]">Pourquoi choisir la SIAAH ?</motion.h2>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {reasons.map((r, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center space-y-4 group"
                            >
                                <div className="flex justify-center group-hover:scale-110 transition-transform">{r.icon}</div>
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{r.title}</p>
                                    <p className="text-[#0d1440] text-2xl font-black uppercase">{r.detail}</p>
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed">{r.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Board Administratif */}
            <section id="board" className="py-24 bg-slate-50 scroll-mt-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="text-center mb-16"
                    >
                        <motion.p variants={fadeInUp} className="text-[#3b5998] text-xs font-bold uppercase tracking-widest mb-4">Gouvernance</motion.p>
                        <motion.h2 variants={fadeInUp} className="text-4xl font-extrabold text-[#0d1440]">Board Administratif</motion.h2>
                        <motion.p variants={fadeInUp} className="mt-4 text-slate-500 font-medium max-w-xl mx-auto text-sm leading-relaxed">
                            Les professionnels qui guident et encadrent le développement académique et stratégique de la plateforme SIAAH.
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {[
                            {
                                num: 'A',
                                name: 'Calixte Evenson',
                                role: 'Doyen — Faculté FSGA, Université Quisqueya',
                                detail: 'Parrain académique du projet SIAAH, il supervise l\'encadrement institutionnel et la rigueur scientifique de la démarche.',
                                icon: <GraduationCap className="h-8 w-8" />,
                                tag: 'Doyen FSGA',
                                color: '#0d1440'
                            },
                            {
                                num: 'B',
                                name: 'Carly Baja',
                                role: 'Professeur Encadreur & Développeur',
                                detail: 'Expert en développement logiciel et mentor principal de l\'équipe technique, il assure la cohérence architecturale du système.',
                                icon: <BookOpen className="h-8 w-8" />,
                                tag: 'Encadreur',
                                color: '#1e3a8a'
                            },
                        ].map((admin, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2, duration: 0.6 }}
                                className="group relative bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col"
                            >
                                {/* Top accent bar */}
                                <div className="h-1.5 w-full" style={{ background: admin.color }} />

                                {/* Avatar placeholder */}
                                <div
                                    className="flex items-center justify-center h-40 w-full"
                                    style={{ background: `${admin.color}12` }}
                                >
                                    <div
                                        className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg text-white"
                                        style={{ background: admin.color }}
                                    >
                                        {admin.icon}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6 space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                                            style={{ background: admin.color }}
                                        >{admin.num}</span>
                                        <div
                                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                                            style={{ background: `${admin.color}cc` }}
                                        >
                                            {admin.tag}
                                        </div>
                                    </div>
                                    <h3 className="text-[#0d1440] font-extrabold text-xl leading-tight">{admin.name}</h3>
                                    <p className="text-[#3b5998] text-xs font-bold uppercase tracking-wider">{admin.role}</p>
                                    <p className="text-slate-500 text-sm leading-relaxed">{admin.detail}</p>
                                    <div className="h-0.5 w-10 rounded-full mt-2" style={{ background: admin.color }} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section id="team" className="py-24 bg-white scroll-mt-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                        className="text-center mb-16"
                    >
                        <motion.p variants={fadeInUp} className="text-[#3b5998] text-xs font-bold uppercase tracking-widest mb-4">Notre Équipe</motion.p>
                        <motion.h2 variants={fadeInUp} className="text-4xl font-extrabold text-[#0d1440]">Board — Staff Technique</motion.h2>
                        <motion.p variants={fadeInUp} className="mt-4 text-slate-500 font-medium max-w-xl mx-auto text-sm leading-relaxed">
                            Les architectes derrière la plateforme SIAAH — une équipe passionnée dédiée à la transformation numérique en Haïti.
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                num: '01',
                                name: 'John Widno Dorcy',
                                role: 'Concepteur Développeur',
                                photo: '/src/assets/images/J.jpg',
                                icon: <Code2 className="h-4 w-4" />,
                                tag: 'Développement',
                                email: 'j.dorcy@siaah.ht',
                                color: '#3b5998'
                            },
                            {
                                num: '02',
                                name: 'Saraï Dieu-Donnée',
                                role: 'Conceptrice Designer',
                                photo: '/src/assets/images/D.jpg',
                                icon: <Palette className="h-4 w-4" />,
                                tag: 'Design & UX',
                                email: 's.dieudonnee@siaah.ht',
                                color: '#7c3aed'
                            },
                            {
                                num: '03',
                                name: 'Stéphane Laine',
                                role: 'Concepteur & Développeur',
                                photo: '/src/assets/images/S.jpg',
                                icon: <Layers className="h-4 w-4" />,
                                tag: 'Architecture',
                                email: 's.laine@siaah.ht',
                                color: '#0d9488'
                            },
                        ].map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15, duration: 0.6 }}
                                className="group relative bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                            >
                                {/* Top accent bar */}
                                <div className="h-1.5 w-full" style={{ background: member.color }} />

                                {/* Photo */}
                                <div className="relative overflow-hidden">
                                    <img
                                        src={member.photo}
                                        alt={member.name}
                                        className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {/* Number badge */}
                                    <div
                                        className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg"
                                        style={{ background: member.color }}
                                    >
                                        {member.num}
                                    </div>
                                    {/* Role tag overlay */}
                                    <div
                                        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg backdrop-blur-sm"
                                        style={{ background: `${member.color}cc` }}
                                    >
                                        {member.icon}
                                        {member.tag}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6 space-y-2">
                                    <h3 className="text-[#0d1440] font-extrabold text-lg leading-tight">{member.name}</h3>
                                    <p className="text-slate-500 text-sm font-medium">{member.role}</p>
                                    <a
                                        href={`mailto:${member.email}`}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold mt-1 hover:underline"
                                        style={{ color: member.color }}
                                    >
                                        <Mail className="h-3.5 w-3.5" />
                                        {member.email}
                                    </a>
                                    <div className="pt-2">
                                        <div className="h-0.5 w-10 rounded-full" style={{ background: member.color }} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-[#3b5998] text-white">
                <div className="container mx-auto px-4 text-center space-y-8">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">Prêt à commencer vos démarches ?</h2>
                    <p className="text-white/80 max-w-xl mx-auto font-medium">Créez votre compte en quelques minutes et accédez à tous nos services administratifs en ligne.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/register" className="bg-white text-[#3b5998] px-8 py-4 rounded font-black uppercase tracking-wider hover:bg-slate-100 transition">
                            Créer un compte
                        </Link>
                        <Link to="/contact" className="border border-white text-white px-8 py-4 rounded font-black uppercase tracking-wider hover:bg-white/10 transition flex items-center justify-center gap-2">
                            Nous contacter <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
