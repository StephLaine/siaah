import React from 'react';
import { FileText, ShieldCheck, AlertCircle } from 'lucide-react';

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
                <h5><FileText size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Type de permis demandé</h5>
            </div>
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Catégorie <span className="required-mark">*</span></label>
                <select className={`pro-select ${errors.licenseCategory ? 'has-error' : ''}`} value={formData.licenseCategory} onChange={e => handleFieldChange('licenseCategory', e.target.value)}>
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

            <div className="inner-form-subheading" style={{ marginTop: '20px' }}>
                <h5><FileText size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> 5. Formation</h5>
            </div>
            <div className="pro-row">
                <div className="pro-field-group">
                    <label>Nom de l'auto-école</label>
                    <input
                        type="text"
                        className="pro-input"
                        placeholder="Nom de l’auto-école..."
                        value={formData.autoEcole || ''}
                        onChange={e => handleFieldChange('autoEcole', e.target.value)}
                    />
                </div>
                <div className="pro-field-group">
                    <label>Date de fin de formation</label>
                    <input
                        type="date"
                        className="pro-input"
                        value={formData.dateFormation || ''}
                        onChange={e => handleFieldChange('dateFormation', e.target.value)}
                    />
                </div>
            </div>
            <div className="pro-field-group">
                <label>Certificat de formation fourni ?</label>
                <div className="radio-group-modern">
                    <label className={`radio-item ${formData.certificatForm === 'Oui' ? 'active' : ''}`}><input type="radio" checked={formData.certificatForm === 'Oui'} onChange={() => handleFieldChange('certificatForm', 'Oui')} /><span>Oui</span></label>
                    <label className={`radio-item ${formData.certificatForm === 'Non' ? 'active' : ''}`}><input type="radio" checked={formData.certificatForm === 'Non'} onChange={() => handleFieldChange('certificatForm', 'Non')} /><span>Non</span></label>
                </div>
            </div>
            
            <div className="inner-form-subheading" style={{ marginTop: '20px' }}>
                <h5><ShieldCheck size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> 4. Informations médicales</h5>
            </div>
            <div className="pro-row">
                <div className="pro-field-group">
                    <label>Lunettes ? <span className="required-mark">*</span></label>
                    <div className="radio-group-modern">
                        <label className={`radio-item ${formData.wearsGlasses ? 'active' : ''}`}><input type="radio" checked={formData.wearsGlasses === true} onChange={() => handleFieldChange('wearsGlasses', true)} /><span>Oui</span></label>
                        <label className={`radio-item ${formData.wearsGlasses === false ? 'active' : ''}`}><input type="radio" checked={formData.wearsGlasses === false} onChange={() => handleFieldChange('wearsGlasses', false)} /><span>Non</span></label>
                    </div>
                </div>
            </div>
            <div className="pro-row">
                <div className="pro-field-group">
                    <label>Certificat médical fourni <span className="required-mark">*</span></label>
                    <div className="radio-group-modern">
                        <label className={`radio-item ${formData.medicalCert === 'Oui' ? 'active' : ''}`}><input type="radio" checked={formData.medicalCert === 'Oui'} onChange={() => handleFieldChange('medicalCert', 'Oui')} /><span>Oui</span></label>
                        <label className={`radio-item ${formData.medicalCert === 'Non' ? 'active' : ''}`}><input type="radio" checked={formData.medicalCert === 'Non'} onChange={() => handleFieldChange('medicalCert', 'Non')} /><span>Non</span></label>
                    </div>
                    {errors.medicalCert && <div className="field-error-msg"><AlertCircle size={14} /> {errors.medicalCert}</div>}
                </div>
                <div className="pro-field-group">
                    <label>Vision conforme <span className="required-mark">*</span></label>
                    <div className="radio-group-modern">
                        <label className={`radio-item ${formData.visionOk === 'Oui' ? 'active' : ''}`}><input type="radio" checked={formData.visionOk === 'Oui'} onChange={() => handleFieldChange('visionOk', 'Oui')} /><span>Oui</span></label>
                        <label className={`radio-item ${formData.visionOk === 'Non' ? 'active' : ''}`}><input type="radio" checked={formData.visionOk === 'Non'} onChange={() => handleFieldChange('visionOk', 'Non')} /><span>Non</span></label>
                    </div>
                    {errors.visionOk && <div className="field-error-msg"><AlertCircle size={14} /> {errors.visionOk}</div>}
                </div>
            </div>
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Observations</label>
                <textarea className="pro-input" placeholder="Observations médicales éventuelles..." value={formData.medicalObs} onChange={e => handleFieldChange('medicalObs', e.target.value)} rows="3"></textarea>
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
                        "Je soussigné(e), certifie que toutes les informations fournies sont exactes et complètes. Je m’engage à respecter le code de la route en vigueur en Haïti."
                    </span>
                </label>
                {errors.declaredAccurate && <div className="field-error-msg" style={{ marginTop: '8px' }}><AlertCircle size={14} /> Veuillez cocher cette case pour continuer.</div>}
            </div>
        </>
    );
};
