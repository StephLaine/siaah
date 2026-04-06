import { useState, useEffect, useCallback } from 'react';
import {
    MapPin, Plus, Search, Pencil, Trash2, X, Check, AlertCircle,
    Calendar, Building2, Phone, Mail, Globe, Clock, User,
    Layers, Info, Briefcase, CheckSquare, Eye
} from 'lucide-react';
import './SuperAdmin.css';

const BUREAU_TYPES   = ['Bureau central', 'Bureau régional', 'Bureau communal', 'Agence'];
const BUREAU_STATUTS = ['Actif', 'Fermé', 'Temporairement fermé'];
const HAITI_DEPARTMENTS = [
    'Artibonite', 'Centre', 'Grand\'Anse', 'Nippes', 'Nord',
    'Nord-Est', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Est'
];
const SERVICES_LIST = [
    'Paiement impôt', 'Enregistrement', 'Assistance fiscale',
    'Immatriculation', 'Délivrance de permis', 'Paiement assurance',
    'Contrôle des contraventions', 'Information et orientation',
    'Gestion des véhicules'
];

const EMPTY_FORM = {
    // Identification
    name: '', code: '', entity_id: '',
    // Localisation
    departement: '', commune: '', quartier: '', adresse: '', latitude: '', longitude: '',
    // Contact
    telephone: '', email: '',
    // Responsable
    responsable_nom: '', responsable_fonction: '', responsable_telephone: '', responsable_email: '',
    // Informations opérationnelles
    type_bureau: '', heures_ouverture: '', services: [],
    statut: 'Actif', date_ouverture: '',
};

const FormSection = ({ icon: Icon, title, children }) => (
    <div className="sa-form-section">
        <div className="sa-form-section-header">
            <Icon size={16} />
            <span>{title}</span>
        </div>
        <div className="sa-form-section-body">{children}</div>
    </div>
);

const Field = ({ label, required, children }) => (
    <div className="sa-form-group">
        <label>{label}{required && <span className="sa-required"> *</span>}</label>
        {children}
    </div>
);

const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="sa-detail-item">
        <div className="sa-detail-label">
            {Icon && <Icon size={14} />}
            <span>{label}</span>
        </div>
        <div className="sa-detail-value">{value || '—'}</div>
    </div>
);

