import React from 'react';
import { FileEdit, AlertCircle, Info } from 'lucide-react';

export const labels = {
    licenseNumber: 'Numéro de permis actuel',
    correctionDetails: 'Détails des corrections à apporter',
    declaredAccurate: 'Déclaration d\'exactitude'
};

export const required = [
    'licenseNumber', 
    'correctionDetails',
    'declaredAccurate'
];

export const FormFields = ({ formData, handleFieldChange, errors }) => {
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
                    onChange={e => handleFieldChange('licenseNumber', e.target.value)}
                />
                {errors.licenseNumber && <div className="field-error-msg"><AlertCircle size={14} /> {errors.licenseNumber}</div>}
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
