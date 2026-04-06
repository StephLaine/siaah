import React from 'react';
import {
  Linkedin,
  Facebook,
  Twitter,
  Mail,
  Phone,
  BookOpen,
  MapPin,
  AlertTriangle,
  Truck,
  ExternalLink,
  Search,
  ArrowRight,
  Menu
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './MainContent.css';

const MainContent = () => {
  const { user } = useAuth();
  const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : null;

  const accidents = [
    {
      id: 1,
      title: "Accident grave sur la RN2",
      location: "Carrefour Dufort",
      description: "Collision entre un véhicule utilitaire et une voiture, plusieurs blessés",
      time: "Il y a 2 heures"
    },
    {
      id: 2,
      title: "Grave accident à Port-au-Prince",
      description: "Trois blessés, circulation paralysée",
      time: "Depuis 9 jours"
    },
    {
      id: 3,
      title: "Grave accident sur la RN3",
      location: "Près de Mirebalais",
      date: "14 janvier 2025",
      description: "Collision entre un camion et deux voitures, plusieurs blessés dont un piéton. Cause: route glissante"
    }
  ];

  return (
    <main className="main-content">
      {/* Organization Info Section */}
      <div className="org-info">
        <div className="org-left">
          <img src="/haiti-coat-of-arms.png" alt="Coat of Arms" className="haiti-coat-of-arms-small" />
          <span className="haiti-text">République d'Haïti</span>
        </div>
        <div className="org-center">
          <div className="org-name">
            Ministère des Travaux Publics, Transports et Communications
          </div>
          <div className="org-subtitle">
            Société de l'Immatriculation et de l'Assurance Automobile en Haïti (SIAAH)
          </div>
        </div>
        <div className="org-right">
          <div className="social-icons">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Linkedin size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Facebook size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Twitter size={18} />
            </a>
            <a href="mailto:contact@siaah.gouv.ht" className="social-icon">
              <Mail size={18} />
            </a>
            <a href="tel:+50912345678" className="social-icon">
              <Phone size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Bienvenue, <span className="highlight-name">{userName || 'Citoyen'}</span></h1>
          <p>Voici l'état actuel de la sécurité routière et des services de transport en Haïti.</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {/* Left Box - Code de la route (25% width) */}
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

        {/* Center Box - Station de Services (25% width) */}
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

        {/* Right Box - Accident Routier (50% width, spans both rows) */}
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

        {/* Transport Ministry Card */}
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
    </main>
  );
};

export default MainContent;
