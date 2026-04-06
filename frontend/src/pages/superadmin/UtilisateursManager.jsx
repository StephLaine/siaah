import { useState, useEffect, useCallback } from 'react';
import {
    Users, Search, Pencil, X, Check, Shield, MapPin, Building2,
    Trash2, Eye, Plus, Mail, Phone, User as UserIcon, Lock, Fingerprint, Info, Briefcase
} from 'lucide-react';
import './SuperAdmin.css';

const ROLE_LABELS = {
    1: { label: 'Super Admin', color: 'red' },
    2: { label: 'Administrateur', color: 'purple' },
    3: { label: 'Employé', color: 'blue' },
    4: { label: 'Usager', color: 'gray' },
};

const EMPTY_FORM = {
    first_name: '', last_name: '', email: '', password: '',
    nif: '', phone: '', role_id: '4', office_id: ''
};

const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="sa-detail-item">
        <div className="sa-detail-label">
            {Icon && <Icon size={14} />}
            <span>{label}</span>
        </div>
        <div className="sa-detail-value">{value || '—'}</div>
    </div>
);

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

const UtilisateursManager = () => {
    const [users, setUsers] = useState([]);
    const [offices, setOffices] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [viewUser, setViewUser] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
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
            const [usrRes, offRes, rolRes] = await Promise.all([
                fetch('/api/admin/users', { headers: authHeader }),
                fetch('/api/admin/offices', { headers: authHeader }),
                fetch('/api/admin/roles', { headers: authHeader })
            ]);
            const [usrData, offData, rolData] = await Promise.all([usrRes.json(), offRes.json(), rolRes.json()]);
            if (usrData.status === 'success') setUsers(usrData.data);
            if (offData.status === 'success') setOffices(offData.data);
            if (rolData.status === 'success') setRoles(rolData.data);
        } catch { showToast('Erreur lors du chargement', 'error'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getRoleConfig = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        const colors = {
            1: 'red', 2: 'purple', 3: 'blue', 4: 'blue',
            5: 'blue', 6: 'blue', 7: 'blue', 8: 'gray'
        };
        return {
            label: role ? role.name : 'Inconnu',
            color: colors[roleId] || 'gray'
        };
    };

    const filtered = users.filter(u => {
        const name = `${u.first_name} ${u.last_name} ${u.email} ${u.nif} ${u.role_name}`.toLowerCase();
        const matchSearch = name.includes(search.toLowerCase());
        const matchRole = filterRole === 'all' || String(u.role_id) === filterRole;
        return matchSearch && matchRole;
    });

    const openAdd = () => {
        setEditUser(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (u) => {
        setEditUser(u);
        setForm({
            first_name: u.first_name || '',
            last_name: u.last_name || '',
            email: u.email || '',
            password: '', // Hidden by default
            nif: u.nif || '',
            phone: u.phone || '',
            role_id: String(u.role_id),
            office_id: String(u.office_id || '')
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.first_name || !form.last_name || !form.email || (!editUser && !form.password)) {
            showToast('Veuillez remplir les champs obligatoires', 'error');
            return;
        }
        setSaving(true);
        try {
            const url = editUser ? `/api/admin/users/${editUser.id}` : '/api/admin/users';
            const method = editUser ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: authHeader,
                body: JSON.stringify({
                    ...form,
                    role_id: parseInt(form.role_id),
                    office_id: form.office_id ? parseInt(form.office_id) : null
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showToast(editUser ? 'Utilisateur mis à jour !' : 'Utilisateur créé !');
                setShowModal(false);
                fetchData();
            } else {
                showToast(data.message || 'Erreur lors de la sauvegarde', 'error');
            }
        } catch { showToast('Erreur de connexion', 'error'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: authHeader });
            const data = await res.json();
            if (data.status === 'success') {
                showToast('Utilisateur supprimé');
                setConfirmDelete(null);
                fetchData();
            }
        } catch { showToast('Erreur lors de la suppression', 'error'); }
    };

    const getRoleBadge = (roleId) => {
        const rc = getRoleConfig(roleId);
        return <span className={`sa-badge sa-badge-${rc.color}`}>{rc.label}</span>;
    };

    const getInitials = (u) => `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() || 'U';

    return (
        <div className="sa-page sa-page-full">
            {toast && <div className={`sa-toast sa-toast-${toast.type}`}>{toast.msg}</div>}

            <div className="sa-page-header">
                <div>
                    <h2><Users size={22} /> Gestion des Utilisateurs</h2>
                    <p>Gérez les comptes, les rôles et les accès de tous les utilisateurs du système</p>
                </div>
                <button className="sa-btn-primary" onClick={openAdd}>
                    <Plus size={16} /> Nouvel Utilisateur
                </button>
            </div>

            {/* Filters */}
            <div className="sa-filters-bar">
                <div className="sa-search-box">
                    <Search size={16} className="sa-search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, NIF..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && <button className="sa-search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
                </div>
                <div className="sa-filter-select-wrapper">
                    <Shield size={14} />
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                        <option value="all">Tous les rôles</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="sa-table-card">
                <div className="sa-table-stats"><span>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span></div>
                <div className="sa-table-wrapper">
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th>Utilisateur</th>
                                <th>Email / NIF</th>
                                <th>Rôle</th>
                                <th>Entité / Bureau</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => <tr key={i}><td colSpan="5"><div className="sa-skeleton-row" /></td></tr>)
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="sa-table-empty">Aucun utilisateur trouvé</td></tr>
                            ) : filtered.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="sa-user-cell">
                                            <div className={`sa-user-avatar-sm sa-role-color-${u.role_id}`}>{getInitials(u)}</div>
                                            <div>
                                                <div className="sa-cell-name">{u.first_name} {u.last_name}</div>
                                                <div className="sa-cell-sub">Inscrit le {new Date(u.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="sa-cell-name">{u.email}</div>
                                        <div className="sa-cell-sub">NIF: {u.nif || '—'}</div>
                                    </td>
                                    <td>{getRoleBadge(u.role_id)}</td>
                                    <td>
                                        {u.entity_name ? (
                                            <>
                                                <div className="sa-cell-name">{u.entity_name}</div>
                                                <div className="sa-cell-sub">{u.office_name || 'Siège central'}</div>
                                            </>
                                        ) : <span className="sa-cell-na">—</span>}
                                    </td>
                                    <td>
                                        <div className="sa-action-btns">
                                            <button className="sa-action-btn sa-btn-view" onClick={() => setViewUser(u)} title="Voir profil"><Eye size={15} /></button>
                                            <button className="sa-action-btn sa-btn-edit" onClick={() => openEdit(u)} title="Modifier"><Pencil size={15} /></button>
                                            {u.role_id !== 1 && (
                                                <button className="sa-action-btn sa-btn-delete" onClick={() => setConfirmDelete(u)} title="Supprimer"><Trash2 size={15} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ══════════════ MODAL : VIEW USER PROFILE ══════════════ */}
            {viewUser && (
                <div className="sa-modal-overlay" onClick={() => setViewUser(null)}>
                    <div className="sa-modal sa-modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="sa-modal-header sa-profile-header">
                            <div className="sa-profile-title-group">
                                <div className={`sa-profile-avatar sa-role-color-${viewUser.role_id}`}>{getInitials(viewUser)}</div>
                                <div>
                                    <h3>{viewUser.first_name} {viewUser.last_name}</h3>
                                    <div className="sa-profile-badges">
                                        {getRoleBadge(viewUser.role_id)}
                                        {viewUser.entity_name && <span className="sa-badge sa-badge-blue">{viewUser.entity_name}</span>}
                                    </div>
                                </div>
                            </div>
                            <button className="sa-modal-close" onClick={() => setViewUser(null)}><X size={18} /></button>
                        </div>
                        <div className="sa-modal-body sa-modal-body-scroll">
                            <div className="sa-profile-grid">
                                <FormSection icon={Info} title="Informations Personnelles">
                                    <div className="sa-details-grid">
                                        <DetailRow label="Prénom" value={viewUser.first_name} icon={UserIcon} />
                                        <DetailRow label="Nom" value={viewUser.last_name} icon={UserIcon} />
                                        <DetailRow label="Email" value={viewUser.email} icon={Mail} />
                                        <DetailRow label="Téléphone" value={viewUser.phone} icon={Phone} />
                                        <DetailRow label="NIF" value={viewUser.nif} icon={Fingerprint} />
                                        <DetailRow label="ID Système" value={`#${viewUser.id}`} icon={Shield} />
                                    </div>
                                </FormSection>

                                <FormSection icon={Briefcase} title="Affectation Professionnelle">
                                    <div className="sa-details-grid">
                                        <DetailRow label="Rôle" value={getRoleConfig(viewUser.role_id).label} icon={Shield} />
                                        <DetailRow label="Entité" value={viewUser.entity_name} icon={Building2} />
                                        <DetailRow label="Bureau" value={viewUser.office_name} icon={MapPin} />
                                        <DetailRow label="Date d'inscription" value={new Date(viewUser.created_at).toLocaleString()} icon={Users} />
                                    </div>
                                </FormSection>
                            </div>
                        </div>
                        <div className="sa-modal-footer">
                            <button className="sa-btn-primary" onClick={() => { setViewUser(null); openEdit(viewUser); }}>
                                <Pencil size={15} /> Modifier l'utilisateur
                            </button>
                            <button className="sa-btn-cancel" onClick={() => setViewUser(null)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ MODAL : ADD / EDIT USER ══════════════ */}
            {showModal && (
                <div className="sa-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="sa-modal sa-modal-xl" onClick={e => e.stopPropagation()}>
                        <div className="sa-modal-header">
                            <h3><Users size={18} /> {editUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}</h3>
                            <button className="sa-modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div className="sa-modal-body sa-modal-body-scroll">
                            <FormSection icon={UserIcon} title="Informations de Base">
                                <div className="sa-form-row">
                                    <Field label="Prénom" required>
                                        <input className="sa-input" type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                                    </Field>
                                    <Field label="Nom" required>
                                        <input className="sa-input" type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                                    </Field>
                                </div>
                                <div className="sa-form-row">
                                    <Field label="Email" required>
                                        <input className="sa-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    </Field>
                                    <Field label="Mot de passe" required={!editUser}>
                                        <div style={{ position: 'relative' }}>
                                            <input className="sa-input" type="password" placeholder={editUser ? '•••••••• (Laisser vide pour ne pas changer)' : ''} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                            <Lock size={14} style={{ position: 'absolute', right: 12, top: 13, color: '#94a3b8' }} />
                                        </div>
                                    </Field>
                                </div>
                                <div className="sa-form-row">
                                    <Field label="NIF">
                                        <input className="sa-input" type="text" placeholder="000-000-000-0" value={form.nif} onChange={e => setForm({ ...form, nif: e.target.value })} />
                                    </Field>
                                    <Field label="Téléphone">
                                        <input className="sa-input" type="tel" placeholder="+509" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                    </Field>
                                </div>
                            </FormSection>

                            <FormSection icon={Shield} title="Accès & Affectation">
                                <div className="sa-form-row">
                                    <Field label="Rôle" required>
                                        <select className="sa-input sa-select" value={form.role_id} onChange={e => setForm({ ...form, role_id: e.target.value })}>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Bureau d'affectation">
                                        <select className="sa-input sa-select" value={form.office_id} onChange={e => setForm({ ...form, office_id: e.target.value })}>
                                            <option value="">Aucun bureau (Siège central ou Hors entité)</option>
                                            {offices.map(o => <option key={o.id} value={o.id}>{o.name} — {o.entity_name}</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </FormSection>
                        </div>
                        <div className="sa-modal-footer">
                            <button className="sa-btn-cancel" onClick={() => setShowModal(false)}>Annuler</button>
                            <button className="sa-btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Enregistrement...' : <><Check size={16} /> {editUser ? 'Mettre à jour' : 'Créer l\'utilisateur'}</>}
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
                            <h3><Trash2 size={18} /> Confirmer la suppression</h3>
                            <button className="sa-modal-close" onClick={() => setConfirmDelete(null)}><X size={18} /></button>
                        </div>
                        <div className="sa-modal-body">
                            <p>Voulez-vous vraiment supprimer l'utilisateur <strong>{confirmDelete.first_name} {confirmDelete.last_name}</strong> ?</p>
                            <p style={{ marginTop: 8, fontSize: '0.8rem', color: '#dc2626' }}>Toutes les données associées seront conservées mais l'accès sera révoqué.</p>
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

export default UtilisateursManager;
