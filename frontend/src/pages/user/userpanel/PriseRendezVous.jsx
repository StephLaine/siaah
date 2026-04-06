import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';
import './PriseRendezVous.css';

const SERVICES = ['Immatriculation', 'Permis de Conduire', 'Assurances', 'Contraventions', 'Code de la Route'];

const SERVICE_TYPES = {
  'Immatriculation': ['Immatriculer un véhicule', 'Transfert de propriété', 'Changement de plaque'],
  'Permis de Conduire': ['Nouveau permis', 'Renouvellement', 'Échange de permis étranger'],
  'Assurances': ['Assurance véhicule', 'Assurance vie'],
  'Contraventions': ['Consultation contravention', 'Contestation'],
  'Code de la Route': ['Examen théorique', 'Renseignements'],
};

const PriseRendezVous = ({ onBack }) => {
  const { user, token } = useAuth();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offices, setOffices] = useState([]);
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

  const [officeSearch, setOfficeSearch] = useState('');
  const [showAllOffices, setShowAllOffices] = useState(false);

  // Fetch offices
  useEffect(() => {
    fetch('http://localhost:5001/api/appointments/offices')
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setOffices(d.data); })
      .catch(console.error);
  }, []);

  // Pre-fill from user profile if logged in
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/appointments', {
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

  if (submitted) {
    const selectedOfficeData = offices.find(o => o.id === parseInt(form.office_id));
    return (
      <div className="prv-container">
        <div className="prv-success-card">
          <CheckCircle size={64} className="prv-success-icon" />
          <h2>Rendez-vous Confirmé !</h2>
          <p>Votre demande de rendez-vous a été soumise avec succès. Vous recevrez une confirmation par email.</p>
          <div className="prv-success-details">
            <div><strong>Bureau :</strong> {selectedOfficeData?.name || '—'}</div>
            <div><strong>Service :</strong> {form.service}</div>
            <div><strong>Type :</strong> {form.service_type}</div>
            <div><strong>Date :</strong> {new Date(form.appointment_date).toLocaleDateString('fr-FR')}</div>
            <div><strong>Heure :</strong> {form.appointment_time || '—'}</div>
          </div>
          <button className="prv-btn-primary" onClick={onBack}>
            <ChevronLeft size={18} /> Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prv-container">
      <div className="prv-header">
        <button className="prv-back-btn" onClick={onBack}>
          <ChevronLeft size={20} /> Retour
        </button>
        <div>
          <h1 className="prv-title">Prise de Rendez-vous</h1>
          <p className="prv-subtitle">Réservez votre créneau en ligne en quelques étapes</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="prv-stepper">
        {['Bureau', 'Service', 'Créneau', 'Vos Infos', 'Confirmer'].map((label, i) => (
          <div key={i} className={`prv-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
            <div className="prv-step-circle">{step > i + 1 ? <CheckCircle size={16} /> : i + 1}</div>
            <span className="prv-step-label">{label}</span>
            {i < 4 && <div className="prv-step-line" />}
          </div>
        ))}
      </div>

      <div className="prv-card">
        {/* STEP 1 — Office */}
        {step === 1 && (
          <div className="prv-step-content">
            <h2 className="prv-step-title">Choisissez un bureau</h2>
            
            {/* Search Bar for Offices */}
            <div className="prv-search-wrapper" style={{ marginBottom: 20, position: 'relative' }}>
              <input 
                type="text"
                placeholder="Rechercher un bureau (nom ou ville)..."
                className="prv-input"
                style={{ paddingLeft: 40, borderRadius: 12 }}
                value={officeSearch}
                onChange={e => setOfficeSearch(e.target.value)}
              />
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            <div className="prv-service-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {displayedOffices.map(off => (
                <button
                  key={off.id}
                  className={`prv-service-btn ${parseInt(form.office_id) === off.id ? 'selected' : ''}`}
                  onClick={() => change('office_id', off.id)}
                  style={{ textAlign: 'left', alignItems: 'flex-start' }}
                >
                  <MapPin size={24} style={{ marginBottom: 8 }} />
                  <strong style={{ display: 'block', fontSize: 14 }}>{off.name}</strong>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 4 }}>{off.address}</span>
                </button>
              ))}
              {displayedOffices.length === 0 && <p className="text-slate-400 italic" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20 }}>Aucun bureau trouvé pour "{officeSearch}"</p>}
            </div>

            {!officeSearch && filteredOffices.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button 
                  onClick={() => setShowAllOffices(!showAllOffices)} 
                  className="prv-btn-secondary" 
                  style={{ padding: '8px 20px', fontSize: 13, border: 'dashed 1.5px #cbd5e1' }}
                >
                  {showAllOffices ? 'Voir moins' : `Voir les ${filteredOffices.length - 5} autres bureaux`}
                </button>
              </div>
            )}

            <div className="prv-nav">
              <div />
              <button
                className="prv-btn-primary"
                disabled={!form.office_id}
                onClick={() => setStep(2)}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Service */}
        {step === 2 && (
          <div className="prv-step-content">
            <h2 className="prv-step-title">Choisissez votre service</h2>
            <div className="prv-service-grid">
              {SERVICES.map(svc => (
                <button
                  key={svc}
                  className={`prv-service-btn ${form.service === svc ? 'selected' : ''}`}
                  onClick={() => { change('service', svc); change('service_type', ''); }}
                >
                  <FileText size={24} />
                  <span>{svc}</span>
                </button>
              ))}
            </div>
            {form.service && (
              <div className="prv-sub-section">
                <label className="prv-label">Type de démarche</label>
                <div className="prv-type-grid">
                  {(SERVICE_TYPES[form.service] || []).map(t => (
                    <button
                      key={t}
                      className={`prv-type-btn ${form.service_type === t ? 'selected' : ''}`}
                      onClick={() => change('service_type', t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="prv-nav">
              <button className="prv-btn-secondary" onClick={() => setStep(1)}>← Retour</button>
              <button
                className="prv-btn-primary"
                disabled={!form.service || !form.service_type}
                onClick={() => setStep(3)}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Date/Time */}
        {step === 3 && (
          <div className="prv-step-content">
            <h2 className="prv-step-title">Choisissez votre créneau</h2>
            <div className="prv-field-group">
              <label className="prv-label"><Calendar size={16} /> Date du rendez-vous</label>
              <input
                type="date"
                className="prv-input"
                value={form.appointment_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => change('appointment_date', e.target.value)}
              />
            </div>
            <div className="prv-field-group">
              <label className="prv-label"><Clock size={16} /> Heure préférée</label>
              <div className="prv-time-grid">
                {['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'].map(t => (
                  <button
                    key={t}
                    className={`prv-time-slot ${form.appointment_time === t ? 'selected' : ''}`}
                    onClick={() => change('appointment_time', t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="prv-field-group">
              <label className="prv-label">Notes / Précisions (optionnel)</label>
              <textarea
                className="prv-input"
                rows={3}
                placeholder="Informations complémentaires..."
                value={form.notes}
                onChange={e => change('notes', e.target.value)}
              />
            </div>
            <div className="prv-nav">
              <button className="prv-btn-secondary" onClick={() => setStep(2)}>← Retour</button>
              <button
                className="prv-btn-primary"
                disabled={!form.appointment_date}
                onClick={() => setStep(4)}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Infos personnelles */}
        {step === 4 && (
          <div className="prv-step-content">
            <h2 className="prv-step-title">Vos informations</h2>
            {user && (
              <div className="prv-prefill-banner">
                ✅ Informations pré-remplies depuis votre compte. Vérifiez et complétez si nécessaire.
              </div>
            )}
            <div className="prv-form-grid">
              <div className="prv-field-group">
                <label className="prv-label"><User size={14} /> Prénom *</label>
                <input className="prv-input" value={form.first_name} onChange={e => change('first_name', e.target.value)} placeholder="Jean" />
              </div>
              <div className="prv-field-group">
                <label className="prv-label"><User size={14} /> Nom *</label>
                <input className="prv-input" value={form.last_name} onChange={e => change('last_name', e.target.value)} placeholder="DUPONT" />
              </div>
              <div className="prv-field-group">
                <label className="prv-label"><Mail size={14} /> Email *</label>
                <input className="prv-input" type="email" value={form.email} onChange={e => change('email', e.target.value)} placeholder="exemple@email.com" />
              </div>
              <div className="prv-field-group">
                <label className="prv-label"><Phone size={14} /> Téléphone *</label>
                <input className="prv-input" value={form.phone} onChange={e => change('phone', e.target.value)} placeholder="+509 " />
              </div>
              <div className="prv-field-group" style={{ gridColumn: '1 / -1' }}>
                <label className="prv-label"><FileText size={14} /> NIF / CIN</label>
                <input className="prv-input" value={form.nif} onChange={e => change('nif', e.target.value)} placeholder="Numéro NIF ou CIN" />
              </div>
            </div>
            <div className="prv-nav">
              <button className="prv-btn-secondary" onClick={() => setStep(3)}>← Retour</button>
              <button
                className="prv-btn-primary"
                disabled={!form.first_name || !form.last_name || !form.email || !form.phone}
                onClick={() => setStep(5)}
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 — Confirmation */}
        {step === 5 && (
          <div className="prv-step-content">
            <h2 className="prv-step-title">Confirmation du rendez-vous</h2>
            <div className="prv-recap-grid">
              <div className="prv-recap-item"><span>Bureau</span><strong>{offices.find(o => o.id === parseInt(form.office_id))?.name || '—'}</strong></div>
              <div className="prv-recap-item"><span>Service</span><strong>{form.service}</strong></div>
              <div className="prv-recap-item"><span>Type</span><strong>{form.service_type}</strong></div>
              <div className="prv-recap-item"><span>Date</span><strong>{new Date(form.appointment_date).toLocaleDateString('fr-FR')}</strong></div>
              <div className="prv-recap-item"><span>Heure</span><strong>{form.appointment_time || 'Non précisée'}</strong></div>
              <div className="prv-recap-item"><span>Nom</span><strong>{form.first_name} {form.last_name}</strong></div>
              <div className="prv-recap-item"><span>Email</span><strong>{form.email}</strong></div>
              <div className="prv-recap-item"><span>Téléphone</span><strong>{form.phone}</strong></div>
              {form.nif && <div className="prv-recap-item"><span>NIF</span><strong>{form.nif}</strong></div>}
              {form.notes && <div className="prv-recap-item" style={{ gridColumn: '1 / -1' }}><span>Notes</span><strong>{form.notes}</strong></div>}
            </div>
            <div className="prv-nav">
              <button className="prv-btn-secondary" onClick={() => setStep(4)}>← Modifier</button>
              <button className="prv-btn-confirm" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Envoi en cours...' : '✅ Confirmer le Rendez-vous'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriseRendezVous;
