import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown,
  ArrowRight, Info, CheckCircle2, Shield, FileText,
  Calendar, CreditCard, UserPlus, RefreshCw, AlertTriangle,
  Settings, Eye, XCircle, Car, Plus, FileEdit, Tag
} from 'lucide-react';
import './SidebarContent.css';
import RequestAnalysis from './AnalysisPanel';
import MesVehicules from './MesVehicules';
import MonPermis from './MonPermis';
import PriseRendezVous from './PriseRendezVous';

/* -----------------------------------------------------------------------
 * Explicit map: section-id → parent category
 * This is the single source of truth for routing scroll ↔ sidebar focus
 * ---------------------------------------------------------------------- */
const SECTION_CATEGORY_MAP = {
  'guide-immatriculation': 'immatriculation',
  'nouvelle-immatriculation': 'immatriculation',
  'renouvellement-plaque': 'immatriculation',
  'transfert-vehicule': 'immatriculation',
  'remplacement-plaque': 'immatriculation',

  'mes-vehicules': 'mes-vehicules', // New top-level category

  'guide-permis': 'permis',
  'mon-permis': 'permis',
  'nouvelle-demande-permis': 'permis',
  'remplacer-permis': 'permis',
  'renouveler-permis': 'permis',
  'corriger-permis': 'permis',

  'guide-assurance': 'assurance',
  'nouvelle-assurance': 'assurance',
  'renouvellement-assurance': 'assurance',

  'guide-contraventions': 'contraventions',
  'liste-contraventions': 'contraventions',
  'paiement-contravention': 'contraventions',

  'rendez-vous': 'rendez-vous',
  'settings': 'settings'
};

