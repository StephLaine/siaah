import { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    Layers, Plus, Search, Pencil, Trash2, X, Check, AlertCircle,
    Building2, ToggleLeft, ToggleRight, Tag, Info, ChevronDown, ChevronUp, FileText, ChevronRight
} from 'lucide-react';
import './SuperAdmin.css';

// Default operations for specific service categories
const DEFAULT_OPERATIONS = {
    'Permis de conduire': [
        { name: 'Nouveau permis', actif: true, required_documents: [], price: 0 },
        { name: 'Renouveler un permis de conduire', actif: true, required_documents: [], price: 0 },
        { name: 'Corriger un permis', actif: true, required_documents: [], price: 0 },
        { name: 'Remplacer un permis', actif: true, required_documents: [], price: 0 }
    ],
    'Immatriculation': [
        { name: 'Immatriculer un véhicule', actif: true, required_documents: [], price: 0 },
        { name: "Renouveler une plaque d'immatriculation", actif: true, required_documents: [], price: 0 },
        { name: 'Transférer un Véhicule', actif: true, required_documents: [], price: 0 },
        { name: 'Remplacer une Plaque', actif: true, required_documents: [], price: 0 }
    ],
    'Assurance': [
        { name: "Faire une Demande d'Assurance", actif: true, required_documents: [], price: 0 },
        { name: 'Renouveler une Assurance', actif: true, required_documents: [], price: 0 }
    ]
};

const CATEGORIES = [
    'Permis de conduire',
    'Immatriculation', 'Paiement', 'Impôts', 'Licences', 'Enregistrement',
    'Certificats', 'Déclarations', 'Timbres', 'Assurance', 'Sinistres',
    'Circulation', 'Accidents', 'Réglementation', 'Contrôle', 'Prévention', 
    'Gestion Véhicules', 'Autre'
];

const EMPTY_FORM = {
    name: '', description: '', categorie: '', actif: true, is_public: false, entity_ids: [], required_documents: [], operations: []
};

const FormSection = ({ icon: Icon, title, children }) => (
    <div className="sa-form-section">
        <div className="sa-form-section-header"><Icon size={16} /><span>{title}</span></div>
        <div className="sa-form-section-body">{children}</div>
    </div>
);

const Field = ({ label, required, children }) => (
    <div className="sa-form-group">
        <label>{label}{required && <span className="sa-required"> *</span>}</label>
        {children}
    </div>
);

