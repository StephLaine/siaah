import React from 'react';
import { CreditCard, Info, FileSignature, AlertCircle } from 'lucide-react';

export const labels = {
    currentLicenseNumber: 'Numéro du permis',
    currentLicenseIssueDate: 'Date de délivrance',
    currentLicenseExpiryDate: 'Date d\'expiration',
    currentLicenseCategories: 'Catégories possédées',
    replacementMotive: 'Motif de la demande',
    declaredAccurate: 'Déclaration d\'exactitude'
};

export const required = [
    'currentLicenseNumber', 
    'currentLicenseIssueDate', 
    'currentLicenseExpiryDate', 
    'replacementMotive', 
    'declaredAccurate'
];

export const FormFields = ({ formData, handleFieldChange, errors }) => {
    const motives = [
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
                <input 
                    type="text" 
                    className={`pro-input ${errors.currentLicenseNumber ? 'has-error' : ''}`} 
                    placeholder="P-00-00000"
                    value={formData.currentLicenseNumber}
                    onChange={e => handleFieldChange('currentLicenseNumber', e.target.value)}
                />
                {errors.currentLicenseNumber && <div className="field-error-msg"><AlertCircle size={14} /> {errors.currentLicenseNumber}</div>}
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
