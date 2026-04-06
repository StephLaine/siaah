import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, CheckCircle, XCircle, RefreshCw, 
  Search, Filter, Eye, ChevronRight, MapPin, Phone, Mail, FileText, Info 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', text: '#92400e', label: 'En attente' },
  confirmed: { bg: '#d1fae5', text: '#065f46', label: 'Confirmé' },
  completed: { bg: '#dbeafe', text: '#1e40af', label: 'Complété' },
  cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Annulé' },
};

const MesRendezVous = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [datePreset, setDatePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedApt, setSelectedApt] = useState(null);

  const authHeader = { Authorization: `Bearer ${token}` };

  const getAllowedServices = () => {
    if (user?.role_id === 1) return null;
    if (user?.role_id === 2) return user?.entity_services || null;
    if (user?.role_id === 3) {
      const a = user?.assigned_services;
      if (Array.isArray(a)) return a;
      if (typeof a === 'string') { try { return JSON.parse(a); } catch { return []; } }
    }
    return null;
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/appointments/office', { headers: authHeader });
      const data = await res.json();
      if (data.status === 'success') {
        let rows = data.data;
        const allowed = getAllowedServices();
        if (allowed && allowed.length > 0) {
          rows = rows.filter(a =>
            allowed.some(s => (a.service || '').toLowerCase().includes(s.toLowerCase()))
          );
        }
        setAppointments(rows);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5001/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (selectedApt?.id === id) setSelectedApt(p => ({ ...p, status }));
    } catch (err) {
      console.error('Error updating appointment:', err);
    }
  };

  const filtered = appointments.filter(a => {
    // 1. Search filter
    const fullName = `${a.first_name || a.user_first || ''} ${a.last_name || a.user_last || ''}`.toLowerCase();
    const matchSearch = !search || fullName.includes(search.toLowerCase()) || (a.service || '').toLowerCase().includes(search.toLowerCase());

    // 2. Status filter
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;

    // 3. Date filter
    let matchDate = true;
    const aptDate = a.appointment_date ? new Date(a.appointment_date) : null;
    if (aptDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const today = new Date(now);
      const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);

      if (datePreset === 'today') {
        matchDate = aptDate.toDateString() === today.toDateString();
      } else if (datePreset === 'tomorrow') {
        matchDate = aptDate.toDateString() === tomorrow.toDateString();
      } else if (datePreset === 'week') {
        const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
        matchDate = aptDate >= today && aptDate <= weekEnd;
      } else if (datePreset === 'month') {
        matchDate = aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
      } else if (datePreset === 'quarter') {
        const qStart = Math.floor(now.getMonth() / 3) * 3;
        matchDate = aptDate.getMonth() >= qStart && aptDate.getMonth() < qStart + 3 && aptDate.getFullYear() === now.getFullYear();
      } else if (datePreset === 'semester') {
        const sStart = now.getMonth() < 6 ? 0 : 6;
        matchDate = aptDate.getMonth() >= sStart && aptDate.getMonth() < sStart + 6 && aptDate.getFullYear() === now.getFullYear();
      } else if (datePreset === 'year') {
        matchDate = aptDate.getFullYear() === now.getFullYear();
      } else if (datePreset === 'range' && dateFrom && dateTo) {
        const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
        const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
        matchDate = aptDate >= from && aptDate <= to;
      }
    }

    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e3a8a', margin: '0 0 4px' }}>
          <Calendar size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Prises de Rendez-vous
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Liste des rendez-vous liés à vos services
        </p>
      </div>

      {/* Tabs / Filter Navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {[
          { id: 'all', label: 'Tous', color: '#64748b' },
          { id: 'pending', label: 'En attente', color: '#d97706' },
          { id: 'confirmed', label: 'Confirmé', color: '#059669' },
          { id: 'completed', label: 'Complété', color: '#2563eb' },
          { id: 'cancelled', label: 'Annulé', color: '#dc2626' }
        ].map((tab) => {
          const isActive = filterStatus === tab.id;
          const count = tab.id === 'all' ? appointments.length : appointments.filter(a => a.status === tab.id).length;
          return (
            <button key={tab.id} onClick={() => setFilterStatus(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: isActive ? 'white' : 'transparent', color: isActive ? '#1e293b' : '#64748b', boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tab.color, opacity: isActive ? 1 : 0.5 }} />
              {tab.label}
              <span style={{ background: isActive ? '#f1f5f9' : '#e2e8f0', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', color: isActive ? '#475569' : '#94a3b8' }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters Search and Date presets */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            style={{ width: '100%', padding: '9px 14px 9px 36px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            placeholder="Nom du client ou service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'white', border: '1.5px solid #e2e8f0', padding: '4px 8px', borderRadius: 8 }}>
          <Calendar size={14} style={{ color: '#64748b' }} />
          <select 
            value={datePreset}
            onChange={e => setDatePreset(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="tomorrow">Demain</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="semester">Ce semestre</option>
            <option value="year">Cette année</option>
            <option value="range">Période personnalisée</option>
          </select>
        </div>

        {datePreset === 'range' && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', animate: 'fadeIn 0.3s' }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12 }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>au</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: 12 }} />
          </div>
        )}

        <button onClick={fetchAppointments} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#475569' }}>
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}><RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} /><p>Chargement...</p></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 100, color: '#94a3b8', background: 'white', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <Calendar size={40} style={{ marginBottom: 16 }} />
          <p style={{ fontWeight: 600 }}>Aucune prise de rendez-vous trouvée.</p>
          <p style={{ fontSize: 12 }}>Essayez de modifier vos filtres de recherche.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={th}>Date & Heure</th>
                <th style={th}>Client</th>
                <th style={th}>Détails Service</th>
                <th style={th}>Contact</th>
                <th style={th}>Statut</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                const name = `${a.first_name || a.user_first || '—'} ${a.last_name || a.user_last || ''}`.trim();
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-row">
                    <td style={td}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('fr-FR') : '—'}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{a.appointment_time || '—'}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.email || a.user_email || '—'}</div>
                    </td>
                    <td style={td}>
                      <div style={{ color: '#1e3a8a', fontWeight: 600 }}>{a.service}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{a.service_type}</div>
                    </td>
                    <td style={td}>
                      <div>{a.phone || '—'}</div>
                      {a.nif && <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>NIF: {a.nif}</div>}
                    </td>
                    <td style={td}>
                      <span style={{ background: sc.bg, color: sc.text, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setSelectedApt(a)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer' }} title="Voir détails">
                          <Eye size={16} />
                        </button>
                        {a.status === 'pending' ? (
                          <button onClick={() => updateStatus(a.id, 'confirmed')} style={{ background: '#d1fae5', color: '#065f46', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 11 }} title="Confirmer">
                            CONFIRMER
                          </button>
                        ) : a.status === 'confirmed' ? (
                          <button onClick={() => updateStatus(a.id, 'completed',)} style={{ background: '#dbeafe', color: '#1e40af', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>
                            COMPLÉTER
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Appointment Profile Modal */}
      {selectedApt && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#eff6ff', padding: 8, borderRadius: 10, color: '#2563eb' }}><User size={24} /></div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Profil du Rendez-vous</h2>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Réf: #{selectedApt.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><XCircle size={24} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <section>
                <h3 style={sectionTitle}><User size={14} /> Information Client</h3>
                <div style={detailBox}>
                  <p style={detailItem}><strong>Nom:</strong> {selectedApt.first_name || selectedApt.user_first} {selectedApt.last_name || selectedApt.user_last}</p>
                  <p style={detailItem}><Mail size={12} /> {selectedApt.email || selectedApt.user_email || '—'}</p>
                  <p style={detailItem}><Phone size={12} /> {selectedApt.phone || '—'}</p>
                  <p style={detailItem}><FileText size={12} /> NIF: {selectedApt.nif || '—'}</p>
                </div>
              </section>

              <section>
                <h3 style={sectionTitle}><Info size={14} /> Rendez-vous</h3>
                <div style={detailBox}>
                  <p style={detailItem}><Calendar size={12} /> {new Date(selectedApt.appointment_date).toLocaleDateString('fr-FR')}</p>
                  <p style={detailItem}><Clock size={12} /> {selectedApt.appointment_time}</p>
                  <p style={detailItem}><MapPin size={12} /> {selectedApt.office_name || '—'}</p>
                  <p style={{ ...detailItem, color: STATUS_COLORS[selectedApt.status].text, fontWeight: 800 }}><strong>Statut:</strong> {STATUS_COLORS[selectedApt.status].label}</p>
                </div>
              </section>
            </div>

            <section style={{ marginTop: 20 }}>
              <h3 style={sectionTitle}><FileText size={14} /> Service & Demande</h3>
              <div style={{ ...detailBox, columnCount: 2 }}>
                <p style={detailItem}><strong>Service:</strong> {selectedApt.service}</p>
                <p style={detailItem}><strong>Type:</strong> {selectedApt.service_type || '—'}</p>
                <p style={detailItem}><strong>Bureau:</strong> {selectedApt.office_name || '—'}</p>
                <p style={detailItem}><strong>Lieu:</strong> {selectedApt.office_address || '—'}</p>
              </div>
            </section>

            {selectedApt.notes && (
              <div style={{ marginTop: 16, padding: 12, background: '#fffbeb', borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>NOTES CLIENT :</p>
                <p style={{ margin: 0, fontSize: 13, color: '#b45309' }}>{selectedApt.notes}</p>
              </div>
            )}

            <div style={{ marginTop: 32, display: 'flex', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
              {selectedApt.status === 'pending' && (
                <button 
                  onClick={() => updateStatus(selectedApt.id, 'confirmed')} 
                  style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirmé le rendez-vous
                </button>
              )}
              {selectedApt.status === 'confirmed' && (
                <button 
                  onClick={() => updateStatus(selectedApt.id, 'completed')} 
                  style={{ flex: 1, padding: '12px', background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Marquer comme Complété
                </button>
              )}
              {(selectedApt.status === 'pending' || selectedApt.status === 'confirmed') && (
                <button 
                  onClick={() => updateStatus(selectedApt.id, 'cancelled')} 
                  style={{ padding: '12px 20px', background: 'white', color: '#dc2626', border: '1.5px solid #fee2e2', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const th = { padding: '16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 };
const td = { padding: '16px', verticalAlign: 'middle' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalCard = { background: 'white', width: '90%', maxWidth: '640px', padding: '32px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' };
const sectionTitle = { fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 };
const detailBox = { background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #f1f5f9' };
const detailItem = { margin: '0 0 8px', fontSize: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 };

export default MesRendezVous;

