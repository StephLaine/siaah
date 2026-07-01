import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FileEdit, AlertCircle, Info, FileText } from 'lucide-react';

export const labels = {
    licenseNumber: 'Numéro de permis actuel',
    licenseCategory: 'Catégorie de Permis',
    correctionDetails: 'Détails des corrections à apporter',
    declaredAccurate: 'Déclaration d\'exactitude'
};

export const required = [
    'licenseNumber', 
    'licenseCategory',
    'correctionDetails',
    'declaredAccurate'
];

export const FormFields = ({ formData, handleFieldChange, errors, licenseCats, initialUser }) => {
  const [lookupError, setLookupError] = useState(null);

  // Toast any lookup error
  useEffect(() => {
    if (lookupError) {
      toast.error(lookupError);
      setLookupError(null);
    }
  }, [lookupError]);

  // Auto-fetch permit details when licenseNumber changes
  useEffect(() => {
    const fetchPermit = async () => {
      if (!formData.licenseNumber) {
        setLookupError(null);
        return;
      }
      
      const permitRegex = /^HT-\d{2}-\d{2}-\d{6,7}$/;
      if (!permitRegex.test(formData.licenseNumber.trim())) {
        setLookupError('Format du numéro de permis invalide. Utilisez HT-xx-xx-xxxxxx ou HT-xx-xx-xxxxxxx');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/permits/search/${formData.licenseNumber.trim().toUpperCase()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.status === 404) {
          setLookupError("Ce numéro de permis n'existe pas.");
          return;
        }
        if (res.status === 403) {
          setLookupError(data.message || "Ce numéro de permis ne vous appartient pas.");
          return;
        }
        if (data.status === 'success' && data.data) {
          const permit = data.data;
          // Ownership check
          if (permit.user_id && permit.user_id !== initialUser?.id) {
            setLookupError('Ce numéro de permis ne vous appartient pas.');
            return;
          }
          setLookupError(null);
          // Populate category if empty
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
    fetchPermit();
  }, [formData.licenseNumber, initialUser]);
    return (
        <>
            <div className="inner-form-subheading">
                <h5><Info size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Informations sur le permis</h5>
            </div>
            
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Numéro du permis à corriger <span className="required-mark">*</span></label>
                    <input 
                        type="text" 
                        className={`pro-input ${errors.licenseNumber ? 'has-error' : ''}`} 
                        placeholder="Ex: 000-000-000-0"
                        value={formData.licenseNumber}
                        onChange={e => {
                          const val = e.target.value;
                          handleFieldChange('licenseNumber', val);
                          // Reset verification and dependent fields
                          handleFieldChange('currentLicenseVerified', false);
                          handleFieldChange('licenseCategory', '');
                        }}
                    />
                    {lookupError && (
                      <div className="field-error-msg">
                        <AlertCircle size={14} /> {lookupError}
                      </div>
                    )}
                {errors.licenseNumber && <div className="field-error-msg"><AlertCircle size={14} /> {errors.licenseNumber}</div>}
            </div>

            <div className="inner-form-subheading" style={{ marginTop: '20px' }}>
                <h5><FileText size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Type de permis demandé</h5>
            </div>
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Catégorie <span className="required-mark">*</span></label>
                <select className={`pro-select ${errors.licenseCategory ? 'has-error' : ''}`} value={formData.licenseCategory || ''} onChange={e => handleFieldChange('licenseCategory', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {(licenseCats || []).map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
                {errors.licenseCategory && <div className="field-error-msg"><AlertCircle size={14} /> {errors.licenseCategory}</div>}
            </div>

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

            <div className="inner-form-subheading" style={{ marginTop: '25px' }}>
                <h5><FileEdit size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Corrections demandées</h5>
            </div>
            
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Détails des corrections <span className="required-mark">*</span></label>
                <textarea 
                    className={`pro-input ${errors.correctionDetails ? 'has-error' : ''}`} 
                    rows="4"
                    placeholder="Veuillez décrire précisément les informations à corriger (ex: erreur sur le nom, date de naissance, etc.)..."
                    value={formData.correctionDetails}
                    onChange={e => handleFieldChange('correctionDetails', e.target.value)}
                ></textarea>
                {errors.correctionDetails && <div className="field-error-msg"><AlertCircle size={14} /> {errors.correctionDetails}</div>}
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
                        Je certifie que les informations fournies pour cette correction sont exactes.
                    </span>
                </label>
                {errors.declaredAccurate && <div className="field-error-msg" style={{ marginTop: '8px' }}><AlertCircle size={14} /> Veuillez cocher cette case pour continuer.</div>}
            </div>
        </>
    );
};
