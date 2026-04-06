import React from 'react';
import { ShieldCheck, Car, AlertCircle } from 'lucide-react';

export const labels = {
    insuranceCompany: 'Compagnie d\'assurance',
    vehiclePlate: 'Numéro de plaque',
    vehicleMake: 'Marque du véhicule',
    vehicleModel: 'Modèle du véhicule',
    coverageType: 'Type de couverture'
};

export const required = [
    'insuranceCompany', 
    'vehiclePlate', 
    'vehicleMake',
    'coverageType'
];

export const FormFields = ({ formData, handleFieldChange, errors, vehMakes, vehModels }) => {
    return (
        <>
            <div className="inner-form-subheading">
                <h5><ShieldCheck size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Demande de Nouvelle Assurance OAVCT</h5>
            </div>
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Compagnie d'assurance <span className="required-mark">*</span></label>
                <select className="pro-select" value={formData.insuranceCompany} onChange={e => handleFieldChange('insuranceCompany', e.target.value)}>
                    <option value="">Sélectionner Compagnie</option>
                    <option value="OAVCT">OAVCT (Principal)</option>
                    <option value="Alternative">Compagnie Alternative</option>
                </select>
            </div>

            <div className="pro-row">
                <div className="pro-field-group">
                    <label>N° Plaque <span className="required-mark">*</span></label>
                    <input type="text" className="pro-input" placeholder="ABC-000" value={formData.vehiclePlate} onChange={e => handleFieldChange('vehiclePlate', e.target.value)} />
                </div>
                <div className="pro-field-group">
                    <label>Type de couverture <span className="required-mark">*</span></label>
                    <select className="pro-select" value={formData.coverageType} onChange={e => handleFieldChange('coverageType', e.target.value)}>
                        <option value="">Sélectionner</option>
                        <option value="Tiers">Tiers (Obligatoire)</option>
                        <option value="Tous Risques">Tous Risques</option>
                    </select>
                </div>
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
        </>
    );
};
