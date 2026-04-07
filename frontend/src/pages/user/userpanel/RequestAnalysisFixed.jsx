import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, XCircle, Search, 
  FileText, User, RefreshCw, Eye, CheckCircle, AlertCircle,
  Printer, Download, X, Mail, Phone, Shield, Calendar,
  FileCheck, FileWarning, FileMinus, ChevronLeft, ChevronRight,
  Check as CheckIcon
} from 'lucide-react';
import './RequestAnalysis.css';

const detailsLabels = {
  firstName: "Nom",
  lastName: "Prénom",
  nifCin: "NIF / CIN",
  phone: "Téléphone",
  email: "Email",
  type: "Type",
  created_at: "Date de demande",
  status: "Etat actuel",
  agent: "Agent Assigné"
};

const RequestAnalysisFixed = ({ requestData, onBack, onValidate, onReject, onMessage, token, user }) => {
  const [fullRequest, setFullRequest] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [docValidation, setDocValidation] = useState({});
  const [isFormValid, setIsFormValid] = useState(null); // null, 'yes', 'no'

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
          const reqDocs = data.data.operation_required_docs || [];
          
          const initVal = { form: false };
          subDocs.forEach((_, i) => initVal[`doc_${i}`] = false);
          
          const missing = (Array.isArray(reqDocs) ? reqDocs : [])
            .filter(rd => !subDocs.find(sd => sd.name === rd));
          missing.forEach((_, i) => initVal[`missing_${i}`] = false);

          setDocValidation(initVal);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoadingRequest(false);
      }
    };
    fetchFull();
  }, [requestData?.id, token]);

  const req = fullRequest || requestData;
  const details = req?.details || {};
  const submittedDocs = (details?.submittedDocuments || []);
  const requiredDocs = (req?.operation_required_docs || []);

  const missingDocs = (Array.isArray(requiredDocs) ? requiredDocs : [])
    .filter(rd => !submittedDocs.find(sd => sd.name === rd))
    .map((rd, i) => ({ id: `missing_${i}`, name: rd, isMissing: true }));

  const allDocs = [
    ...(submittedDocs || []).map((d, i) => (
      d ? { id: `doc_${i}`, name: d.name, fileName: d.fileName } : null
    )).filter(Boolean),
    ...missingDocs
  ];

  const filteredDocs = allDocs.filter(d => 
    !searchTerm || d?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleValidation = (id) => {
    setDocValidation(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isEverythingValidated = () => {
    const docsValidated = allDocs.length > 0 && allDocs.every(d => docValidation[d.id] === true);
    return docsValidated && isFormValid === 'yes';
  };

  const validatedCount = Object.values(docValidation || {}).filter(Boolean).length + (isFormValid === 'yes' ? 1 : 0);
  const totalItems = allDocs.length + 1; // Docs + Formulaire
  const progressPercent = totalItems > 0 ? (validatedCount / totalItems) * 100 : 0;

  if (loadingRequest) {
    return (
      <div className="ra-loading-overlay">
        <RefreshCw className="ra-spin" />
        <span>Chargement des données du dossier...</span>
      </div>
    );
  }

  const serviceName = req?.service_name || "Immatriculation Vehicule";

  return (
    <div className="ra-container">
      {/* 1. BREADCRUMBS */}
      <div className="ra-breadcrumb-bar">
        <span>{serviceName} &gt; Liste de Demandes en Cours d'Analyse &gt; Demande en Cours d'Analyse</span>
      </div>

      {/* 2. MAIN HEADER SECTION */}
      <div className="ra-top-header">
        <h1 className="ra-main-title">Gestion de l'Immatriculation des Vehicules</h1>
        <div className="ra-search-container">
          <input type="text" placeholder="Nom Document" className="ra-search-input" />
          <button className="ra-search-submit"><Search size={18} /></button>
        </div>
      </div>

      {/* 3. ACTION BAR */}
      <div className="ra-action-bar">
        <div className="ra-action-left">
          <button className="ra-icon-btn-box" onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
          <div className="ra-tab-title">
            Liste des Demandes en Cours d'Analyse
          </div>
        </div>
        <div className="ra-action-right">
          <button className="ra-btn-pill-green" onClick={() => onValidate('validated')}>
            <CheckIcon size={16} /> Valider
          </button>
          <button className="ra-btn-pill-red" onClick={onReject}>
             <X size={16} /> Refuser
          </button>
          <button className="ra-btn-pill-outline" onClick={() => onMessage(req?.user_id)}>
             <Mail size={16} /> Message
          </button>
        </div>
      </div>

      {/* 4. CONTENT AREA */}
      <div className="ra-content">
        <div className="ra-left-panel">
          {/* Header info */}
          <div className="ra-info-header-row">
            <div className="ra-info-header-item">
              <span className="ra-hdr-label">Numero Demande :</span>
              <span className="ra-hdr-value">{req?.id || 'IM21020001'}</span>
            </div>
            <div className="ra-info-header-item">
              <span className="ra-hdr-label">Etat :</span>
              <span className="ra-hdr-value status-blue">En Analyse</span>
            </div>
          </div>

          {/* Client Info */}
          <div className="ra-section">
            <h3 className="ra-section-title">Information du Client</h3>
            <div className="ra-section-grid">
              <div className="ra-grid-item">
                <span className="ra-grid-label">Nom :</span>
                <span className="ra-grid-value">{`${req?.first_name || 'Sarah'} ${req?.last_name || 'Dieudonne'}`}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">NIF :</span>
                <span className="ra-grid-value">{details?.nifCin || '096-002-156 -1'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Telephone :</span>
                <span className="ra-grid-value">{details?.phone || '+509 48607457'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Email :</span>
                <span className="ra-grid-value">{details?.email || 'sarai.dieudonne@uniq.edu'}</span>
              </div>
            </div>
          </div>

          {/* Operation Details */}
          <div className="ra-section">
            <h3 className="ra-section-title">Details de l'Operation</h3>
            <div className="ra-section-grid">
              <div className="ra-grid-item">
                <span className="ra-grid-label">Type :</span>
                <span className="ra-grid-value">{req?.type || 'Nouvelle demande'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Date de demande :</span>
                <span className="ra-grid-value">{req?.created_at ? new Date(req.created_at).toLocaleDateString('fr-FR') : '16/09/2025'}</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Etat actuel :</span>
                <span className="ra-grid-value">En analyse</span>
              </div>
              <div className="ra-grid-item">
                <span className="ra-grid-label">Agent Assigne :</span>
                <span className="ra-grid-value">{req?.assigned_agent_name || 'Marie Paul'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar right */}
        <div className="ra-right-panel">
          <div className="ra-docs-card-premium">
            <div className="ra-docs-card-header">
              DOCUMENTS ({totalItems})
            </div>
            <div className="ra-docs-list-premium">
              {/* Special Form item */}
              <div className={`ra-doc-item-premium ${isFormValid === 'yes' ? 'is-valid' : ''}`}>
                <div className="ra-doc-icon-col">
                   {isFormValid === 'yes' ? (
                     <CheckIcon size={20} className="text-green-600" />
                   ) : (
                     <AlertCircle size={20} className="text-blue-500" />
                   )}
                </div>
                <div className="ra-doc-name-col">
                  Formulaire
                </div>
                <div className="ra-doc-action-col">
                   <button className="ra-voir-btn" onClick={() => setIsFormValid(isFormValid === 'yes' ? null : 'yes')}>
                     Voir <Eye size={16} />
                   </button>
                </div>
              </div>

              {allDocs.map((doc, idx) => (
                <div key={doc.id} className="ra-doc-item-premium">
                  <div className="ra-doc-icon-col">
                     {docValidation[doc.id] ? (
                       <CheckIcon size={20} className="text-green-600" />
                     ) : doc.isMissing ? (
                       <X size={20} className="text-red-600" />
                     ) : (
                       <FileText size={20} className="text-gray-400" />
                     )}
                  </div>
                  <div className="ra-doc-name-col">
                    {doc.name}
                    {docValidation[doc.id] && <span className="doc-pdf-label">PDF</span>}
                  </div>
                  <div className="ra-doc-action-col">
                     <button className="ra-voir-btn" onClick={() => toggleValidation(doc.id)}>
                       Voir <Eye size={16} />
                     </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ra-docs-footer-premium">
              <div className="ra-docs-valides-label">
                Documents Valides
              </div>
              <div className="ra-progress-container-premium">
                <div className="ra-progress-bar-premium">
                  <div className="ra-progress-fill-premium" style={{ width: `${progressPercent}%` }}></div>
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
           <button className="ra-footer-icon-btn"><Printer size={20} /></button>
           <button className="ra-footer-icon-btn"><Download size={20} /></button>
        </div>
        <div className="ra-footer-right">
           <button className="ra-btn-fermer" onClick={onBack}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default RequestAnalysisFixed;

