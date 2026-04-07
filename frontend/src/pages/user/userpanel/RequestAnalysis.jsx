import React, { useState, useEffect, useRef } from 'react';
import {
  Search, RefreshCw, Eye, ChevronLeft,
  FileText, AlertCircle, X, Mail, Printer, Download,
  Check as CheckIcon
} from 'lucide-react';
import './RequestAnalysis.css';

const RequestAnalysis = ({ requestData, onBack, onValidate, onReject, onMessage, token }) => {
  const [fullRequest, setFullRequest] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [docValidation, setDocValidation] = useState({});
  const [isFormValid, setIsFormValid] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const statusLabels = {
    pending: 'En attente', processing: 'En analyse', completed: 'Terminée',
    rejected: 'Refusée', paused: 'En Pause', validated: 'En Paiement',
    to_deliver: 'À Livrer', draft: 'Brouillon'
  };

  const getStatusLabel = (status) => statusLabels[status] || status || '—';

  const handleViewDoc = (path) => {
    if (!path) return;
    window.open(`/uploads/${path}`, '_blank');
  };

  useEffect(() => {
    if (!requestData?.id || !token) return;
    const fetchFull = async () => {
      setLoadingRequest(true);
      try {
        const res = await fetch(`/api/requests/admin/${requestData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setFullRequest(data.data);
          const subDocs = data.data.details?.submittedDocuments || [];
          const rawDocs = Array.isArray(data.data.operation_required_docs) ? data.data.operation_required_docs : [];
          const reqDocs = rawDocs.map(rd => (typeof rd === 'object' && rd !== null ? rd.name : rd)).filter(Boolean);
          
          const initVal = { form: data.data.details?.formValidated || false };
          if (data.data.details?.formValidated) setIsFormValid('yes');
          
          subDocs.forEach((doc, i) => { initVal[`doc_${i}`] = !!doc.validated; });
          const missing = reqDocs.filter(rd => !subDocs.find(sd => sd && sd.name === rd));
          missing.forEach((_, i) => { initVal[`missing_${i}`] = false; });
          setDocValidation(initVal);
        }
      } catch (err) {
        console.error('Error fetching request details:', err);
      } finally {
        setLoadingRequest(false);
      }
    };
    fetchFull();
  }, [requestData?.id, token]);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!requestData?.user_id || !token) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${requestData.user_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setUserData(data.data);
        }
      } catch (err) {
        console.error('Error fetching user master data:', err);
      }
    };
    fetchUser();
  }, [requestData?.user_id, token]);

  const req = fullRequest || requestData;
  const details = (req && typeof req.details === 'object' ? req.details : {}) || {};
  const submittedDocs = Array.isArray(details.submittedDocuments) ? details.submittedDocuments : [];
  
  // Normalize requiredDocs to strings if it's an array of objects
  const rawRequiredDocs = Array.isArray(req?.operation_required_docs) ? req.operation_required_docs : [];
  const requiredDocs = rawRequiredDocs.map(rd => (typeof rd === 'object' && rd !== null ? rd.name : rd)).filter(Boolean);

  const missingDocs = requiredDocs
    .filter(rd => !submittedDocs.find(sd => sd && sd.name === rd))
    .map((rd, i) => ({ id: `missing_${i}`, name: rd, isMissing: true }));

  const allDocs = [
    ...submittedDocs.filter(Boolean).map((d, i) => ({
      id: `doc_${i}`, name: (d && d.name) || `Document ${i + 1}`, path: d && d.path, fileName: d && d.fileName
    })),
    ...missingDocs
  ];

  const filteredDocs = searchTerm
    ? allDocs.filter(d => d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : allDocs;

  const saveDraftTimeout = useRef(null);

  const performAutoSave = (newValidationState, newFormValidState) => {
    if (!req || !token) return;
    
    // Calculate updated details immediately
    const newDocs = submittedDocs.map((doc, i) => ({ ...doc, validated: !!newValidationState[`doc_${i}`] }));
    const updatedDetails = { ...details, submittedDocuments: newDocs, formValidated: newFormValidState === 'yes' };
    
    if (saveDraftTimeout.current) clearTimeout(saveDraftTimeout.current);
    
    saveDraftTimeout.current = setTimeout(async () => {
      try {
        await fetch(`/api/requests/${req.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: req.status, details: updatedDetails })
        });
      } catch (err) {
        console.error('Failed to auto-save draft:', err);
      }
    }, 1000); // 1s debounce
  };

  const handleFormValidChange = (val) => {
    if (isFormValid === 'yes') return; // Cannot un-validate form once validated
    setIsFormValid(val);
    performAutoSave(docValidation, val);
  };

  const toggleValidation = (id) => {
    if (docValidation[id]) return; // Cannot un-validate once true
    setDocValidation(prev => {
      const next = { ...prev, [id]: true };
      performAutoSave(next, isFormValid);
      return next;
    });
  };

  const getUpdatedDetails = () => {
    const newDocs = submittedDocs.map((doc, i) => ({ ...doc, validated: !!docValidation[`doc_${i}`] }));
    return { ...details, submittedDocuments: newDocs, formValidated: isFormValid === 'yes' };
  };

  const isEverythingValidated = () => {
    if (allDocs.some(d => d.isMissing)) return false;
    const allDocsValidated = allDocs.every(d => !!docValidation[d.id]);
    return allDocsValidated && isFormValid === 'yes';
  };

  const validatedCount = Object.values(docValidation).filter(Boolean).length + (isFormValid === 'yes' ? 1 : 0);
  const totalItems = (allDocs.length || 0) + 1;
  const progressPercent = totalItems > 0 ? Math.round((validatedCount / totalItems) * 100) : 0;

  if (loadingRequest) {
    return (
      <div className="ra-loading-overlay">
        <RefreshCw className="ra-spin" size={32} />
        <span>Chargement du dossier...</span>
      </div>
    );
  }

  const clientFirstName = req?.first_name || details?.firstName || '';
  const clientLastName = req?.last_name || details?.lastName || '';
  const serviceName = req?.service_name || (typeof req?.type === 'string' ? req.type.split(' - ')[0] : 'Analyse de Dossier');

  return (
    <div className="ra-container">
      {/* 1. BREADCRUMBS */}
      <div className="ra-breadcrumb-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#2563eb', fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}
            title="Retour à la liste"
          >
            <ChevronLeft size={16} /> Retour
          </button>
          <span style={{ color: '#94a3b8' }}>›</span>
          <span>{serviceName}</span>
          <span style={{ color: '#94a3b8' }}>›</span>
          <span>Dossier D-{req?.id}</span>
          <span style={{ color: '#94a3b8' }}>›</span>
          <span style={{ fontWeight: 700, color: '#1e3a8a' }}>Analyse</span>
        </div>
        <span style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
          💾 Modifications sauvegardées automatiquement
        </span>
      </div>

      {/* 2. HEADER */}
      <div className="ra-top-header">
        <h1 className="ra-main-title">{serviceName}</h1>
        <div className="ra-search-container">
          <input
            type="text"
            placeholder="Filtrer documents..."
            className="ra-search-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="ra-search-submit"><Search size={18} /></button>
        </div>
      </div>

      {/* 3. ACTION BAR */}
      <div className="ra-action-bar">
        <div className="ra-action-left">
          <button className="ra-icon-btn-box" onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <div className="ra-centered-header-bar">
          Liste des Demandes en Cours d'Analyse
        </div>

        <div className="ra-action-right">
          <button
            className="ra-btn-pill-green"
            disabled={!isEverythingValidated()}
            onClick={() => onValidate && onValidate(getUpdatedDetails())}
            style={{ opacity: isEverythingValidated() ? 1 : 0.5, cursor: isEverythingValidated() ? 'pointer' : 'not-allowed' }}
          >
            <CheckIcon size={16} /> Valider
          </button>
          <button className="ra-btn-pill-red" onClick={() => onReject && onReject('rejected', '', getUpdatedDetails())}>
            <X size={16} /> Refuser
          </button>
          <button className="ra-btn-pill-outline" onClick={() => onMessage && onMessage(req?.user_id)}>
            <Mail size={16} /> Message
          </button>
        </div>
      </div>

      {/* 4. CONTENT */}
      <div className="ra-content">
        {/* LEFT PANEL */}
        <div className="ra-left-panel">
          {/* Header row */}
          <div className="ra-info-header-row">
            <div className="ra-info-header-box">
              <span className="ra-hdr-label">Numero Demande :</span>
              <span className="ra-hdr-value">{req?.id ? `IM${req.id}` : 'IM21020001'}</span>
            </div>
            <div className="ra-info-header-box">
              <span className="ra-hdr-label">Etat :</span>
              <span className="ra-hdr-value">{getStatusLabel(req?.status)}</span>
            </div>
          </div>

          {/* Client Info */}
          <div className="ra-section">
            <h3 className="ra-section-title">Information du Client</h3>
            <div className="ra-section-grid">
              <div className="ra-grid-item">
                <span className="ra-grid-label">Nom :</span>
                <span className="ra-grid-value">{userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || `${clientFirstName} ${clientLastName}` : `${clientFirstName} ${clientLastName}`}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">NIF / CIN :</span>
                <span className="ra-grid-value">{(userData?.nif || userData?.cin) || details?.nifCin || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Nationalité :</span>
                <span className="ra-grid-value">{userData?.nationality || details?.nationality || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Groupe Sanguin :</span>
                <span className="ra-grid-value">{userData?.blood_group || details?.bloodGroup || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Sexe :</span>
                <span className="ra-grid-value">
                  {userData?.sexe === 'M' || details?.sexe === 'M' ? 'Masculin' : 
                   userData?.sexe === 'F' || details?.sexe === 'F' ? 'Féminin' : 
                   userData?.sexe || details?.sexe || '—'}
                </span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Date Naissance :</span>
                <span className="ra-grid-value">{userData?.dob ? new Date(userData.dob).toLocaleDateString('fr-FR') : details?.dob || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Lieu Naissance :</span>
                <span className="ra-grid-value">{userData?.pob || details?.pob || '—'}</span>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="ra-section">
            <h3 className="ra-section-title">Coordonnées (Contact & Localisation)</h3>
            <div className="ra-section-grid">
              <div className="ra-grid-item">
                <span className="ra-grid-label">Téléphone :</span>
                <span className="ra-grid-value">{userData?.phone || details?.phone || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Téléphone 2 :</span>
                <span className="ra-grid-value">{userData?.phone2 || details?.phone2 || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Email :</span>
                <span className="ra-grid-value">{userData?.email || details?.email || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Pays :</span>
                <span className="ra-grid-value">{userData?.country || details?.country || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Département :</span>
                <span className="ra-grid-value">{userData?.department || details?.state || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Ville / Commune :</span>
                <span className="ra-grid-value">{userData?.city || details?.city || '—'}</span>
              </div>
              <div className="ra-grid-item" style={{ gridColumn: '1 / -1' }}>
                <span className="ra-grid-label">Adresse Complète :</span>
                <span className="ra-grid-value">{userData?.full_address || userData?.address || (details?.street || details?.houseNumber ? `${details?.houseNumber || ''} ${details?.street || ''}`.trim() : '—')}</span>
              </div>
            </div>
          </div>

          {/* Operation Details */}
          <div className="ra-section">
            <h3 className="ra-section-title">Détails de l'Opération</h3>
            <div className="ra-section-grid">
              <div className="ra-grid-item">
                <span className="ra-grid-label">Type :</span>
                <span className="ra-grid-value">{req?.type || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Date de demande :</span>
                <span className="ra-grid-value">{req?.created_at ? new Date(req.created_at).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Bureau :</span>
                <span className="ra-grid-value">{req?.office_name || '—'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">État actuel :</span>
                <span className="ra-grid-value">{getStatusLabel(req?.status)}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          {details?.vehicleMake && (
            <div className="ra-section">
              <h3 className="ra-section-title">Détails du Véhicule</h3>
              <div className="ra-section-grid">
                {[['Marque', details.vehicleMake], ['Modèle', details.vehicleModel], ['Année', details.vehicleYear], ['Plaque', details.vehiclePlate], ['VIN', details.vinNumber], ['Couleur', details.vehicleColor]].map(([label, value]) => value ? (
                  <div key={label} className="ra-grid-item">
                    <span className="ra-grid-label">{label} :</span>
                    <span className="ra-grid-value">{value}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {/* Permis Details */}
          {details?.licenseCategory && (
            <div className="ra-section">
              <h3 className="ra-section-title">Détails du Permis</h3>
              <div className="ra-section-grid">
                <div className="ra-grid-item" style={{ gridColumn: 'span 2' }}>
                  <span className="ra-grid-label">Catégorie :</span>
                  <span className="ra-grid-value">{details.licenseCategory} {details.permitTypeDetail ? `— ${details.permitTypeDetail}` : ''}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — DOCUMENTS */}
        <div className="ra-right-panel">
          <div className="ra-docs-card-premium">
            <div className="ra-docs-card-header">
              DOCUMENTS ({totalItems})
            </div>
            <div className="ra-docs-list-premium">
              {/* Formulaire row */}
              <div className={`ra-doc-item-premium ${isFormValid === 'yes' ? 'is-valid' : ''}`}>
                <div
                  className="ra-doc-icon-col"
                  style={{ cursor: isFormValid === 'yes' ? 'default' : 'pointer' }}
                  onClick={() => handleFormValidChange(isFormValid === 'yes' ? null : 'yes')}
                >
                  {isFormValid === 'yes' ? (
                    <CheckIcon size={20} style={{ color: '#22c55e' }} />
                  ) : (
                    <AlertCircle size={20} style={{ color: '#3b82f6' }} />
                  )}
                </div>
                <div className="ra-doc-name-col">
                  Formulaire de Demande
                  {isFormValid === 'yes' && <span className="doc-pdf-label">VALIDÉ</span>}
                </div>
                <div className="ra-doc-action-col">
                  <button className="ra-voir-btn" onClick={() => setShowFormModal(true)}>
                    Voir <Eye size={16} />
                  </button>
                </div>
              </div>

              {/* Submitted documents */}
              {filteredDocs.map((doc) => (
                <div key={doc.id} className={`ra-doc-item-premium ${doc.isMissing ? 'is-missing' : (docValidation[doc.id] ? 'is-valid' : '')}`}>
                  <div
                    className="ra-doc-icon-col"
                    style={{ cursor: (doc.isMissing || docValidation[doc.id]) ? 'default' : 'pointer' }}
                    onClick={() => !doc.isMissing && toggleValidation(doc.id)}
                  >
                    {doc.isMissing ? (
                      <X size={20} style={{ color: '#ef4444' }} />
                    ) : docValidation[doc.id] ? (
                      <CheckIcon size={20} style={{ color: '#22c55e' }} />
                    ) : (
                      <FileText size={20} style={{ color: '#94a3b8' }} />
                    )}
                  </div>
                  <div className="ra-doc-name-col">
                    {doc.name}
                    {doc.isMissing && <span style={{ fontSize: 10, color: '#ef4444', marginLeft: 6 }}>MANQUANT</span>}
                    {docValidation[doc.id] && <span className="doc-pdf-label">VALIDÉ</span>}
                  </div>
                  <div className="ra-doc-action-col">
                    {!doc.isMissing && doc.path && (
                      <button className="ra-voir-btn" onClick={() => handleViewDoc(doc.path)}>
                        Voir <Eye size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer progress */}
            <div className="ra-docs-footer-premium">
              <div className="ra-docs-valides-label">Documents Validés</div>
              <div className="ra-progress-container-premium">
                <div className="ra-progress-bar-premium">
                  <div className="ra-progress-fill-premium" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="ra-progress-count-premium">{validatedCount}/{totalItems}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FOOTER */}
      <div className="ra-bottom-footer">
        <div className="ra-footer-left">
          <button className="ra-footer-icon-btn" title="Imprimer"><Printer size={20} /></button>
          <button className="ra-footer-icon-btn" title="Télécharger"><Download size={20} /></button>
        </div>
        <div className="ra-footer-right">
          <button className="ra-btn-fermer" onClick={onBack}>Fermer</button>
        </div>
      </div>

      {/* FORMULAIRE MODAL */}
      {showFormModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 10, width: '100%', maxWidth: 680, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.35)' }}>
            {/* Modal header */}
            <div style={{ background: '#1e3a8a', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '10px 10px 0 0', position: 'sticky', top: 0 }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: 15, fontWeight: 800 }}>
                Formulaire de Demande — Dossier #{req?.id}
              </h3>
              <button onClick={() => setShowFormModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 24, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Personal info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: 12, borderBottom: '2px solid #3b82f6', paddingBottom: 6, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Informations Personnelles
                </div>
                <div className="ra-section-grid">
                  {[
                    ['Nom', details?.lastName], ['Prénom', details?.firstName],
                    ['Sexe', details?.sexe === 'M' ? 'Masculin' : details?.sexe === 'F' ? 'Féminin' : details?.sexe],
                    ['Date de Naissance', details?.dob], ['Lieu de Naissance', details?.pob],
                    ['Nationalité', details?.nationality], ['État Civil', details?.maritalStatus],
                    ['NIF / CIN', details?.nifCin], ['Groupe Sanguin', details?.bloodGroup]
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} className="ra-grid-item">
                      <span className="ra-grid-label">{label} :</span>
                      <span className="ra-grid-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact & Location */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: 12, borderBottom: '2px solid #3b82f6', paddingBottom: 6, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Contact & Localisation
                </div>
                <div className="ra-section-grid">
                  {[
                    ['Téléphone', details?.phone], ['Email', details?.email],
                    ['Pays', details?.country], ['Département', details?.state],
                    ['Ville', details?.city], ['N° Maison', details?.houseNumber],
                    ['Rue / Quartier', details?.street]
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} className="ra-grid-item">
                      <span className="ra-grid-label">{label} :</span>
                      <span className="ra-grid-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service-specific */}
              {(details?.vehicleMake || details?.licenseCategory) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: 12, borderBottom: '2px solid #3b82f6', paddingBottom: 6, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Informations du Service
                  </div>
                  <div className="ra-section-grid">
                    {details?.vehicleMake && [
                      ['Marque', details.vehicleMake], ['Modèle', details.vehicleModel],
                      ['Année', details.vehicleYear], ['Plaque', details.vehiclePlate],
                      ['VIN', details.vinNumber], ['Couleur', details.vehicleColor]
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label} className="ra-grid-item">
                        <span className="ra-grid-label">{label} :</span>
                        <span className="ra-grid-value">{value}</span>
                      </div>
                    ))}
                    {details?.licenseCategory && [
                      ['Catégorie', details.licenseCategory],
                      ['Type de Permis', details.permitTypeDetail]
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label} className="ra-grid-item">
                        <span className="ra-grid-label">{label} :</span>
                        <span className="ra-grid-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => { setIsFormValid(null); setShowFormModal(false); }}
                  style={{ flex: 1, padding: '10px 0', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                >
                  ✗ Formulaire Invalide
                </button>
                <button
                  onClick={() => { setIsFormValid('yes'); setShowFormModal(false); }}
                  style={{ flex: 1, padding: '10px 0', background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                >
                  ✓ Formulaire Valide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestAnalysis;
