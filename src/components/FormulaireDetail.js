import React from 'react';
import './FormulaireDetail.css';

const FormulaireDetail = ({ onClose }) => {
  return (
    <div className="formulaire-detail">
      {/* Header */}
      <div className="formulaire-header">
        <div className="header-info">
          <span className="dossier-number">Numero Dossier : AS21020003</span>
          <span className="status">Etat : En Analyse</span>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {/* Main Content */}
      <div className="formulaire-content">
        {/* Official Header */}
        <div className="official-header">
          <div className="coat-of-arms">
            <div className="haiti-emblem">🇭🇹</div>
            <div className="motto">L'UNION FAIT LA FORCE</div>
          </div>
          <div className="official-titles">
            <h1>RÉPUBLIQUE D'HAITI</h1>
            <h2>MINISTERE DE L'ÉCONOMIE ET DES FINANCES</h2>
            <h3>SOCIÉTÉ DE L'IMMATRICULATION ET DE L'ASSURANCE AUTOMOBILE EN HAÏTI</h3>
          </div>
          <div className="document-title">
            <h2>Certificat de Souscription a une Nouvelle Assurance</h2>
          </div>
        </div>

        {/* Titulaire Section */}
        <div className="section">
          <div className="section-header">
            <h3>Titulaire</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>NIF</label>
              <input type="text" value="096-002-156-1" readOnly />
            </div>
            <div className="form-group">
              <label>Telephone</label>
              <div className="phone-inputs">
                <input type="text" value="+509" readOnly />
                <input type="text" value="48607457" readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="section">
          <div className="form-grid">
            <div className="form-group">
              <label>Nom</label>
              <input type="text" value="Dieudonne" readOnly />
            </div>
            <div className="form-group">
              <label>Prenom</label>
              <input type="text" value="Sarah" readOnly />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value="sarai.dieudonne@uniq.edu" readOnly />
            </div>
            <div className="form-group">
              <label>Date de Naissance</label>
              <div className="date-inputs">
                <input type="text" value="06" readOnly />
                <input type="text" value="11" readOnly />
                <input type="text" value="2001" readOnly />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Adresse</label>
              <input type="text" value="Fontamara 43 rue sassine # 156" readOnly />
            </div>
            <div className="form-group">
              <label>Sexe</label>
              <input type="text" value="Female" readOnly />
            </div>
            <div className="form-group">
              <label>Lieu de Naissance</label>
              <div className="birth-place-inputs">
                <input type="text" value="Carrefour" readOnly />
                <input type="text" value="Port-au-Prince" readOnly />
                <input type="text" value="Haïti" readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Section */}
        <div className="section">
          <div className="section-header">
            <h3>Vehicule</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Numero de Chassis</label>
              <input type="text" value="1HGCM82633A004352" readOnly />
            </div>
            <div className="form-group">
              <label>Marque du Vehicule</label>
              <input type="text" value="Toyota" readOnly />
            </div>
            <div className="form-group">
              <label>Modele du Vehicule</label>
              <input type="text" value="Toyota Land Cruiser" readOnly />
            </div>
            <div className="form-group">
              <label>Type de Vehicule</label>
              <input type="text" value="Voiture" readOnly />
            </div>
            <div className="form-group">
              <label>Couleur du Vehicule</label>
              <input type="text" value="Noir (e)" readOnly />
            </div>
            <div className="form-group">
              <label>Poids total Autorise en charge (Camion)</label>
              <input type="text" value="3 100 kg" readOnly />
            </div>
            <div className="form-group">
              <label>Usage du Vehicule</label>
              <input type="text" value="Privé" readOnly />
            </div>
            <div className="form-group">
              <label>Annee de Fabrication</label>
              <input type="text" value="2023" readOnly />
            </div>
            <div className="form-group">
              <label>Type de Carburant</label>
              <input type="text" value="Gazoline" readOnly />
            </div>
            <div className="form-group">
              <label>Nombre de passagers</label>
              <input type="text" value="8" readOnly />
            </div>
          </div>
        </div>

        {/* Contractual Information */}
        <div className="section">
          <div className="section-header">
            <h3>Informations Contractuelles</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Categorie de Licence</label>
              <input type="text" value="Responsabilite Civile" readOnly />
            </div>
            <div className="form-group">
              <label>Type de Transmission</label>
              <input type="text" value="1 an" readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaireDetail;
