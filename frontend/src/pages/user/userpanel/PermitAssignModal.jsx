import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';

/**
 * PermitAssignModal
 * -----------------
 * Opens when an employee clicks "Assigner Permis" on a request in status `to_deliver`.
 * Lets the employee enter:
 *   - Permit number (unique)
 *   - Issuance date
 *   - Validity duration (1, 5, 10 years or custom)
 * Automatically computes the expiry date.
 */
const PermitAssignModal = ({ request, token, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    permit_number: '',
    issuance_date: new Date().toISOString().split('T')[0],
    duration_years: '5',
    custom_years: '',
    permit_type: '',
    license_category: '',
  });

  // Initialize from request if available
  useEffect(() => {
    if (request?.permit_type) setForm(f => ({ ...f, permit_type: request.permit_type }));
    if (request?.license_category) setForm(f => ({ ...f, license_category: request.license_category }));
  }, [request]);

  // Fetch permit details based on number
  const fetchPermit = async () => {
    if (!form.permit_number.trim()) return setError('Entrez un numéro de permis à rechercher.');
    const pattern = /^HT-\d{2}-\d{2}-\d{7}$/;
    if (!pattern.test(form.permit_number.trim())) return setError('Format de permis invalide pour la recherche.');
    try {
      const res = await axios.get(`/api/permits/search/${form.permit_number.trim()}`);
      const p = res.data.data;
      setForm(f => ({
        ...f,
        permit_type: p.permit_type || '',
        license_category: p.license_category || '',
        issuance_date: p.issuance_date ? new Date(p.issuance_date).toISOString().split('T')[0] : f.issuance_date,
        duration_years: p.duration_years ? String(p.duration_years) : f.duration_years,
      }));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la recherche du permis.');
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);
  const [result, setResult]   = useState(null);

  const years = form.duration_years === 'custom'
    ? parseInt(form.custom_years) || 0
    : parseInt(form.duration_years);

  const computeExpiry = () => {
    if (!form.issuance_date || !years) return '—';
    const d = new Date(form.issuance_date);
    d.setFullYear(d.getFullYear() + years);
    return d.toLocaleDateString('fr-FR');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.permit_number.trim()) return setError('Numéro de permis requis.');
    if (years < 1) return setError('Durée invalide (minimum 1 an).');

    try {

      // Validate permit number format (HT-xx-xx-xxxxxxx)
      const pattern = /^HT-\d{2}-\d{2}-\d{7}$/;
      if (!pattern.test(form.permit_number.trim())) {
        setError('Le numéro de permis doit être au format HT-xx-xx-xxxxxxx');
        return;
      }
      setLoading(true);
      const res = await axios.post(
        '/api/permits/assign',
        {
          permit_number:    form.permit_number.trim().toUpperCase(),
          issuance_date:    form.issuance_date,
          duration_years:   years,
          permit_type:      form.permit_type,
          license_category: form.license_category,
          user_id:          request.user_id,
          request_id:       request.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data.data);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'assignation.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Overlay ─────────────────────────────────────────────────────────────── */
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
              <CreditCard size={22} color="white" />
            </div>
            <div>
              <h2 style={{ color: 'white', margin: 0, fontSize: 17, fontWeight: 800 }}>
                Assigner Permis de Conduire
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
                Permis assigné avec succès !
              </h3>
              <p style={{ color: '#475569', fontSize: 13, margin: '0 0 20px' }}>
                Le permis a été enregistré et lié au dossier de l'usager.
              </p>
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '16px 20px',
                textAlign: 'left', marginBottom: 20,
              }}>
                {[
                  ['Numéro de permis', result?.permit?.permit_number],
                  ['Date d\'émission',  result?.permit?.issuance_date ? new Date(result.permit.issuance_date).toLocaleDateString('fr-FR') : '—'],
                  ['Date d\'expiration', result?.permit?.expiry_date ? new Date(result.permit.expiry_date).toLocaleDateString('fr-FR') : '—'],
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

                {/* Permit number */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Numéro de Permis *
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={form.permit_number}
                      onChange={e => setForm(f => ({ ...f, permit_number: e.target.value }))}
                      placeholder="HT-xx-xx-xxxxxxx"
                      required
                      style={{
                        flex: 1,
                        width: '100%',
                        padding: '11px 14px',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    />
                    <button
                      type="button"
                      onClick={fetchPermit}
                      disabled={loading}
                      style={{
                        padding: '8px 12px',
                        background: loading ? '#93c5fd' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Rechercher
                    </button>
                  </div>
                </div>

                {/* Permit type */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Type de Permis
                  </label>
                  <input
                    type="text"
                    value={form.permit_type}
                    onChange={e => setForm(f => ({ ...f, permit_type: e.target.value }))}
                    placeholder="Ex : Permis de Conduire"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* License category */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Catégorie de Licence
                  </label>
                  <input
                    type="text"
                    value={form.license_category}
                    onChange={e => setForm(f => ({ ...f, license_category: e.target.value }))}
                    placeholder="Ex : Commercial"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

              {/* Issuance date */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Date d'Émission *
                </label>
                <input
                  type="date"
                  value={form.issuance_date}
                  onChange={e => setForm(f => ({ ...f, issuance_date: e.target.value }))}
                  required
                  style={{
                    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8,
                    fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Duration */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Durée de Validité *
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: '1 an',   val: '1'  },
                    { label: '5 ans',  val: '5'  },
                    { label: '10 ans', val: '10' },
                    { label: 'Autre',  val: 'custom' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, duration_years: opt.val }))}
                      style={{
                        padding: '8px 16px', borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        border: form.duration_years === opt.val ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                        background: form.duration_years === opt.val ? '#eff6ff' : 'white',
                        color: form.duration_years === opt.val ? '#1d4ed8' : '#475569',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {form.duration_years === 'custom' && (
                  <input
                    type="number"
                    min="1"
                    max="99"
                    placeholder="Nombre d'années"
                    value={form.custom_years}
                    onChange={e => setForm(f => ({ ...f, custom_years: e.target.value }))}
                    style={{
                      marginTop: 10, width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
                      borderRadius: 8, fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>

              {/* Computed expiry preview */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px',
                marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Date d'expiration calculée</span>
                <span style={{ fontSize: 15, color: '#1e3a8a', fontWeight: 800 }}>{computeExpiry()}</span>
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
                  <CreditCard size={16} />
                  {loading ? 'Assignation...' : 'Assigner le Permis'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermitAssignModal;