const ServicesManager = () => {
    const [services, setServices] = useState([]);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editService, setEditService] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [expandedEntity, setExpandedEntity] = useState(null);
    const [expandedOp, setExpandedOp] = useState(null);
    const [newOpName, setNewOpName] = useState('');
    const [opDocInputs, setOpDocInputs] = useState({}); // { opIndex: { name: '', required: true } }

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
            const [svcRes, entRes] = await Promise.all([
                fetch('/api/admin/services', { headers: authHeader }),
                fetch('/api/admin/entities', { headers: authHeader }),
            ]);
            const [svcData, entData] = await Promise.all([svcRes.json(), entRes.json()]);
            if (svcData.status === 'success') setServices(svcData.data);
            if (entData.status === 'success') setEntities(entData.data);
        } catch { showToast('Erreur lors du chargement', 'error'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const activeServicesCount = services.filter(s => s.actif !== false).length;
    const categoriesCount = [...new Set(services.map(s => s.categorie).filter(Boolean))].length;

    // Map services to entities
    const entitiesWithServices = entities.map(ent => ({
        ...ent,
        assignedServices: services.filter(s => s.entities?.some(e => e.id === ent.id))
    }));

    // Find services not assigned to any entity
    const unassignedServices = services.filter(s => !s.entities || s.entities.length === 0);
    if (unassignedServices.length > 0) {
        entitiesWithServices.push({
            id: 'unassigned',
            name: 'Services non affectés',
            sigle: '',
            assignedServices: unassignedServices,
            isUnassigned: true
        });
    }

    // Filter by entity name
    const filteredEntities = entitiesWithServices.filter(ent =>
        ent.name.toLowerCase().includes(search.toLowerCase()) ||
        (ent.sigle || '').toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditService(null);
        // Initialize with empty form then set default category to trigger defaults
        setForm(EMPTY_FORM);
        // Pre-select first category (Permis de conduire) to auto‑populate operations
        setForm(p => ({ ...p, categorie: CATEGORIES[0] }));
        setShowModal(true);
    };

    const openEdit = (s) => {
    setEditService(s);
    setForm({
        id: s.id,
        name: s.name,
        description: s.description || '',
        categorie: s.categorie || '',
        actif: s.actif !== false,
        is_public: s.is_public !== undefined ? s.is_public : false,
        entity_ids: (s.entities || []).map(e => e.id),
        required_documents: s.required_documents || [],
        operations: s.operations || []
    });
    setShowModal(true);
};;

    const closeModal = () => { setShowModal(false); setEditService(null); };
    const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const toggleEntitySelection = (eid) => {
        const id = parseInt(eid);
        setForm(p => ({
            ...p,
            entity_ids: p.entity_ids.includes(id)
                ? p.entity_ids.filter(x => x !== id)
                : [...p.entity_ids, id]
        }));
    };

    const toggleAccordion = (id) => {
        setExpandedEntity(prev => prev === id ? null : id);
    };

    // Auto‑populate default operations and public flag for predefined service categories when creating a new service
    useEffect(() => {
        if (!editService && form.categorie && form.operations.length === 0) {
            const defaults = DEFAULT_OPERATIONS[form.categorie];
            const publicCategories = ['Immatriculation', 'Permis de conduire', 'Assurance', 'Contravention'];
            const isPublic = publicCategories.includes(form.categorie);
            setForm(p => ({
                ...p,
                ...(defaults ? { operations: defaults } : {}),
                is_public: isPublic
            }));
        }
    }, [form.categorie, editService]);

    const [newDocName, setNewDocName] = useState('');
    const [newDocRequired, setNewDocRequired] = useState(true);
    const addDocument = () => {
        if (!newDocName.trim()) return;
        const exists = form.required_documents.some(d => (typeof d === 'string' ? d : d.name) === newDocName.trim());
        if (exists) return;

        setForm(p => ({
            ...p,
            required_documents: [...p.required_documents, { name: newDocName.trim(), required: newDocRequired }]
        }));
        setNewDocName('');
        setNewDocRequired(true);
    };
    const removeDocument = (docName) => {
        setForm(p => ({
            ...p,
            required_documents: p.required_documents.filter(d => (typeof d === 'string' ? d : d.name) !== docName)
        }));
    };
    const toggleDocRequired = (docName) => {
        setForm(p => ({
            ...p,
            required_documents: p.required_documents.map(d => {
                const name = typeof d === 'string' ? d : d.name;
                if (name === docName) {
                    return { name, required: !(typeof d === 'string' ? true : d.required) };
                }
                return d;
            })
        }));
    };

    const addOperation = () => {
        if (!newOpName.trim()) return;
        setForm(p => ({
            ...p,
            operations: [...p.operations, { name: newOpName.trim(), actif: true, required_documents: [], price: 0 }]
        }));
        setNewOpName('');
    };

    const removeOperation = (idx) => {
        setForm(p => ({
            ...p,
            operations: p.operations.filter((_, i) => i !== idx)
        }));
        if (expandedOp === idx) setExpandedOp(null);
    };

    const toggleOpActif = (idx) => {
        setForm(p => ({
            ...p,
            operations: p.operations.map((op, i) => i === idx ? { ...op, actif: !op.actif } : op)
        }));
    };

    const addDocToOp = (opIdx) => {
        const input = opDocInputs[opIdx];
        if (!input || !input.name.trim()) return;

        setForm(p => ({
            ...p,
            operations: p.operations.map((op, i) => {
                if (i !== opIdx) return op;
                const docs = op.required_documents || [];
                if (docs.some(d => (typeof d === 'string' ? d : d.name) === input.name.trim())) return op;
                return {
                    ...op,
                    required_documents: [...docs, { name: input.name.trim(), required: input.required }]
                };
            })
        }));
        setOpDocInputs({ ...opDocInputs, [opIdx]: { name: '', required: true } });
    };

    const removeDocFromOp = (opIdx, docName) => {
        setForm(p => ({
            ...p,
            operations: p.operations.map((op, i) => {
                if (i !== opIdx) return op;
                return {
                    ...op,
                    required_documents: (op.required_documents || []).filter(d => (typeof d === 'string' ? d : d.name) !== docName)
                };
            })
        }));
    };

    const toggleOpDocRequired = (opIdx, docName) => {
        setForm(p => ({
            ...p,
            operations: p.operations.map((op, i) => {
                if (i !== opIdx) return op;
                return {
                    ...op,
                    required_documents: (op.required_documents || []).map(d => {
                        const name = typeof d === 'string' ? d : d.name;
                        if (name === docName) {
                            return { name, required: !(typeof d === 'string' ? true : d.required) };
                        }
                        return d;
                    })
                };
            })
        }));
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const url = editService ? `/api/admin/services/${editService.id}` : '/api/admin/services';
            const method = editService ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: authHeader, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.status === 'success') {
                showToast(editService ? 'Service mis à jour !' : 'Service créé avec succès !');
                closeModal();
                fetchData();
            } else {
                showToast(data.message || 'Erreur', 'error');
            }
        } catch { showToast('Erreur de connexion', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/admin/services/${id}`, { method: 'DELETE', headers: authHeader });
            showToast('Service supprimé !');
            setConfirmDelete(null);
            fetchData();
        } catch { showToast('Erreur lors de la suppression', 'error'); }
    };

    return (
        <div className="sa-page sa-page-full">
            {toast && <div className={`sa-toast sa-toast-${toast.type}`}>{toast.msg}</div>}

            {/* Header */}
            <div className="sa-page-header">
                <div>
                    <h2><Layers size={22} /> Gestion des Services</h2>
                    <p>Définissez les services offerts et associez-les aux entités. Les bureaux héritent automatiquement des services de leur entité.</p>
                </div>
                <button className="sa-btn-primary" onClick={openAdd}>
                    <Plus size={16} /> Nouveau Service
                </button>
            </div>

            {/* Info Banner */}
            <div className="sa-info-banner">
                <Info size={16} />
                <span>
                    Chaque service affecté à une entité est automatiquement disponible dans <strong>tous les bureaux</strong> de cette entité.
                </span>
            </div>

            {/* Stats Row requested by user */}
            <div className="sa-svc-stats-row">
                <div className="sa-svc-stat">
                    <span className="sa-svc-stat-num">{services.length}</span>
                    <span className="sa-svc-stat-label">Services total</span>
                </div>
                <div className="sa-svc-stat">
                    <span className="sa-svc-stat-num">{activeServicesCount}</span>
                    <span className="sa-svc-stat-label">Actifs</span>
                </div>
                <div className="sa-svc-stat">
                    <span className="sa-svc-stat-num">{categoriesCount}</span>
                    <span className="sa-svc-stat-label">Catégories</span>
                </div>
                <div className="sa-svc-stat">
                    <span className="sa-svc-stat-num">{entities.length}</span>
                    <span className="sa-svc-stat-label">Entités</span>
                </div>
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
            </div>

            {/* Accordions */}
            {loading ? (
                <div className="sa-loading-list">
                    {[...Array(4)].map((_, i) => <div key={i} className="sa-skeleton-row" style={{ height: 60, marginBottom: 10 }} />)}
                </div>
            ) : filteredEntities.length === 0 ? (
                <div className="sa-empty-state">
                    <Building2 size={48} opacity={0.3} />
                    <p>Aucune entité trouvée pour cette recherche</p>
                </div>
            ) : (
                <div className="sa-accordions-list">
                    {filteredEntities.map(ent => {
                        const isExpanded = expandedEntity === ent.id;
                        return (
                            <div key={ent.id} className={`sa-accordion ${isExpanded ? 'expanded' : ''} ${ent.isUnassigned ? 'sa-accordion-unassigned' : ''}`}>
                                <div className="sa-accordion-header" onClick={() => toggleAccordion(ent.id)}>
                                    <div className="sa-acc-title">
                                        {ent.isUnassigned ? <Layers size={20} /> : <Building2 size={20} />}
                                        <div className="sa-acc-name">
                                            <strong>{ent.name}</strong>
                                            {ent.sigle && <span>({ent.sigle})</span>}
                                        </div>
                                    </div>
                                    <div className="sa-acc-actions">
                                        <div className="sa-acc-badge">
                                            <span>{ent.assignedServices.length}</span> service{ent.assignedServices.length !== 1 ? 's' : ''}
                                        </div>
                                        <div className="sa-acc-icon">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="sa-accordion-body">
                                        {ent.assignedServices.length === 0 ? (
                                            <p className="sa-empty-text">Aucun service n'est associé à cette entité.</p>
                                        ) : (
                                            <div className="sa-svc-grid">
                                                {ent.assignedServices.map(svc => (
                                                    <div key={svc.id} className={`sa-svc-card ${!svc.actif ? 'inactive' : ''}`}>
                                                        <div className="sa-svc-card-top">
                                                            <div className="sa-svc-card-name">{svc.name}</div>
                                                            <div className="sa-svc-card-actions">
                                                                <button className="sa-svc-see-more" onClick={(e) => { e.stopPropagation(); openEdit(svc); }}>
                                                                    Voir plus <ChevronRight size={12} />
                                                                </button>
                                                                <button className="sa-action-btn sa-btn-edit" onClick={(e) => { e.stopPropagation(); openEdit(svc); }} title="Modifier">
                                                                    <Pencil size={13} />
                                                                </button>
                                                                <button className="sa-action-btn sa-btn-delete" onClick={(e) => { e.stopPropagation(); setConfirmDelete(svc); }} title="Supprimer">
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="sa-svc-card-footer">
                                                            <span className="sa-svc-category-chip">
                                                                <Tag size={12} /> {svc.categorie || 'Autre'}
                                                            </span>
                                                            <span className={`sa-badge ${svc.actif !== false ? 'sa-badge-green' : 'sa-badge-gray'}`}>
                                                                {svc.actif !== false ? 'Actif' : 'Inactif'}
                                                            </span>
                                                            <span className={`sa-badge ${svc.is_public ? 'sa-badge-blue' : 'sa-badge-gray'}`}>
                                                                {svc.is_public ? 'Public' : 'Privé'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ══════ MODAL ADD / EDIT ══════ */}
            {showModal && (
                <div className="sa-modal-overlay" onClick={closeModal}>
                    <div className="sa-modal sa-modal-xl" onClick={e => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h3><Layers size={18} /> {editService ? 'Modifier le service' : 'Nouveau Service'}</h3>
                            <button className="sa-modal-close" onClick={closeModal}><X size={18} /></button>
                        </div>

                        <div className="sa-modal-body sa-modal-body-scroll">
                            {/* ── Info du service ── */}
                            <FormSection icon={Info} title="Informations du service">
                                <Field label="Nom du service" required>
                                    <input className="sa-input" type="text" placeholder="Ex: Immatriculation fiscale (NIF)" value={form.name} onChange={e => setF('name', e.target.value)} autoFocus />
                                </Field>
                                <div className="sa-form-row">
                                    <Field label="Catégorie">
                                        <select className="sa-input sa-select" value={form.categorie} onChange={e => setF('categorie', e.target.value)}>
                                            <option value="">Sélectionner une catégorie...</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Statut">
                                        <button
                                            type="button"
                                            className={`sa-toggle-btn-field ${form.actif ? 'active' : ''}`}
                                            onClick={() => setF('actif', !form.actif)}
                                        >
                                            {form.actif ? <><ToggleRight size={20} /> Actif</> : <><ToggleLeft size={20} /> Inactif</>}
                                        </button>
                                    </Field>
                                    <Field label="Public">
                                        <button
                                            type="button"
                                            className={`sa-toggle-btn-field ${form.is_public ? 'active' : ''}`}
                                            onClick={() => setF('is_public', !form.is_public)}
                                        >
                                            {form.is_public ? <><ToggleRight size={20} /> Public</> : <><ToggleLeft size={20} /> Privé</>}
                                        </button>
                                    </Field>
                                </div>
                                <Field label="Description">
                                    <ReactQuill 
                                        theme="snow"
                                        value={form.description} 
                                        onChange={val => setF('description', val)}
                                        placeholder="Description du service et de son rôle..."
                                        className="sa-quill-editor"
                                    />
                                </Field>
                            </FormSection>

                            {/* ── Affecter aux entités ── */}
                            <FormSection icon={Building2} title="Affecter aux entités">
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem' }}>
                                    Sélectionnez les entités qui offrent ce service. Tous les bureaux de ces entités en hériteront automatiquement.
                                </p>
                                <div className="sa-entities-checklist">
                                    {entities.map(ent => {
                                        const selected = form.entity_ids.includes(ent.id);
                                        return (
                                            <label key={ent.id} className={`sa-entity-check-item ${selected ? 'selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => toggleEntitySelection(ent.id)}
                                                    style={{ display: 'none' }}
                                                />
                                                <div className="sa-entity-check-dot">{ent.name[0]}</div>
                                                <div className="sa-entity-check-info">
                                                    <strong>{ent.name}</strong>
                                                    {ent.sigle && <span>{ent.sigle}</span>}
                                                </div>
                                                {selected && <Check size={16} className="sa-entity-check-icon" />}
                                            </label>
                                        );
                                    })}
                                </div>
                            </FormSection>

                            {/* ── Documents requis ── */}
                            <FormSection icon={FileText} title="Documents légaux requis">
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem' }}>
                                    Ajoutez la liste des documents que l'usager devra fournir pour ce service.
                                </p>
                                <div className="sa-doc-input-group" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <input
                                        type="text"
                                        className="sa-input"
                                        placeholder="Nom du document (ex: Carte d'identité)"
                                        value={newDocName}
                                        onChange={e => setNewDocName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDocument())}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={newDocRequired} onChange={e => setNewDocRequired(e.target.checked)} />
                                        <span>Obligatoire</span>
                                    </label>
                                    <button type="button" className="sa-btn-primary" onClick={addDocument} style={{ padding: '8px 16px' }}>
                                        <Plus size={16} /> Ajouter
                                    </button>
                                </div>
                                <div className="sa-docs-list-manager">
                                    {form.required_documents.length === 0 ? (
                                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Aucun document ajouté.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            {form.required_documents.map((d, idx) => {
                                                const name = typeof d === 'string' ? d : d.name;
                                                const required = typeof d === 'string' ? true : d.required;
                                                return (
                                                    <div key={idx} className="sa-doc-tag" style={{
                                                        background: required ? '#eff6ff' : '#f8fafc',
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        fontSize: '0.8rem',
                                                        color: '#334155',
                                                        border: `1px solid ${required ? '#bfdbfe' : '#e2e8f0'}`,
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                    }}>
                                                        <span style={{ fontWeight: 600 }}>{name}</span>
                                                        <span
                                                            onClick={() => toggleDocRequired(name)}
                                                            style={{
                                                                fontSize: '0.7rem',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                background: required ? '#3b82f6' : '#94a3b8',
                                                                color: 'white',
                                                                cursor: 'pointer',
                                                                fontWeight: 700
                                                            }}
                                                        >
                                                            {required ? 'REQUIS' : 'OPTIONNEL'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDocument(name)}
                                                            style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', display: 'flex', padding: 0 }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </FormSection>

                            {/* ── Sous-modules / Opérations ── */}
                            <FormSection icon={Layers} title="Sous-modules / Opérations">
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem' }}>
                                    Définissez les différentes fonctionnalités ou démarches liées à ce service.
                                </p>
                                <div className="sa-op-input-group" style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                                    <input
                                        type="text"
                                        className="sa-input"
                                        placeholder="Nom de l'opération (ex: Renouveler plaque)"
                                        value={newOpName}
                                        onChange={e => setNewOpName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOperation())}
                                    />
                                    <button type="button" className="sa-btn-primary" onClick={addOperation} style={{ padding: '8px 16px' }}>
                                        <Plus size={16} /> Ajouter
                                    </button>
                                </div>

                                <div className="sa-ops-list">
                                    {form.operations.length === 0 ? (
                                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Aucun sous-module défini.</p>
                                    ) : (
                                        form.operations.map((op, opIdx) => (
                                            <div key={opIdx} className="sa-op-item-card" style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                marginBottom: '10px',
                                                overflow: 'hidden'
                                            }}>
                                                <div className="sa-op-header"
                                                    onClick={() => setExpandedOp(expandedOp === opIdx ? null : opIdx)}
                                                    style={{
                                                        padding: '12px 15px',
                                                        background: '#f8fafc',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                                        <Tag size={16} color="#64748b" />
                                                        {expandedOp === opIdx ? (
                                                            <input
                                                                type="text"
                                                                className="sa-input sa-input-sm"
                                                                style={{ padding: '2px 8px', fontSize: '0.9rem', width: '200px' }}
                                                                value={op.name}
                                                                onClick={e => e.stopPropagation()}
                                                                onChange={e => {
                                                                    setForm(p => ({
                                                                        ...p,
                                                                        operations: p.operations.map((o, i) => i === opIdx ? { ...o, name: e.target.value } : o)
                                                                    }));
                                                                }}
                                                            />
                                                        ) : (
                                                            <strong style={{ fontSize: '0.9rem' }}>{op.name}</strong>
                                                        )}
                                                        {!op.actif && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}>INACTIF</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); toggleOpActif(opIdx); }}
                                                            style={{ background: 'none', border: 'none', color: op.actif ? '#10b981' : '#94a3b8', cursor: 'pointer' }}
                                                        >
                                                            {op.actif ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); removeOperation(opIdx); }}
                                                            style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        {expandedOp === opIdx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </div>
                                                </div>

                                                {expandedOp === opIdx && (
                                                    <div className="sa-op-body" style={{ padding: '15px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                                                        
                                                        {/* Price Field */}
                                                        <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                            <div>
                                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '5px' }}>
                                                                    Prix du service (HTG)
                                                                </label>
                                                                <div style={{ position: 'relative' }}>
                                                                    <input 
                                                                        type="number"
                                                                        className="sa-input sa-input-sm"
                                                                        style={{ paddingLeft: '45px' }}
                                                                        value={op.price || 0}
                                                                        onChange={e => {
                                                                            const val = parseFloat(e.target.value) || 0;
                                                                            setForm(p => ({
                                                                                ...p,
                                                                                operations: p.operations.map((o, i) => i === opIdx ? { ...o, price: val } : o)
                                                                            }));
                                                                        }}
                                                                    />
                                                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>HTG</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Step-by-Step Rich Description (Full width) */}
                                                        <div style={{ marginBottom: '20px' }}>
                                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                                                                Description détaillée & procédure (Optionnel)
                                                            </label>
                                                            <div className="sa-quill-op-wrapper">
                                                                <ReactQuill 
                                                                    theme="snow"
                                                                    value={op.description || ''} 
                                                                    onChange={val => {
                                                                        setForm(p => ({
                                                                            ...p,
                                                                            operations: p.operations.map((o, i) => i === opIdx ? { ...o, description: val } : o)
                                                                        }));
                                                                    }}
                                                                    placeholder="Précisez ici les étapes, soulignez les documents importants..."
                                                                    className="sa-quill-editor sa-quill-op"
                                                                    modules={{
                                                                        toolbar: [
                                                                            [{ 'font': [] }],
                                                                            ['bold', 'italic', 'underline'],
                                                                            [{ 'color': [] }, { 'background': [] }],
                                                                            [{ 'list': 'bullet' }, { 'list': 'ordered' }],
                                                                            [{ 'align': [] }],
                                                                            ['clean']
                                                                        ]
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div style={{ marginBottom: '15px' }}>
                                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                                                                Documents requis pour cette opération
                                                            </label>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <input
                                                                    type="text"
                                                                    className="sa-input sa-input-sm"
                                                                    placeholder="Nom du document..."
                                                                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem' }}
                                                                    value={opDocInputs[opIdx]?.name || ''}
                                                                    onChange={e => setOpDocInputs({ ...opDocInputs, [opIdx]: { ...opDocInputs[opIdx], name: e.target.value, required: opDocInputs[opIdx]?.required ?? true } })}
                                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDocToOp(opIdx))}
                                                                />
                                                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={opDocInputs[opIdx]?.required ?? true}
                                                                        onChange={e => setOpDocInputs({ ...opDocInputs, [opIdx]: { ...opDocInputs[opIdx], required: e.target.checked } })}
                                                                    />
                                                                    Req.
                                                                </label>
                                                                <button type="button" className="sa-btn-primary" style={{ padding: '0 12px' }} onClick={() => addDocToOp(opIdx)}>
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                            {(op.required_documents || []).map((d, dIdx) => {
                                                                const dName = typeof d === 'string' ? d : d.name;
                                                                const dReq = typeof d === 'string' ? true : d.required;
                                                                return (
                                                                    <div key={dIdx} className="sa-doc-tag" style={{
                                                                        background: dReq ? '#eff6ff' : '#f8fafc',
                                                                        padding: '4px 10px',
                                                                        borderRadius: '15px',
                                                                        fontSize: '0.75rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        border: `1px solid ${dReq ? '#bfdbfe' : '#e2e8f0'}`,
                                                                        color: '#334155'
                                                                    }}>
                                                                        <span style={{ fontWeight: 600 }}>{dName}</span>
                                                                        <span
                                                                            onClick={() => toggleOpDocRequired(opIdx, dName)}
                                                                            style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', background: dReq ? '#3b82f6' : '#94a3b8', color: 'white', cursor: 'pointer' }}
                                                                        >
                                                                            {dReq ? 'REQUIS' : 'OPT.'}
                                                                        </span>
                                                                        <X size={12} style={{ cursor: 'pointer', color: '#fca5a5' }} onClick={() => removeDocFromOp(opIdx, dName)} />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </FormSection>
                        </div>

                        <div className="sa-modal-footer">
                            <button className="sa-btn-cancel" onClick={closeModal}>Annuler</button>
                            <button className="sa-btn-primary" onClick={handleSave} disabled={saving || !form.name.trim()}>
                                {saving ? 'Enregistrement...' : <><Check size={16} /> {editService ? 'Mettre à jour' : 'Créer le service'}</>}
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
                            <p>Supprimer le service <strong>« {confirmDelete.name} »</strong> ? Il sera retiré de toutes les entités qui l'utilisent.</p>
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

export default ServicesManager;
