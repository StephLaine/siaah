import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
  Filter,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Download, FileEdit, Wallet, Smartphone, Globe, ArrowRight, Trash2 as TrashIcon, CheckCircle as CheckIcon
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './StatutDemandes.css';
import { generateAttestationPDF } from '../../../utils/generatePDF';
import AttestationTemplate from '../../../components/AttestationTemplate';

const StatutDemandes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeMobileFilter, setActiveMobileFilter] = useState(null); // 'type' | 'status' | 'date' | 'search'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [expandedSections, setExpandedSections] = useState({
    pending: true,
    validated: true,
    to_deliver: true,
    processing: false,
    completed: false,
    rejected: false,
    draft: false
  });

  const [paymentRequest, setPaymentRequest] = useState(null);
  const [showSuccess, setShowSuccess] = useState(null); // { type: 'delete' | 'payment', message: '' }
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Carte Bancaire');
  const [viewType, setViewType] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'type'

  const activeViewType = isMobile ? 'grid' : viewType;

  React.useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const result = await response.json();
        if (result.status === 'success') {
          setRequests(result.data);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
    // If navigated with openDrafts: true, expand that section
    if (location.state?.openDrafts) {
      setExpandedSections({
        pending: false,
        processing: false,
        completed: false,
        rejected: false,
        draft: true
      });
    }

    if (location.state?.openPayment) {
      setExpandedSections({
        pending: false,
        validated: true,
        processing: false,
        completed: false,
        rejected: false,
        draft: false
      });
      // Find the request and trigger payment modal if state.openPayment matches
      const reqToPay = requests.find(r => r.id === location.state.openPayment);
      if (reqToPay) setPaymentRequest(reqToPay);
    }

    // Parse URL query params
    const queryParams = new URLSearchParams(location.search);
    const urlType = queryParams.get('type');
    const urlStatus = queryParams.get('status');

    if (urlType) setFilterType(urlType);
    if (urlStatus) {
      setFilterStatus(urlStatus);
      setExpandedSections({
        ...expandedSections,
        pending: urlStatus === 'pending',
        validated: urlStatus === 'validated',
        processing: urlStatus === 'processing',
        completed: urlStatus === 'completed',
        rejected: urlStatus === 'rejected',
        draft: urlStatus === 'draft'
      });
    }
  }, [location.state, location.search, requests.length]);

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { label: 'En attente', color: '#f59e0b' };
      case 'processing': return { label: 'En cours', color: '#3b82f6' };
      case 'validated': return { label: 'À payer', color: '#10b981' };
      case 'to_deliver': return { label: 'À livrer', color: '#3b82f6' };
      case 'completed': return { label: 'Terminé', color: '#059669' };
      case 'rejected': return { label: 'Correction', color: '#ef4444' };
      case 'draft': return { label: 'Brouillon', color: '#64748b' };
      default: return { label: status, color: '#64748b' };
    }
  };

  const toggleAccordion = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredRequests = requests.filter(req => {
    const reqType = req.type || '';
    const reqStatus = req.status || '';
    const term = searchTerm.toLowerCase();
    const idStr = `REQ-${(req.id || 0).toString().padStart(3, '0')}`;
    const matchesSearch = idStr.toLowerCase().includes(term) || reqType.toLowerCase().includes(term);
    
    const matchesType = filterType === 'all' || reqType.toLowerCase().includes(filterType.toLowerCase());
    const matchesStatus = filterStatus === 'all' || reqStatus.toLowerCase() === filterStatus.toLowerCase();
    
    // Date Filtering
    const reqDate = new Date(req.created_at);
    let matchesDate = true;
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0,0,0,0);
      matchesDate = matchesDate && reqDate >= s;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23,59,59,999);
      matchesDate = matchesDate && reqDate <= e;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  }).sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'type') return (a.type || '').localeCompare(b.type || '');
    return 0;
  });

  const getRequestsByStatus = (status) => {
    return filteredRequests.filter(req => (req.status || '').toLowerCase() === status);
  };

  const sections = [
    { id: 'pending', title: 'Nouvelles demandes en attente', icon: <Clock size={18} />, color: '#f59e0b' },
    { id: 'validated', title: 'Demandes à payer (Validées)', icon: <CreditCard size={18} />, color: '#10b981' },
    { id: 'to_deliver', title: 'Demandes à livrer / Prêt', icon: <Download size={18} />, color: '#3b82f6' },
    { id: 'processing', title: 'Demandes en cours de traitement', icon: <RefreshCw size={18} />, color: '#3b82f6' },
    { id: 'completed', title: 'Demandes traitées', icon: <CheckCircle size={18} />, color: '#059669' },
    { id: 'rejected', title: 'Demandes refusées', icon: <AlertCircle size={18} />, color: '#ef4444' },
    { id: 'draft', title: 'Brouillons', icon: <FileEdit size={18} />, color: '#64748b' }
  ];

  const handleCancelRequest = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette demande ?")) {
      setIsProcessingAction(true);
      try {
        const response = await fetch(`/api/requests/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          setRequests(prev => prev.filter(r => r.id !== id));
          setShowSuccess({ type: 'delete', message: 'La demande a été supprimée avec succès.' });
        } else {
          alert("Erreur lors de la suppression.");
        }
      } catch (error) {
        console.error("Delete error:", error);
      } finally {
        setIsProcessingAction(false);
      }
    }
  };

  const handlePayRequest = async () => {
    if (!paymentRequest) return;
    setIsProcessingAction(true);
    
    // Map UI method names to backend expected keys
    let methodKey = 'moncash';
    if (paymentMethod === 'Carte Bancaire') methodKey = 'credit_card';
    if (paymentMethod === 'Mon Cash' || paymentMethod === 'MonCash') methodKey = 'moncash';
    
    if (paymentMethod === 'Virement' || paymentMethod === 'NatCash') {
      alert(`${paymentMethod} n'est pas encore disponible en ligne. Veuillez utiliser Mon Cash ou Carte Bancaire.`);
      setIsProcessingAction(false);
      return;
    }

    try {
      // Pre-open window synchronously to bypass browser popup blockers
      let paymentWindow = null;
      if (methodKey === 'moncash') {
        paymentWindow = window.open('about:blank', '_blank');
      }

      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ 
          requestId: paymentRequest.id, 
          amount: (paymentRequest.price !== null && paymentRequest.price !== undefined) ? paymentRequest.price : 2500, // Fallback if price missing
          method: methodKey 
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        if (methodKey === 'moncash') {
          // Navigate the pre-opened window to MonCash Sandbox URL
          if (paymentWindow) {
            paymentWindow.location.href = result.paymentUrl;
          } else {
            window.location.href = result.paymentUrl;
          }

          // Poll verify endpoint until completed
          const paymentId = result.paymentId || result.paymentUrl.match(/orderId=(\d+)/)?.[1];
          let attempts = 0;
          const maxAttempts = 60; // 3 minutes
          const pollInterval = setInterval(async () => {
            attempts++;
            try {
              const verifyRes = await fetch(`/api/payments/verify/${paymentId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success && verifyData.status === 'completed') {
                clearInterval(pollInterval);
                alert("✅ Paiement MonCash confirmé avec succès !");
                setShowPaymentModal(false);
                fetchUserRequests(); // Reload list
              }
            } catch (e) { /* ignore polling errors */ }
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              alert("Délai d'attente dépassé. Veuillez rafraîchir la page pour vérifier le statut de votre paiement.");
              setShowPaymentModal(false);
            }
          }, 3000);
        } else {
          window.location.href = result.paymentUrl;
        }
      } else {
        alert("Erreur lors de l'initiation du paiement : " + (result.message || "Erreur inconnue"));
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Une erreur est survenue lors de la connexion au service de paiement.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleResumeDraft = (req) => {
    navigate('/user/nouvelle-demande', { state: { draftId: req.id, type: req.type } });
  };

  const renderRequestCard = (req) => {
    const [service, operation] = (req.type || '').split(' - ');
    const statusInfo = getStatusInfo(req.status);
    
    return (
      <div key={req.id} className="request-card animate-fade-in">
        <div className="card-top">
          <span className="card-id">REQ-{req.id.toString().padStart(3, '0')}</span>
          <span className="status-pill" style={{ backgroundColor: statusInfo.color }}>
            {statusInfo.label}
          </span>
        </div>
        <div className="card-body">
          <h4>{service}</h4>
          <p className="op-name">{operation || '-'}</p>
          <div className="card-date-row" style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
            <Clock size={12} style={{ marginRight: '4px' }} />
            {new Date(req.created_at).toLocaleDateString('fr-FR')}
          </div>
        </div>
        <div className="card-meta">
          <span className="card-price">{(req.price !== null && req.price !== undefined) ? `${parseFloat(req.price).toLocaleString()} HTG` : '2,500 HTG'}</span>
          <span className={`status-pill-pay ${req.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
            {req.payment_status === 'paid' ? 'Payé' : 'Non Payé'}
          </span>
        </div>
        <div className="card-actions">
          <button className="btn-action-view" title="Voir les détails" onClick={() => setSelectedRequest(req)}>
            <Eye size={16} />
          </button>
          
          {req.payment_status !== 'paid' && (req.status === 'pending' || req.status === 'processing' || req.status === 'validated') && (
            <button className="btn-action-pay" onClick={() => setPaymentRequest(req)}>
              <CreditCard size={16} />
            </button>
          )}

          {req.status === 'draft' && (
            <button className="btn-action-edit" onClick={() => handleResumeDraft(req)}>
              <FileEdit size={16} />
            </button>
          )}

          {(req.status === 'pending' || req.status === 'draft') && (
            <button className="btn-action-cancel" onClick={() => handleCancelRequest(req.id)}>
              <Trash2 size={16} />
            </button>
          )}
          
          {req.payment_status === 'paid' && (
             <button className="btn-attestation-dl" onClick={() => generateAttestationPDF(req)}>
                <Download size={14} />
             </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="statut-demandes">
      {/* Header Section */}
      <div className="statut-header">
        <div className="statut-title-section">
          <h1>
            SIAAH — DGI DGI Port-au-Prince | {filterType !== 'all' ? `${filterType} : ` : ''}
            {filterStatus === 'all' ? 'Statut des Demandes' : 
             filterStatus === 'pending' ? 'Demandes en Attente' :
             filterStatus === 'processing' ? 'Demandes en Cours' :
             filterStatus === 'completed' ? 'Dossiers Traités' :
             filterStatus === 'rejected' ? 'Dossiers Rejetés' :
             filterStatus === 'draft' ? 'Brouillons' : 'Statut'}
            | Direction Générale des Impôts
          </h1>
          <div className="statut-header-actions">
            <div className="view-switcher">
                <button 
                    className={`view-btn ${viewType === 'list' ? 'active' : ''}`}
                    onClick={() => setViewType('list')}
                    title="Vue Liste"
                >
                    Table liste
                </button>
                <button 
                    className={`view-btn ${viewType === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewType('grid')}
                    title="Vue Grille"
                >
                    Grille
                </button>
            </div>
            <div className="sort-wrapper">
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="date-desc">Plus récents</option>
                    <option value="date-asc">Plus anciens</option>
                    <option value="type">Trier par Type</option>
                </select>
            </div>
            <button className="close-button" onClick={() => navigate('/user')}><X size={20} /></button>
          </div>
        </div>
      </div>

      <div className="statut-container">
        <div className="pro-filters-bar unified-layout">
          {/* Mobile Filter Icons Row (Visible only on Mobile) */}
          <div className="mobile-filter-icons-row">
            <button 
              type="button" 
              className={`mobile-filter-icon-btn ${activeMobileFilter === 'type' ? 'active' : ''} ${filterType !== 'all' ? 'has-value' : ''}`}
              onClick={() => setActiveMobileFilter(activeMobileFilter === 'type' ? null : 'type')}
              title="Filtrer par type"
            >
              <Filter size={20} />
              {filterType !== 'all' && <span className="filter-active-dot" />}
            </button>
            
            <button 
              type="button" 
              className={`mobile-filter-icon-btn ${activeMobileFilter === 'status' ? 'active' : ''} ${filterStatus !== 'all' ? 'has-value' : ''}`}
              onClick={() => setActiveMobileFilter(activeMobileFilter === 'status' ? null : 'status')}
              title="Filtrer par statut"
            >
              <Clock size={20} />
              {filterStatus !== 'all' && <span className="filter-active-dot" />}
            </button>
            
            <button 
              type="button" 
              className={`mobile-filter-icon-btn ${activeMobileFilter === 'date' ? 'active' : ''} ${(startDate || endDate) ? 'has-value' : ''}`}
              onClick={() => setActiveMobileFilter(activeMobileFilter === 'date' ? null : 'date')}
              title="Filtrer par date"
            >
              <Clock size={20} />
              {(startDate || endDate) && <span className="filter-active-dot" />}
            </button>
            
            <button 
              type="button" 
              className={`mobile-filter-icon-btn ${activeMobileFilter === 'search' ? 'active' : ''} ${searchTerm ? 'has-value' : ''}`}
              onClick={() => setActiveMobileFilter(activeMobileFilter === 'search' ? null : 'search')}
              title="Recherche globale"
            >
              <Search size={20} />
              {searchTerm && <span className="filter-active-dot" />}
            </button>

            {(filterType !== 'all' || filterStatus !== 'all' || startDate || endDate || searchTerm) && (
              <button 
                type="button" 
                className="mobile-filter-icon-btn reset-btn"
                onClick={() => {
                  setFilterType('all');
                  setFilterStatus('all');
                  setStartDate('');
                  setEndDate('');
                  setSearchTerm('');
                  setExpandedSections({ pending: true, processing: false, completed: false, rejected: false });
                  setActiveMobileFilter(null);
                }}
                title="Réinitialiser"
                style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#dc2626' }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className={`filter-item type-box ${activeMobileFilter === 'type' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="filter-select-wrapper">
              <Filter size={14} className="filter-icon-inside" />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">Tous types</option>
                <option value="immatriculation">Immatriculation</option>
                <option value="permis">Permis</option>
                <option value="assurance">Assurances</option>
              </select>
            </div>
          </div>

          <div className={`filter-item status-box ${activeMobileFilter === 'status' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="filter-select-wrapper">
              <Clock size={14} className="filter-icon-inside" />
              <select 
                value={filterStatus} 
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterStatus(val);
                  if (val !== 'all') {
                    setExpandedSections({
                      pending: val === 'pending',
                      processing: val === 'processing',
                      completed: val === 'completed',
                      rejected: val === 'rejected'
                    });
                  }
                }}
              >
                <option value="all">Statuts</option>
                <option value="pending">En attente</option>
                <option value="processing">En cours</option>
                <option value="completed">Traité</option>
                <option value="rejected">Refusé</option>
              </select>
            </div>
          </div>

          <div className={`filter-item date-box ${activeMobileFilter === 'date' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="date-inputs-compact">
              <Clock size={14} className="filter-icon-inside" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span className="date-sep">→</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className={`filter-item search-box-compact ${activeMobileFilter === 'search' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="search-container-mini">
              <Search size={16} className="search-icon-mini" />
              <input
                type="text"
                placeholder="Recherche globale..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {(filterType !== 'all' || filterStatus !== 'all' || startDate || endDate || searchTerm) && (
            <button className="btn-reset-mini" onClick={() => {
              setFilterType('all');
              setFilterStatus('all');
              setStartDate('');
              setEndDate('');
              setSearchTerm('');
              setExpandedSections({ pending: true, processing: false, completed: false, rejected: false });
            }} title="Réinitialiser">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Conditional Rendering: Accordions vs Single Table */}
        {(searchTerm || startDate || endDate || (filterType !== 'all' && filterStatus === 'all')) ? (
          <div className="flat-results-view animate-fade-in">
            <div className="flat-view-header">
              <h3>Résultats de recherche ({filteredRequests.length})</h3>
            </div>
            {activeViewType === 'list' ? (
              <div className="table-responsive pro-card-shadow">
                <table className="demandes-pro-table">
                    <thead>
                    <tr>
                        <th>N° Demande</th>
                        <th>Service</th>
                        <th>Opération</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Prix (HTG)</th>
                        <th>Paiement</th>
                        <th>Attestation</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredRequests.length === 0 ? (
                        <tr><td colSpan="9" className="empty-table-msg">Aucun résultat correspondant.</td></tr>
                    ) : filteredRequests.map(req => (
                        <tr key={req.id}>
                        <td className="cell-id">REQ-{(req.id || 0).toString().padStart(3, '0')}</td>
                        <td className="cell-type">{(req.type || '').split(' - ')[0]}</td>
                        <td className="cell-op">{(req.type || '').split(' - ')[1] || '-'}</td>
                        <td className="cell-date">{new Date(req.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="cell-status">
                            <span className="status-pill" style={{ backgroundColor: getStatusInfo(req.status).color }}>
                            {getStatusInfo(req.status).label}
                            </span>
                        </td>
                        <td className="cell-price" style={{ fontWeight: 'bold' }}>
                            {(req.price !== null && req.price !== undefined) ? `${parseFloat(req.price).toLocaleString()} HTG` : '2,500 HTG'}
                        </td>
                        <td className="cell-payment">
                            <span className={`status-pill-pay ${req.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                            {req.payment_status === 'paid' ? 'Payé' : 'Non Payé'}
                            </span>
                        </td>
                        <td className="cell-attestation">
                            {req.payment_status === 'paid' ? (
                            <button 
                                className="btn-attestation-dl" 
                                onClick={() => generateAttestationPDF(req)}
                                title="Télécharger l'attestation"
                            >
                                <Download size={14} /> Attestation
                            </button>
                            ) : (
                            <span className="no-attestation">Indisponible</span>
                            )}
                        </td>
                        <td className="cell-actions">
                            <div className="action-buttons-group">
                            <button className="btn-action-view" title="Voir les détails" onClick={() => setSelectedRequest(req)}>
                                <Eye size={16} />
                            </button>
                            
                            {req.payment_status !== 'paid' && (req.status === 'pending' || req.status === 'processing') && (
                                <button 
                                className="btn-action-pay" 
                                title="Payer le service"
                                onClick={() => setPaymentRequest(req)}
                                >
                                <CreditCard size={16} />
                                </button>
                            )}

                            {(req.status === 'pending' || req.status === 'draft') && (
                                <button 
                                className="btn-action-cancel" 
                                title={req.status === 'draft' ? "Supprimer le brouillon" : "Annuler la demande"}
                                onClick={() => handleCancelRequest(req.id)}
                                >
                                <Trash2 size={16} />
                                </button>
                            )}

                            {req.status === 'draft' && (
                                <button 
                                className="btn-action-edit" 
                                title="Reprendre le brouillon"
                                onClick={() => handleResumeDraft(req)}
                                >
                                <FileEdit size={16} />
                                </button>
                            )}
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            ) : (
              <div className="grid-results-view">
                {filteredRequests.length === 0 ? (
                    <div className="empty-table-msg">Aucun résultat correspondant.</div>
                ) : filteredRequests.map(req => renderRequestCard(req))}
              </div>
            )}
          </div>
        ) : (
          <div className="requests-accordions">
          {sections.map(section => {
            const sectionRequests = getRequestsByStatus(section.id);
            const isOpen = expandedSections[section.id];
            
            return (
              <div key={section.id} className={`accordion-row-item ${isOpen ? 'is-open' : ''}`}>
                <div 
                  className="accordion-header" 
                  onClick={() => toggleAccordion(section.id)}
                  style={{ borderLeftColor: section.color }}
                >
                  <div className="header-left-info">
                    {section.icon}
                    <span className="accordion-title">{section.title}</span>
                    <span className="count-badge">{sectionRequests.length}</span>
                  </div>
                  <div className="header-right-icons">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {isOpen && (
                  <div className="accordion-content-table">
                    {loading ? (
                      <div className="loader-area-small">
                        <Loader2 className="animate-spin" size={24} />
                        <span>Chargement...</span>
                      </div>
                    ) : sectionRequests.length === 0 ? (
                      <div className="empty-section-msg">
                        Aucune demande dans cette catégorie.
                      </div>
                    ) : (
                      <>
                        {activeViewType === 'list' ? (
                          <div className="table-responsive">
                            <table className="demandes-pro-table">
                              <thead>
                                <tr>
                                  <th>N° Demande</th>
                                  <th>Service</th>
                                  <th>Opération</th>
                                  <th>Date</th>
                                  <th>Statut</th>
                                  <th>Prix (HTG)</th>
                                  <th>Paiement</th>
                                  <th>Attestation</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sectionRequests.map(req => {
                                  const dateObj = new Date(req.created_at);
                                  const formattedDate = dateObj.toLocaleDateString('fr-FR');
                                  const [service, operation] = (req.type || '').split(' - ');
                                  
                                  return (
                                    <tr key={req.id}>
                                      <td className="cell-id">REQ-{req.id.toString().padStart(3, '0')}</td>
                                      <td className="cell-type">{service}</td>
                                      <td className="cell-op">{operation || '-'}</td>
                                      <td className="cell-date">{formattedDate}</td>
                                      <td className="cell-status">
                                        <span className="status-badge-small" style={{ color: getStatusInfo(req.status).color }}>
                                          {getStatusInfo(req.status).label}
                                        </span>
                                      </td>
                                      <td className="cell-price" style={{ fontWeight: 'bold' }}>
                                        {(req.price !== null && req.price !== undefined) ? `${parseFloat(req.price).toLocaleString()} HTG` : '2,500 HTG'}
                                      </td>
                                      <td className="cell-payment">
                                        <span className={`status-pill-pay ${req.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                                          {req.payment_status === 'paid' ? 'Payé' : 'Non Payé'}
                                        </span>
                                      </td>
                                      <td className="cell-attestation">
                                        {req.payment_status === 'paid' ? (
                                          <button 
                                            className="btn-attestation-dl" 
                                            onClick={() => generateAttestationPDF(req)}
                                            title="Télécharger l'attestation"
                                          >
                                            <Download size={14} /> Attestation
                                          </button>
                                        ) : (
                                          <span className="no-attestation">Indisponible</span>
                                        )}
                                      </td>
                                      <td className="cell-actions">
                                        <div className="action-buttons-group">
                                          <button 
                                            className="btn-action-view" 
                                            title="Voir les détails"
                                            onClick={() => setSelectedRequest(req)}
                                          >
                                            <Eye size={16} />
                                          </button>
                                          
                                          {req.payment_status !== 'paid' && (section.id === 'pending' || section.id === 'processing' || section.id === 'validated') && (
                                            <button 
                                              className="btn-action-pay" 
                                              title="Payer le service"
                                              onClick={() => setPaymentRequest(req)}
                                            >
                                              <CreditCard size={16} />
                                            </button>
                                          )}
     
                                          {(section.id === 'pending' || section.id === 'draft') && (
                                            <button 
                                              className="btn-action-cancel" 
                                              title={section.id === 'draft' ? "Supprimer le brouillon" : "Annuler la demande"}
                                              onClick={() => handleCancelRequest(req.id)}
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          )}
     
                                          {section.id === 'draft' && (
                                            <button 
                                              className="btn-action-edit" 
                                              title="Reprendre le brouillon"
                                              onClick={() => handleResumeDraft(req)}
                                            >
                                              <FileEdit size={16} />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="grid-results-view">
                            {sectionRequests.map(req => renderRequestCard(req))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="request-modal-overlay" onClick={() => setSelectedRequest(null)}>
          {/* ... Modal content ... */}
          <div className="request-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails de la demande REQ-{(selectedRequest.id || 0).toString().padStart(3, '0')}</h3>
              <button className="btn-close-modal" onClick={() => setSelectedRequest(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item full">
                  <span className="label">Service & Opération</span>
                  <span className="value-prominent">{selectedRequest.type}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Date de soumission</span>
                  <span className="value">{new Date(selectedRequest.created_at).toLocaleString('fr-FR')}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Statut actuel</span>
                  <span className="value status-badge" style={{ color: getStatusInfo(selectedRequest.status).color }}>
                    {getStatusInfo(selectedRequest.status).label}
                  </span>
                </div>
                <div className="detail-item">
                   <span className="label">Prix</span>
                   <span className="value" style={{ fontWeight: 'bold' }}>{(selectedRequest.price !== null && selectedRequest.price !== undefined) ? `${parseFloat(selectedRequest.price).toLocaleString()} HTG` : '2,500 HTG'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Paiement</span>
                  <span className={`value status-pill-pay ${selectedRequest.payment_status === 'paid' ? 'paid' : 'unpaid'}`} style={{ width: 'fit-content' }}>
                    {selectedRequest.payment_status === 'paid' ? 'Payé' : 'Non Payé'}
                  </span>
                </div>
                <div className="details-divider">Données du formulaire</div>
                {selectedRequest.details ? (
                  Object.entries(selectedRequest.details).map(([key, value]) => (
                    <div key={key} className="detail-item">
                      <span className="label">{key.replace(/_/g, ' ')}</span>
                      <span className="value">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-details">Aucun détail supplémentaire disponible.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-print" onClick={() => window.print()}>
                <FileText size={16} /> Imprimer Reçu
              </button>
              {selectedRequest.payment_status === 'paid' && (
                <button className="btn-action-pay" onClick={() => generateAttestationPDF(selectedRequest)}>
                  <Download size={16} /> Attestation
                </button>
              )}
              <button className="btn-modal-close" onClick={() => setSelectedRequest(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modality Modal */}
      <AnimatePresence>
        {paymentRequest && (
          <div className="request-modal-overlay" onClick={() => setPaymentRequest(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="payment-modal-content" 
              onClick={e => e.stopPropagation()}
            >
              <div className="payment-modal-header">
                <h3>Finaliser le Paiement</h3>
                <button className="btn-close-modal" onClick={() => setPaymentRequest(null)}><X size={20} /></button>
              </div>
              <div className="payment-modal-body">
                <div className="payment-summary-card">
                  <div className="summary-row">
                    <span>Service:</span>
                    <span className="summary-val">{paymentRequest.type}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Montant total à payer:</span>
                    <span className="summary-price">{(paymentRequest.price !== null && paymentRequest.price !== undefined) ? `${parseFloat(paymentRequest.price).toLocaleString()} HTG` : '2,500 HTG'}</span>
                  </div>
                </div>

                <div className="payment-methods-selection">
                  <h4>Choisissez votre mode de paiement:</h4>
                  <div className="methods-grid">
                    <div 
                      className={`method-card ${paymentMethod === 'MonCash' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('MonCash')}
                    >
                      <Smartphone size={24} />
                      <div className="method-info">
                        <span className="method-name">Mon Cash</span>
                        <span className="method-sub">Paiement mobile</span>
                      </div>
                    </div>
                    <div 
                      className={`method-card ${paymentMethod === 'Carte Bancaire' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('Carte Bancaire')}
                    >
                      <Globe size={24} />
                      <div className="method-info">
                        <span className="method-name">Carte Bancaire</span>
                        <span className="method-sub">Visa, Mastercard</span>
                      </div>
                    </div>
                    <div 
                      className={`method-card ${paymentMethod === 'Virement' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('Virement')}
                    >
                      <Wallet size={24} />
                      <div className="method-info">
                        <span className="method-name">Virement</span>
                        <span className="method-sub">Banque locale</span>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'Carte Bancaire' && (
                  <div className="card-input-placeholder">
                    <input type="text" placeholder="Numéro de carte" className="pay-input" />
                    <div className="input-row">
                      <input type="text" placeholder="MM/YY" className="pay-input" />
                      <input type="text" placeholder="CVV" className="pay-input" />
                    </div>
                  </div>
                )}
                
                {(paymentMethod === 'MonCash' || paymentMethod === 'NatCash') && (
                  <div className="phone-input-placeholder">
                    <input type="text" placeholder="Numéro de téléphone" className="pay-input" />
                  </div>
                )}
              </div>
              <div className="payment-modal-footer">
                <button className="btn-cancel-pay" onClick={() => setPaymentRequest(null)}>Annuler</button>
                <button className="btn-confirm-pay" onClick={handlePayRequest} disabled={isProcessingAction}>
                  {isProcessingAction ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Redirection...</span>
                    </>
                  ) : (
                    `Confirmer le paiement de ${(paymentRequest.price !== null && paymentRequest.price !== undefined) ? parseFloat(paymentRequest.price).toLocaleString() : '2,500'} HTG`
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <div className="success-overlay">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="success-popup"
            >
              <div className="success-icon-wrapper" style={{ background: showSuccess.type === 'delete' ? '#fee2e2' : '#dcfce7' }}>
                {showSuccess.type === 'delete' ? <TrashIcon color="#ef4444" size={32} /> : <CheckIcon color="#10b981" size={32} />}
              </div>
              <h4>{showSuccess.type === 'delete' ? 'Supprimé !' : 'Succès !'}</h4>
              <p>{showSuccess.message}</p>
              <button className="btn-success-close" onClick={() => setShowSuccess(null)}>D'accord</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="pdf-templates-container" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        {Array.isArray(requests) && requests.map(req => (
          <AttestationTemplate key={req.id} request={req} id={`attestation-template-${req.id}`} />
        ))}
      </div>
    </main>
  );
};

export default StatutDemandes;
