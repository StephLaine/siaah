import React from 'react';
import { AlertTriangle, Car, AlertCircle } from 'lucide-react';

export const labels = {
    vehiclePlate: 'Numéro de Plaque',
    replacementMotive: 'Motif du remplacement',
    chassisNumber: 'Numéro de châssis'
};

export const required = [
    'vehiclePlate', 
    'replacementMotive', 
    'chassisNumber'
];

export const FormFields = ({ formData, handleFieldChange, errors }) => {
    const motives = [
        "Plaque perdue",
        "Plaque volée",
        "Plaque endommagée / illisible",
        "Autre"
    ];

    return (
        <>
            <div className="inner-form-subheading">
                <h5><AlertTriangle size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Remplacement de Plaque</h5>
            </div>
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Numéro de Plaque Concernée <span className="required-mark">*</span></label>
                <input type="text" className="pro-input" placeholder="ABC-000" value={formData.vehiclePlate || ''} onChange={e => handleFieldChange('vehiclePlate', e.target.value)} />
            </div>

            <div className="pro-field-group">
                <label>N° Châssis (VIN) <span className="required-mark">*</span></label>
                <input type="text" className="pro-input" value={formData.chassisNumber} onChange={e => handleFieldChange('chassisNumber', e.target.value)} />
            </div>

            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Motif du Remplacement <span className="required-mark">*</span></label>
                <div className="radio-group-modern" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {motives.map(m => (
                        <label key={m} className={`radio-item ${formData.replacementMotive === m ? 'active' : ''}`}>
                            <input 
                                type="radio" 
                                name="replacementMotive" 
                                checked={formData.replacementMotive === m} 
                                onChange={() => handleFieldChange('replacementMotive', m)}
                            />
                            <span>{m}</span>
                        </label>
                    ))}
                </div>
                {errors.replacementMotive && <div className="field-error-msg" style={{ marginTop: '5px' }}><AlertCircle size={14} /> {errors.replacementMotive}</div>}
            </div>

            <p className="form-info-msg" style={{ fontSize: '11px', color: '#dc2626', background: '#fef2f2', padding: '10px', borderRadius: '6px', border: '1px solid #fee2e2', marginTop: '15px' }}>
                <strong>Attention:</strong> En cas de perte ou de vol, vous devez impérativement joindre un procès-verbal de police dans la section Documents.
            </p>
        </>
    );
};
