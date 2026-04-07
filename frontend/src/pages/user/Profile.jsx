import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, FileText, CreditCard, Clock, Bell, Calendar, MapPin } from 'lucide-react';

const Profile = () => {
    const { user, token } = useAuth();
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        if (!token) return;
        fetch('/api/appointments/mine', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => { if (d.status === 'success') setAppointments(d.data); })
            .catch(console.error);
    }, [token]);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="bg-white p-6 sm:p-8 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="h-24 w-24 shrink-0 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                    <User className="h-12 w-12" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">
                        {user.first_name} {user.last_name}
                    </h1>
                    <p className="text-slate-500 break-words mt-1">{user.email} • NIF: {user.nif}</p>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-white p-6 rounded-2xl border">
                        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-primary-600" />
                            <span>Suivi des demandes en cours</span>
                        </h2>
                        <div className="text-center py-12 text-slate-400">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Aucune demande en cours</p>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl border">
                        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-primary-600" />
                            <span>Vos Rendez-vous</span>
                        </h2>
                        {appointments.length > 0 ? (
                            <div className="space-y-3">
                                {appointments.map((apt, i) => (
                                    <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                        <div>
                                            <p className="font-bold text-slate-900">{apt.service} - {apt.service_type}</p>
                                            <p className="text-xs text-slate-500 font-medium">{new Date(apt.appointment_date).toLocaleDateString('fr-FR')} à {apt.appointment_time}</p>
                                            {apt.office_name && <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase flex items-center gap-1"><MapPin size={10} /> {apt.office_name}</p>}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                            ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                              apt.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                              apt.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                            {apt.status === 'pending' ? 'En attente' :
                                             apt.status === 'confirmed' ? 'Confirmé' :
                                             apt.status === 'completed' ? 'Complété' : 'Annulé'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>Aucun rendez-vous planifié</p>
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-6 rounded-2xl border">
                        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                            <CreditCard className="h-5 w-5 text-primary-600" />
                            <span>Historique des paiements</span>
                        </h2>
                        <div className="text-center py-12 text-slate-400">
                            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Aucun paiement effectué</p>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl border">
                        <h2 className="font-bold flex items-center space-x-2 mb-4">
                            <Bell className="h-5 w-5 text-primary-600" />
                            <span>Notifications</span>
                        </h2>
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm">
                                Bienvenue sur le portail SIAAH !
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;
