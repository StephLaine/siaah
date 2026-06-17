import React, { useState } from 'react';
import {
  BookOpen,
  MapPin,
  AlertTriangle,
  Truck,
  ArrowRight,
  Search,
  ExternalLink,
  ChevronDown,
  Menu
} from 'lucide-react';
import './MainContent.css';

/**
 * MobileExtraAccordion – renders the four cards (Road Code, Service Station,
 * Accident, Transport) as separate collapsible accordions on mobile devices.
 * On desktop, they display automatically as a unified grid.
 */
const MobileExtraAccordion = () => {
  const [openSections, setOpenSections] = useState({
    roadCode: false,
    serviceStation: false,
    accidents: false,
    transport: false,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="mobile-extra-container">
      {/* 1. Code de la Route Accordion */}
      <div className={`accordion-card-wrapper road-code-wrapper ${openSections.roadCode ? 'is-open' : ''}`}>
        <button className="accordion-card-header" onClick={() => toggleSection('roadCode')}>
          <div className="accordion-header-left">
            <BookOpen size={20} className="accordion-icon-left" />
            <span>Code de la route</span>
          </div>
          <ChevronDown className="accordion-chevron" size={16} />
        </button>
        <div className="accordion-card-body">
          <div className="card road-code-card">
            <div className="card-header">
              <h3>Code de la route</h3>
              <span className="card-icon-header"><BookOpen size={20} /></span>
            </div>
            <div className="card-content">
              <p>
                <strong>Article R221-4:</strong><br />
                <strong>Catégorie B :</strong> Véhicules dont le poids total autorisé en charge (PTAC)
                n'excède pas 3,5 tonnes, affectés au transport de personnes et comportant, outre le siège
                du conducteur, huit places assises au maximum, ou affectés au transport de marchandises.
                La catégorie B autorise à conduire un ensemble constitué d'un véhicule tracteur de la
                catégorie B et d'une remorque dont le PTAC n'excède pas 750 kilogrammes.
              </p>
            </div>
            <div className="card-btn-footer">
              <button className="small-action-btn">Voir détails <ArrowRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Station de Services Accordion */}
      <div className={`accordion-card-wrapper service-station-wrapper ${openSections.serviceStation ? 'is-open' : ''}`}>
        <button className="accordion-card-header" onClick={() => toggleSection('serviceStation')}>
          <div className="accordion-header-left">
            <MapPin size={20} className="accordion-icon-left" />
            <span>Station de Services</span>
          </div>
          <ChevronDown className="accordion-chevron" size={16} />
        </button>
        <div className="accordion-card-body">
          <div className="card service-station-card">
            <div className="card-header">
              <h3>Station de Services</h3>
              <span className="card-icon-header"><MapPin size={20} /></span>
            </div>
            <div className="card-content">
              <div className="map-container">
                <div className="map-pin station-pin">
                  <MapPin size={14} /> Station de service
                </div>
                <div className="map-pin user-pin">
                  <MapPin size={14} /> Votre Position
                </div>
              </div>
            </div>
            <div className="card-btn-footer">
              <button className="small-action-btn">Rechercher <Search size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Accident Routier Accordion */}
      <div className={`accordion-card-wrapper accidents-wrapper ${openSections.accidents ? 'is-open' : ''}`}>
        <button className="accordion-card-header" onClick={() => toggleSection('accidents')}>
          <div className="accordion-header-left">
            <AlertTriangle size={20} className="accordion-icon-left" />
            <span>Accident Routier</span>
          </div>
          <ChevronDown className="accordion-chevron" size={16} />
        </button>
        <div className="accordion-card-body">
          <div className="card accidents-card">
            <div className="card-header">
              <h3>Accident Routier</h3>
              <div className="accident-header-right">
                <span className="accident-icon"><AlertTriangle size={20} /></span>
                <span className="hamburger-menu"><Menu size={16} /></span>
              </div>
            </div>
            <div className="card-content">
              <div className="accidents-list">
                <div className="accident-item">
                  <div className="accident-description">
                    <strong>Grave accident sur la route nationale numéro 2, près de Carrefour Dufort :</strong>
                    Un véhicule utilitaire et une voiture sont entrés en collision frontale en raison d'une chaussée glissante.
                    Le conducteur du véhicule utilitaire a été grièvement blessé et transporté à l'hôpital, tandis que les passagers
                    de la voiture ont également été blessés.
                  </div>
                </div>
                <div className="accident-item">
                  <div className="accident-description">
                    <strong>Grave accident à Port-au-Prince :</strong> Une collision frontale fait trois blessés et paralyse la circulation.
                  </div>
                  <div className="accident-time">Depuis 9 jours</div>
                </div>
                <div className="accident-item">
                  <div className="accident-description">
                    <strong>Grave accident sur la RN3 :</strong> plusieurs blessés [Mardi 14 janvier 2025] - Ce matin, un accident s'est produit
                    sur la Route Nationale 3, près de Mirebalais. Un camion et deux voitures sont entrés en collision, faisant un blessé grave
                    et trois blessés légers, dont un piéton. Les premières constatations attribuent l'accident à la chaussée glissante et à une...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Transport des biens et matériels Accordion */}
      <div className={`accordion-card-wrapper transport-wrapper ${openSections.transport ? 'is-open' : ''}`}>
        <button className="accordion-card-header" onClick={() => toggleSection('transport')}>
          <div className="accordion-header-left">
            <Truck size={20} className="accordion-icon-left" />
            <span>Transport des biens et matériels</span>
          </div>
          <ChevronDown className="accordion-chevron" size={16} />
        </button>
        <div className="accordion-card-body">
          <div className="card transport-card">
            <div className="card-header">
              <h3>Transport des biens et materiels</h3>
              <span className="card-icon-header"><Truck size={20} /></span>
            </div>
            <div className="card-content">
              <div className="transport-section">
                <h4>Ministère des Travaux Publics, Transport et Communications - République d'Haïti: Transports</h4>
                <h5>Les Transports</h5>
                <p>
                  Le transport est une fonction clé du Ministère des TPTC. Il englobe le transport
                  terrestre, aérien et maritime. Ces modes de transport doivent répondre aux besoins
                  fondamentaux de la population.
                </p>
                <h5>Etat des Lieux</h5>
                <p>
                  Les trois modes de transport (routier, maritime, aérien) doivent répondre de manière
                  adéquate aux besoins fondamentaux de la population.
                </p>
              </div>
            </div>
            <div className="card-btn-footer">
              <button className="small-action-btn">En savoir plus <ExternalLink size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileExtraAccordion;
