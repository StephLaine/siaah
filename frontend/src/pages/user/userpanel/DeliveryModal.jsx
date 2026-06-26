import React, { useState } from 'react';
import { X, Truck, Calendar, User, CheckCircle } from 'lucide-react';
import axios from 'axios';

/**
 * DeliveryModal
 * -------------
 * Opens when an employee clicks "Livrer" on a request in status `to_deliver`.
 * Collects delivery tracking info and updates request to `completed`.
 */
const DeliveryModal = ({ request, user, token, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    delivered_by: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    delivery_date: new Date().toISOString().split('T')[0],
    received_by: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);
  const [result, setResult]   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.delivered_by.trim()) return setError('Le nom du livreur est requis.');
    if (!form.received_by.trim()) return setError('Le nom du récipiendaire est requis.');
    if (!form.delivery_date) return setError('La date de livraison est requise.');

    try {
      setLoading(true);
      const res = await axios.patch(
        `/api/requests/${request.id}/status`,
        {
          status: 'completed',
          delivered_by:  form.delivered_by.trim(),
          delivery_date: form.delivery_date,
          received_by:   form.received_by.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.data);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la livraison.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 4000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        style={{
          background: 'white', borderRadius: 14, width: '100%', maxWidth: 520,
          boxShadow: '0 30px 80px rgba(0,0,0,0.35)', overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Truck size={22} color="white" />
            </div>
            <div>
              <h2 style={{ color: 'white', margin: 0, fontSize: 17, fontWeight: 800 }}>
                Enregistrer la Livraison
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: 12, marginTop: 2 }}>
                Dossier REQ-{String(request?.id || '').padStart(3, '0')} · {request?.first_name} {request?.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
              padding: 8, cursor: 'pointer', display: 'flex', color: 'white' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 24px 20px' }}>
          {done ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
              <CheckCircle size={56} color="#22c55e" style={{ marginBottom: 12 }} />
              <h3 style={{ color: '#15803d', fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>
                Livraison enregistrée !
              </h3>
              <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px' }}>
                Le permis de conduire a été marqué comme livré et le dossier est maintenant traité.
              </p>
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '16px 20px',
                textAlign: 'left', marginBottom: 20,
              }}>
                {[
                  ['Livreur', result?.delivered_by || form.delivered_by],
                  ['Récipiendaire', result?.received_by || form.received_by],
                  ['Date de livraison', result?.delivery_date ? new Date(result.delivery_date).toLocaleDateString('fr-FR') : new Date(form.delivery_date).toLocaleDateString('fr-FR')],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
                    <span style={{ color: '#0f172a', fontWeight: 700, fontSize: 13 }}>{val}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { onSuccess && onSuccess(); onClose(); }}
                style={{
                  background: '#2563eb', color: 'white', border: 'none', borderRadius: 8,
                  padding: '11px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  width: '100%',
                }}
              >
                Fermer
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
                  padding: '10px 14px', marginBottom: 16, color: '#b91c1c', fontSize: 13, fontWeight: 600,
                }}>
                  {error}
                </div>
              )}

              {/* Delivered By */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <User size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Livreur (Effectué par) *
                </label>
                <input
                  type="text"
                  value={form.delivered_by}
                  onChange={e => setForm(f => ({ ...f, delivered_by: e.target.value }))}
                  placeholder="Nom de l'agent"
                  required
                  style={{
                    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Received By */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <User size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Récipiendaire (Reçu par) *
                </label>
                <input
                  type="text"
                  value={form.received_by}
                  onChange={e => setForm(f => ({ ...f, received_by: e.target.value }))}
                  placeholder="Nom de la personne qui reçoit le permis"
                  required
                  style={{
                    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Delivery Date */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Date de Livraison *
                </label>
                <input
                  type="date"
                  value={form.delivery_date}
                  onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))}
                  required
                  style={{
                    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8,
                    fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1, padding: '12px 0', border: '1.5px solid #e2e8f0', borderRadius: 8,
                    background: 'white', color: '#475569', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2, padding: '12px 0', border: 'none', borderRadius: 8,
                    background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                    color: 'white', fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <Truck size={16} />
                  {loading ? 'Livraison...' : 'Confirmer la Livraison'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryModal;
