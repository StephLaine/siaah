// @refresh reset
import React, { useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, AlertCircle, FileText, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const labels = {
    licenseCategory: 'Catégorie de Permis',
    bloodGroup: 'Groupe sanguin',
    medicalCert: 'Certificat médical',
    visionOk: 'Vision conforme',
    declaredAccurate: "Déclaration d'exactitude"
};

export const required = [
    'licenseCategory', 
    'bloodGroup', 
    'medicalCert', 
    'visionOk', 
    'declaredAccurate'
];

const Renouvellement = ({ formData, handleFieldChange, errors, licenseCats }) => {
  const [suggestions, setSuggestions] = React.useState([]);
  const [lookupError, setLookupError] = React.useState(null);

  // Validate licence number format (HT-xx-xx-xxxxxx)
  const validateLicense = () => {
    const pattern = /^HT-\d{2}-\d{2}-\d{6}$/;
    if (!pattern.test(formData.currentLicenseNumber)) {
      const msg = 'Le numéro de permis doit être au format HT-xx-xx-xxxxxx';
      setLookupError(msg);
      toast.error(msg);
      return false;
    }
    return true;
  };

  // Fetch permit details and auto‑populate fields
  const fetchPermit = async () => {
    if (!formData.currentLicenseNumber) {
      setLookupError(null);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/permits/search/${formData.currentLicenseNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.status === 404) {
        setLookupError('Ce numéro de permis n\'existe pas.');
        return;
      }
      if (data.status === 'success' && data.data) {
        const permit = data.data;
        // Ownership check – you may adapt the logic if needed
        if (permit.user_id && permit.user_id !== formData.userId) {
          setLookupError('Ce numéro de permis ne vous appartient pas.');
          return;
        }
        setLookupError(null);
        if (!formData.currentLicenseIssueDate) handleFieldChange('currentLicenseIssueDate', permit.issuance_date?.split('T')[0] || '');
        if (!formData.currentLicenseExpiryDate) handleFieldChange('currentLicenseExpiryDate', permit.expiry_date?.split('T')[0] || '');
        if (!formData.currentLicenseCategories) {
          const cats = permit.request_details?.licenseCategory || [];
          handleFieldChange('currentLicenseCategories', Array.isArray(cats) ? cats.join(', ') : cats);
        }
        if (!formData.licenseCategory && permit.request_details?.licenseCategory) {
          const cat = Array.isArray(permit.request_details.licenseCategory) ? permit.request_details.licenseCategory[0] : permit.request_details.licenseCategory;
          handleFieldChange('licenseCategory', cat);
        }
      }
    } catch (e) {
      console.error('Autofill error', e);
      setLookupError('Erreur lors de la recherche du permis.');
    }
  };

  const handleSearch = () => {
    if (validateLicense()) {
      fetchPermit();
    }
  };

  return (
    <>
      <div className="pro-field-group" style={{ marginTop: '15px' }}>
        <label>Numéro du permis à renouveler <span className="required-mark">*</span></label>
        <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
          <input
            type="text"
            className="pro-input"
            placeholder="HT-12-34-567890"
            value={formData.currentLicenseNumber || ''}
            onChange={e => handleFieldChange('currentLicenseNumber', e.target.value)}
            onBlur={validateLicense}
          />
          <button type="button" className="pro-button flex items-center gap-1" onClick={handleSearch}>
            <Search size={16} /> Rechercher
          </button>
        </div>
        {lookupError && (
          <div className="field-error-msg">
            <AlertCircle size={14} /> {lookupError}
          </div>
        )}
        {errors.currentLicenseNumber && (
          <div className="field-error-msg">
            <AlertCircle size={14} /> {errors.currentLicenseNumber}
          </div>
        )}
{suggestions.length > 0 && (
  <ul className="autocomplete-list" style={{ border: '1px solid #e2e8f0', borderTop: 'none', maxHeight: '150px', overflowY: 'auto', background: '#fff', marginTop: '-4px', position: 'relative', zIndex: 10 }}>
    {suggestions.map((s, i) => (
      <li key={i} style={{ padding: '4px 8px', cursor: 'pointer' }} onClick={() => { handleFieldChange('currentLicenseNumber', s); setSuggestions([]); }}>
        {s}
      </li>
    ))}
  </ul>
)}
<div className="pro-field-group" style={{ marginTop: '12px' }}>
  <label>Type de permis</label>
  <select className="pro-select" value={formData.licenseType || ''} onChange={e => handleFieldChange('licenseType', e.target.value)}>
    <option value="">Sélectionner</option>
    <option value="Provisoire">Provisoire</option>
    <option value="Définitif">Définitif</option>
    <option value="Temporaire">Temporaire</option>
    <option value="International">International</option>
  </select>
</div>
            </div>
            
            <div className="inner-form-subheading" style={{ marginTop: '20px' }}>
                <h5><ShieldCheck size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Informations médicales (Mise à jour)</h5>
            </div>
            <div className="pro-row">
                <div className="pro-field-group">
                    <label>Vision conforme <span className="required-mark">*</span></label>
                    <div className="radio-group-modern">
                        <label className={`radio-item ${formData.visionOk === 'Oui' ? 'active' : ''}`}><input type="radio" checked={formData.visionOk === 'Oui'} onChange={() => handleFieldChange('visionOk', 'Oui')} /><span>Oui</span></label>
                        <label className={`radio-item ${formData.visionOk === 'Non' ? 'active' : ''}`}><input type="radio" checked={formData.visionOk === 'Non'} onChange={() => handleFieldChange('visionOk', 'Non')} /><span>Non</span></label>
                    </div>
                </div>
            </div>

            <div className="declaration-checkbox-modern" style={{ marginTop: '25px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
                    <input 
                        type="checkbox" 
                        style={{ marginTop: '4px', transform: 'scale(1.2)' }}
                        checked={formData.declaredAccurate}
                        onChange={e => handleFieldChange('declaredAccurate', e.target.checked)}
                    />
                    <span style={{ fontSize: '13px', lineHeight: '1.5', color: '#1e293b', fontWeight: '500' }}>
                        "Je certifie que les informations fournies pour ce renouvellement sont à jour et exactes."
                    </span>
                </label>
                {errors.declaredAccurate && <div className="field-error-msg" style={{ marginTop: '8px' }}><AlertCircle size={14} /> Veuillez cocher cette case pour continuer.</div>}
            </div>
        </>
    );
};
export default Renouvellement;
