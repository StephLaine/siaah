import React from 'react';
import {
  X, User, Phone, Mail, MapPin, Calendar, Car,
  FileText, ShieldCheck, AlertTriangle, Hash, Flag,
  Printer, CheckCircle2, XCircle, Building2
} from 'lucide-react';
import './FormulaireDetail.css';

const Field = ({ label, value, icon: Icon, fullWidth }) => (
  <div className={`fd-field ${fullWidth ? 'fd-full' : ''}`}>
    <label className="fd-label">
      {Icon && <Icon size={13} />}
      {label}
    </label>
    <div className="fd-value">{value || <span className="fd-empty">—</span>}</div>
  </div>
);

const Section = ({ icon: Icon, title, color = '#1e3a8a', children }) => (
  <div className="fd-section">
    <div className="fd-section-header" style={{ borderLeftColor: color }}>
      {Icon && <Icon size={16} color={color} />}
      <h3>{title}</h3>
    </div>
    <div className="fd-section-body">{children}</div>
  </div>
);

const statusMap = {
  pending: { label: 'En attente', bg: '#fef3c7', color: '#92400e' },
  processing: { label: 'En analyse', bg: '#dbeafe', color: '#1e40af' },
  completed: { label: 'Complété', bg: '#dcfce7', color: '#166534' },
  rejected: { label: 'Refusé', bg: '#fee2e2', color: '#991b1b' },
  draft: { label: 'Brouillon', bg: '#f1f5f9', color: '#475569' },
};

