import React from 'react';
import { FileEdit, AlertCircle } from 'lucide-react';

export const labels = {
    vehiclePlate: 'Numéro de Plaque',
    correctionDetails: 'Détails de la correction',
    chassisNumber: 'Numéro de châssis'
};

export const required = [
    'vehiclePlate', 
    'correctionDetails', 
    'chassisNumber'
];

export const FormFields = ({ formData, handleFieldChange, errors }) => {
    return (
        <>
            <div className="inner-form-subheading">
                <h5><FileEdit size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Correction de Données d'Immatriculation</h5>
            </div>
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Numéro de Plaque Actuel <span className="required-mark">*</span></label>
                <input type="text" className="pro-input" placeholder="ABC-000" value={formData.vehiclePlate || ''} onChange={e => handleFieldChange('vehiclePlate', e.target.value)} />
            </div>

            <div className="pro-field-group">
                <label>N° Châssis (VIN) <span className="required-mark">*</span></label>
                <input type="text" className="pro-input" value={formData.chassisNumber} onChange={e => handleFieldChange('chassisNumber', e.target.value)} />
            </div>

            <div className="pro-field-group">
                <label>Précisez les éléments à corriger <span className="required-mark">*</span></label>
                <textarea 
                    className={`pro-input ${errors.correctionDetails ? 'has-error' : ''}`}
                    rows="4"
                    placeholder="Ex: Couleur incorrecte, Numéro moteur mal saisi..."
                    value={formData.correctionDetails}
                    onChange={e => handleFieldChange('correctionDetails', e.target.value)}
                ></textarea>
                {errors.correctionDetails && <div className="field-error-msg" style={{ marginTop: '5px' }}><AlertCircle size={14} /> {errors.correctionDetails}</div>}
            </div>
        </>
    );
};
