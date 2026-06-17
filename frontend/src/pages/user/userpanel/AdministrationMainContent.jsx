import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  List,
  Grid,
  ArrowDown,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  X,
  Pause,
  RefreshCw,
  Play,
  FileText,
  Users,
  Plus,
  Mail,
  Phone,
  Building2,
  Lock,
  User as UserIcon,
  Save,
  Trash2,
  Shield,
  Truck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './AdministrationMainContent.css';
import RequestAnalysis from './RequestAnalysis.jsx';
import UserList from './UserList';
import UserProfile from './UserProfile';
import GestionVehicules from './GestionVehicules';
import GestionPermisConfig from './GestionPermisConfig';
import MesRendezVous from './MesRendezVous';
import Reports from './Reports';

const AdministrationMainContent = ({ activeTab, onTabSelect, activeSection, onSectionSelect, externalRequest }) => {
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Track if search result was processed
  useEffect(() => {
    if (externalRequest) {
      if (externalRequest.type === 'user_search') {
        fetchUserDetail(externalRequest.id);
      } else {
        setSelectedRequest(externalRequest);
        setShowAnalysis(true);
      }
    }
  }, [externalRequest]);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('list');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'validate'|'reject', requestId }

  // User Profile state
  const [users, setUsers] = useState([]);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Stats & Dashboard state
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [searchDocId, setSearchDocId] = useState('');

  // NEW: Employee specific state
  const [employees, setEmployees] = useState([]);
  const [offices, setOffices] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ first_name: '', last_name: '', email: '', phone: '', job_title: '', office_id: '', assigned_services: [] });
  const [confirmModal, setConfirmModal] = useState(null); // { type, status, note, requestId }

  // Requests state (must be declared before useEffect)
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const authHeader = { 'Authorization': `Bearer ${token}` };
  const entityName = user?.entity_name || 'Entité';

  // Fetch data based on section
  useEffect(() => {
    if (!token) return;

    // Reset any open analysis/profile views when changing section
    setShowAnalysis(false);
    setShowUserProfile(false);
    setSelectedRequest(null);
    setSelectedUser(null);

    if (activeSection === 'tableau-de-bord') {
      fetchDashboardData();
    } else if (activeSection === 'gestion-employes') {
      fetchEmployees();
      fetchOffices();
    } else if (activeSection === 'gestion-usagers') {
      fetchUsers();
    } else {
      fetchOfficeRequests();
    }
  }, [activeSection, token, user?.role_id]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/users', { headers: authHeader });
      setUsers(res.data.data.filter(u => u.role_id === 4)); // Only client users
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/admin/users/${userId}`, { headers: authHeader });
      const fetchedUser = res.data.data;
      
      // Filter requests based on allowed services for employees/admin
      if (fetchedUser.requests && user) {
        const matchesService = (allowedName, reqType) => {
          const allowedNorm = allowedName.toLowerCase().trim();
          const reqNorm = (reqType || '').toLowerCase().trim();
          if (allowedNorm.includes('immatriculation') && reqNorm.includes('immatriculation')) return true;
          if (allowedNorm.includes('permis') && reqNorm.includes('permis')) return true;
          if (allowedNorm.includes('assurance') && reqNorm.includes('assurance')) return true;
          if ((allowedNorm.includes('amende') || allowedNorm.includes('contravention')) && (reqNorm.includes('amende') || reqNorm.includes('contravention'))) return true;
          return reqNorm.includes(allowedNorm);
        };

        if (user.role_id === 3) {
          const assigned = Array.isArray(user.assigned_services) 
            ? user.assigned_services 
            : (typeof user.assigned_services === 'string' ? JSON.parse(user.assigned_services || '[]') : []);
          if (assigned.length > 0) {
            fetchedUser.requests = fetchedUser.requests.filter(req => 
              assigned.some(a => matchesService(a, req.type))
            );
          }
        } else if (user.role_id === 2) {
          const entityServices = user.entity_services || [];
          if (entityServices.length > 0) {
            fetchedUser.requests = fetchedUser.requests.filter(req => 
              entityServices.some(es => matchesService(es, req.type))
            );
          }
        }
      }
      
      setSelectedUser(fetchedUser);
      setShowUserProfile(true);
    } catch (err) {
      console.error('Error fetching user detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficeRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await axios.get('/api/requests/office-requests', { headers: authHeader });
      if (res.data.status === 'success') setRequests(res.data.data);
    } catch (err) {
      console.error('Error fetching office requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const updateRequestStatus = async (id, newStatus, note = '', details = null) => {
    try {
      await axios.patch(`/api/requests/${id}/status`, { status: newStatus, note, details }, { headers: authHeader });
      await fetchOfficeRequests();
      return true;
    } catch (err) {
      console.error('Error updating status:', err);
      return false;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/entity-admin/stats', { headers: authHeader });
      if (res.data.status === 'success') {
        setStats(res.data.data.stats);
        setRecentActivity(res.data.data.recentActivity);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/entity-admin/employees', { headers: authHeader });
      setEmployees(res.data.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffices = async () => {
    try {
      const res = await axios.get('/api/entity-admin/offices', { headers: authHeader });
      setOffices(res.data.data);
    } catch (err) {
      console.error('Error fetching offices:', err);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/entity-admin/employees', newEmployee, { headers: authHeader });
      setShowEmployeeModal(false);
      setNewEmployee({ first_name: '', last_name: '', email: '', password: '', phone: '', office_id: '' });
      fetchEmployees();
    } catch (err) {
      console.error("Error adding employee:", err);
    } finally {
      setLoading(false);
    }
  };

  const nouvellesDemandesData = [
    {
      id: 'D21020001',
      clientName: 'Pierre Martin',
      operationType: 'Demande Générale',
      plateNumber: '-',
      receptionDate: '20/02/2025',
      status: 'En attente',
      statusType: 'waiting'
    },
    {
      id: 'D21020002',
      clientName: 'Sophie Laurent',
      operationType: 'Modification',
      plateNumber: '-',
      receptionDate: '20/02/2025',
      status: 'En attente',
      statusType: 'waiting'
    }
  ];

  const dossiersTraitesData = [
    {
      id: 'D21020003',
      clientName: 'Jean Dupont',
      operationType: 'Nouveau Dossier',
      plateNumber: '-',
      receptionDate: '21/02/2025',
      status: 'Valide',
      statusType: 'valid'
    }
  ];

  const getStatusIcon = (type) => {
    switch (type) {
      case 'waiting': return <Clock size={14} />;
      case 'valid': return <CheckCircle size={14} />;
      case 'rejected': return <X size={14} />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: { label: 'En attente', type: 'waiting' },
      processing: { label: 'En analyse', type: 'processing' },
      completed: { label: 'Terminée', type: 'valid' },
      rejected: { label: 'Refusée', type: 'rejected' },
      paused: { label: 'En Pause', type: 'paused' },
      validated: { label: 'En Paiement', type: 'validated' },
      to_deliver: { label: 'À Livrer', type: 'to_deliver' },
      draft: { label: 'Brouillon', type: 'draft' }
    };
    return labels[status] || { label: status, type: 'waiting' };
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by service using 'service_name' (extracted from type or directly)
    if (activeSection.includes('permis') || activeTab === 'nouvelle-demande-permis') {
      filtered = filtered.filter(r => (r.service_name || r.type || '').toLowerCase().includes('permis'));
    } else if (activeSection.includes('immatriculation') || ['reception-demandes', 'documents-analyse', 'dossiers-traites', 'dossiers-refuses'].includes(activeSection)) {
      filtered = filtered.filter(r => (r.service_name || r.type || '').toLowerCase().includes('immatriculation'));
    } else if (activeSection.includes('assurance')) {
      filtered = filtered.filter(r => (r.service_name || r.type || '').toLowerCase().includes('assurance'));
    } else if (activeSection.includes('contravention')) {
      filtered = filtered.filter(r => (r.service_name || r.type || '').toLowerCase().includes('contravention') || (r.service_name || r.type || '').toLowerCase().includes('amende'));
    }

    if (activeTab === 'dossiers-traites') {
      filtered = filtered.filter(r => r.status === 'completed');
    } else if (activeTab === 'dossiers-refuses') {
      filtered = filtered.filter(r => r.status === 'rejected');
    } else if (activeTab === 'documents-analyse') {
      filtered = filtered.filter(r => r.status === 'processing' || r.status === 'paused');
    } else if (activeTab === 'paiements') {
      filtered = filtered.filter(r => r.status === 'validated' || r.status === 'paiement');
    } else if (activeTab === 'a-livrer') {
      filtered = filtered.filter(r => r.status === 'to_deliver');
    } else if (activeTab === 'nouvelles-demandes') {
      filtered = filtered.filter(r => r.status === 'pending');
    }
    if (searchTerm) {
      filtered = filtered.filter(r => {
        // Try direct columns first, then fall back to details JSONB
        const details = r.details || {};
        const clientFirstName = r.first_name || details.firstName || '';
        const clientLastName = r.last_name || details.lastName || '';
        const fullName = `${clientFirstName} ${clientLastName}`;
        return (
          String(r.id).includes(searchTerm) ||
          fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.type || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    return filtered;
  };

  const sortRequests = (list) => {
    const sorted = [...list];
    if (sortBy === 'date') {
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    if (sortBy === 'name') {
      return sorted.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
    }
    if (sortBy === 'status') {
      return sorted.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    }
    if (sortBy === 'id') {
      return sorted.sort((a, b) => b.id - a.id);
    }
    return sorted;
  };

  const tableData = sortRequests(filterRequests());

  const handleAnalyzeRequest = (request) => {
    // Close profile view and open analysis
    setShowUserProfile(false);
    setSelectedRequest(request);
    setShowAnalysis(true);
  };

  const handleBackToList = () => {
    setShowAnalysis(false);
    setSelectedRequest(null);
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  const handleValidate = (details) => {
    const isPaid = selectedRequest?.payment_status === 'paid';
    const nextStatus = isPaid ? 'to_deliver' : 'validated';
    
    setConfirmModal({
      status: nextStatus,
      requestId: selectedRequest?.id,
      title: 'Confirmation de Validation',
      message: isPaid 
        ? 'Dossier payé. Voulez-vous valider et passer à l\'étape de livraison ?' 
        : 'Dossier non payé. Voulez-vous valider et passer à l\'étape de paiement ?',
      details: typeof details === 'object' ? details : null,
      note: 'Dossier validé par l\'administration',
    });
  };

  const handleDeliver = (details) => {
    setConfirmModal({
      status: 'completed',
      requestId: selectedRequest?.id,
      title: 'Dossier Livré',
      message: 'Voulez-vous vraiment marquer ce dossier comme livré ? Il passera en section "Demandes traités".',
      details: typeof details === 'object' ? details : null,
      note: 'Dossier marqué comme livré par l\'administration',
    });
  };

  const handleReject = (status, note, details) => {
    setConfirmModal({
      status: status || 'rejected',
      note: note || 'Dosser refusé par l\'administration',
      requestId: selectedRequest?.id,
      title: 'Refuser le Dossier',
      message: 'Voulez-vous vraiment refuser ce dossier ? Une notification sera envoyée au client.',
      details: typeof details === 'object' ? details : null,
    });
  };

  const handlePause = (status, note, details) => {
    setConfirmModal({
      status: status || 'paused',
      note: note || 'Dossier mis en pause par l\'administration',
      requestId: selectedRequest?.id,
      title: 'Mettre en Pause',
      message: 'Voulez-vous vraiment mettre ce dossier en pause ? Il restera visible dans "Analyse en cours" avec le statut "En Pause".',
      details: typeof details === 'object' ? details : null,
    });
  };

  const handleSetProcessing = (details = null) => {
    setConfirmModal({
      type: 'processing',
      status: 'processing',
      details: details,
      requestId: selectedRequest?.id,
      title: 'Remettre en Analyse',
      message: 'Voulez-vous vraiment remettre ce dossier en analyse ? Il sera à nouveau visible dans la section "Analyse en cours".'
    });
  };

  const confirmStatusUpdate = async () => {
    if (!confirmModal) return;
    try {
      setLoading(true);
      const success = await updateRequestStatus(confirmModal.requestId, confirmModal.status, confirmModal.note, confirmModal.details);
      if (success) {
        await fetchDashboardData();
        setConfirmModal(null);
        handleBackToList();
      } else {
        alert('Erreur lors de la mise à jour du statut.');
      }
    } catch (err) {
      console.error('Error in status update:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmActionNow = async () => {
    if (!confirmAction) return;
    const newStatus = confirmAction.type === 'validate' ? (confirmAction.status || 'validated') : (confirmAction.status || 'rejected');
    try {
      await updateRequestStatus(confirmAction.requestId, newStatus, confirmAction.note);
    } catch (err) {
      console.error('Error updating status:', err);
    }
    setConfirmAction(null);
    handleBackToList();
  };

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({ subject: '', message: '', userId: null });

  const handleMessage = (userId) => {
    setMessageData({ ...messageData, userId: userId || selectedRequest?.user_id });
    setShowMessageModal(true);
  };

  const confirmSendMessage = async () => {
    try {
      setLoading(true);
      await axios.post('/api/requests/message', messageData, { headers: authHeader });
      setShowMessageModal(false);
      setMessageData({ subject: '', message: '', userId: null });
      alert('Message envoyé avec succès.');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Erreur lors de l\'envoi du message.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchRequest = async () => {
    if (!searchDocId.trim()) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/admin/search?query=${searchDocId.trim()}`, { headers: authHeader });
      const { type, data } = res.data;
      
      if (type === 'request') {
        setSelectedRequest(data);
        setShowAnalysis(true);
        setShowUserProfile(false);
      } else if (type === 'user') {
        setSelectedUser(data);
        setShowUserProfile(true);
        setShowAnalysis(false);
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('Aucun résultat trouvé pour cette recherche.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecentActivity = recentActivity; // Simplified for now

  const getActiveService = () => {
    if (activeSection.includes('permis')) {
      return 'permis';
    }
    if (activeSection.includes('immatriculation') || ['reception-demandes', 'documents-analyse', 'dossiers-traites', 'dossiers-refuses'].includes(activeSection)) {
      return 'immatriculation';
    }
    if (activeSection.includes('assurance')) {
      return 'assurance';
    }
    if (activeSection.includes('contravention')) {
      return 'contravention';
    }
    return '';
  };

  const getServiceRequests = () => {
    const service = getActiveService();
    if (!service) return [];
    if (service === 'contravention') {
      return requests.filter(r => {
        const name = (r.service_name || r.type || '').toLowerCase();
        return name.includes('contravention') || name.includes('amende');
      });
    }
    return requests.filter(r => (r.service_name || r.type || '').toLowerCase().includes(service));
  };

  const serviceReqs = getServiceRequests();
  const countPending = serviceReqs.filter(r => r.status === 'pending').length;
  const countProcessing = serviceReqs.filter(r => r.status === 'processing' || r.status === 'paused').length;
  const countPaiements = serviceReqs.filter(r => r.status === 'validated' || r.status === 'paiement').length;
  const countALivrer = serviceReqs.filter(r => r.status === 'to_deliver').length;
  const countCompleted = serviceReqs.filter(r => r.status === 'completed').length;
  const countRejected = serviceReqs.filter(r => r.status === 'rejected').length;

  // ─── MAIN RENDER LOGIC ────────────────────────────────────────────────────
  let content = null;

  if (showAnalysis && selectedRequest) {
    content = (
      <main className="admin-main-content no-padding">
        <RequestAnalysis
          requestData={selectedRequest}
          onBack={handleBackToList}
          onValidate={handleValidate}
          onReject={handleReject}
          onPause={handlePause}
          onProcessing={handleSetProcessing}
          onDeliver={handleDeliver}
          onMessage={handleMessage}
          token={token}
          user={user}
        />
      </main>
    );
  } else if (activeSection === 'tableau-de-bord') {
    content = (
      <main className="admin-main-content">
        <div className="content-header">
          <div className="breadcrumb">
            <span className="breadcrumb-item-link" onClick={() => onSectionSelect('tableau-de-bord')}>Direction Générale des Impôts</span>
          </div>
          <h1 className="main-title">Tableau de Bord</h1>
          <p className="subtitle-admin">Vue d'ensemble des activités et statistiques de votre entité</p>
        </div>

        <div className="dashboard-container">
          <div className="stats-minimal-row">
            <div className="stat-item total"><span className="stat-label"><List size={14} /> TOTAL</span><span className="stat-value">{stats?.total || 0}</span></div>
            <div className="stat-item accepted"><span className="stat-label"><CheckCircle size={14} /> ACCEPTÉES</span><span className="stat-value">{stats?.accepted || 0}</span></div>
            <div className="stat-item rejected"><span className="stat-label"><X size={14} /> REFUSÉES</span><span className="stat-value">{stats?.rejected || 0}</span></div>
            <div className="stat-item processed"><span className="stat-label"><Printer size={14} /> TRAITÉES</span><span className="stat-value">{stats?.processed || 0}</span></div>
            <div className="stat-item processing"><span className="stat-label"><Play size={14} /> ANALYSE</span><span className="stat-value">{stats?.processing || 0}</span></div>
          </div>
          <div className="dashboard-search-section">
            <h3 className="search-title"><Search size={20} /> Rechercher</h3>
            <div className="dashboard-search-bar">
              <input 
                type="text" 
                placeholder="N° dossier, nom, email ou NIF..." 
                value={searchDocId} 
                onChange={(e) => setSearchDocId(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSearchRequest()}
              />
              <button className="search-submit-btn" onClick={handleSearchRequest}>Rechercher</button>
            </div>
          </div>
          <div className="accordion-section">
            <h3 className="search-title"><Clock size={20} /> Activités Récentes</h3>
            {recentActivity.length === 0 ? <div className="p-8 text-center text-slate-400">Aucune activité récente</div> : recentActivity.map(activity => (
              <div key={activity.id} className="accordion-item">
                <div className="accordion-header" onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}>
                  <div className="accordion-title-group"><div className="activity-icon"><FileText size={20} /></div><div className="activity-main-info"><span className="activity-subject">Dossier #{activity.id}</span><span className="activity-meta">{activity.type}</span></div></div>
                  <ChevronRight size={18} className={expandedActivity === activity.id ? 'rotate-90' : ''} />
                </div>
                {expandedActivity === activity.id && <div className="accordion-content p-4 bg-slate-50">Détails de l'activité: {activity.status}</div>}
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  } else if (showUserProfile && selectedUser) {
    content = (
      <main className="admin-main-content no-padding">
        <UserProfile user={selectedUser} onClose={handleBackToList} onAnalyzeRequest={handleAnalyzeRequest} />
      </main>
    );
  } else if (activeSection === 'gestion-usagers') {
    content = (
      <main className="admin-main-content">
        <div className="content-header"><div className="breadcrumb"><span className="breadcrumb-item">{entityName}</span></div></div>
        <UserList users={users} loading={loading} onShowProfile={fetchUserDetail} onEdit={() => {}} onDelete={() => {}} />
      </main>
    );
  } else if (activeSection.startsWith('flotte-vehicules') || activeSection === 'gestion-vehicules') {
    content = (
      <main className="admin-main-content">
        <GestionVehicules defaultSection={activeSection} />
      </main>
    );
  } else if (activeSection === 'config-categories') {
    content = (
      <main className="admin-main-content">
        <GestionPermisConfig />
      </main>
    );
  } else if (activeSection === 'rendez-vous') {
    content = (
      <main className="admin-main-content">
        <MesRendezVous />
      </main>
    );
  } else if (activeSection === 'rapport') {
    content = (
      <main className="admin-main-content">
        <Reports />
      </main>
    );
  } else if (activeSection === 'gestion-employes') {
    content = (
      <main className="admin-main-content">
        <div className="content-header">
          <div className="breadcrumb"><span className="breadcrumb-item">{entityName}</span></div>
          <div className="flex-header">
            <h1 className="main-title">Gestion des Employés</h1>
            <button className="add-employee-btn" onClick={() => setShowEmployeeModal(true)}><Plus size={18} /> Ajouter</button>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Nom</th><th>Email</th><th>Bureau</th><th>Actions</th></tr></thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}><td>{emp.first_name} {emp.last_name}</td><td>{emp.email}</td><td>{emp.office_name}</td><td><Trash2 size={16} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    );
  } else {
    // DEFAULT: REQUEST LIST
    content = (
      <main className="admin-main-content">
        <div className="content-header">
          <div className="breadcrumb"><span className="breadcrumb-item">{entityName}</span></div>
          <h1 className="main-title">Suivi des Demandes</h1>
        </div>
        <div className="filters-section">
          <div className="search-filter">
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search size={18} className="search-icon" />
          </div>
        </div>
        <div className="tabs-section">
          <button className={`tab ${activeTab === 'nouvelles-demandes' ? 'active' : ''}`} onClick={() => onTabSelect('nouvelles-demandes')}>Nouvelle demande ({countPending})</button>
          <button className={`tab ${activeTab === 'documents-analyse' ? 'active' : ''}`} onClick={() => onTabSelect('documents-analyse')}>Analyse en cours ({countProcessing})</button>
          <button className={`tab ${activeTab === 'paiements' ? 'active' : ''}`} onClick={() => onTabSelect('paiements')}>Paiement ({countPaiements})</button>
          <button className={`tab ${activeTab === 'a-livrer' ? 'active' : ''}`} onClick={() => onTabSelect('a-livrer')}>À livrer ({countALivrer})</button>
          <button className={`tab ${activeTab === 'dossiers-traites' ? 'active' : ''}`} onClick={() => onTabSelect('dossiers-traites')}>Demande traité ({countCompleted})</button>
          <button className={`tab ${activeTab === 'dossiers-refuses' ? 'active' : ''}`} onClick={() => onTabSelect('dossiers-refuses')}>Demande refusé ({countRejected})</button>
        </div>
        <div className="table-container shadow-sm">
          <table className="data-table">
            <thead><tr><th>No Dossier</th><th>Client</th><th>Type</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>
              {requestsLoading ? <tr><td colSpan={5}>Chargement...</td></tr> : tableData.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>Aucune demande trouvée pour cette catégorie.</td></tr>
              ) : tableData.map(row => {
                const { label, type } = getStatusLabel(row.status);
                // Read client name from direct column (backend extracts from JSONB) or details object
                const details = row.details || {};
                const clientFirstName = row.first_name || details.firstName || '';
                const clientLastName = row.last_name || details.lastName || '';
                return (
                  <tr key={row.id}>
                    <td>D-{row.id}</td>
                    <td>
                      <span 
                        className="clickable-client-name" 
                        onClick={() => fetchUserDetail(row.user_id)}
                        style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}
                        title="Voir le profil"
                      >
                        {clientFirstName} {clientLastName}
                      </span>
                    </td>
                    <td>{row.type}</td>
                    <td><span className="status" data-status={type}>{label}</span></td>
                    <td><button className="action-btn" onClick={() => handleAnalyzeRequest(row)}>Analyser</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    );
  }

  return (
    <>
      {content}

      {/* Action Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`p-6 ${
              (confirmModal.status === 'validated' || confirmModal.status === 'completed' || confirmModal.status === 'to_deliver') ? 'bg-green-50' : 
              confirmModal.status === 'paused' ? 'bg-amber-50' : 
              confirmModal.status === 'processing' ? 'bg-blue-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {(confirmModal.status === 'validated' || confirmModal.status === 'completed') ? <CheckCircle className="text-green-600" size={24} /> : 
                 confirmModal.status === 'to_deliver' ? <Truck className="text-blue-600" size={24} /> :
                 confirmModal.status === 'paused' ? <Pause className="text-amber-600" size={24} /> : 
                 confirmModal.status === 'processing' ? <RefreshCw className="text-blue-600" size={24} /> : <X className="text-red-600" size={24} />}
                <h3 className="font-bold text-lg text-slate-800">{confirmModal.title}</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{confirmModal.message}</p>
              {confirmModal.note && <div className="mt-3 p-3 bg-white/50 border border-slate-200 rounded text-xs italic text-slate-500">Note : {confirmModal.note}</div>}
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg" onClick={() => setConfirmModal(null)}>Annuler</button>
              <button className={`px-6 py-2 rounded-lg font-bold text-white shadow-sm transition-all active:scale-95 ${
                (confirmModal.status === 'validated' || confirmModal.status === 'completed') ? 'bg-green-600 hover:bg-green-700' : 
                confirmModal.status === 'to_deliver' ? 'bg-blue-700 hover:bg-blue-800' :
                confirmModal.status === 'paused' ? 'bg-amber-500 hover:bg-amber-600' : 
                confirmModal.status === 'processing' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
              }`} onClick={confirmStatusUpdate} disabled={loading}>{loading ? 'Traitement...' : 'Confirmer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout Employé */}
      {showEmployeeModal && (
        <div className="modal-overlay">
          <div className="modal-content small shadow-2xl">
             <div className="modal-header"><h2>Nouvel Employé</h2><button className="close-btn" onClick={() => setShowEmployeeModal(false)}><X size={24} /></button></div>
             <form onSubmit={handleAddEmployee} className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="form-group"><label className="block text-sm font-bold mb-1">Prénom</label><input className="w-full p-2 border rounded" type="text" value={newEmployee.first_name} onChange={e => setNewEmployee({...newEmployee, first_name: e.target.value})} required /></div>
                  <div className="form-group"><label className="block text-sm font-bold mb-1">Nom</label><input className="w-full p-2 border rounded" type="text" value={newEmployee.last_name} onChange={e => setNewEmployee({...newEmployee, last_name: e.target.value})} required /></div>
                </div>
                <div className="form-group mb-4"><label className="block text-sm font-bold mb-1">Email</label><input className="w-full p-2 border rounded" type="email" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} required /></div>
                <div className="form-group mb-4"><label className="block text-sm font-bold mb-1">Mot de passe</label><input className="w-full p-2 border rounded" type="password" value={newEmployee.password} onChange={e => setNewEmployee({...newEmployee, password: e.target.value})} required /></div>
                <div className="form-group mb-6"><label className="block text-sm font-bold mb-1">Bureau Affecté</label><select className="w-full p-2 border rounded" value={newEmployee.office_id} onChange={e => setNewEmployee({...newEmployee, office_id: e.target.value})} required><option value="">Sélectionner</option>{offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
                <div className="flex justify-end gap-3"><button type="button" className="px-4 py-2 bg-slate-100 rounded" onClick={() => setShowEmployeeModal(false)}>Annuler</button><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-bold">Enregistrer</button></div>
             </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="modal-overlay">
          <div className="modal-content small shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Mail className="text-blue-600" size={20} />
                <h2 className="text-lg font-bold">Envoyer un Message</h2>
              </div>
              <button className="close-btn" onClick={() => setShowMessageModal(false)}><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="mb-4 text-sm text-slate-500">
                L'utilisateur recevra ce message par email concernant son dossier.
              </div>
              <div className="form-group mb-4">
                <label className="block text-sm font-bold mb-1">Sujet</label>
                <input 
                  className="w-full p-2 border rounded" 
                  type="text" 
                  placeholder="Ex: Documents manquants"
                  value={messageData.subject} 
                  onChange={e => setMessageData({...messageData, subject: e.target.value})} 
                />
              </div>
              <div className="form-group mb-6">
                <label className="block text-sm font-bold mb-1">Message</label>
                <textarea 
                  className="w-full p-2 border rounded h-32" 
                  placeholder="Tapez votre message ici..."
                  value={messageData.message} 
                  onChange={e => setMessageData({...messageData, message: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 bg-slate-100 rounded hover:bg-slate-200 transition-colors" onClick={() => setShowMessageModal(false)}>Annuler</button>
                <button 
                  className="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                  onClick={confirmSendMessage}
                  disabled={loading || !messageData.message}
                >
                  {loading ? 'Envoi...' : <><Mail size={18} /> Envoyer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdministrationMainContent;
