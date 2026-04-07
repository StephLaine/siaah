import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, ChevronRight, Phone, User, Car, FileText, ChevronLeft, Mail, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const SERVICES = ['Immatriculation', 'Permis de Conduire', 'Assurances', 'Contraventions', 'Code de la Route'];
const SERVICE_TYPES = {
  'Immatriculation': ['Immatriculer un véhicule', 'Transfert de propriété', 'Changement de plaque'],
  'Permis de Conduire': ['Nouveau permis', 'Renouvellement', 'Échange de permis étranger'],
  'Assurances': ['Assurance véhicule', 'Assurance vie'],
  'Contraventions': ['Consultation contravention', 'Contestation'],
  'Code de la Route': ['Examen théorique', 'Renseignements'],
};

const Appointment = () => {
    const { user, token } = useAuth();
    const [step, setStep] = useState(1);
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const [officeSearch, setOfficeSearch] = useState('');
    const [showAllOffices, setShowAllOffices] = useState(false);

    const [form, setForm] = useState({
        office_id: '',
        service: '',
        service_type: '',
        appointment_date: '',
        appointment_time: '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        nif: user?.nif || '',
        notes: '',
    });

    const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'];

    useEffect(() => {
        fetch('/api/appointments/offices')
            .then(r => r.json())
            .then(d => { if (d.status === 'success') setOffices(d.data); })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                first_name: user.first_name || prev.first_name,
                last_name: user.last_name || prev.last_name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
                nif: user.nif || prev.nif,
            }));
        }
    }, [user]);

    const change = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const filteredOffices = offices.filter(o => 
        o.name.toLowerCase().includes(officeSearch.toLowerCase()) || 
        o.address.toLowerCase().includes(officeSearch.toLowerCase())
    );

    const displayedOffices = officeSearch 
        ? filteredOffices 
        : (showAllOffices ? filteredOffices : filteredOffices.slice(0, 5));

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.status === 'success') {
                setSubmitted(true);
            } else {
                alert('Erreur: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Erreur de connexion au serveur.');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Bureau', 'Service', 'Date & Heure', 'Vos Infos', 'Confirmation'];

    return (
        <div className="font-sans bg-white pb-20">
            {/* Hero */}
            <section className="bg-[#0d1440] py-16 text-center text-white">
                <div className="container mx-auto px-4 space-y-4">
                    <p className="text-[#60a5fa] text-xs font-bold uppercase tracking-widest">Prise de Rendez-Vous</p>
                    <h1 className="text-4xl md:text-5xl font-black">Réservez votre créneau en ligne</h1>
                    <p className="text-slate-300 text-lg max-w-xl mx-auto font-medium">Simple, rapide, sans attente. Disponible pour tous les services SIAAH.</p>
                </div>
            </section>

            {/* Wizard */}
            <section className="py-12">
                <div className="container mx-auto px-4 max-w-3xl">
                    {submitted ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-16">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-black text-[#0d1440]">Rendez-vous confirmé !</h2>
                            <p className="text-slate-600 font-medium max-w-md mx-auto">
                                Votre demande a été enregistrée. Vous recevrez une confirmation par email sous peu.
                            </p>
                            <div className="bg-slate-50 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3 text-sm font-medium text-slate-700 border border-slate-200">
                                <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-xs">Bureau:</span><span>{offices.find(o => o.id === parseInt(form.office_id))?.name || '—'}</span></div>
                                <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-xs">Service:</span><span>{form.service}</span></div>
                                <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-xs">Date:</span><span>{new Date(form.appointment_date).toLocaleDateString('fr-FR')}</span></div>
                                <div className="flex justify-between"><span className="font-bold text-slate-400 uppercase text-xs">Heure:</span><span>{form.appointment_time || '—'}</span></div>
                            </div>
                            <Link to="/" className="inline-block bg-[#3b5998] text-white px-8 py-3 rounded font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition">
                                Retour à l'accueil
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            {/* Step Indicator */}
                            <div className="mb-10">
                                <div className="flex items-center justify-between">
                                    {steps.map((s, i) => (
                                        <div key={i} className="flex items-center flex-1 last:flex-none">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-[#3b5998] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    {i + 1 < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wide hidden sm:block ${i + 1 === step ? 'text-[#3b5998]' : 'text-slate-400'}`}>{s}</span>
                                            </div>
                                            {i < steps.length - 1 && <div className={`h-0.5 flex-1 mx-2 ${i + 1 < step ? 'bg-green-400' : 'bg-slate-200'}`} />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Step 1: Office */}
                            {step === 1 && (
                                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <MapPin className="h-8 w-8 text-[#3b5998] mx-auto" />
                                        <h2 className="text-2xl font-black text-[#0d1440]">Choisissez votre bureau</h2>
                                    </div>
                                    
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Rechercher un bureau (nom ou ville)..." 
                                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-2xl outline-none focus:border-[#3b5998] transition-all font-medium text-slate-700"
                                            value={officeSearch}
                                            onChange={e => setOfficeSearch(e.target.value)}
                                        />
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    </div>

                                    <div className="grid gap-4">
                                        {displayedOffices.map(office => (
                                            <div
                                                key={office.id}
                                                onClick={() => change('office_id', office.id)}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${parseInt(form.office_id) === office.id ? 'border-[#3b5998] bg-[#eff6ff]' : 'border-slate-200 hover:border-[#3b5998]/40'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-black text-[#0d1440]">{office.name}</h3>
                                                        <p className="text-slate-500 text-sm font-medium mt-1">{office.address || 'Adresse non précisée'}</p>
                                                    </div>
                                                    {parseInt(form.office_id) === office.id && <CheckCircle className="h-6 w-6 text-[#3b5998]" />}
                                                </div>
                                            </div>
                                        ))}
                                        {displayedOffices.length === 0 && <p className="text-center text-slate-400 py-10 italic">Aucun bureau trouvé pour "{officeSearch}"</p>}
                                    </div>

                                    {!officeSearch && filteredOffices.length > 5 && (
                                        <div className="text-center">
                                            <button 
                                                onClick={() => setShowAllOffices(!showAllOffices)}
                                                className="text-[#3b5998] font-bold text-sm hover:underline"
                                            >
                                                {showAllOffices ? 'Voir moins' : `Voir les ${filteredOffices.length - 5} autres bureaux`}
                                            </button>
                                        </div>
                                    )}

                                    <button disabled={!form.office_id} onClick={() => setStep(2)} className="w-full bg-[#3b5998] disabled:opacity-50 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-800 transition flex items-center justify-center gap-2">
                                        Continuer <ChevronRight className="h-5 w-5" />
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 2: Service */}
                            {step === 2 && (
                                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <FileText className="h-8 w-8 text-[#3b5998] mx-auto" />
                                        <h2 className="text-2xl font-black text-[#0d1440]">Quel service souhaitez-vous ?</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {SERVICES.map(svc => (
                                            <div
                                                key={svc}
                                                onClick={() => { change('service', svc); change('service_type', ''); }}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${form.service === svc ? 'border-[#3b5998] bg-[#eff6ff]' : 'border-slate-200 hover:border-[#3b5998]/40'}`}
                                            >
                                                <span className="font-bold text-[#0d1440]">{svc}</span>
                                                {form.service === svc && <CheckCircle className="h-5 w-5 text-[#3b5998] ml-auto" />}
                                            </div>
                                        ))}
                                    </div>
                                    {form.service && (
                                        <div className="space-y-3 pt-4">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Précisez l'opération :</label>
                                            <div className="flex flex-wrap gap-2">
                                                {SERVICE_TYPES[form.service].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => change('service_type', t)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${form.service_type === t ? 'bg-[#3b5998] text-white' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(1)} className="flex-1 border border-slate-300 text-slate-600 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-50 transition">Retour</button>
                                        <button disabled={!form.service_type} onClick={() => setStep(3)} className="flex-1 bg-[#3b5998] disabled:opacity-50 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-800 transition flex items-center justify-center gap-2">
                                            Continuer <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Date & Time */}
                            {step === 3 && (
                                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <Calendar className="h-8 w-8 text-[#3b5998] mx-auto" />
                                        <h2 className="text-2xl font-black text-[#0d1440]">Quand souhaitez-vous venir ?</h2>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Choisissez la date</label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3b5998]"
                                                value={form.appointment_date}
                                                onChange={e => change('appointment_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Choisissez l'heure</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {timeSlots.map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => change('appointment_time', t)}
                                                        className={`py-2 rounded-lg text-xs font-bold ${form.appointment_time === t ? 'bg-[#3b5998] text-white' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setStep(2)} className="flex-1 border border-slate-300 text-slate-600 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-50 transition">Retour</button>
                                        <button disabled={!form.appointment_date || !form.appointment_time} onClick={() => setStep(4)} className="flex-1 bg-[#3b5998] disabled:opacity-50 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-800 transition flex items-center justify-center gap-2">
                                            Continuer <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Personal Info */}
                            {step === 4 && (
                                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <User className="h-8 w-8 text-[#3b5998] mx-auto" />
                                        <h2 className="text-2xl font-black text-[#0d1440]">Vos informations de contact</h2>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Prénom *</label>
                                            <input className="w-full p-4 border border-slate-200 rounded-xl" value={form.first_name} onChange={e => change('first_name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nom *</label>
                                            <input className="w-full p-4 border border-slate-200 rounded-xl" value={form.last_name} onChange={e => change('last_name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Email *</label>
                                            <input className="w-full p-4 border border-slate-200 rounded-xl" type="email" value={form.email} onChange={e => change('email', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Téléphone *</label>
                                            <input className="w-full p-4 border border-slate-200 rounded-xl" value={form.phone} onChange={e => change('phone', e.target.value)} />
                                        </div>
                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">NIF (facultatif)</label>
                                            <input className="w-full p-4 border border-slate-200 rounded-xl" value={form.nif} onChange={e => change('nif', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setStep(3)} className="flex-1 border border-slate-300 text-slate-600 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-50 transition">Retour</button>
                                        <button disabled={!form.first_name || !form.last_name || !form.email || !form.phone} onClick={() => setStep(5)} className="flex-1 bg-[#3b5998] disabled:opacity-50 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-800 transition flex items-center justify-center gap-2">
                                            Dernière étape <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5: Final Recap */}
                            {step === 5 && (
                                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                                        <h2 className="text-2xl font-black text-[#0d1440]">Vérification finale</h2>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                                        <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Bureau :</span><span className="font-bold">{offices.find(o => o.id === parseInt(form.office_id))?.name}</span></div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Service :</span><span className="font-bold">{form.service} - {form.service_type}</span></div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Date :</span><span className="font-bold">{new Date(form.appointment_date).toLocaleDateString('fr-FR')}</span></div>
                                        <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Heure :</span><span className="font-bold">{form.appointment_time}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Contact :</span><span className="font-bold">{form.first_name} {form.last_name}</span></div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(4)} className="flex-1 border border-slate-300 text-slate-600 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-50 transition">Modifier</button>
                                        <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-green-700 transition flex items-center justify-center gap-2">
                                            {loading ? 'Traitement...' : 'Confirmer le Rendez-vous'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Appointment;
