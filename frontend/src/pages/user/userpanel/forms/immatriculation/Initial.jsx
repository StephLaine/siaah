import React from 'react';
import { Car, AlertCircle } from 'lucide-react';

export const labels = {
    vehicleMake: 'Marque',
    vehicleModel: 'Modèle',
    vehicleYear: 'Année de fabrication',
    vehicleColor: 'Couleur',
    vehicleType: 'Type de véhicule',
    chassisNumber: 'Numéro de châssis',
    engineNumber: 'Numéro du moteur',
    seatsCount: 'Nombre de places',
    fuelType: 'Type de carburant'
};

export const required = [
    'vehicleMake', 
    'vehicleModel', 
    'vehicleYear', 
    'vehicleColor', 
    'vehicleType', 
    'chassisNumber', 
    'engineNumber', 
    'seatsCount', 
    'fuelType'
];

export const FormFields = ({ formData, handleFieldChange, errors, vehMakes, vehModels, vehColors }) => {
    return (
        <>
            <div className="inner-form-subheading">
                <h5><Car size={18} style={{ marginBottom: '-3px', marginRight: '8px' }} /> Informations sur le véhicule</h5>
            </div>
            <div className="pro-row">
                <div className="pro-field-group" id="field-vehicleMake">
                    <label>Marque <span className="required-mark">*</span></label>
                    <select className={`pro-select ${errors.vehicleMake ? 'has-error' : ''}`} value={formData.vehicleMake} onChange={e => {
                        handleFieldChange('vehicleMake', e.target.value);
                        handleFieldChange('vehicleModel', ''); // reset model
                    }}>
                        <option value="">Sélectionner</option>
                        {(vehMakes || []).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                </div>
                <div className="pro-field-group" id="field-vehicleModel">
                    <label>Modèle <span className="required-mark">*</span></label>
                    <select className={`pro-select ${errors.vehicleModel ? 'has-error' : ''}`} value={formData.vehicleModel} onChange={e => handleFieldChange('vehicleModel', e.target.value)}>
                        <option value="">Sélectionner</option>
                        {(vehModels || [])
                            .filter(m => !formData.vehicleMake || (vehMakes.find(mak => mak.name === formData.vehicleMake)?.id === m.make_id))
                            .map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="pro-row">
                <div className="pro-field-group" id="field-vehicleYear">
                    <label>Année <span className="required-mark">*</span></label>
                    <input type="number" className={`pro-input ${errors.vehicleYear ? 'has-error' : ''}`} value={formData.vehicleYear} onChange={e => handleFieldChange('vehicleYear', e.target.value)} placeholder="Ex: 2022" />
                </div>
                <div className="pro-field-group" id="field-vehicleColor">
                    <label>Couleur <span className="required-mark">*</span></label>
                    <select className={`pro-select ${errors.vehicleColor ? 'has-error' : ''}`} value={formData.vehicleColor} onChange={e => handleFieldChange('vehicleColor', e.target.value)}>
                        <option value="">Sélectionner</option>
                        {(vehColors || []).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="pro-row">
                <div className="pro-field-group" id="field-vehicleType">
                    <label>Type de véhicule <span className="required-mark">*</span></label>
                    <select className="pro-select" value={formData.vehicleType} onChange={e => handleFieldChange('vehicleType', e.target.value)}>
                        <option value="">Sélectionner</option>
                        {['Privé', 'Public', 'Transport de Marchandises', 'Moto', 'Autre'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="pro-field-group" id="field-chassisNumber">
                    <label>N° Châssis (VIN) <span className="required-mark">*</span></label>
                    <input type="text" className="pro-input" value={formData.chassisNumber} onChange={e => handleFieldChange('chassisNumber', e.target.value)} />
                </div>
            </div>
            <div className="pro-row">
                <div className="pro-field-group" id="field-engineNumber">
                    <label>N° Moteur <span className="required-mark">*</span></label>
                    <input type="text" className="pro-input" value={formData.engineNumber} onChange={e => handleFieldChange('engineNumber', e.target.value)} />
                </div>
                <div className="pro-field-group" id="field-fuelType">
                    <label>Carburant <span className="required-mark">*</span></label>
                    <select className="pro-select" value={formData.fuelType} onChange={e => handleFieldChange('fuelType', e.target.value)}>
                        <option value="">Sélectionner</option>
                        {['Essence', 'Diesel', 'Hybride', 'Electrique'].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>
            <div className="pro-field-group" id="field-seatsCount" style={{ width: '50%' }}>
                <label>Nombre de places <span className="required-mark">*</span></label>
                <input type="number" className="pro-input" value={formData.seatsCount} onChange={e => handleFieldChange('seatsCount', e.target.value)} />
            </div>
        </>
    );
};
