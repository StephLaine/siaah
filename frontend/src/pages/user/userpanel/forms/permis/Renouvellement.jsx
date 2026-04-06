import React from 'react';
import { RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';

export const labels = {
    licenseCategory: 'Catégorie de Permis',
    bloodGroup: 'Groupe sanguin',
    medicalCert: 'Certificat médical',
    visionOk: 'Vision conforme',
    declaredAccurate: 'Déclaration d\'exactitude'
};

export const required = [
    'licenseCategory', 
    'bloodGroup', 
    'medicalCert', 
    'visionOk', 
    'declaredAccurate'
];

export const FormFields = ({ formData, handleFieldChange, errors, licenseCats }) => {
    return (
        <>
            <div className="inner-form-subheading">
                <h5><RefreshCw size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Renouvellement de permis</h5>
            </div>
            {/* User can add specific fields for renewal here */}
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Numéro du permis à renouveler <span className="required-mark">*</span></label>
                <input type="text" className="pro-input" placeholder="P-00-00000" value={formData.currentLicenseNumber || ''} onChange={e => handleFieldChange('currentLicenseNumber', e.target.value)} />
            </div>

            <div className="pro-field-group">
                <label>Catégorie <span className="required-mark">*</span></label>
                <select className={`pro-select ${errors.licenseCategory ? 'has-error' : ''}`} value={formData.licenseCategory} onChange={e => handleFieldChange('licenseCategory', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {(licenseCats || []).map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
                {errors.licenseCategory && <div className="field-error-msg"><AlertCircle size={14} /> {errors.licenseCategory}</div>}
            </div>
            
            <div className="inner-form-subheading" style={{ marginTop: '20px' }}>
                <h5><ShieldCheck size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Informations médicales (Mise à jour)</h5>
            </div>
            <div className="pro-row">
                <div className="pro-field-group">
                    <label>Groupe Sanguin <span className="required-mark">*</span></label>
                    <select className={`pro-select ${errors.bloodGroup ? 'has-error' : ''}`} value={formData.bloodGroup} onChange={e => handleFieldChange('bloodGroup', e.target.value)}>
                        <option value="">Sélectionner</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                </div>
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