const SidebarContent = ({ selectedContent, onSectionChange }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const scrollLock = useRef(false);   // TRUE while we are auto-scrolling
  const prevCatRef = useRef(null);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [dbServices, setDbServices] = useState([]);
  const mockRequests = [
    { id: 'LI21020002', name: 'Sarah Dieudonne', type: 'Permis de Conduire', date: '16/09/2025', status: 'processing' }
  ];

  // Accordion state for main modules (expanded by default)
  const [accordionOpen, setAccordionOpen] = useState({
    immatriculation: true,
    mesVehicules: true,
    permis: true,
    assurance: true,
  });

  const toggleAccordion = (key) => {
    setAccordionOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const h = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    fetch('/api/requests/services', { headers: h })
      .then(r => r.json())
      .then(data => { if (data.status === 'success') setDbServices(data.data); })
      .catch(err => console.error('Error fetching services in sidebar:', err));
  }, []);

  const currentCategory = SECTION_CATEGORY_MAP[selectedContent] || 'immatriculation';

  /* -----------------------------------------------
   * 1. Build the IntersectionObserver ONCE
   *    Only fires while scrollLock is false
   * --------------------------------------------- */
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (scrollLock.current) return;           // ignore during programmatic scroll
        let best = null;
        let bestRatio = 0;
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = entry.target.id;
          }
        });
        if (best) onSectionChange(best);
      },
      {
        root: containerRef.current,
        rootMargin: '0px 0px -60% 0px',  // section is "active" when its top 40% is visible
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [onSectionChange]);

  /* -----------------------------------------------
   * 2. Re-attach observer when category changes
   *    (new DOM nodes rendered)
   * --------------------------------------------- */
  useEffect(() => {
    if (!observerRef.current || !containerRef.current) return;
    observerRef.current.disconnect();
    // Small delay so React has rendered new elements
    const t = setTimeout(() => {
      const sections = containerRef.current?.querySelectorAll('.sc-nav');
      sections?.forEach(s => observerRef.current?.observe(s));
    }, 50);
    return () => clearTimeout(t);
  }, [currentCategory]);

  /* -----------------------------------------------
   * 3. Scroll to the target section whenever
   *    selectedContent changes (sidebar click)
   * --------------------------------------------- */
  useEffect(() => {
    if (!selectedContent) return;

    const newCat = SECTION_CATEGORY_MAP[selectedContent] || 'immatriculation';
    const prevCat = prevCatRef.current;
    prevCatRef.current = newCat;

    const doScroll = () => {
      const el = document.getElementById(selectedContent);
      if (!el || !containerRef.current) return;
      scrollLock.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { scrollLock.current = false; }, 900);
    };

    if (newCat !== prevCat) {
      // Cross-category: reset scroll, wait for render, then scroll to section
      if (containerRef.current) containerRef.current.scrollTop = 0;
      const t = setTimeout(doScroll, 80);
      return () => clearTimeout(t);
    } else {
      // Same category: scroll directly
      doScroll();
    }
  }, [selectedContent]);

  /* -----------------------------------------------
   * Shared helpers
   * --------------------------------------------- */
  const ActionButton = ({ label, path }) => (
    <button className="action-button" onClick={() => navigate(path)}>
      {label} <ArrowRight size={16} />
    </button>
  );

  /* SectionCard — adds sc-nav class for the observer
   * and active-focus class when this section is active  */
  const SectionCard = ({ id, icon: Icon, title, children }) => {
    const isActive = selectedContent === id;
    return (
      <div
        id={id}
        className={`content-section sc-nav ${isActive ? 'active-focus' : ''}`}
      >
        <div className="section-header-icon"><Icon size={28} color={isActive ? '#1d4ed8' : '#3b82f6'} /></div>
        <h2>{title}</h2>
        {children}
      </div>
    );
  };

  /**
   * PriceAndDocs component:
   * Finds the service/operation based on id and displays its price and documents from the DB.
   */
  const PriceAndDocs = ({ sectionId }) => {
    if (!dbServices || dbServices.length === 0) return null;

    // Helper to find operation by keywords in name
    const findOp = (keywords, serviceNameKeyword) => {
      const svc = dbServices.find(s => s.name.toLowerCase().includes(serviceNameKeyword.toLowerCase()));
      if (!svc || !svc.operations) return null;
      return svc.operations.find(op => keywords.some(k => op.name.toLowerCase().includes(k.toLowerCase())));
    };

    let op = null;
    // Direct mapping for each sectionId to operation keywords
    if (sectionId === 'nouvelle-immatriculation') op = findOp(['Immatriculer'], 'Immatriculation');
    else if (sectionId === 'renouvellement-plaque') op = findOp(['Renouveler'], 'Immatriculation');
    else if (sectionId === 'transfert-vehicule') op = findOp(['Transférer'], 'Immatriculation');
    else if (sectionId === 'remplacement-plaque') op = findOp(['Remplacer'], 'Immatriculation');
    else if (sectionId === 'nouvelle-demande-permis') op = findOp(['Nouveau'], 'Permis de conduire');
    else if (sectionId === 'remplacer-permis') op = findOp(['Remplacer'], 'Permis de conduire');
    else if (sectionId === 'renouveler-permis') op = findOp(['Renouveler un permis de conduire'], 'Permis de conduire');
    else if (sectionId === 'corriger-permis') op = findOp(['Corriger'], 'Permis de conduire');
    else if (sectionId === 'nouvelle-assurance') op = findOp(['Demande'], 'Assurance');
    else if (sectionId === 'renouvellement-assurance') op = findOp(['Renouveler'], 'Assurance');
    else if (sectionId === 'paiement-contravention') op = findOp(['Payer'], 'Contraventions');

    if (!op) return null;

    return (
      <div className="op-summary-db">
        <div className="op-summary-grid">
          {/* Left Column: Description */}
          <div className="op-summary-left">
            <div className="summary-title-db">
              <Info size={16} /> Détails et procédures
            </div>
            <div className="op-description-db" dangerouslySetInnerHTML={{ __html: op.description || '<p style="color: #94a3b8; font-style: italic;">La procédure détaillée pour ce service sera bientôt disponible.</p>' }} />
          </div>

          {/* Right Column: Pricing and Docs */}
          <div className="op-summary-right">
            <div className="price-tag-db">
              <CreditCard size={18} />
              <div className="price-info-db">
                <span className="price-label-db">Frais du service</span>
                <strong className="price-value-db">{Number(op.price || 0).toLocaleString()} HTG</strong>
              </div>
            </div>

            {op.required_documents && op.required_documents.length > 0 && (
              <div className="docs-db">
                <h4><FileText size={18} /> Documents requis</h4>
                <ul>
                  {op.required_documents.map((d, i) => (
                    <li key={i}>{typeof d === 'string' ? d : d.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* -----------------------------------------------
   * Category content blocks
   * --------------------------------------------- */

  // ─── Immatriculation ───────────────────────────
  const ImmatriculationContent = () => (
    <div className="category-group">
      <SectionCard id="guide-immatriculation" icon={Info} title="Guide d'Immatriculation">
        <p>Bienvenue dans le guide complet de l'immatriculation. Enregistrez un nouveau véhicule, renouvelez votre plaque, ou gérez les transferts de propriété.</p>
        <div className="operation-detail">
          <h3>Procédure générale</h3>
          <div className="procedure-steps">
            <div className="step"><div className="step-number">1</div><div className="step-content">Saisie des informations du véhicule et du propriétaire.</div></div>
            <div className="step"><div className="step-number">2</div><div className="step-content">Téléchargement des pièces justificatives.</div></div>
            <div className="step"><div className="step-number">3</div><div className="step-content">Paiement des taxes et frais administratifs.</div></div>
            <div className="step"><div className="step-number">4</div><div className="step-content">Validation et remise de la plaque physique.</div></div>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="nouvelle-immatriculation" icon={CheckCircle2} title="Immatriculer un véhicule">
        <div className="operation-detail">
          <h3>Demande Initiale</h3>
          <PriceAndDocs sectionId="nouvelle-immatriculation" />
          <ActionButton label="Démarrer maintenant" path="/user/nouvelle-demande?type=immatriculation&op=immatriculer" />
        </div>
      </SectionCard>

      <SectionCard id="renouvellement-plaque" icon={RefreshCw} title="Renouveler une plaque d'immatriculation">
        <div className="operation-detail">
          <PriceAndDocs sectionId="renouvellement-plaque" />
          <ActionButton label="Renouveler la plaque" path="/user/nouvelle-demande?type=immatriculation&op=renouveler" />
        </div>
      </SectionCard>

      <SectionCard id="transfert-vehicule" icon={UserPlus} title="Transférer un Véhicule">
        <div className="operation-detail">
          <PriceAndDocs sectionId="transfert-vehicule" />
          <ActionButton label="Transférer maintenant" path="/user/nouvelle-demande?type=immatriculation&op=transferer" />
        </div>
      </SectionCard>

      <SectionCard id="remplacement-plaque" icon={AlertTriangle} title="Remplacer une Plaque">
        <div className="operation-detail">
          <PriceAndDocs sectionId="remplacement-plaque" />
          <ActionButton label="Remplacer maintenant" path="/user/nouvelle-demande?type=immatriculation&op=remplacer" />
        </div>
      </SectionCard>
    </div>
  );

  // ─── Permis de Conduire ────────────────────────
  const PermisContent = () => (
    <div className="category-group">
      <SectionCard id="guide-permis" icon={Info} title="Guide du Permis de Conduire">
        <p>Bienvenue dans l'espace dédié au permis de conduire. Cette section vous guide à travers toutes les étapes pour obtenir, renouveler ou corriger votre permis.</p>
        <div className="operation-detail">
          <h3>Procédure de Demande</h3>
          <div className="procedure-steps">
            <div className="step"><div className="step-number">1</div><div className="step-content">Saisie des informations personnelles et d'identification.</div></div>
            <div className="step"><div className="step-number">2</div><div className="step-content">Choix de l'opération (Nouveau, Renouvellement, etc.).</div></div>
            <div className="step"><div className="step-number">3</div><div className="step-content">Paiement et validation finale du dossier.</div></div>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="nouvelle-demande-permis" icon={Plus} title="Nouveau permis de conduire">
        <div className="operation-detail">
          <PriceAndDocs sectionId="nouvelle-demande-permis" />
          <ActionButton label="Démarrer la demande" path="/user/nouvelle-demande?type=permis&op=nouveau" />
        </div>
      </SectionCard>

      <SectionCard id="remplacer-permis" icon={AlertTriangle} title="Remplacer un permis de conduire">
        <div className="operation-detail">
          <PriceAndDocs sectionId="remplacer-permis" />
          <ActionButton label="Demander un remplacement" path="/user/nouvelle-demande?type=permis&op=remplacer" />
        </div>
      </SectionCard>
      <SectionCard id="renouveler-permis" icon={RefreshCw} title="Renouveler un permis de conduire">
        <div className="operation-detail">
          <PriceAndDocs sectionId="renouveler-permis" />
          <ActionButton label="Renouveler maintenant" path="/user/nouvelle-demande?type=permis&op=renouveler" />
        </div>
      </SectionCard>

      <SectionCard id="corriger-permis" icon={FileEdit} title="Corriger un permis de conduire">
        <div className="operation-detail">
          <PriceAndDocs sectionId="corriger-permis" />
          <ActionButton label="Demander une correction" path="/user/nouvelle-demande?type=permis&op=corriger" />
        </div>
      </SectionCard>

      <SectionCard id="mon-permis" icon={CreditCard} title="Mon Permis">
        <MonPermis />
      </SectionCard>
    </div>
  );


  // ─── Assurance ─────────────────────────────────
  const AssuranceContent = () => (
    <div className="category-group">
      <SectionCard id="guide-assurance" icon={Shield} title="Guide de l'Assurance OAVCT">
        <p>Gérez vos polices d'assurance OAVCT. L'assurance est obligatoire pour tout véhicule circulant sur le territoire haïtien.</p>
        <div className="operation-detail">
          <h3>Couverture OAVCT</h3>
          <div className="procedure-steps">
            <div className="step"><div className="step-number">1</div><div className="step-content">Responsabilité civile envers les tiers.</div></div>
            <div className="step"><div className="step-number">2</div><div className="step-content">Dommages corporels suite à un accident.</div></div>
            <div className="step"><div className="step-number">3</div><div className="step-content">Dommages matériels (selon formule choisie).</div></div>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="nouvelle-assurance" icon={CheckCircle2} title="Faire une Demande d'Assurance">
        <div className="operation-detail">
          <PriceAndDocs sectionId="nouvelle-assurance" />
          <ActionButton label="Souscrire" path="/user/nouvelle-demande?type=assurance&op=nouvelle" />
        </div>
      </SectionCard>

      <SectionCard id="renouvellement-assurance" icon={RefreshCw} title="Renouveler une Assurance">
        <div className="operation-detail">
          <PriceAndDocs sectionId="renouvellement-assurance" />
          <ActionButton label="Renouveler Contrat" path="/user/nouvelle-demande?type=assurance&op=renouveler" />
        </div>
      </SectionCard>
    </div>
  );

  // ─── Contraventions ────────────────────────────
  const ContraventionsContent = () => (
    <div className="category-group">
      <SectionCard id="guide-contraventions" icon={Info} title="Guide des Contraventions">
        <p>Consultez et réglez vos infractions routières en ligne. Évitez les pénalités supplémentaires en payant dans les délais.</p>
        <div className="operation-detail">
          <h3>Types d'infractions courantes</h3>
          <div className="procedure-steps">
            <div className="step"><div className="step-number">⚠</div><div className="step-content">Excès de vitesse — amende variable.</div></div>
            <div className="step"><div className="step-number">⚠</div><div className="step-content">Non-respect des feux — amende fixe.</div></div>
            <div className="step"><div className="step-number">⚠</div><div className="step-content">Conduite sans permis — amende majorée.</div></div>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="liste-contraventions" icon={FileText} title="Voir Mes Contraventions">
        <div className="operation-detail">
          <div className="empty-state">
            <CheckCircle2 size={48} color="#10b981" />
            <h3>Dossier vierge</h3>
            <p>Aucune contravention en attente. Continuez à conduire prudemment !</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="paiement-contravention" icon={CreditCard} title="Payer une Contravention">
        <div className="operation-detail">
          <PriceAndDocs sectionId="paiement-contravention" />
          <ActionButton label="Payer Maintenant" path="/user/nouvelle-demande?type=contravention&op=payer" />
        </div>
      </SectionCard>
    </div>
  );

  /* -----------------------------------------------
   * Render the correct content block
   * --------------------------------------------- */
  const renderContent = () => {
    if (showAnalysis) {
      return <RequestAnalysis onBack={() => setShowAnalysis(false)} />;
    }
    switch (currentCategory) {
      case 'immatriculation':
        return (
          <div className="sidebar-accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('immatriculation')}>
              <h3>Immatriculation</h3>
              <ChevronDown className={accordionOpen.immatriculation ? 'rotate-180' : ''} size={16} />
            </div>
            {accordionOpen.immatriculation && <ImmatriculationContent />}
          </div>
        );
      case 'mes-vehicules':
        return (
          <div className="sidebar-accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('mesVehicules')}>
              <h3>Mes Véhicules</h3>
              <ChevronDown className={accordionOpen.mesVehicules ? 'rotate-180' : ''} size={16} />
            </div>
            {accordionOpen.mesVehicules && <MesVehicules />}
          </div>
        );
      case 'permis':
        return (
          <div className="sidebar-accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('permis')}>
              <h3>Permis de Conduire</h3>
              <ChevronDown className={accordionOpen.permis ? 'rotate-180' : ''} size={16} />
            </div>
            {accordionOpen.permis && <PermisContent />}
          </div>
        );
      case 'assurance':
        return (
          <div className="sidebar-accordion">
            <div className="accordion-header" onClick={() => toggleAccordion('assurance')}>
              <h3>Assurance</h3>
              <ChevronDown className={accordionOpen.assurance ? 'rotate-180' : ''} size={16} />
            </div>
            {accordionOpen.assurance && <AssuranceContent />}
          </div>
        );
      case 'contraventions': return <ContraventionsContent />;
      case 'rendez-vous':
        return (
          <div className="category-group">
            <PriseRendezVous onBack={() => onSectionChange('guide-immatriculation')} />
          </div>
        );
      case 'settings':
        return (
          <div className="category-group">
            <div id="settings" className={`content-section sc-nav ${selectedContent === 'settings' ? 'active-focus' : ''}`}>
              <div className="section-header-icon"><Settings size={28} color={selectedContent === 'settings' ? '#1d4ed8' : '#3b82f6'} /></div>
              <h2>Paramètres du Compte</h2>
              <p>Gérez vos informations personnelles, votre mot de passe et vos préférences de notification.</p>
              <ActionButton label="Gérer Profil" path="/user/profile" />
            </div>
          </div>
        );
      default:
        return <ImmatriculationContent />;
    }
  };

  return (
    <div className="sidebar-content-scrollable" ref={containerRef}>
      {renderContent()}
    </div>
  );
};

export default SidebarContent;