const FormulaireDetail = ({ requestData = {}, onClose, onValidate, onReject }) => {
  const details = requestData.details || {};
  const st = statusMap[requestData.status] || statusMap.pending;
  const typeStr = (requestData.type || '').toLowerCase();
  const isImmat = typeStr.includes('immatricul');
  const isPermis = typeStr.includes('permis');
  const isAssur = typeStr.includes('assurance');
  const isContr = typeStr.includes('contraven');

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
  const fmtSize = (b) => {
    if (!b) return '';
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="fd-overlay" onClick={onClose}>
      <div className="fd-modal" onClick={e => e.stopPropagation()}>

        {/* ── Top bar ── */}
        <div className="fd-topbar">
          <div className="fd-topbar-left">
            <span className="fd-dossier-id">Dossier #{requestData.id}</span>
            <span className="fd-type-badge">{requestData.type || 'Demande'}</span>
            <span className="fd-status-chip" style={{ background: st.bg, color: st.color }}>
              {st.label}
            </span>
          </div>
          <div className="fd-topbar-right">
            <button className="fd-print-btn" onClick={() => window.print()} title="Imprimer">
              <Printer size={16} />
            </button>
            <button className="fd-close-btn" onClick={onClose} title="Fermer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Official header ── */}
        <div className="fd-official-header">
          <div className="fd-emblem">
            <span role="img" aria-label="Haïti" style={{ fontSize: 36 }}>🇭🇹</span>
            <div className="fd-emblem-text">
              <strong>RÉPUBLIQUE D'HAÏTI</strong>
              <small>L'Union Fait La Force</small>
            </div>
          </div>
          <div className="fd-official-title">
            <p>Ministère de l'Économie et des Finances</p>
            <strong>Société de l'Immatriculation et de l'Assurance Automobile en Haïti</strong>
          </div>
          <div className="fd-doc-ref">
            <div>Date : {fmtDate(requestData.created_at)}</div>
            <div>Réf : SIAAH-{requestData.id}</div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="fd-body">

          {/* Client info */}
          <Section icon={User} title="Informations du Titulaire" color="#1e3a8a">
            <div className="fd-grid">
              <Field label="Nom"           value={details.lastName || requestData.last_name}   icon={User} />
              <Field label="Prénom"        value={details.firstName || requestData.first_name} icon={User} />
              <Field label="Sexe"          value={details.sexe}       icon={Flag} />
              <Field label="État civil"    value={details.maritalStatus || details.etatCivil} />
              <Field label="Date de naiss." value={fmtDate(details.dob)}        icon={Calendar} />
              <Field label="Lieu de naiss." value={details.pob}        icon={MapPin} />
              <Field label="Nationalité"   value={details.nationality} icon={Flag} />
              <Field label="NIF / CIN"     value={details.nifCin || details.nif || details.cin} icon={Hash} />
              <Field label="Groupe Sanguin" value={details.bloodGroup || details.sang} />
            </div>
          </Section>

          {/* Contact */}
          <Section icon={Phone} title="Contact & Localisation" color="#0891b2">
            <div className="fd-grid">
              <Field label="Téléphone"     value={details.phone}  icon={Phone} />
              <Field label="Email"         value={details.email}  icon={Mail} />
              <Field label="Adresse"       value={details.houseNumber ? `${details.houseNumber}, ${details.street}` : details.street} icon={MapPin} fullWidth />
              <Field label="Ville"         value={details.city || details.commune}      icon={MapPin} />
              <Field label="Département"   value={details.state}   icon={MapPin} />
              <Field label="Pays"          value={details.country || 'Haïti'} icon={Flag} />
            </div>
          </Section>

          {/* Bureau */}
          <Section icon={Building2} title="Bureau & Traitement" color="#7c3aed">
            <div className="fd-grid">
              <Field label="Bureau choisi" value={requestData.office_name || details.office} icon={Building2} />
              <Field label="Date soumission" value={fmtDate(requestData.created_at)} icon={Calendar} />
              <Field label="Paiement" value={requestData.payment_status === 'paid' ? '✓ Payé' : 'Non payé'} />
              <Field label="Montant" value={requestData.price ? `${Number(requestData.price).toLocaleString('fr-HT')} HTG` : '—'} />
            </div>
          </Section>

          {/* Service-specific fields */}
          {isImmat && (
            <Section icon={Car} title="Détails du Véhicule (Immatriculation)" color="#d97706">
              <div className="fd-grid">
                <Field label="Marque" value={details.vehicleMake} icon={Car} />
                <Field label="Modèle" value={details.vehicleModel} icon={Car} />
                <Field label="Couleur" value={details.vehicleColor} />
                <Field label="N° de Châssis" value={details.chassisNumber} icon={Hash} />
              </div>
            </Section>
          )}

          {isPermis && (
            <Section icon={ShieldCheck} title="Détails du Permis de Conduire" color="#059669">
              <div className="fd-grid">
                <Field label="Type de permis" value={details.permitType} icon={ShieldCheck} />
                <Field label="Catégorie demandée" value={details.permitTypeDetail} />
              </div>
            </Section>
          )}

          {isAssur && (
            <Section icon={ShieldCheck} title="Détails de l'Assurance" color="#dc2626">
              <div className="fd-grid">
                <Field label="Compagnie d'assurance" value={details.insuranceCompany} icon={ShieldCheck} />
                <Field label="Plaque du véhicule" value={details.vehiclePlate} icon={Car} />
              </div>
            </Section>
          )}

          {isContr && (
            <Section icon={AlertTriangle} title="Détails de la Contravention" color="#ea580c">
              <div className="fd-grid">
                <Field label="N° de contravention" value={details.ticketNumber} icon={Hash} />
                <Field label="Date de l'infraction" value={details.infractionDate} icon={Calendar} />
              </div>
            </Section>
          )}

          {/* Documents submitted */}
          {(details.submittedDocuments || []).length > 0 && (
            <Section icon={FileText} title="Documents Joints" color="#475569">
              <div className="fd-docs-list">
                {details.submittedDocuments.map((doc, i) => (
                  <div key={i} className="fd-doc-row">
                    <FileText size={15} color="#6b7280" />
                    <div className="fd-doc-info">
                      <span className="fd-doc-name">{doc.name}</span>
                      {doc.fileName && (
                        <span className="fd-doc-file">
                          {doc.fileName} {doc.fileSize ? `(${fmtSize(doc.fileSize)})` : ''}
                        </span>
                      )}
                    </div>
                    <span className="fd-doc-joined">✓ joint</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* ── Action footer ── */}
        <div className="fd-footer">
          {onValidate && (
            <button className="fd-btn fd-btn-validate" onClick={onValidate}>
              <CheckCircle2 size={16} /> Valider la demande
            </button>
          )}
          {onReject && (
            <button className="fd-btn fd-btn-reject" onClick={onReject}>
              <XCircle size={16} /> Refuser la demande
            </button>
          )}
          <button className="fd-btn fd-btn-close" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormulaireDetail;
