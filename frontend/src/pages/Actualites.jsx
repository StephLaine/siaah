import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, ArrowRight, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const Actualites = () => {
    const [activeCategory, setActiveCategory] = useState('Tout');

    const categories = ['Tout', 'Immatriculation', 'Permis', 'Assurance', 'Réglementation', 'Événements'];

    const articles = [
        {
            id: 1,
            category: 'Immatriculation',
            date: '15 février 2026',
            title: 'Nouveau système d\'immatriculation numérique lancé par le SIAAH',
            excerpt: 'Le SIAAH annonce le lancement de son nouveau système d\'immatriculation entièrement numérique, permettant aux citoyens de réaliser toutes leurs démarches en ligne, sans se déplacer.',
            image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800',
            featured: true,
        },
        {
            id: 2,
            category: 'Assurance',
            date: '10 février 2026',
            title: 'L\'OAVCT renforce les contrôles d\'assurance sur les véhicules',
            excerpt: 'Dans le cadre d\'un partenariat avec la DCPJ, l\'OAVCT intensifie ses contrôles sur les routes haïtiennes pour s\'assurer que tous les véhicules disposent d\'une assurance valide.',
            image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
            featured: false,
        },
        {
            id: 3,
            category: 'Permis',
            date: '5 février 2026',
            title: 'Réforme du système de permis de conduire électronique',
            excerpt: 'Le nouveau permis de conduire électronique intègre désormais un QR code sécurisé permettant une vérification instantanée par les forces de l\'ordre.',
            image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800',
            featured: false,
        },
        {
            id: 4,
            category: 'Réglementation',
            date: '28 janvier 2026',
            title: 'Nouvelles règles de circulation sur les routes nationales',
            excerpt: 'Le Ministère des Travaux Publics, Transports et Communications publie de nouvelles directives pour améliorer la sécurité routière sur les routes nationales haïtiennes.',
            image: 'https://images.unsplash.com/photo-1518012312832-96aea3c91144?auto=format&fit=crop&q=80&w=800',
            featured: false,
        },
        {
            id: 5,
            category: 'Événements',
            date: '20 janvier 2026',
            title: 'Forum national sur la sécurité routière en Haïti',
            excerpt: 'Le SIAAH organise un forum national réunissant les principales institutions et acteurs de la sécurité routière pour définir une nouvelle stratégie nationale de prévention.',
            image: 'https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?auto=format&fit=crop&q=80&w=800',
            featured: false,
        },
        {
            id: 6,
            category: 'Immatriculation',
            date: '12 janvier 2026',
            title: 'Extension des délais de renouvellement de plaques',
            excerpt: 'Suite aux perturbations récentes, le SIAAH accorde une extension de deux mois pour le renouvellement des plaques d\'immatriculation expirant entre janvier et mars 2026.',
            image: 'https://images.unsplash.com/photo-1571847140471-1d7766e825ea?auto=format&fit=crop&q=80&w=800',
            featured: false,
        },
    ];

    const filtered = activeCategory === 'Tout' ? articles : articles.filter(a => a.category === activeCategory);
    const featured = articles.find(a => a.featured);
    const regularArticles = filtered.filter(a => !a.featured);

    return (
        <div className="font-sans bg-white">
            {/* Hero */}
            <section className="bg-[#0d1440] py-20 text-center text-white">
                <div className="container mx-auto px-4 space-y-4">
                    <p className="text-[#60a5fa] text-xs font-bold uppercase tracking-widest">Actualités</p>
                    <h1 className="text-4xl md:text-5xl font-black">Les dernières nouvelles du SIAAH</h1>
                    <p className="text-slate-300 text-lg max-w-xl mx-auto font-medium">Restez informé des derniers développements en matière de transport et de mobilité en Haïti.</p>
                </div>
            </section>

            {/* Breadcrumb */}
            <div className="bg-slate-50 border-b border-slate-200 py-3">
                <div className="container mx-auto px-4 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Link to="/" className="hover:text-[#3b5998] transition-colors">Accueil</Link>
                    <span>/</span>
                    <span className="text-[#3b5998]">Actualités</span>
                </div>
            </div>

            {/* Featured Article */}
            {featured && (
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
                        >
                            <img src={featured.image} alt={featured.title} className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1440]/90 via-[#0d1440]/40 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-[#3b5998] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">{featured.category}</span>
                                    <span className="text-slate-300 text-xs font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{featured.date}</span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black leading-tight mb-4 max-w-3xl">{featured.title}</h2>
                                <p className="text-slate-200 font-medium mb-6 max-w-2xl hidden md:block">{featured.excerpt}</p>
                                <button className="inline-flex items-center gap-2 bg-white text-[#0d1440] px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-[#3b5998] hover:text-white transition">
                                    Lire l'article <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Categories Filter */}
            <section className="py-8 border-b border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeCategory === cat ? 'bg-[#3b5998] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {regularArticles.map((article, idx) => (
                            <motion.article
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
                            >
                                <div className="relative overflow-hidden h-48">
                                    <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-[#3b5998] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                                            <Tag className="h-3 w-3" /> {article.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                        <Calendar className="h-3 w-3" />
                                        {article.date}
                                    </div>
                                    <h3 className="text-lg font-black text-[#0d1440] leading-snug group-hover:text-[#3b5998] transition-colors">{article.title}</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">{article.excerpt}</p>
                                    <button className="text-[#3b5998] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                                        Lire la suite <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {regularArticles.length === 0 && (
                        <div className="text-center py-16 text-slate-400 font-medium">
                            Aucun article dans cette catégorie pour le moment.
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <button className="border-2 border-[#3b5998] text-[#3b5998] px-10 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-[#3b5998] hover:text-white transition">
                            Charger plus d'articles
                        </button>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-20 bg-[#0d1440] text-white">
                <div className="container mx-auto px-4 text-center space-y-6 max-w-2xl">
                    <p className="text-[#60a5fa] text-xs font-bold uppercase tracking-widest">Newsletter</p>
                    <h2 className="text-3xl font-black">Restez informé de nos actualités</h2>
                    <p className="text-slate-300 font-medium">Inscrivez-vous à notre bulletin d'information pour recevoir les dernières nouvelles du SIAAH directement dans votre boîte email.</p>
                    <form className="flex flex-col sm:flex-row gap-3" onSubmit={e => e.preventDefault()}>
                        <input
                            type="email"
                            required
                            placeholder="Votre adresse email..."
                            className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/30"
                        />
                        <button type="submit" className="bg-[#3b5998] text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-700 transition shrink-0">
                            S'inscrire
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Actualites;
