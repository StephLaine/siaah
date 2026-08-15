import { useState, useEffect, useCallback } from 'react';
import { Trash2, Search, RefreshCw, AlertTriangle, FileText, User, ChevronDown, X, CheckSquare, Square, PauseCircle, PlayCircle, ShieldAlert } from 'lucide-react';
import './SuperAdmin.css';

const TOKEN = () => localStorage.getItem('token');
const H = () => ({ Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' });

const STATUS_LABELS = {
  pending:     { label: 'En Attente',   color: '#f59e0b', bg: '#fef3c7' },
  under_review:{ label: 'En Analyse', color: '#3b82f6', bg: '#eff6ff' },
  validated:   { label: 'Validé',       color: '#10b981', bg: '#d1fae5' },
  to_assign:   { label: 'À Assigner',   color: '#7c3aed', bg: '#f5f3ff' },
  to_deliver:  { label: 'À Livrer',     color: '#0891b2', bg: '#e0f2fe' },
  completed:   { label: 'Complété',     color: '#16a34a', bg: '#dcfce7' },
  rejected:    { label: 'Rejeté',       color: '#dc2626', bg: '#fee2e2' },
  paused:      { label: 'Bloqué / En Pause', color: '#64748b', bg: '#f1f5f9' },
};

const Badge = ({ status }) => {
  const s = STATUS_LABELS[status] || { label: status, color: '#64748b', bg: '#f1f5f9' };
  return (
    <span style={{
      background: s.bg, color: s.color, borderRadius: 6,
      padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.4
    }}>{s.label}</span>
  );
};

const ConfirmModal = ({ title, message, onConfirm, onCancel, danger = true }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9000,
    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
  }}>
    <div style={{
      background: 'white', borderRadius: 16, maxWidth: 440, width: '100%',
      padding: 28, boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: danger ? '#fee2e2' : '#e0f2fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <AlertTriangle size={22} color={danger ? '#dc2626' : '#0284c7'} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{message}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '10px 0', border: '1.5px solid #e2e8f0', borderRadius: 8,
          background: 'white', color: '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer'
        }}>Annuler</button>
        <button onClick={onConfirm} style={{
          flex: 2, padding: '10px 0', border: 'none', borderRadius: 8,
          background: danger ? '#dc2626' : '#0284c7', color: 'white',
          fontWeight: 800, fontSize: 13, cursor: 'pointer'
        }}>
          {danger ? 'Supprimer définitivement' : 'Confirmer'}
        </button>
      </div>
    </div>
  </div>
);

