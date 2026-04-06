import React from 'react';
import { CreditCard, FileText, AlertCircle } from 'lucide-react';

export const labels = {
    ticketNumber: 'Numéro de Contravention',
    infractionDate: 'Date de l\'infraction',
    infractionType: 'Type d\'infraction',
    penaltyAmount: 'Montant de l\'amende'
};

export const required = [
    'ticketNumber', 
    'infractionDate', 
    'infractionType'
];

export const FormFields = ({ formData, handleFieldChange, errors }) => {
    return (
        <>
            <div className="inner-form-subheading">
                <h5><CreditCard size={18} style={{ marginBottom: '-4px', marginRight: '8px' }} /> Paiement de Contravention</h5>
            </div>
            <div className="pro-field-group" style={{ marginTop: '15px' }}>
                <label>Numéro du procès-verbal (PV) <span className="required-mark">*</span></label>
                <input type="text" className="pro-input" placeholder="PV-00-00000" value={formData.ticketNumber} onChange={e => handleFieldChange('ticketNumber', e.target.value)} />
                {errors.ticketNumber && <div className="field-error-msg"><AlertCircle size={14} /> {errors.ticketNumber}</div>}
            </div>

            <div className="pro-row">
                <div className="pro-field-group">
                    <label>Date de l'infraction <span className="required-mark">*</span></label>
                    <input type="date" className="pro-input" value={formData.infractionDate} onChange={e => handleFieldChange('infractionDate', e.target.value)} />
                </div>
                <div className="pro-field-group">
                    <label>Type d'infraction <span className="required-mark">*</span></label>
                    <select className="pro-select" value={formData.infractionType} onChange={e => handleFieldChange('infractionType', e.target.value)}>
                        <option value="">Sélectionner Infraction</option>
                        <option value="Excès de vitesse">Excès de vitesse</option>
                        <option value="Brûlage de feu">Brûlage de feu rouge</option>
                        <option value="Stationnement interdit">Stationnement interdit</option>
                        <option value="Sens interdit">Sens interdit</option>
                    </select>
                </div>
            </div>

            <p className="form-info-msg" style={{ fontSize: '13px', color: '#1a365d', background: '#ebf4ff', padding: '15px', borderRadius: '10px', marginTop: '15px', border: '1px solid #d1e9ff' }}>
                <FileText size={16} /> <strong>Note :</strong> Le montant de l'amende sera calculé automatiquement sur la base du type d'infraction déclaré et vérifié par nos services.
            </p>
        </>
    );
};
