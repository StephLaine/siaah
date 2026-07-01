import React, { useEffect, useState } from 'react';
import { CreditCard, Info, FileSignature, AlertCircle, FileText, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const labels = {
    currentLicenseNumber: 'Numéro du permis',
    currentLicenseIssueDate: 'Date de délivrance',
    currentLicenseExpiryDate: 'Date d\'expiration',
    currentLicenseCategories: 'Catégories possédées',
    licenseCategory: 'Catégorie de Permis',
    replacementMotive: 'Motif de la demande',
    declaredAccurate: 'Déclaration d\'exactitude'
};

export const required = [
    'currentLicenseNumber', 
    'currentLicenseIssueDate', 
    'currentLicenseExpiryDate', 
    'licenseCategory',
    'replacementMotive', 
    'declaredAccurate'
];

export const FormFields = ({ formData, handleFieldChange, errors, licenseCats, initialUser }) => {
  const [lookupError, setLookupError] = useState(null);

  

  useEffect(() => {
    if (lookupError) {
      toast.error(lookupError);
      setLookupError(null);
    }
  }, [lookupError]);  // Function to fetch permit data
  const fetchPermit = async () => {
    if (!formData.currentLicenseNumber) {
      setLookupError(null);
      return;
    }
    // RESET FIELDS & VERIFIED FLAG AT START OF SEARCH
    handleFieldChange('currentLicenseVerified', false);
    handleFieldChange('currentLicenseIssueDate', '');
    handleFieldChange('currentLicenseExpiryDate', '');
    handleFieldChange('currentLicenseCategories', '');
    handleFieldChange('licenseCategory', '');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/permits/search/${formData.currentLicenseNumber.trim().toUpperCase()}`, {
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
        if (permit.user_id && permit.user_id !== initialUser?.id) {
          setLookupError('Ce numéro de permis ne vous appartient pas.');
          return;
        }
        setLookupError(null);
        handleFieldChange('currentLicenseVerified', true); // SET VERIFIED!
        handleFieldChange('currentLicenseIssueDate', permit.issuance_date?.split('T')[0] || '');
        handleFieldChange('currentLicenseExpiryDate', permit.expiry_date?.split('T')[0] || '');
        const cats = permit.request_details?.licenseCategory || [];
        handleFieldChange('currentLicenseCategories', Array.isArray(cats) ? cats.join(', ') : cats);
        if (permit.request_details?.licenseCategory) {
          const cat = Array.isArray(permit.request_details.licenseCategory) ? permit.request_details.licenseCategory[0] : permit.request_details.licenseCategory;
          handleFieldChange('licenseCategory', cat);
        }
      }
    } catch (e) {
      console.error('Autofill error', e);
      setLookupError('Erreur lors de la recherche du permis.');
    }
  };

  // Validate license number format
  const validateLicense = () => {
    const pattern = /^HT-\d{2}-\d{2}-\d{6,7}$/;
    if (!formData.currentLicenseNumber || !pattern.test(formData.currentLicenseNumber.trim())) {
      const msg = "Le numéro de permis doit être au format HT-xx-xx-xxxxxx ou HT-xx-xx-xxxxxxx";
      setLookupError(msg);
      toast.error(msg);
      return false;
    }
    return true;
  };

  // Handle search button click
  const handleSearch = () => {
    if (validateLicense()) {
      fetchPermit();
    }
  };    const motives = [
        "Expiration du permis",
        "Permis perdu",
        "Permis volé",
        "Permis endommagé",
        "Autre (préciser)"
    ];

    return (
        <>
            <div className="inner-form-subheading">
                <h5><CreditCard size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> 3. Informations sur le permis actuel</h5>
            </div>
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
            <label>Numéro du permis <span className="required-mark">*</span></label>
            <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
                <input
                  type="text"
                  className={`pro-input ${errors.currentLicenseNumber ? 'has-error' : ''}`}
                  placeholder="HT-12-34-567890"
                  value={formData.currentLicenseNumber}
                  onChange={e => {
                    const val = e.target.value;
                    handleFieldChange('currentLicenseNumber', val);
                    handleFieldChange('currentLicenseVerified', false);
                    handleFieldChange('currentLicenseIssueDate', '');
                    handleFieldChange('currentLicenseExpiryDate', '');
                    handleFieldChange('currentLicenseCategories', '');
                    handleFieldChange('licenseCategory', '');
                  }}
                  onBlur={validateLicense}
                />
              <button
                type="button"
                className="pro-button flex items-center gap-1"
                onClick={handleSearch}
              >
                <Search size={16} />
                Rechercher
              </button>
            </div>

                {lookupError && (
                  <div className="field-error-msg">
                    <AlertCircle size={14} /> {lookupError}
                  </div>
                )}
            </div>

            <div className="pro-row">
                <div className="pro-field-group">
                    <label>Date de délivrance <span className="required-mark">*</span></label>
                    <input type="date" className="pro-input" value={formData.currentLicenseIssueDate} onChange={e => handleFieldChange('currentLicenseIssueDate', e.target.value)} />
                </div>
                <div className="pro-field-group">
                    <label>Date d'expiration <span className="required-mark">*</span></label>
                    <input type="date" className="pro-input" value={formData.currentLicenseExpiryDate} onChange={e => handleFieldChange('currentLicenseExpiryDate', e.target.value)} />
                </div>
            </div>

            <div className="pro-field-group">
                <label>Catégorie(s) actuelle(s)</label>
                <input 
                    type="text" 
                    className="pro-input" 
                    placeholder="Ex: A, B, C"
                    value={formData.currentLicenseCategories}
                    onChange={e => handleFieldChange('currentLicenseCategories', e.target.value)}
                />
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
                <h5><Info size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> 4. Motif de la demande</h5>
            </div>
            <div className="pro-field-group">
                <div className="replacement-motives-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                    {motives.map(m => (
                        <label key={m} className={`radio-item ${formData.replacementMotive === m ? 'active' : ''}`} style={{ padding: '10px 15px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                                type="radio" 
                                name="replacementMotive" 
                                checked={formData.replacementMotive === m} 
                                onChange={() => handleFieldChange('replacementMotive', m)}
                                style={{ transform: 'scale(1.1)' }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{m}</span>
                        </label>
                    ))}
                </div>
                {errors.replacementMotive && <div className="field-error-msg" style={{ marginTop: '5px' }}><AlertCircle size={14} /> {errors.replacementMotive}</div>}
            </div>

            {formData.replacementMotive === "Autre (préciser)" && (
                <div className="pro-field-group animate-fade-in" style={{ marginTop: '10px' }}>
                    <label>Précisez le motif</label>
                    <textarea 
                        className="pro-input" 
                        rows="2"
                        placeholder="Détails du motif..."
                        value={formData.otherMotiveDetails}
                        onChange={e => handleFieldChange('otherMotiveDetails', e.target.value)}
                    ></textarea>
                </div>
            )}

            <div className="inner-form-subheading" style={{ marginTop: '25px' }}>
                <h5><FileSignature size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> 5. Déclaration</h5>
            </div>
            <div className="declaration-checkbox-modern" style={{ marginTop: '10px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', alignItems: 'flex-start' }}>
                    <input 
                        type="checkbox" 
                        style={{ marginTop: '4px', transform: 'scale(1.3)' }}
                        checked={formData.declaredAccurate}
                        onChange={e => handleFieldChange('declaredAccurate', e.target.checked)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ fontSize: '14px', lineHeight: '1.5', color: '#1e293b', fontWeight: '700' }}>
                            Je certifie que les informations fournies sont exactes.
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                <strong>Signature :</strong> {formData.firstName} {formData.lastName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                <strong>Date :</strong> {formData.signatureDate}
                            </div>
                        </div>
                    </div>
                </label>
                {errors.declaredAccurate && <div className="field-error-msg" style={{ marginTop: '8px' }}><AlertCircle size={14} /> Veuillez cocher cette case pour valider votre déclaration.</div>}
            </div>
        </>
    );
};
