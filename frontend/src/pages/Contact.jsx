import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Twitter, Linkedin, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const offices = [
        {
            city: 'Port-au-Prince',
            label: 'Siège Principal',
            address: '319, Av Jean Paul 2, Haut Turgeau',
            phone: '+509 28 85-5555',
            hours: 'Lun - Ven: 8h00 - 16h00'
        },
        {
            city: 'Cap-Haïtien',
            label: 'Bureau Régional Nord',
            address: 'Rue 24-H, Centre-Ville, Cap-Haïtien',
            phone: '+509 28 85-6666',
            hours: 'Lun - Ven: 8h00 - 15h30'
        },
        {
            city: 'Les Cayes',
            label: 'Bureau Régional Sud',
            address: 'Avenue Geffard, Les Cayes',
            phone: '+509 28 85-7777',
            hours: 'Lun - Ven: 8h00 - 15h30'
        },
    ];

    return (
        <div className="font-sans bg-white">
            {/* Hero */}
            <section className="bg-[#0d1440] py-20 text-center text-white">
                <div className="container mx-auto px-4 space-y-4">
                    <p className="text-[#60a5fa] text-xs font-bold uppercase tracking-widest">Contactez-Nous</p>
                    <h1 className="text-4xl md:text-5xl font-black">Nous sommes là pour vous aider</h1>
                    <p className="text-slate-300 text-lg max-w-xl mx-auto font-medium">Une question sur nos services ? Notre équipe est disponible pour vous répondre.</p>
                </div>
            </section>

            {/* Breadcrumb */}
            <div className="bg-slate-50 border-b border-slate-200 py-3">
                <div className="container mx-auto px-4 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Link to="/" className="hover:text-[#3b5998] transition-colors">Accueil</Link>
                    <span>/</span>
                    <span className="text-[#3b5998]">Contacts</span>
                </div>
            </div>

            {/* Main Content */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="bg-[#eff6ff] p-8 lg:p-16 rounded-3xl flex flex-col lg:flex-row gap-16">
                        {/* Left: Info */}
                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                            className="lg:w-1/3 space-y-10"
                        >
                            <div className="space-y-2">
                                <h2 className="text-4xl font-extrabold text-[#0d1440]">Contacts</h2>
                                <p className="text-slate-600 font-medium text-sm">Nos équipes vous répondent dans les meilleurs délais.</p>
                            </div>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-[#3b5998] rounded-lg flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-extrabold text-black uppercase text-xs tracking-wider">Adresse Principale:</p>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">319, Av Jean Paul 2, Haut Turgeau,<br />Port-au-Prince, Haïti</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-[#3b5998] rounded-lg flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-extrabold text-black uppercase text-xs tracking-wider">Téléphone:</p>
                                        <p className="text-sm text-slate-600 font-medium">+509 28 85-5555</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-[#3b5998] rounded-lg flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-extrabold text-black uppercase text-xs tracking-wider">Email:</p>
                                        <p className="text-sm text-slate-600 font-medium">contact@siaah.gouv.ht</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 shrink-0 bg-[#3b5998] rounded-lg flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-extrabold text-black uppercase text-xs tracking-wider">Horaires:</p>
                                        <p className="text-sm text-slate-600 font-medium">Lun - Ven: 8h00 - 16h00</p>
                                    </div>
                                </div>
                            </div>
                            {/* Social */}
                            <div className="space-y-3">
                                <p className="font-extrabold text-black uppercase text-xs tracking-wider">Réseaux Sociaux:</p>
                                <div className="flex gap-3">
                                    {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                                        <a key={i} href="#" className="w-10 h-10 bg-[#3b5998] rounded-full flex items-center justify-center hover:bg-[#2d4373] transition-colors">
                                            <Icon className="h-4 w-4 text-white" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Form */}
                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                            className="lg:w-2/3"
                        >
                            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm space-y-6">
                                {submitted && (
                                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold text-sm">
                                        <CheckCircle className="h-5 w-5 shrink-0" />
                                        Message envoyé avec succès ! Nous vous répondrons sous 48h.
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nom complet *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Jean Dupont"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#3b5998] focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Adresse E-mail *</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="votre@email.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#3b5998] focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Sujet *</label>
                                    <select
                                        required
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#3b5998] focus:border-transparent outline-none transition"
                                    >
                                        <option value="">Choisir un sujet...</option>
                                        <option value="immatriculation">Immatriculation</option>
                                        <option value="permis">Permis de Conduire</option>
                                        <option value="assurance">Assurance</option>
                                        <option value="contravention">Contravention</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Message *</label>
                                    <textarea
                                        rows="5"
                                        required
                                        placeholder="Décrivez votre demande en détail..."
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#3b5998] focus:border-transparent outline-none transition resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#3b5998] text-white py-4 rounded-lg font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition active:scale-95"
                                >
                                    <span>Envoyer le message</span> <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Regional Offices */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 space-y-2">
                        <p className="text-[#3b5998] text-xs font-bold uppercase tracking-widest">Présence Nationale</p>
                        <h2 className="text-3xl font-extrabold text-[#0d1440]">Nos Bureaux Régionaux</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {offices.map((office, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#3b5998] rounded-full flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[#0d1440] text-lg">{office.city}</h3>
                                        <p className="text-[#3b5998] text-xs font-bold uppercase tracking-wide">{office.label}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600 font-medium border-t border-slate-100 pt-4">
                                    <p className="flex items-start gap-2"><MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />{office.address}</p>
                                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400 shrink-0" />{office.phone}</p>
                                    <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400 shrink-0" />{office.hours}</p>
                                </div>
                                <Link to="/appointment" className="w-full text-center block bg-[#eff6ff] text-[#3b5998] py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#3b5998] hover:text-white transition">
                                    Prendre RDV ici
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
