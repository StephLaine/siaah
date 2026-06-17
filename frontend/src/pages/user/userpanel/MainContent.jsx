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
import MobileExtraAccordion from './MobileExtraAccordion';

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
            <img src="file:///C:/Users/teach/.gemini/antigravity-ide/brain/33e9d054-6ffa-437c-bfce-7922b3d48ba9/lego_icon_1781696739369.png" alt="LEGO" className="lego-icon" style={{ width: '48px', height: '48px', marginRight: '8px' }} />
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

      <MobileExtraAccordion />
    </main>
  );
};

export default MainContent;
