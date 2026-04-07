import React, { useState, useEffect } from 'react';
// No icons for now to isolate rendering issues
import './RequestAnalysis.css';

const RequestAnalysisV2 = ({ requestData, onBack, onValidate, onReject, onMessage, token, user }) => {
  const [fullRequest, setFullRequest] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [docValidation, setDocValidation] = useState({});
  const [isFormValid, setIsFormValid] = useState(null);

  useEffect(() => {
    if (!requestData?.id || !token) return;
    const fetchFull = async () => {
      setLoadingRequest(true);
      try {
        const res = await fetch(`/api/requests/admin/${requestData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('API Error');
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

  const toggleValidation = (id) => {
    setDocValidation(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const validatedCount = Object.values(docValidation || {}).filter(Boolean).length + (isFormValid === 'yes' ? 1 : 0);
  const totalItems = allDocs.length + 1;
  const progressPercent = totalItems > 0 ? (validatedCount / totalItems) * 100 : 0;

  if (loadingRequest) {
    return (
      <div className="ra-loading-overlay">
        <span>Chargement des données...</span>
      </div>
    );
  }

  const serviceName = req?.service_name || "Analyse de Demande";
  const safeDate = (dateStr) => {
    try {
      if (!dateStr) return '---';
      const d = new Date(dateStr);
      return isNaN(d) ? '---' : d.toLocaleDateString();
    } catch (e) { return '---'; }
  };

  return (
    <div className="ra-container">
      <div className="ra-breadcrumb-bar">
        <span>{serviceName} &gt; Analyse</span>
      </div>

      <div className="ra-top-header">
        <h1 className="ra-main-title">Analyse du Dossier</h1>
      </div>

      <div className="ra-action-bar">
        <button onClick={onBack}>[ Retour ]</button>
        <div className="ra-action-right">
          <button onClick={() => onValidate && onValidate('validated')}>Valider</button>
          <button onClick={onReject}>Refuser</button>
          <button onClick={() => onMessage && onMessage(req?.user_id)}>Message</button>
        </div>
      </div>

      <div className="ra-content">
        <div className="ra-left-panel">
          <h3>Informations Client</h3>
          <p>Dossier: {req?.id || '---'}</p>
          <p>Nom: {req?.first_name} {req?.last_name}</p>
          <p>NIF: {details?.nifCin || '---'}</p>
          <p>Date: {safeDate(req?.created_at)}</p>
        </div>

        <div className="ra-right-panel">
          <div className="ra-docs-card-premium">
            <div className="ra-docs-card-header">DOCUMENTS ({totalItems})</div>
            <div className="ra-docs-list-premium">
              <div className="ra-doc-item-premium">
                <span>Formulaire</span>
                <button onClick={() => setIsFormValid(isFormValid === 'yes' ? null : 'yes')}>
                  {isFormValid === 'yes' ? '[VALIDE]' : '[VOIR]'}
                </button>
              </div>
              {allDocs.map((doc) => (
                <div key={doc.id} className="ra-doc-item-premium">
                  <span>{doc.name}</span>
                  <button onClick={() => toggleValidation(doc.id)}>
                    {docValidation[doc.id] ? '[VALIDE]' : '[VOIR]'}
                  </button>
                </div>
              ))}
            </div>
            <div className="ra-docs-footer-premium">
               Progression: {validatedCount}/{totalItems} ({Math.round(progressPercent)}%)
            </div>
          </div>
        </div>
      </div>

      <div className="ra-bottom-footer">
        <button onClick={onBack}>Fermer</button>
      </div>
    </div>
  );
};

export default RequestAnalysisV2;
