import React from 'react';
import { RefreshCw, Car, AlertCircle } from 'lucide-react';

export const labels = {
    vehiclePlate: 'Numéro de Plaque',
    vehicleMake: 'Marque',
    vehicleModel: 'Modèle',
    vehicleYear: 'Année de fabrication',
    vehicleColor: 'Couleur',
    chassisNumber: 'Numéro de châssis'
};

export const required = [
    'vehiclePlate', 
    'vehicleMake', 
    'vehicleModel', 
    'vehicleYear', 
    'vehicleColor', 
    'chassisNumber'
];

export const FormFields = ({ formData, handleFieldChange, errors, vehMakes, vehModels, vehColors }) => {
    return (
        <>
            <div className="inner-form-subheading">
                <h5><RefreshCw size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Renouvellement de Plaque</h5>
            </div>
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Numéro de Plaque Actuel <span className="required-mark">*</span></label>
                <input type="text" className="pro-input" placeholder="ABC-000" value={formData.vehiclePlate || ''} onChange={e => handleFieldChange('vehiclePlate', e.target.value)} />
            </div>

            <div className="pro-row">
                <div className="pro-field-group">
                    <label>Marque <span className="required-mark">*</span></label>
                    <select className="pro-select" value={formData.vehicleMake} onChange={e => handleFieldChange('vehicleMake', e.target.value)}>
                        <option value="">Sélectionner</option>
                        {(vehMakes || []).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                </div>
                <div className="pro-field-group">
                    <label>Modèle <span className="required-mark">*</span></label>
                    <select className="pro-select" value={formData.vehicleModel} onChange={e => handleFieldChange('vehicleModel', e.target.value)}>
                        <option value="">Sélectionner</option>
                        {(vehModels || []).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="pro-field-group">
                <label>N° Châssis (VIN) <span className="required-mark">*</span></label>
                <input type="text" className="pro-input" value={formData.chassisNumber} onChange={e => handleFieldChange('chassisNumber', e.target.value)} />
            </div>
            
            <p className="form-info-msg" style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '10px' }}>
                * Le renouvellement nécessite de fournir l'original de la carte grise lors de votre passage au bureau.
            </p>
        </>
    );
};