const DemandesManager = () => {
  const [requests, setRequests]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [selected, setSelected]     = useState(new Set());
  const [confirm, setConfirm]       = useState(null); // { type, id?, userId?, userName?, count? }
  const [toast, setToast]           = useState(null);
  const [page, setPage]             = useState(0);
  const PAGE_SIZE = 50;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: PAGE_SIZE, offset: page * PAGE_SIZE });
      if (search)       params.set('search', search);
      if (statusFilter)  params.set('status', statusFilter);
      const res  = await fetch(`/api/superadmin/requests?${params}`, { headers: H() });
      const data = await res.json();
      if (data.status === 'success') { setRequests(data.data); setTotal(data.total); }
    } catch {
      showToast('Erreur lors du chargement des demandes.', 'error');
    } finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleSelect = (id) => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const allSelected = requests.length > 0 && requests.every(r => selected.has(r.id));
  const toggleAll  = () => setSelected(allSelected ? new Set() : new Set(requests.map(r => r.id)));

  // ── Delete actions ─────────────────────────────────────────────────────────
  const doDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id =>
        fetch(`/api/superadmin/requests/${id}`, { method: 'DELETE', headers: H() })
      ));
      showToast(`${ids.length} demande(s) supprimée(s) avec succès.`);
      setSelected(new Set());
      fetchRequests();
    } catch { showToast('Erreur lors de la suppression.', 'error'); }
  };

  const doDeleteUser = async (uid) => {
    try {
      const res  = await fetch(`/api/superadmin/requests/user/${uid}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      showToast(data.message || 'Demandes supprimées.');
      setSelected(new Set());
      fetchRequests();
    } catch { showToast('Erreur lors de la suppression.', 'error'); }
  };

  const doDeleteAll = async () => {
    try {
      const res  = await fetch('/api/superadmin/requests/all', { method: 'DELETE', headers: H() });
      const data = await res.json();
      showToast(data.message || 'Toutes les démarches ont été supprimées.');
      setSelected(new Set());
      fetchRequests();
    } catch { showToast('Erreur lors de la suppression globale.', 'error'); }
  };

  // ── Toggle Block / Pause action ───────────────────────────────────────────
  const doToggleBlock = async (id) => {
    try {
      const res  = await fetch(`/api/superadmin/requests/${id}/block`, { method: 'PATCH', headers: H() });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(data.message || 'Statut mis à jour.');
        fetchRequests();
      } else {
        showToast(data.message || 'Erreur lors du blocage.', 'error');
      }
    } catch { showToast('Erreur lors du blocage.', 'error'); }
  };

  // ── Confirm handler ────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.type === 'single') doDelete([confirm.id]);
    if (confirm.type === 'bulk')   doDelete([...selected]);
    if (confirm.type === 'user')   doDeleteUser(confirm.userId);
    if (confirm.type === 'all')    doDeleteAll();
    setConfirm(null);
  };

  // Group requests by user for summary button
  const userGroups = requests.reduce((acc, r) => {
    const key = r.user_id;
    if (!acc[key]) acc[key] = { userId: key, name: `${r.first_name || ''} ${r.last_name || ''}`.trim(), nif: r.nif, email: r.email, count: 0, ids: [] };
    acc[key].count++;
    acc[key].ids.push(r.id);
    return acc;
  }, {});

  return (
    <div className="sa-page sa-page-full">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#dc2626' : '#16a34a',
          color: 'white', borderRadius: 12, padding: '14px 22px',
          fontWeight: 700, fontSize: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          {toast.type === 'error' ? <X size={16} /> : '✓'} {toast.msg}
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <ConfirmModal
          title={
            confirm.type === 'all'
              ? '🚨 SUPPRIMER TOUTES LES DÉMARCHES DUL SYSTEME 🚨'
              : confirm.type === 'user'
              ? `Supprimer toutes les démarches de ${confirm.userName}`
              : `Supprimer ${confirm.type === 'bulk' ? selected.size : 1} démarche(s)`
          }
          message={
            confirm.type === 'all'
              ? `ATTENTION ! Vous allez supprimer l'intégralité des démarches enregistrées dans tout le système (${total} dossier(s)). Cette action est définitive et irréversible.`
              : confirm.type === 'user'
              ? `Toutes les démarches de cet utilisateur (${confirm.count}) seront supprimées de façon irréversible.`
              : `Cette action est irréversible. Les données seront définitivement effacées de la base.`
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
          danger={true}
        />
      )}

      {/* Header */}
      <div className="sa-page-header">
        <div>
          <h2>Gestion des Démarches</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: 13 }}>
            <strong style={{ color: '#dc2626' }}>Espace réservé au Super Admin</strong> — Recherche, suppression et blocage des démarches
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {selected.size > 0 && (
            <button
              onClick={() => setConfirm({ type: 'bulk' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#dc2626', color: 'white', border: 'none',
                borderRadius: 10, padding: '10px 18px', fontWeight: 700,
                fontSize: 13, cursor: 'pointer'
              }}
            >
              <Trash2 size={16} /> Supprimer la sélection ({selected.size})
            </button>
          )}

          {total > 0 && (
            <button
              onClick={() => setConfirm({ type: 'all' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#7f1d1d', color: 'white', border: 'none',
                borderRadius: 10, padding: '10px 18px', fontWeight: 800,
                fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(127,29,29,0.3)'
              }}
              title="Supprimer TOUTES les démarches de la base de données"
            >
              <ShieldAlert size={16} /> Tout Supprimer ({total})
            </button>
          )}

          <button onClick={fetchRequests} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f1f5f9', color: '#475569', border: 'none',
            borderRadius: 10, padding: '10px 14px', fontWeight: 700,
            fontSize: 13, cursor: 'pointer'
          }}>
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Rechercher par dossier #, nom, email, NIF..."
            style={{
              width: '100%', padding: '11px 14px 11px 38px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(0); }}
            style={{
              padding: '11px 36px 11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              fontSize: 13, fontWeight: 600, outline: 'none', appearance: 'none', cursor: 'pointer',
              background: 'white', color: statusFilter ? '#0f172a' : '#94a3b8'
            }}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
        </div>
        <div style={{ background: '#f1f5f9', padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#475569' }}>
          {total} démarche(s) au total
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '14px 18px', textAlign: 'left' }}>
                  <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}>
                    {allSelected ? <CheckSquare size={18} color="#dc2626" /> : <Square size={18} />}
                  </button>
                </th>
                {['Dossier', 'Usager / Demandeur', 'Service', 'Opération / Type', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 18px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: 48, textAlign: 'center' }}>
                  <FileText size={40} style={{ color: '#cbd5e1', marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
                  <p style={{ color: '#94a3b8', fontWeight: 600, margin: 0 }}>Aucune démarche enregistrée</p>
                </td></tr>
              ) : requests.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '12px 18px' }}>
                    <button onClick={() => toggleSelect(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {selected.has(r.id) ? <CheckSquare size={18} color="#dc2626" /> : <Square size={18} color="#cbd5e1" />}
                    </button>
                  </td>
                  <td style={{ padding: '12px 18px', fontSize: 12, fontWeight: 800, color: '#2563eb' }}>
                    {r.dossier_id || `REQ-${String(r.id).padStart(3,'0')}`}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{r.first_name} {r.last_name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{r.email}</p>
                    {r.nif && <p style={{ margin: 0, fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>NIF: {r.nif}</p>}
                  </td>
                  <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 600, color: '#475569' }}>{r.service_name || '—'}</td>
                  <td style={{ padding: '12px 18px', fontSize: 13, color: '#475569' }}>{r.operation || r.service_type || r.type || '—'}</td>
                  <td style={{ padding: '12px 18px' }}><Badge status={r.status} /></td>
                  <td style={{ padding: '12px 18px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {/* Bloquer / Débloquer */}
                      <button
                        onClick={() => doToggleBlock(r.id)}
                        title={r.status === 'paused' ? 'Débloquer / Reprendre la démarche' : 'Bloquer / Mettre en pause la démarche'}
                        style={{
                          background: r.status === 'paused' ? '#dcfce7' : '#f1f5f9',
                          color: r.status === 'paused' ? '#15803d' : '#475569',
                          border: 'none', borderRadius: 7, padding: '7px 10px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                          fontWeight: 700, fontSize: 12
                        }}
                      >
                        {r.status === 'paused' ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                        {r.status === 'paused' ? 'Débloquer' : 'Bloquer'}
                      </button>

                      {/* Supprimer une démarche */}
                      <button
                        onClick={() => setConfirm({ type: 'single', id: r.id })}
                        title="Supprimer cette démarche"
                        style={{
                          background: '#fee2e2', color: '#dc2626', border: 'none',
                          borderRadius: 7, padding: '7px 10px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 12
                        }}
                      >
                        <Trash2 size={13} /> Supprimer
                      </button>

                      {/* Supprimer toutes les démarches d'un usager s'il en a plusieurs */}
                      {userGroups[r.user_id]?.count > 1 && (
                        <button
                          onClick={() => setConfirm({ type: 'user', userId: r.user_id, userName: `${r.first_name} ${r.last_name}`, count: userGroups[r.user_id].count })}
                          title="Supprimer toutes les démarches de cet usager"
                          style={{
                            background: '#fef3c7', color: '#b45309', border: 'none',
                            borderRadius: 7, padding: '7px 10px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 12
                          }}
                        >
                          <User size={13} /> Usager ({userGroups[r.user_id].count})
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: page === 0 ? '#f8fafc' : 'white', cursor: page === 0 ? 'default' : 'pointer', fontWeight: 700, fontSize: 13, color: '#475569' }}>
            ← Préc.
          </button>
          <span style={{ padding: '8px 18px', fontSize: 13, fontWeight: 700, color: '#64748b' }}>
            Page {page + 1} / {Math.ceil(total / PAGE_SIZE)}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total}
            style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: (page + 1) * PAGE_SIZE >= total ? '#f8fafc' : 'white', cursor: (page + 1) * PAGE_SIZE >= total ? 'default' : 'pointer', fontWeight: 700, fontSize: 13, color: '#475569' }}>
            Suiv. →
          </button>
        </div>
      )}

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DemandesManager;
