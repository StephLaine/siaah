import React, { useState } from 'react';
import { 
  ChevronLeft, Search, CheckCircle, X, Mail, Printer, Download, Eye, FileText, AlertCircle, Pause
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './RequestAnalysis.css';

// Helper functions for Modern PDF
const ModernTableRow = ({ label1, val1, label2, val2, fullRow = false }) => (
  <div className="flex border-b border-slate-200 last:border-b-0 min-h-[32px]">
     <div className="w-[20%] bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200 text-[11px] flex items-center">{label1}</div>
     {fullRow ? (
        <div className="w-[80%] p-1.5 text-[12px] text-slate-800 flex items-center font-bold">{val1 || <span className="text-slate-400 italic font-normal text-[11px]">Non renseigné</span>}</div>
     ) : (
        <>
           <div className="w-[30%] p-1.5 text-[12px] text-slate-800 border-r border-slate-200 flex items-center font-bold">{val1 || <span className="text-slate-400 italic font-normal text-[11px]">Non renseigné</span>}</div>
           <div className="w-[20%] bg-slate-50 p-1.5 font-semibold text-slate-600 border-r border-slate-200 text-[11px] flex items-center">{label2}</div>
           <div className="w-[30%] p-1.5 text-[12px] text-slate-800 flex items-center font-bold">{val2 || <span className="text-slate-400 italic font-normal text-[11px]">Non renseigné</span>}</div>
        </>
     )}
  </div>
);

const ModernSection = ({ title, children }) => (
  <div className="mb-3" style={{ pageBreakInside: 'avoid' }}>
      <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-t border border-slate-800 shadow-sm flex items-center">
         {title}
      </div>
      <div className="border border-slate-200 border-t-0 rounded-b bg-white overflow-hidden">
         {children}
      </div>
  </div>
);

const PrintablePDFFormPreview = ({ req, details }) => {
  if (!details) return null;

  const getVal = (possibleKeys) => {
    for (let pk of possibleKeys) {
      const foundKey = Object.keys(details).find(k => k.toLowerCase() === pk.toLowerCase() || k.toLowerCase().includes(pk.toLowerCase()));
      if (foundKey && details[foundKey]) {
        return details[foundKey];
      }
    }
    return '';
  };

  const getCin = () => getVal(['cin', 'numero_cin']) || (details.nifCin?.length > 10 ? details.nifCin : '');
  const getNif = () => getVal(['nif', 'numero_nif']) || (details.nifCin && details.nifCin.length <= 10 ? details.nifCin : '');

  const formatBool = (val) => {
     if (val === 'Oui' || val === true) return 'Oui';
     if (val === 'Non' || val === false) return 'Non';
     return val || '';
  };

  return (
    <div className="bg-white p-8 shadow-2xl rounded-sm font-sans text-slate-800" style={{ width: '100%', maxWidth: '210mm', height: 'auto', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* Official Modern Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3 mb-4">
         <div>
            <h1 className="text-[22px] font-black uppercase text-slate-900 tracking-tight leading-none mb-1.5">République d'Haïti</h1>
            <h2 className="text-[13px] font-bold uppercase text-slate-500 tracking-wider">SIAAH - Direction Générale des Impôts</h2>
         </div>
         <div className="text-right">
            <h3 className="text-lg font-black text-blue-700 uppercase tracking-wider mb-2">Formulaire de Demande</h3>
            <div className="inline-block bg-slate-100 border border-slate-200 px-3 py-1.5 rounded text-left">
               <p className="text-[11px] text-slate-500 font-bold uppercase mb-0.5">Dossier N°</p>
               <p className="text-[14px] text-slate-800 font-mono font-bold leading-none">{req.id || '---'}</p>
            </div>
         </div>
      </div>
      
      <ModernSection title="1. Informations Personnelles">
         <ModernTableRow label1="Nom" val1={req.last_name} label2="Prénom" val2={req.first_name} />
         <ModernTableRow fullRow label1="Nom Complet" val1={`${req.first_name || ''} ${req.last_name || ''}`.trim()} />
         <ModernTableRow label1="Sexe" val1={getVal(['sexe', 'gender'])} label2="Date de naissance" val2={getVal(['naissance', 'date_naissance', 'dob', 'dateofbirth'])} />
         <ModernTableRow label1="Lieu de naissance" val1={getVal(['lieuNaissance', 'lieu_naissance', 'lieu', 'pob', 'placeofbirth'])} label2="Nationalité" val2={getVal(['nationalite', 'nationality'])} />
         <ModernTableRow label1="État civil" val1={getVal(['etatCivil', 'etat_civil', 'statutMatrimonial', 'maritalstatus'])} label2="Groupe sanguin" val2={getVal(['sang', 'bloodtype', 'groupesanguin', 'bloodgroup'])} />
      </ModernSection>

      <ModernSection title="2. Identification">
         <ModernTableRow label1="Numéro CIN" val1={getCin()} label2="Numéro NIF" val2={getNif()} />
         <ModernTableRow label1="Type de pièce" val1={getVal(['piece', 'typepiece']) || (details.nifCin ? (details.nifCin.length > 10 ? 'CIN' : 'NIF') : null)} label2="Photo soumise" val2={getVal(['photo', 'hasphoto']) || 'Oui'} />
      </ModernSection>

      <ModernSection title="3. Coordonnées">
         <ModernTableRow fullRow label1="Adresse complète" val1={[getVal(['adresse', 'address', 'housenumber']), getVal(['commune', 'ville', 'city']), getVal(['departement', 'state', 'province']), getVal(['pays', 'country'])].filter(Boolean).join(', ')} />
         <ModernTableRow label1="Commune / Ville" val1={getVal(['commune', 'ville', 'city'])} label2="Département" val2={getVal(['departement', 'state', 'province'])} />
         <ModernTableRow label1="Pays" val1={getVal(['pays', 'country'])} label2="Téléphone" val2={getVal(['telephone', 'phone', 'tel'])} />
         <ModernTableRow fullRow label1="Adresse Email" val1={req.email || getVal(['email'])} />
      </ModernSection>

      <ModernSection title="4. Détails de la demande">
         <ModernTableRow label1="Catégorie demandée" val1={getVal(['categorie', 'categoriePermis', 'licensecategory'])} label2="Type de permis" val2={getVal(['typePermis', 'permis', 'licensetype'])} />
      </ModernSection>

      <ModernSection title="5. Formation">
         <ModernTableRow fullRow label1="Nom de l'auto-école" val1={getVal(['autoEcole', 'nom_auto', 'drivingschool'])} />
         <ModernTableRow label1="Date de formation" val1={getVal(['dateFormation', 'trainingdate'])} label2="Certificat fourni" val2={formatBool(getVal(['certificatForm', 'trainingcert']))} />
      </ModernSection>

      <ModernSection title="6. Aptitude médicale">
         <ModernTableRow label1="Certificat médical" val1={formatBool(getVal(['certificatMed', 'medicalcert']))} label2="Apte à conduire" val2={formatBool(getVal(['apte', 'visionok']))} />
         <ModernTableRow fullRow label1="Porter des lunettes" val1={formatBool(getVal(['lunettes', 'wearsglasses']))} />
         <ModernTableRow fullRow label1="Observations" val1={getVal(['observations', 'medicalobs'])} />
      </ModernSection>

      <div className="mt-4 border border-slate-300 rounded p-4 bg-slate-50/50" style={{ pageBreakInside: 'avoid' }}>
        <h4 className="font-bold text-slate-800 mb-2 uppercase text-center tracking-widest text-[11px]">Déclaration sur l'honneur</h4>
        <p className="italic text-[12px] text-justify text-slate-600 mb-4 leading-normal">
           Je soussigné(e), certifie par la présente que toutes les informations fournies dans le cadre de 
           cette demande sont exactes et complètes. Je m’engage à respecter le code de la route en vigueur en Haïti. 
           Le non-respect de cette déclaration peut entraîner l'annulation de la présente procédure.
        </p>
        <div className="flex justify-between items-end px-4">
           <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date de demande</p>
              <p className="text-[13px] font-medium text-slate-800 bg-white px-3 py-1.5 border border-slate-200 rounded">{req.created_at ? new Date(req.created_at).toLocaleDateString('fr-FR') : 'Non définie'}</p>
           </div>
           <div className="text-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Signature Électronique Validée</p>
              <div className="border-b border-slate-400 w-64 mx-auto text-[13px] italic py-2 text-slate-800 font-medium">
                 {details.declaredAccurate ? `${req.first_name || ''} ${req.last_name || ''} (Certifié)` : 'Non signé'}
              </div>
           </div>
        </div>
      </div>

      <div className="mt-4 text-center text-[9px] text-slate-400 font-medium uppercase tracking-widest">
        Document officiel généré électroniquement • SIAAH v1.0 • Impôts Haïti
      </div>
    </div>
  );
};

const FormDocumentPreview = ({ req, details, isModal = false }) => {
  if (!details) return null;

  // Track which keys are matched to catch any unmapped extras
  const usedKeys = new Set();
  
  const getVal = (possibleKeys) => {
    for (let pk of possibleKeys) {
      const foundKey = Object.keys(details).find(k => k.toLowerCase() === pk.toLowerCase() || k.toLowerCase().includes(pk.toLowerCase()));
      if (foundKey && details[foundKey]) {
        usedKeys.add(foundKey);
        return details[foundKey];
      }
    }
    return null;
  };

  // Prevent duplicate top-level or internal data from appearing in "Autres Informations"
  const ignoredExplicitly = ['firstname', 'lastname', 'first_name', 'last_name', 'email', 'nifcin', 'submitteddocuments', 'signaturedate', 'declaredaccurate', 'wearsglasses', 'medicalobs'];
  ignoredExplicitly.forEach(k => {
     const fn = Object.keys(details).find(key => key.toLowerCase() === k);
     if (fn) usedKeys.add(fn);
  });

  // Explicit mappings to capture user's exact requested structure
  const sections = [
    {
      title: '1 - Informations personnelles',
      items: [
        { label: 'Nom', value: req.last_name },
        { label: 'Prénom', value: req.first_name },
        { label: 'Nom Complet', value: `${req.first_name || ''} ${req.last_name || ''}`.trim() },
        { label: 'Sexe', value: getVal(['sexe', 'gender']) },
        { label: 'Date de naissance', value: getVal(['naissance', 'date_naissance', 'dob', 'dateofbirth']) },
        { label: 'Lieu de naissance', value: getVal(['lieuNaissance', 'lieu_naissance', 'lieu', 'pob', 'placeofbirth']) },
        { label: 'Nationalité', value: getVal(['nationalite', 'nationality']) },
        { label: 'État civil', value: getVal(['etatCivil', 'etat_civil', 'statutMatrimonial', 'maritalstatus']) },
        { label: 'Groupe sanguin', value: getVal(['sang', 'bloodtype', 'groupesanguin', 'bloodgroup']) }
      ]
    },
    {
      title: '2 - Identification',
      items: [
        { label: 'Numéro CIN', value: getVal(['cin', 'numero_cin']) || (details.nifCin?.length > 10 ? details.nifCin : null) },
        { label: 'Numéro NIF', value: getVal(['nif', 'numero_nif']) || (details.nifCin?.length <= 10 ? details.nifCin : null) },
        { label: "Type de pièce d'identité", value: getVal(['piece', 'typepiece']) || (details.nifCin ? (details.nifCin.length > 10 ? 'CIN' : 'NIF') : null) }
      ]
    },
    {
      title: '3 - Coordonnées',
      items: [
        { label: 'Adresse', value: getVal(['adresse', 'address', 'housenumber', 'house_number', 'street']) },
        { label: 'Commune / Ville', value: getVal(['commune', 'ville', 'city']) },
        { label: 'Département', value: getVal(['departement', 'state', 'province']) },
        { label: 'Téléphone', value: getVal(['telephone', 'phone', 'tel']) },
        { label: 'Email', value: req.email || getVal(['email']) }
      ]
    },
    {
      title: '4 - Informations de la demande',
      items: [
        { label: 'Type de demande', value: req.type },
        { label: 'Catégorie de permis', value: getVal(['categorie', 'categoriePermis', 'licensecategory', 'licenseCategory']) },
        { label: 'Type de permis', value: getVal(['typePermis', 'licenseType', 'licensetype', 'permis']) }
      ]
    },
    {
      title: '5 - Formation',
      items: [
        { label: 'Nom auto-école', value: getVal(['autoEcole', 'nom_auto', 'drivingschool']) },
        { label: 'Date formation', value: getVal(['dateFormation', 'trainingdate']) },
        { label: 'Certificat formation', value: getVal(['certificatForm', 'trainingcert']) }
      ]
    },
    {
      title: '6 - Aptitude médicale',
      items: [
        { label: 'Certificat médical', value: getVal(['certificatMed', 'medicalcert']) },
        { label: 'Apte à conduire', value: getVal(['apte', 'visionok']) },
        { label: 'Porter des lunettes', value: (() => { const v = getVal(['lunettes', 'wearsglasses']); return v === true ? 'Oui' : v === false ? 'Non' : v; })() },
        { label: 'Observations', value: getVal(['observations', 'medicalobs']) }
      ]
    }
  ];

  // Make sure internal keys don't get spewed to "Autres Informations"
  if (details.nifCin) usedKeys.add('nifCin');
  if (details.email) usedKeys.add('email');
  if (details.submittedDocuments) usedKeys.add('submittedDocuments');

  // Collect leftover fields (especially for Assurances, Immatriculation...)
  const otherItems = [];
  Object.keys(details).forEach(key => {
    if (!usedKeys.has(key) && details[key] && String(details[key]).trim() !== '') {
       otherItems.push({
         label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
         value: details[key]
       });
    }
  });

  if (otherItems.length > 0) {
     sections.push({
       title: 'Autres Informations',
       items: otherItems
     });
  }

  const submittedDocsKeys = Array.isArray(details.submittedDocuments) ? details.submittedDocuments : [];

  return (
    <div className={`form-preview-container ${isModal ? 'bg-slate-50 p-8' : 'pr-4'}`}>
      
      {/* Date de soumission en haut à droite */}
      <div className="flex justify-end mb-4">
         <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Soumis le: {req.created_at ? new Date(req.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'}
         </span>
      </div>

      {/* Simulation of top two grey boxes from Figma (Only if full standalone / not modal) */}
      {!isModal && (
         <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-[#e9eff5] px-4 py-3 rounded text-[15px] font-bold text-slate-800 border-b-[3px] border-[#3b82f6]">
             Numero Demande : {req.id ? `D-${req.id}` : '---'}
           </div>
           <div className="bg-[#e9eff5] px-4 py-3 rounded text-[15px] font-bold text-slate-800 border-b-[3px] border-[#3b82f6]">
             Etat : {req.status || 'En Analyse'}
           </div>
         </div>
      )}

      {sections.map((section, sIndex) => {
         // Omit entirely empty core sections unless they are requested like "1,2,3,4". We print everything for the generic UI.
         return (
           <div key={sIndex} className="mb-6">
             {/* Figma style blue header block */}
             <h3 className="text-[16px] font-bold text-[#1f4a9b] mb-4">
               {section.title}
             </h3>
             {/* Figma style 2-col data grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {section.items.map((item, idx) => (
                  <div key={idx} className="bg-[#eef2f6] px-4 py-3 text-[14px] border-b-[3px] border-[#3b82f6]">
                    <span className="font-bold text-[#1e293b] mr-2 flex-shrink-0">{item.label} :</span>
                    <span className="text-[#334155]">{item.value ? String(item.value) : '---'}</span>
                  </div>
                ))}
             </div>
           </div>
         );
      })}

      <div className="mb-6">
         <h3 className="text-[16px] font-bold text-[#1f4a9b] mb-4">Documents liés</h3>
         <div className="bg-[#eef2f6] px-4 py-3 text-[14px] border-b-[3px] border-[#3b82f6]">
            {submittedDocsKeys.length > 0 ? (
               <ul className="list-disc pl-5 text-[#334155]">
                 {submittedDocsKeys.map((doc, i) => <li key={i} className="font-medium text-[#1e293b]">{doc.name}</li>)}
               </ul>
            ) : (
               <span className="text-[#334155]">Aucun document attaché enregistré.</span>
            )}
         </div>
      </div>

      <div className="mb-8">
         <h3 className="text-[16px] font-bold text-[#1f4a9b] mb-4">Déclaration</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="bg-[#eef2f6] px-4 py-3 text-[14px] border-b-[3px] border-[#3b82f6]">
               <span className="font-bold text-[#1e293b] mr-2">Déclaration conforme :</span>
               <span className="font-bold text-green-600">{details.declaredAccurate ? 'Oui' : 'Non précisé'}</span>
               <div className="mt-3 text-black font-medium italic text-xs leading-relaxed">
                  "Je soussigné(e), certifie que toutes les informations fournies sont exactes et complètes. Je m’engage à respecter le code de la route en vigueur en Haïti."
               </div>
            </div>
            <div className="bg-[#eef2f6] px-4 py-3 text-[14px] border-b-[3px] border-[#3b82f6] flex flex-col justify-center">
               <div>
                  <span className="font-bold text-[#1e293b] mr-2">Date Demande :</span>
                  <span className="text-[#334155]">{req.created_at ? new Date(req.created_at).toLocaleDateString('fr-FR') : '---'}</span>
               </div>
               <div className="mt-4">
                  <span className="font-bold text-[#1e293b] mr-2">Signature Demandeur :</span>
                  <span className="text-[#334155] italic">{req.first_name} {req.last_name} / Approuvé numériquement</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const AnalysisPanel = ({ requestData, onBack, onValidate, onReject, onMessage, token }) => {
  const req = requestData || {};
  // Support both direct fields and nested user object
  const firstName = req.first_name || req.user?.first_name || '';
  const lastName = req.last_name || req.user?.last_name || '';
  const enrichedReq = { ...req, first_name: firstName, last_name: lastName };
  const details = req.details || {};
  
  // Extract all documents submitted
  const submittedDocs = Array.isArray(details.submittedDocuments) ? details.submittedDocuments : [];
  
  // Track validation of items (form + each document)
  const [validations, setValidations] = useState({});
  const [note, setNote] = useState('');
  const [docToView, setDocToView] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-pdf-form');
    if (!element) return;
    
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(element, {
        scale: 2, // Better quality
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Formulaire_Dossier_${enrichedReq.id || 'SIAAH'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleToggleValidation = (itemKey) => {
    setValidations(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const handlePrintForm = () => {
    const formEl = document.getElementById('printable-pdf-form');
    if (!formEl) return;
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    printWindow.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8" />
      <title>Formulaire SIAAH - Dossier ${enrichedReq.id || ''}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
        body { background: white; color: #1e293b; font-size: 11px; line-height: 1.4; }
        @media print { 
          @page { size: A4; margin: 10mm; } 
          body { zoom: 95%; }
        }
        .bg-white { background: white !important; }
        .shadow-2xl { box-shadow: none !important; }
        .bg-slate-50 { background: #f8fafc !important; }
        .bg-slate-100 { background: #f1f5f9 !important; }
        .bg-slate-800 { background: #1e293b !important; }
        .text-white { color: white !important; }
        .border { border: 1px solid #e2e8f0; }
        .border-slate-200 { border-color: #e2e8f0 !important; }
        .border-b { border-bottom: 1px solid #e2e8f0 !important; }
        .rounded-t { border-radius: 4px 4px 0 0; }
        .rounded-b { border-radius: 0 0 4px 4px; }
        .rounded { border-radius: 4px; }
        .flex { display: flex !important; }
        .items-center { align-items: center !important; }
        .justify-between { justify-content: space-between !important; }
        .mb-3 { margin-bottom: 10px; }
        .mb-4 { margin-bottom: 14px; }
        .mb-2 { margin-bottom: 8px; }
        .p-1\.5 { padding: 5px; }
        .p-8 { padding: 25px; }
        .p-4 { padding: 15px; }
        .px-3 { padding-left: 10px; padding-right: 10px; }
        .py-1 { padding-top: 4px; padding-bottom: 4px; }
        .text-slate-900 { color: #0f172a; }
        .text-slate-500 { color: #64748b; }
        .text-slate-600 { color: #475569; }
        .text-slate-800 { color: #1e293b; }
        .text-blue-700 { color: #1d4ed8; }
        .font-black { font-weight: 900; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .uppercase { text-transform: uppercase; }
        .tracking-tight { letter-spacing: -0.025em; }
        .tracking-wider { letter-spacing: 0.05em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .text-\[22px\] { font-size: 18px; }
        .text-\[13px\] { font-size: 11px; }
        .text-\[12px\] { font-size: 10px; }
        .text-\[11px\] { font-size: 9px; }
        .text-lg { font-size: 15px; }
        .text-sm { font-size: 11px; }
        .italic { font-style: italic; }
        .w-\[20\%\] { width: 20%; }
        .w-\[30\%\] { width: 30%; }
        .w-\[80\%\] { width: 80%; }
        .text-\[10px\] { font-size: 9px; }
        .text-\[9px\] { font-size: 8px; }
        .text-center { text-align: center; }
        .text-justify { text-align: justify; }
        .leading-none { line-height: 1; }
        .leading-normal { line-height: 1.4; }
        .mt-4 { margin-top: 12px; }
        .border-b-2 { border-bottom: 2px solid #1e293b; }
        .pb-3 { padding-bottom: 10px; }
        .font-mono { font-family: 'Courier New', monospace; }
        .overflow-hidden { overflow: hidden; }
        .bg-white { background: white; }
        .inline-block { display: inline-block; }
        .text-left { text-align: left; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .w-64 { width: 240px; }
      </style>
    </head><body>${formEl.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  // Check if everything is validated (the form itself + all documents)
  const isAllValid = validations['form'] && submittedDocs.every(doc => validations[`doc_${doc.name}`]);

  // Keys to ignore when displaying standard form info
  const ignoreKeys = ['submittedDocuments', 'nifCin', 'email'];

  return (
    <div className="ra-container relative">
      <div className="ra-breadcrumb-bar">
        <span>Administration &gt; Analyse &gt; #{req.id || '---'}</span>
      </div>

      <div className="ra-top-header">
        <h1 className="ra-main-title">Analyse du Dossier</h1>
        <div className="ra-search-container">
          <input type="text" placeholder="Rechercher..." className="ra-search-input" />
          <button className="ra-search-submit"><Search size={18} /></button>
        </div>
      </div>

      <div className="ra-action-bar">
        <div className="ra-action-left">
          <button className="ra-icon-btn-box" onClick={onBack} title="Retour"><ChevronLeft size={20} /></button>
          <div className="ra-tab-title">Dossier de {req.first_name || 'Client'} {req.last_name || ''}</div>
        </div>
        <div className="ra-action-right">
          <button 
             className={`ra-btn-pill-green ${!isAllValid ? 'opacity-50 cursor-not-allowed' : ''}`}
             disabled={!isAllValid}
             onClick={() => onValidate && onValidate('validated', note)}
          >
            <CheckCircle size={16} /> Valider
          </button>
          <button className="ra-btn-pill-red" onClick={() => onReject && onReject('rejected', note)}>
            <X size={16} /> Refuser
          </button>
          <button className="ra-btn-pill-warning" onClick={() => onReject && onReject('paused', note)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pause size={16} /> En Pause
          </button>
          <button className="ra-btn-pill-outline" onClick={() => onMessage && onMessage(req.user_id)}>
            <Mail size={16} /> Envoyer un Message
          </button>
        </div>
      </div>

      <div className="ra-content">
        <div className="ra-left-panel">
          <div className="ra-section pb-8 border-none bg-transparent">
             <FormDocumentPreview req={enrichedReq} details={details} isModal={false} />
          </div>
          
          <div className="ra-section">
            <h3 className="ra-section-title">Recommandations / Commentaire</h3>
            <textarea
              className="w-full mt-2 p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 transition-colors"
              rows={4}
              placeholder="Saisissez une note, une raison de refus, ou une recommandation..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <div className="ra-right-panel" style={{ flex: '1' }}>
          <div className="ra-docs-card-premium" style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
             <div className="ra-docs-card-header" style={{ fontWeight: '800', color: '#1e3a8a', marginBottom: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
               VÉRIFICATION DES DOCUMENTS
             </div>
             
             {!isAllValid && (
               <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-start gap-2">
                 <AlertCircle size={16} className="mt-0.5 shrink-0" />
                 <span>Veuillez valider (cocher) tous les documents et le formulaire ci-dessous pour activer le bouton Valider.</span>
               </div>
             )}

             <div className="ra-docs-list-premium flex flex-col gap-3">
                {/* Formulaire Verification */}
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-3">
                      <div 
                         className="cursor-pointer"
                         onClick={() => handleToggleValidation('form')}
                      >
                         {validations['form'] ? <CheckCircle size={22} className="text-green-600" /> : <div className="w-[22px] h-[22px] rounded-full border-2 border-slate-300"></div>}
                      </div>
                      <div className="font-semibold text-slate-700">Formulaire de demande</div>
                   </div>
                   <button className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:text-blue-800" onClick={() => setDocToView('form')}>
                     Voir <Eye size={16} />
                   </button>
                </div>

                {/* Docs Verification */}
                {submittedDocs.map((doc, i) => {
                   const docKey = `doc_${doc.name}`;
                   const isMissing = !doc.path && !doc.url;
                   return (
                     <div key={i} className={`flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors ${isMissing ? 'bg-red-50 border-red-200' : ''}`}>
                        <div className="flex items-center gap-3">
                           <div 
                              className={`cursor-pointer ${isMissing ? 'opacity-30 cursor-not-allowed' : ''}`}
                              onClick={() => !isMissing && handleToggleValidation(docKey)}
                           >
                              {validations[docKey] ? <CheckCircle size={22} className="text-green-600" /> : <div className="w-[22px] h-[22px] rounded-full border-2 border-slate-300"></div>}
                           </div>
                           <div className="flex-1">
                              <div className={`font-semibold text-slate-700 truncate max-w-[150px] ${isMissing ? 'text-red-700' : ''}`} title={doc.name}>
                                {doc.name} {isMissing && <span className="text-[10px] font-bold uppercase ml-1">(Manquant)</span>}
                              </div>
                              <div className="text-xs text-slate-400">Document attaché</div>
                           </div>
                        </div>
                        <button 
                          disabled={isMissing}
                          className={`font-semibold text-sm flex items-center gap-1 ${isMissing ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`} 
                          onClick={() => setDocToView(doc)}
                        >
                          Voir <Eye size={16} />
                        </button>
                     </div>
                   );
                })}
             </div>
          </div>
        </div>
      </div>

      <div className="ra-bottom-footer" style={{ background: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0' }}>
        <button className="text-slate-500 hover:text-slate-800 flex items-center justify-center p-2 rounded-lg bg-slate-100"><Printer size={20} /></button>
        <button className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300" onClick={onBack}>Fermer</button>
      </div>

      {/* Document Viewer Modal */}
      {docToView && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                 <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    {docToView === 'form' ? 'Visualisation : Formulaire de demande' : `Visualisation : ${docToView.name}`}
                 </h3>
                 <button onClick={() => setDocToView(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                    <X size={24} />
                 </button>
              </div>
              <div className="flex-1 bg-slate-100 p-8 flex items-start overflow-auto relative min-h-[400px]">
                 {docToView === 'form' ? (
                    <div className="w-full flex justify-center py-4" id="printable-pdf-form">
                       <PrintablePDFFormPreview req={enrichedReq} details={details} />
                    </div>
                 ) : (
                    <div className="bg-white w-full max-w-2xl min-h-[500px] shadow-sm border border-slate-200 p-4 flex flex-col items-center justify-center text-center overflow-auto">
                       {docToView.path || docToView.url ? (
                         <div className="w-full flex flex-col items-center">
                           {(docToView.path?.toLowerCase().endsWith('.pdf') || docToView.url?.toLowerCase().endsWith('.pdf')) ? (
                             <iframe 
                               src={docToView.url || `/uploads/${docToView.path}`} 
                               className="w-full h-[700px] border-none"
                               title="Aperçu du PDF"
                             />
                           ) : (
                             <img 
                               src={docToView.url || `/uploads/${docToView.path}`} 
                               alt={docToView.name} 
                               className="max-w-full h-auto rounded border border-slate-100 shadow-md" 
                             />
                           )}
                           <p className="mt-4 text-slate-500 font-semibold">{docToView.name}</p>
                         </div>
                       ) : (
                         <div className="p-12">
                           <FileText size={64} className="text-slate-300 mb-4" />
                           <h4 className="text-xl font-bold text-slate-700 mb-2">Aperçu du Document</h4>
                           <p className="text-slate-500">Nom du fichier : {docToView.name}</p>
                           <p className="text-slate-400 text-sm mt-4 italic">Ceci est un aperçu généré pour visualiser les informations téléchargées par l'usager.</p>
                         </div>
                       )}
                    </div>
                  )}
              </div>
              <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between gap-3">
                 <div className="flex">
                   {docToView === 'form' && (
                     <button 
                        onClick={() => {
                          if (onReject) onReject('rejected', note);
                          setDocToView(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 mr-2"
                     >
                        <X size={18} /> Refuser le dossier
                     </button>
                   )}
                 </div>
                  <div className="flex gap-3">
                     {docToView === 'form' ? (
                       <button 
                         onClick={handleDownloadPDF}
                         disabled={isDownloading}
                         className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300"
                       >
                         <Download size={18} /> {isDownloading ? 'Téléchargement...' : 'Télécharger en PDF'}
                       </button>
                     ) : (
                       <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100">
                         <Download size={18} /> Télécharger
                       </button>
                     )}
                    <button 
                       onClick={() => {
                           handleToggleValidation(docToView === 'form' ? 'form' : `doc_${docToView.name}`);
                           setDocToView(null);
                       }} 
                       className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                    >
                       <CheckCircle size={18} /> Valider ce {docToView === 'form' ? 'formulaire' : 'document'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
