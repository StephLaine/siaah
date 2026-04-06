import { useState, useEffect, useCallback } from 'react';
import {
    Building2, Plus, Search, Pencil, Trash2, X, Check, AlertCircle,
    Calendar, ChevronDown, Globe, Phone, Mail, MapPin, FileText,
    User, Shield, Upload, Info, Briefcase, Eye, Layers, Clock
} from 'lucide-react';
import './SuperAdmin.css';

const ENTITY_TYPES = ['Ministère', 'Direction', 'Organisation', 'Institution publique', 'Institution privée'];
const ENTITY_STATUTS = ['Actif', 'Inactif', 'Suspendu'];
const HAITI_DEPARTMENTS = [
    'Artibonite', 'Centre', 'Grand\'Anse', 'Nippes', 'Nord',
    'Nord-Est', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Est'
];

const EMPTY_FORM = {
    name: '', sigle: '', type_entite: '', description: '',
    date_creation: '', statut: 'Actif', ministere_tutelle: '', responsable: '',
    telephone: '', email: '', site_web: '',
    pays: 'Haïti', departement: '', ville: '', adresse: '', code_postal: '',
    service_ids: [],
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

const EntitesManager = () => {
    const [entities, setEntities]       = useState([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [startDate, setStartDate]     = useState('');
    const [endDate, setEndDate]         = useState('');
    const [showModal, setShowModal]     = useState(false);
    const [editEntity, setEditEntity]   = useState(null);
    const [viewEntity, setViewEntity]   = useState(null);
    const [allServices, setAllServices] = useState([]);
    const [form, setForm]               = useState(EMPTY_FORM);
    const [saving, setSaving]           = useState(false);
    const [toast, setToast]             = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [filterStatut, setFilterStatut]   = useState('all');

    const authHeader = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchEntities = useCallback(async () => {
        setLoading(true);
        try {
            const [entRes, srvRes] = await Promise.all([
                fetch('/api/admin/entities', { headers: authHeader }),
                fetch('/api/admin/services', { headers: authHeader })
            ]);
            const entData = await entRes.json();
            const srvData = await srvRes.json();
            
            if (entData.status === 'success') setEntities(entData.data);
            if (srvData.status === 'success') setAllServices(srvData.data);
        } catch { showToast('Erreur lors du chargement', 'error'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchEntities(); }, [fetchEntities]);

    const filtered = entities.filter(e => {
        const matchSearch  = e.name.toLowerCase().includes(search.toLowerCase());
        const created      = new Date(e.created_at);
        const matchStart   = !startDate || created >= new Date(startDate);
        const matchEnd     = !endDate   || created <= new Date(endDate + 'T23:59:59');
        const matchStatut  = filterStatut === 'all' || (e.statut || 'Actif') === filterStatut;
        return matchSearch && matchStart && matchEnd && matchStatut;
    });

    const openAdd  = () => { setEditEntity(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = async (e) => {
        setEditEntity(e);
        setForm({
            name: e.name || '', sigle: e.sigle || '', type_entite: e.type_entite || '',
            description: e.description || '', date_creation: e.date_creation?.split('T')[0] || '',
            statut: e.statut || 'Actif', ministere_tutelle: e.ministere_tutelle || '',
            responsable: e.responsable || '', telephone: e.telephone || '',
            email: e.email || '', site_web: e.site_web || '',
            pays: e.pays || 'Haïti', departement: e.departement || '',
            ville: e.ville || '', adresse: e.adresse || '', code_postal: e.code_postal || '',
            service_ids: [],
        });
        setShowModal(true);
        
        // Fetch assigned services
        try {
            const res = await fetch(`/api/admin/entities/${e.id}/services`, { headers: authHeader });
            const data = await res.json();
            if (data.status === 'success') {
                setForm(prev => ({ ...prev, service_ids: data.data.map(s => s.id) }));
            }
        } catch (err) { console.error('Error fetching services', err); }
    };
    const closeModal = () => { setShowModal(false); setEditEntity(null); };

    const setF = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            // Remove service_ids from the main entity payload
            const { service_ids, ...entityPayload } = form;
            
            const url    = editEntity ? `/api/admin/entities/${editEntity.id}` : '/api/admin/entities';
            const method = editEntity ? 'PUT' : 'POST';
            const res    = await fetch(url, { method, headers: authHeader, body: JSON.stringify(entityPayload) });
            const data   = await res.json();
            
            if (data.status === 'success') {
                const entityId = editEntity ? editEntity.id : data.data.id;
                
                // Save services
                await fetch(`/api/admin/entities/${entityId}/services`, {
                    method: 'PUT',
                    headers: authHeader,
                    body: JSON.stringify({ service_ids: form.service_ids })
                });

                showToast(editEntity ? 'Entité mise à jour !' : 'Entité créée avec succès !');
                closeModal();
                fetchEntities();
            } else {
                showToast(data.message || 'Erreur lors de l\'enregistrement', 'error');
            }
        } catch { showToast('Erreur de connexion', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/admin/entities/${id}`, { method: 'DELETE', headers: authHeader });
            showToast('Entité supprimée !');
            setConfirmDelete(null);
            fetchEntities();
        } catch { showToast('Erreur lors de la suppression', 'error'); }
    };

    const statutColor = (s) => {
        if (s === 'Actif')    return 'sa-badge-green';
        if (s === 'Suspendu') return 'sa-badge-orange';
        return 'sa-badge-gray';
    };

    return (
        <div className="sa-page sa-page-full">
            {toast && <div className={`sa-toast sa-toast-${toast.type}`}>{toast.msg}</div>}

            {/* Header */}
            <div className="sa-page-header">
                <div>
                    <h2><Building2 size={22} /> Gestion des Entités</h2>
                    <p>Gérez toutes les entités gouvernementales et institutionnelles enregistrées</p>
                </div>
                <button className="sa-btn-primary" onClick={openAdd}>
                    <Plus size={16} /> Nouvelle Entité
                </button>
            </div>

            {/* Filters */}
            <div className="sa-filters-bar">
                <div className="sa-search-box">
                    <Search size={16} className="sa-search-icon" />
                    <input
                        type="text" placeholder="Rechercher une entité..."
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                    {search && <button className="sa-search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
                </div>
                <div className="sa-filter-select-wrapper">
                    <Shield size={14} />
                    <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        {ENTITY_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
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
                <div className="sa-table-stats"><span>{filtered.length} entité{filtered.length !== 1 ? 's' : ''}</span></div>
                <div className="sa-table-wrapper">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Entité</th>
                                <th>Sigle</th>
                                <th>Type</th>
                                <th>Responsable</th>
                                <th>Statut</th>
                                <th>Bureaux</th>
                                <th>Créée le</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => <tr key={i}><td colSpan="9"><div className="sa-skeleton-row" /></td></tr>)
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="9" className="sa-table-empty">Aucune entité trouvée</td></tr>
                            ) : filtered.map((e, i) => (
                                <tr key={e.id}>
                                    <td className="sa-cell-dim">{i + 1}</td>
                                    <td>
                                        <div className="sa-entity-name-cell">
                                            <div className="sa-entity-dot">{e.name[0]}</div>
                                            <span className="sa-cell-name">{e.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="sa-badge sa-badge-blue">{e.sigle || '—'}</span></td>
                                    <td className="sa-cell-dim">{e.type_entite || '—'}</td>
                                    <td className="sa-cell-dim">{e.responsable || '—'}</td>
                                    <td><span className={`sa-badge ${statutColor(e.statut || 'Actif')}`}>{e.statut || 'Actif'}</span></td>
                                    <td><span className="sa-badge sa-badge-purple">{e.office_count || 0} bureau{e.office_count !== 1 ? 'x' : ''}</span></td>
                                    <td className="sa-cell-dim">{new Date(e.created_at).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <div className="sa-action-btns">
                                            <button className="sa-action-btn sa-btn-view" onClick={() => setViewEntity(e)} title="Voir Profil"><Eye size={15} /></button>
                                            <button className="sa-action-btn sa-btn-edit" onClick={() => openEdit(e)} title="Modifier"><Pencil size={15} /></button>
                                            {!['DGI', 'OAVCT', 'DCPR'].includes(e.sigle) && (
                                                <button className="sa-action-btn sa-btn-delete" onClick={() => setConfirmDelete(e)} title="Supprimer"><Trash2 size={15} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ══════════════ MODAL : VIEW PROFILE ══════════════ */}
            {viewEntity && (
                <div className="sa-modal-overlay" onClick={() => setViewEntity(null)}>
                    <div className="sa-modal sa-modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="sa-modal-header sa-profile-header">
                            <div className="sa-profile-title-group">
                                <div className="sa-profile-avatar">{viewEntity.name[0]}</div>
                                <div>
                                    <h3>{viewEntity.name}</h3>
                                    <div className="sa-profile-badges">
                                        <span className="sa-badge sa-badge-blue">{viewEntity.sigle || 'N/A'}</span>
                                        <span className={`sa-badge ${statutColor(viewEntity.statut || 'Actif')}`}>{viewEntity.statut || 'Actif'}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="sa-modal-close" onClick={() => setViewEntity(null)}><X size={18} /></button>
                        </div>
                        <div className="sa-modal-body sa-modal-body-scroll">
                            <div className="sa-profile-grid">
                                <FormSection icon={Info} title="Détails de l'institution">
                                    <div className="sa-details-grid">
                                        <DetailRow label="Type d'entité" value={viewEntity.type_entite} icon={Building2} />
                                        <DetailRow label="Responsable" value={viewEntity.responsable} icon={User} />
                                        <DetailRow label="Tutelle" value={viewEntity.ministere_tutelle} icon={Shield} />
                                        <DetailRow label="Création (Officielle)" value={viewEntity.date_creation ? new Date(viewEntity.date_creation).toLocaleDateString('fr-FR') : '—'} icon={Calendar} />
                                    </div>
                                    <div className="sa-detail-block">
                                        <label className="sa-detail-label"><FileText size={14} /> Description</label>
                                        <p className="sa-detail-description">{viewEntity.description || 'Aucune description disponible.'}</p>
                                    </div>
                                </FormSection>

                                <FormSection icon={Phone} title="Coordonnées & Contact">
                                    <div className="sa-details-grid">
                                        <DetailRow label="Téléphone" value={viewEntity.telephone} icon={Phone} />
                                        <DetailRow label="Email" value={viewEntity.email} icon={Mail} />
                                        <DetailRow label="Site Web" value={viewEntity.site_web} icon={Globe} />
                                    </div>
                                </FormSection>

                                <FormSection icon={MapPin} title="Localisation">
                                    <div className="sa-details-grid">
                                        <DetailRow label="Département" value={viewEntity.departement} icon={MapPin} />
                                        <DetailRow label="Ville" value={viewEntity.ville} icon={Globe} />
                                        <DetailRow label="Adresse" value={viewEntity.adresse} icon={MapPin} />
                                        <DetailRow label="Code Postal" value={viewEntity.code_postal} icon={Briefcase} />
                                    </div>
                                </FormSection>

                                <FormSection icon={Calendar} title="Métadonnées Système">
                                    <div className="sa-details-grid">
                                        <DetailRow label="Date d'enregistrement" value={new Date(viewEntity.created_at).toLocaleString('fr-FR')} icon={Clock} />
                                        <DetailRow label="ID Système" value={viewEntity.id} icon={Shield} />
                                    </div>
                                </FormSection>
                            </div>
                        </div>
                        <div className="sa-modal-footer">
                            <button className="sa-btn-primary" onClick={() => { setViewEntity(null); openEdit(viewEntity); }}>
                                <Pencil size={15} /> Modifier le profil
                            </button>
                            <button className="sa-btn-cancel" onClick={() => setViewEntity(null)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ MODAL : ADD / EDIT ══════════════ */}
            {showModal && (
                <div className="sa-modal-overlay" onClick={closeModal}>
                    <div className="sa-modal sa-modal-xl" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sa-modal-header">
                            <h3><Building2 size={18} /> {editEntity ? 'Modifier l\'entité' : 'Nouvelle Entité'}</h3>
                            <button className="sa-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>

                        {/* Modal Scrollable Body */}
                        <div className="sa-modal-body sa-modal-body-scroll">

                            {/* ── Section 1 : Informations de base ── */}
                            <FormSection icon={Info} title="Informations de base">
                                <div className="sa-form-row sa-3col">
                                    <Field label="Nom de l'entité" required>
                                        <input className="sa-input" type="text" placeholder="Ex: Direction Générale des Impôts" value={form.name} onChange={e => setF('name', e.target.value)} autoFocus />
                                    </Field>
                                    <Field label="Sigle / Acronyme">
                                        <input className="sa-input" type="text" placeholder="Ex: DGI" value={form.sigle} onChange={e => setF('sigle', e.target.value)} />
                                    </Field>
                                    <Field label="Type d'entité">
                                        <select className="sa-input sa-select" value={form.type_entite} onChange={e => setF('type_entite', e.target.value)}>
                                            <option value="">Sélectionner...</option>
                                            {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </Field>
                                </div>
                                <Field label="Description">
                                    <textarea className="sa-input sa-textarea" rows={3} placeholder="Texte expliquant le rôle et les missions de l'entité..." value={form.description} onChange={e => setF('description', e.target.value)} />
                                </Field>
                            </FormSection>

                            {/* ── Section 2 : Informations administratives ── */}
                            <FormSection icon={Briefcase} title="Informations administratives">
                                <div className="sa-form-row sa-3col">
                                    <Field label="Date de création">
                                        <input className="sa-input" type="date" value={form.date_creation} onChange={e => setF('date_creation', e.target.value)} />
                                    </Field>
                                    <Field label="Statut">
                                        <select className="sa-input sa-select" value={form.statut} onChange={e => setF('statut', e.target.value)}>
                                            {ENTITY_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Ministère de tutelle">
                                        <input className="sa-input" type="text" placeholder="Ex: Ministère de l'Économie et des Finances" value={form.ministere_tutelle} onChange={e => setF('ministere_tutelle', e.target.value)} />
                                    </Field>
                                </div>
                                <Field label="Responsable principal">
                                    <input className="sa-input" type="text" placeholder="Ex: Directeur Général" value={form.responsable} onChange={e => setF('responsable', e.target.value)} />
                                </Field>
                            </FormSection>

                            {/* ── Section 3 : Coordonnées ── */}
                            <FormSection icon={Phone} title="Coordonnées">
                                <div className="sa-form-row sa-3col">
                                    <Field label="Téléphone">
                                        <input className="sa-input" type="tel" placeholder="Ex: +509 2999-0000" value={form.telephone} onChange={e => setF('telephone', e.target.value)} />
                                    </Field>
                                    <Field label="Email">
                                        <input className="sa-input" type="email" placeholder="Ex: contact@dgi.gouv.ht" value={form.email} onChange={e => setF('email', e.target.value)} />
                                    </Field>
                                    <Field label="Site web">
                                        <input className="sa-input" type="url" placeholder="Ex: https://dgi.gouv.ht" value={form.site_web} onChange={e => setF('site_web', e.target.value)} />
                                    </Field>
                                </div>
                            </FormSection>

                            {/* ── Section 4 : Adresse ── */}
                            <FormSection icon={MapPin} title="Adresse">
                                <div className="sa-form-row sa-3col">
                                    <Field label="Pays">
                                        <input className="sa-input" type="text" placeholder="Haïti" value={form.pays} onChange={e => setF('pays', e.target.value)} />
                                    </Field>
                                    <Field label="Département">
                                        <select className="sa-input sa-select" value={form.departement} onChange={e => setF('departement', e.target.value)}>
                                            <option value="">Sélectionner...</option>
                                            {HAITI_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Ville">
                                        <input className="sa-input" type="text" placeholder="Ex: Port-au-Prince" value={form.ville} onChange={e => setF('ville', e.target.value)} />
                                    </Field>
                                </div>
                                <div className="sa-form-row">
                                    <Field label="Adresse complète">
                                        <input className="sa-input" type="text" placeholder="Ex: Rue des Miracles, Delmas 33" value={form.adresse} onChange={e => setF('adresse', e.target.value)} />
                                    </Field>
                                    <Field label="Code postal">
                                        <input className="sa-input" type="text" placeholder="Ex: HT-6110" value={form.code_postal} onChange={e => setF('code_postal', e.target.value)} />
                                    </Field>
                                </div>
                            </FormSection>

                            {/* ── Section 5 : Modules / Services Gérés ── */}
                            <FormSection icon={Layers} title="Modules / Services gérés par l'entité">
                                <div className="sa-services-grid" style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px'
                                }}>
                                    {allServices.map(service => (
                                        <label key={service.id} className="sa-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                                            <input 
                                                type="checkbox" 
                                                style={{ cursor: 'pointer' }}
                                                checked={form.service_ids.includes(service.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setForm(prev => ({
                                                        ...prev,
                                                        service_ids: checked 
                                                            ? [...prev.service_ids, service.id]
                                                            : prev.service_ids.filter(id => id !== service.id)
                                                    }));
                                                }}
                                            />
                                            {service.name}
                                        </label>
                                    ))}
                                </div>
                            </FormSection>

                        </div>

                        {/* Modal Footer */}
                        <div className="sa-modal-footer">
                            <button className="sa-btn-cancel" onClick={closeModal}>Annuler</button>
                            <button className="sa-btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()}>
                                {saving ? 'Enregistrement...' : <><Check size={16} /> {editEntity ? 'Mettre à jour' : 'Créer l\'entité'}</>}
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
                            <p>Êtes-vous sûr de vouloir supprimer l'entité <strong>« {confirmDelete.name} »</strong> ? Cette action est irréversible et supprimera tous les bureaux associés.</p>
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

export default EntitesManager;