const BureauxManager = () => {
    const [offices, setOffices]         = useState([]);
    const [entities, setEntities]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [startDate, setStartDate]     = useState('');
    const [endDate, setEndDate]         = useState('');
    const [filterStatut, setFilterStatut] = useState('all');
    const [showModal, setShowModal]     = useState(false);
    const [editOffice, setEditOffice]   = useState(null);
    const [viewOffice, setViewOffice]   = useState(null);
    const [form, setForm]               = useState(EMPTY_FORM);
    const [saving, setSaving]           = useState(false);
    const [toast, setToast]             = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const authHeader = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [offRes, entRes] = await Promise.all([
                fetch('/api/admin/offices',  { headers: authHeader }),
                fetch('/api/admin/entities', { headers: authHeader })
            ]);
            const [offData, entData] = await Promise.all([offRes.json(), entRes.json()]);
            if (offData.status === 'success') setOffices(offData.data);
            if (entData.status === 'success') setEntities(entData.data);
        } catch { showToast('Erreur lors du chargement', 'error'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = offices.filter(o => {
        const matchSearch = [o.name, o.entity_name, o.commune, o.departement]
            .filter(Boolean).some(v => v.toLowerCase().includes(search.toLowerCase()));
        const created    = new Date(o.created_at);
        const matchStart = !startDate || created >= new Date(startDate);
        const matchEnd   = !endDate   || created <= new Date(endDate + 'T23:59:59');
        const matchStat  = filterStatut === 'all' || (o.statut || 'Actif') === filterStatut;
        return matchSearch && matchStart && matchEnd && matchStat;
    });

    const openAdd  = () => { setEditOffice(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (o) => {
        setEditOffice(o);
        setForm({
            name: o.name || '', code: o.code || '', entity_id: String(o.entity_id || ''),
            departement: o.departement || '', commune: o.commune || '',
            quartier: o.quartier || '', adresse: o.location || o.adresse || '',
            latitude: o.latitude || '', longitude: o.longitude || '',
            telephone: o.telephone || '', email: o.email || '',
            responsable_nom: o.responsable_nom || '', responsable_fonction: o.responsable_fonction || '',
            responsable_telephone: o.responsable_telephone || '', responsable_email: o.responsable_email || '',
            type_bureau: o.type_bureau || '', heures_ouverture: o.heures_ouverture || '',
            services: o.services || [], statut: o.statut || 'Actif',
            date_ouverture: o.date_ouverture?.split('T')[0] || '',
        });
        setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setEditOffice(null); };

    const setF = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const toggleService = (svc) => {
        setForm(prev => ({
            ...prev,
            services: prev.services.includes(svc)
                ? prev.services.filter(s => s !== svc)
                : [...prev.services, svc]
        }));
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.entity_id) return;
        setSaving(true);
        try {
            const url    = editOffice ? `/api/admin/offices/${editOffice.id}` : '/api/admin/offices';
            const method = editOffice ? 'PUT' : 'POST';
            const res    = await fetch(url, { method, headers: authHeader, body: JSON.stringify(form) });
            const data   = await res.json();
            if (data.status === 'success') {
                showToast(editOffice ? 'Bureau mis à jour !' : 'Bureau créé avec succès !');
                closeModal();
                fetchData();
            } else {
                showToast(data.message || 'Erreur lors de l\'enregistrement', 'error');
            }
        } catch { showToast('Erreur de connexion', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/admin/offices/${id}`, { method: 'DELETE', headers: authHeader });
            showToast('Bureau supprimé !');
            setConfirmDelete(null);
            fetchData();
        } catch { showToast('Erreur lors de la suppression', 'error'); }
    };

    const statutColor = (s) => {
        if (s === 'Actif')                return 'sa-badge-green';
        if (s === 'Temporairement fermé') return 'sa-badge-orange';
        return 'sa-badge-gray';
    };

    return (
        <div className="sa-page sa-page-full">
            {toast && <div className={`sa-toast sa-toast-${toast.type}`}>{toast.msg}</div>}

            {/* Header */}
            <div className="sa-page-header">
                <div>
                    <h2><MapPin size={22} /> Gestion des Bureaux</h2>
                    <p>Bureaux enregistrés par entité, avec leurs localisations et responsables</p>
                </div>
                <button className="sa-btn-primary" onClick={openAdd}>
                    <Plus size={16} /> Nouveau Bureau
                </button>
            </div>

            {/* Filters */}
            <div className="sa-filters-bar">
                <div className="sa-search-box">
                    <Search size={16} className="sa-search-icon" />
                    <input
                        type="text" placeholder="Rechercher un bureau, entité, ville..."
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                    {search && <button className="sa-search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
                </div>
                <div className="sa-filter-select-wrapper">
                    <Layers size={14} />
                    <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        {BUREAU_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="sa-date-range">
                    <Calendar size={15} className="sa-date-icon" />
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span className="sa-date-sep">→</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    {(startDate || endDate) && <button className="sa-clear-date" onClick={() => { setStartDate(''); setEndDate(''); }}><X size={13} /></button>}
                </div>
            </div>

            {/* Table */}
            <div className="sa-table-card">
                <div className="sa-table-stats"><span>{filtered.length} bureau{filtered.length !== 1 ? 'x' : ''}</span></div>
                <div className="sa-table-wrapper">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Bureau</th>
                                <th>Code</th>
                                <th>Entité</th>
                                <th>Type</th>
                                <th>Département</th>
                                <th>Responsable</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => <tr key={i}><td colSpan="9"><div className="sa-skeleton-row" /></td></tr>)
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="9" className="sa-table-empty">Aucun bureau trouvé</td></tr>
                            ) : filtered.map((o, i) => (
                                <tr key={o.id}>
                                    <td className="sa-cell-dim">{i + 1}</td>
                                    <td>
                                        <div className="sa-entity-name-cell">
                                            <div className="sa-entity-dot sa-dot-green"><MapPin size={12} /></div>
                                            <span className="sa-cell-name">{o.name}</span>
                                        </div>
                                    </td>
                                    <td className="sa-cell-dim">{o.code || '—'}</td>
                                    <td><span className="sa-badge sa-badge-blue">{o.entity_name || '—'}</span></td>
                                    <td className="sa-cell-dim">{o.type_bureau || '—'}</td>
                                    <td className="sa-cell-dim">{o.departement || o.city || '—'}</td>
                                    <td className="sa-cell-dim">{o.responsable_nom || '—'}</td>
                                    <td><span className={`sa-badge ${statutColor(o.statut || 'Actif')}`}>{o.statut || 'Actif'}</span></td>
                                    <td>
                                        <div className="sa-action-btns">
                                            <button className="sa-action-btn sa-btn-view" onClick={() => setViewOffice(o)} title="Voir Profil"><Eye size={15} /></button>
                                            <button className="sa-action-btn sa-btn-edit" onClick={() => openEdit(o)} title="Modifier"><Pencil size={15} /></button>
                                            <button className="sa-action-btn sa-btn-delete" onClick={() => setConfirmDelete(o)} title="Supprimer"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ══════════════ MODAL : VIEW OFFICE PROFILE ══════════════ */}
            {viewOffice && (
                <div className="sa-modal-overlay" onClick={() => setViewOffice(null)}>
                    <div className="sa-modal sa-modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="sa-modal-header sa-profile-header">
                            <div className="sa-profile-title-group">
                                <div className="sa-profile-avatar sa-bg-green"><MapPin size={24} /></div>
                                <div>
                                    <h3>{viewOffice.name}</h3>
                                    <div className="sa-profile-badges">
                                        <span className="sa-badge sa-badge-blue">{viewOffice.entity_name}</span>
                                        <span className={`sa-badge ${statutColor(viewOffice.statut || 'Actif')}`}>{viewOffice.statut || 'Actif'}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="sa-modal-close" onClick={() => setViewOffice(null)}><X size={18} /></button>
                        </div>
                        <div className="sa-modal-body sa-modal-body-scroll">
                            <div className="sa-profile-grid">
                                <FormSection icon={Info} title="Identification & Opérations">
                                    <div className="sa-details-grid">
                                        <DetailRow label="Code Bureau" value={viewOffice.code} icon={Layers} />
                                        <DetailRow label="Type de bureau" value={viewOffice.type_bureau} icon={Briefcase} />
                                        <DetailRow label="Entité" value={viewOffice.entity_name} icon={Building2} />
                                        <DetailRow label="Ouvert depuis" value={viewOffice.date_ouverture ? new Date(viewOffice.date_ouverture).toLocaleDateString('fr-FR') : '—'} icon={Calendar} />
                                    </div>
                                    <div className="sa-detail-block">
                                        <label className="sa-detail-label"><Clock size={14} /> Horaires</label>
                                        <p className="sa-detail-description">{viewOffice.heures_ouverture || 'Non spécifiés.'}</p>
                                    </div>
                                </FormSection>

                                <FormSection icon={User} title="Responsable du bureau">
                                    <div className="sa-details-grid">
                                        <DetailRow label="Nom" value={viewOffice.responsable_nom} icon={User} />
                                        <DetailRow label="Fonction" value={viewOffice.responsable_fonction} icon={Briefcase} />
                                        <DetailRow label="Téléphone" value={viewOffice.responsable_telephone} icon={Phone} />
                                        <DetailRow label="Email" value={viewOffice.responsable_email} icon={Mail} />
                                    </div>
                                </FormSection>

                                <FormSection icon={MapPin} title="Localisation & Contact">
                                    <div className="sa-details-grid">
                                        <DetailRow label="Département" value={viewOffice.departement} icon={MapPin} />
                                        <DetailRow label="Commune / Ville" value={viewOffice.commune || viewOffice.city} icon={Globe} />
                                        <DetailRow label="Adresse" value={viewOffice.location || viewOffice.adresse} icon={MapPin} />
                                        <DetailRow label="Email Bureau" value={viewOffice.email} icon={Mail} />
                                    </div>
                                </FormSection>

                                <FormSection icon={CheckSquare} title="Services Offerts">
                                    <div className="sa-services-grid sa-view-only">
                                        {viewOffice.services && viewOffice.services.length > 0 ? (
                                            viewOffice.services.map(s => (
                                                <span key={s} className="sa-service-tag">{s}</span>
                                            ))
                                        ) : <p className="sa-no-data">Aucun service spécifié.</p>}
                                    </div>
                                </FormSection>
                            </div>
                        </div>
                        <div className="sa-modal-footer">
                            <button className="sa-btn-primary" onClick={() => { setViewOffice(null); openEdit(viewOffice); }}>
                                <Pencil size={15} /> Modifier le bureau
                            </button>
                            <button className="sa-btn-cancel" onClick={() => setViewOffice(null)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ MODAL : ADD / EDIT BUREAU ══════════════ */}
            {showModal && (
                <div className="sa-modal-overlay" onClick={closeModal}>
                    <div className="sa-modal sa-modal-xl" onClick={e => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h3><MapPin size={18} /> {editOffice ? 'Modifier le Bureau' : 'Nouveau Bureau'}</h3>
                            <button className="sa-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>

                        <div className="sa-modal-body sa-modal-body-scroll">

                            {/* ── Section 1 : Identification ── */}
                            <FormSection icon={Info} title="Identification">
                                <div className="sa-form-row sa-3col">
                                    <Field label="Nom du bureau" required>
                                        <input className="sa-input" type="text" placeholder="Ex: Bureau DGI Delmas" value={form.name} onChange={e => setF('name', e.target.value)} autoFocus />
                                    </Field>
                                    <Field label="Code du bureau">
                                        <input className="sa-input" type="text" placeholder="Ex: DGI-DMS-01" value={form.code} onChange={e => setF('code', e.target.value)} />
                                    </Field>
                                    <Field label="Entité associée" required>
                                        <select className="sa-input sa-select" value={form.entity_id} onChange={e => setF('entity_id', e.target.value)}>
                                            <option value="">Sélectionner une entité...</option>
                                            {entities.map(en => <option key={en.id} value={en.id}>{en.name}</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </FormSection>

                            {/* ── Section 2 : Localisation ── */}
                            <FormSection icon={MapPin} title="Localisation">
                                <div className="sa-form-row sa-3col">
                                    <Field label="Département">
                                        <select className="sa-input sa-select" value={form.departement} onChange={e => setF('departement', e.target.value)}>
                                            <option value="">Sélectionner...</option>
                                            {HAITI_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Commune">
                                        <input className="sa-input" type="text" placeholder="Ex: Delmas" value={form.commune} onChange={e => setF('commune', e.target.value)} />
                                    </Field>
                                    <Field label="Quartier">
                                        <input className="sa-input" type="text" placeholder="Ex: Delmas 33" value={form.quartier} onChange={e => setF('quartier', e.target.value)} />
                                    </Field>
                                </div>
                                <div className="sa-form-row">
                                    <Field label="Adresse complète">
                                        <input className="sa-input" type="text" placeholder="Ex: Rue des Miracles, Delmas 33" value={form.adresse} onChange={e => setF('adresse', e.target.value)} />
                                    </Field>
                                </div>
                                <div className="sa-form-row">
                                    <Field label="Latitude">
                                        <input className="sa-input" type="text" placeholder="Ex: 18.5432" value={form.latitude} onChange={e => setF('latitude', e.target.value)} />
                                    </Field>
                                    <Field label="Longitude">
                                        <input className="sa-input" type="text" placeholder="Ex: -72.3388" value={form.longitude} onChange={e => setF('longitude', e.target.value)} />
                                    </Field>
                                </div>
                            </FormSection>

                            {/* ── Section 3 : Contact ── */}
                            <FormSection icon={Phone} title="Contact du bureau">
                                <div className="sa-form-row">
                                    <Field label="Téléphone">
                                        <input className="sa-input" type="tel" placeholder="Ex: +509 2999-0000" value={form.telephone} onChange={e => setF('telephone', e.target.value)} />
                                    </Field>
                                    <Field label="Email">
                                        <input className="sa-input" type="email" placeholder="Ex: bureau.delmas@dgi.gouv.ht" value={form.email} onChange={e => setF('email', e.target.value)} />
                                    </Field>
                                </div>
                            </FormSection>

                            {/* ── Section 4 : Responsable ── */}
                            <FormSection icon={User} title="Responsable du bureau">
                                <div className="sa-form-row">
                                    <Field label="Nom du responsable">
                                        <input className="sa-input" type="text" placeholder="Prénom et Nom" value={form.responsable_nom} onChange={e => setF('responsable_nom', e.target.value)} />
                                    </Field>
                                    <Field label="Fonction">
                                        <input className="sa-input" type="text" placeholder="Ex: Chef de bureau" value={form.responsable_fonction} onChange={e => setF('responsable_fonction', e.target.value)} />
                                    </Field>
                                </div>
                                <div className="sa-form-row">
                                    <Field label="Téléphone du responsable">
                                        <input className="sa-input" type="tel" placeholder="Ex: +509 3700-0000" value={form.responsable_telephone} onChange={e => setF('responsable_telephone', e.target.value)} />
                                    </Field>
                                    <Field label="Email du responsable">
                                        <input className="sa-input" type="email" placeholder="Ex: j.pierre@dgi.gouv.ht" value={form.responsable_email} onChange={e => setF('responsable_email', e.target.value)} />
                                    </Field>
                                </div>
                            </FormSection>

                            {/* ── Section 5 : Informations opérationnelles ── */}
                            <FormSection icon={Briefcase} title="Informations opérationnelles">
                                <div className="sa-form-row sa-3col">
                                    <Field label="Type de bureau">
                                        <select className="sa-input sa-select" value={form.type_bureau} onChange={e => setF('type_bureau', e.target.value)}>
                                            <option value="">Sélectionner...</option>
                                            {BUREAU_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Statut">
                                        <select className="sa-input sa-select" value={form.statut} onChange={e => setF('statut', e.target.value)}>
                                            {BUREAU_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Date d'ouverture">
                                        <input className="sa-input" type="date" value={form.date_ouverture} onChange={e => setF('date_ouverture', e.target.value)} />
                                    </Field>
                                </div>
                                <Field label="Heures d'ouverture">
                                    <input className="sa-input" type="text" placeholder="Ex: Lundi–Vendredi, 8h00–16h00" value={form.heures_ouverture} onChange={e => setF('heures_ouverture', e.target.value)} />
                                </Field>

                                {/* Services checklist */}
                                <div className="sa-form-group" style={{ marginTop: '0.5rem' }}>
                                    <label>Services offerts</label>
                                    <div className="sa-services-grid">
                                        {SERVICES_LIST.map(svc => (
                                            <label key={svc} className={`sa-service-chip ${form.services.includes(svc) ? 'selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={form.services.includes(svc)}
                                                    onChange={() => toggleService(svc)}
                                                    style={{ display: 'none' }}
                                                />
                                                <CheckSquare size={14} />
                                                {svc}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </FormSection>

                        </div>

                        <div className="sa-modal-footer">
                            <button className="sa-btn-cancel" onClick={closeModal}>Annuler</button>
                            <button className="sa-btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.entity_id}>
                                {saving ? 'Enregistrement...' : <><Check size={16} /> {editOffice ? 'Mettre à jour' : 'Créer le bureau'}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {confirmDelete && (
                <div className="sa-modal-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="sa-modal sa-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="sa-modal-header sa-modal-danger">
                            <h3><AlertCircle size={18} /> Confirmer la suppression</h3>
                            <button className="sa-modal-close" onClick={() => setConfirmDelete(null)}><X size={18} /></button>
                        </div>
                        <div className="sa-modal-body">
                            <p>Supprimer le bureau <strong>« {confirmDelete.name} »</strong> ? Cette action est irréversible.</p>
                        </div>
                        <div className="sa-modal-footer">
                            <button className="sa-btn-cancel" onClick={() => setConfirmDelete(null)}>Annuler</button>
                            <button className="sa-btn-danger" onClick={() => handleDelete(confirmDelete.id)}><Trash2 size={15} /> Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BureauxManager;
