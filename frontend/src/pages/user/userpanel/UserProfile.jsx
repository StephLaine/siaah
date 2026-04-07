import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  MapPin, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  Calendar, 
  MessageCircle,
  Phone,
  User,
  Hash,
  Activity,
  UserCheck,
  Edit3,
  Camera,
  Check,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import './UserProfile.css';

// Helper for cropping
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
}

const UserProfile = ({ user: initialUser, onClose, onAnalyzeRequest }) => {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState('General');
  const [expandedSections, setExpandedSections] = useState({
    personnelle: true,
    contact: true,
    demarches: true,
    rendezvous: false,
    historiqueVehicules: true,
    historiquePermis: true,
    historiqueComms: false
  });

  // Note Sommaire State
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(user?.note_somaire || "");

  // Avatar Upload & Crop State
  const [photoSrc, setPhotoSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Pagination State
  const ITEMS_PER_PAGE = 5;
  const [currentPageComms, setCurrentPageComms] = useState(1);
  const [currentPageRequests, setCurrentPageRequests] = useState(1);
  const [currentPageVehicules, setCurrentPageVehicules] = useState(1);
  const [currentPagePermis, setCurrentPagePermis] = useState(1);
  const [currentPageAppointments, setCurrentPageAppointments] = useState(1);

  // Appointments for this user
  const [appointments, setAppointments] = useState([]);
  useEffect(() => {
    if (!initialUser?.id) return;
    const token = localStorage.getItem('token');
    fetch(`/api/appointments/office?user_id=${initialUser.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setAppointments(d.data.filter(a => a.user_id === initialUser.id));
        }
      })
      .catch(() => {});
  }, [initialUser?.id]);

  // Communications History
  const [communications, setCommunications] = useState([]);
  useEffect(() => {
    if (!initialUser?.id) return;
    const token = localStorage.getItem('token');
    fetch(`/api/admin/users/${initialUser.id}/comms`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setCommunications(d.data);
      })
      .catch(err => console.error('Comms error:', err));
  }, [initialUser?.id]);

  if (!user) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const statusColors = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    completed: '#22c55e',
    rejected: '#ef4444'
  };

  const handleSaveNote = async () => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ note_somaire: noteText })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUser({ ...user, note_somaire: noteText });
        setEditingNote(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde de la note.');
    }
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      let imageDataUrl = await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = (e) => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      setPhotoSrc(imageDataUrl);
      e.target.value = ''; // Reset input
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveAvatar = async () => {
    try {
      setUploadingAvatar(true);
      const croppedImageBlob = await getCroppedImg(photoSrc, croppedAreaPixels);
      
      const formData = new FormData();
      formData.append('avatar', croppedImageBlob, 'avatar.jpg');
      
      const res = await fetch(`/api/admin/users/${user.id}/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        setUser({ ...user, profile_image: data.photo || data.profile_image });
        setPhotoSrc(null);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde de la photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const Pagination = ({ totalItems, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center gap-1 mt-3 justify-center mb-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`w-6 h-6 text-[10px] items-center justify-center flex rounded border transition-all ${
              currentPage === num 
                ? 'bg-blue-600 border-blue-600 text-white font-bold' 
                : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="user-profile-modal-container">
      {/* Blue Bar */}
      <div className="user-profile-header-bar">
        <button className="close-profile-btn" onClick={onClose}>
          <ChevronLeft size={20} />
          <span>Retour à la liste</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="profile-hero-section">
        <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          {user.profile_image ? (
            <img src={user.profile_image} alt="Avatar" className="profile-main-avatar" />
          ) : (
            <div className="profile-avatar-fallback">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
          )}
          <div className="avatar-edit-overlay">
            <Camera size={20} />
          </div>
        </div>

        <div className="profile-hero-info">
          <h1 className="profile-name">{user.first_name} {user.last_name}</h1>
          <p className="profile-title">{user.job_title || 'Client / Usager'}</p>
          <div className="profile-location">
            <MapPin size={16} />
            <span>{user.location || user.address || 'Port-au-Prince, Haiti'}</span>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="profile-note-header m-0">Note Sommaire</h3>
              {!editingNote && (
                <button 
                  className="text-slate-400 hover:text-blue-600 transition" 
                  onClick={() => setEditingNote(true)}
                  title="Modifier la note"
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>
            {editingNote ? (
              <div className="mt-2 flex flex-col gap-2">
                <textarea 
                  className="p-2 border border-slate-300 rounded text-sm w-full outline-none focus:border-blue-500"
                  rows="3"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Ajouter une note..."
                />
                <div className="flex justify-end gap-2">
                  <button className="px-3 py-1 bg-slate-100 rounded text-xs text-slate-600" onClick={() => { setEditingNote(false); setNoteText(user.note_somaire || ""); }}>Annuler</button>
                  <button className="px-3 py-1 bg-blue-600 rounded text-xs text-white flex items-center gap-1" onClick={handleSaveNote}><Check size={12}/> Enregistrer</button>
                </div>
              </div>
            ) : (
              <p className="profile-note-text" onDoubleClick={() => setEditingNote(true)}>
                {user.note_somaire || "Aucune note particulière pour cet usager pour le moment."}
              </p>
            )}
          </div>
        </div>

        <div className="profile-meta-sidebar">
          <div className="meta-item">
            <div className="meta-label">ID :</div>
            <div className="meta-value">{user.nif || `${user.id}`.padStart(6, '0')}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Statut :</div>
            <div className="meta-value">{user.role_name === 'User' ? 'Conducteur / Propriétaire' : user.role_name}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">User / Client :</div>
            <div className="meta-value">
              {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} - Present
            </div>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="profile-tabs-bar">
        {['General', 'Nouvelle demarche', 'Editer', 'Status'].map(tab => (
          <div 
            key={tab} 
            className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
        <div className="profile-actions-right">
          <button className="message-btn-profile">
            Message <Mail size={14} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="profile-content-body">
        {activeTab === 'General' ? (
          <div className="profile-general-grid">
            {/* Left Column : Contact & Demarches */}
            <div className="profile-info-column">
              {/* Contact Informations */}
              <div className="profile-collapse-card">
                <div className="collapse-header" onClick={() => toggleSection('contact')}>
                  <span className="collapse-title">Contact & Adresse</span>
                  {expandedSections.contact ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {expandedSections.contact && (
                  <div className="collapse-body">
                    <div className="info-field mb-4">
                      <label>Email</label>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <p>{user.email}</p>
                      </div>
                    </div>
                    <div className="info-field mb-4">
                      <label>Téléphone 1</label>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        <p>{user.phone || '-'}</p>
                      </div>
                    </div>
                    <div className="info-field mb-4">
                      <label>Téléphone 2</label>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        <p>{user.phone2 || '-'}</p>
                      </div>
                    </div>
                    <hr className="my-3 border-slate-100" />
                    <div className="info-field mb-2">
                      <label>Pays</label>
                      <p>{user.country || '-'}</p>
                    </div>
                    <div className="info-field mb-2">
                      <label>Département / État</label>
                      <p>{user.department || '-'}</p>
                    </div>
                    <div className="info-field mb-2">
                      <label>Commune / Ville</label>
                      <p>{user.city || '-'}</p>
                    </div>
                    <div className="info-field">
                      <label>Adresse Complète</label>
                      <p className="text-sm leading-snug">{user.full_address || user.address || '-'}</p>
                    </div>
                  </div>
                )}
              </div>

  {/* Demarches */}
              <div className="profile-collapse-card">
                <div className="collapse-header" onClick={() => toggleSection('demarches')}>
                  <span className="collapse-title">Demarches Récentes</span>
                  {expandedSections.demarches ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {expandedSections.demarches && (
                  <div className="collapse-body">
                    {user.requests && user.requests.length > 0 ? (
                      <>
                        {user.requests
                          .slice((currentPageRequests - 1) * ITEMS_PER_PAGE, currentPageRequests * ITEMS_PER_PAGE)
                          .map(req => (
                            <div 
                              key={req.id} 
                              className="demarche-mini-item hover:bg-slate-50 transition cursor-pointer"
                              onClick={() => onAnalyzeRequest && onAnalyzeRequest(req)}
                              title="Cliquer pour analyser cette démarche"
                            >
                              <div>
                                <div className="demarche-name">{req.service_name || req.type}</div>
                                <div className="demarche-date">#{req.id} — {new Date(req.created_at).toLocaleDateString('fr-FR')}</div>
                              </div>
                              <div className="flex items-center">
                                <span 
                                  className="demarche-status-dot" 
                                  style={{ backgroundColor: statusColors[req.status] || '#ccc' }} 
                                />
                                <span className="text-xs font-bold uppercase" style={{ color: statusColors[req.status] }}>
                                  {getStatusLabel(req.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                        <Pagination 
                          totalItems={user.requests.length} 
                          currentPage={currentPageRequests} 
                          onPageChange={setCurrentPageRequests} 
                        />
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Aucune démarche enregistrée.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Historique des Communications */}
              <div className="profile-collapse-card">
                <div className="collapse-header" onClick={() => toggleSection('historiqueComms')}>
                  <span className="collapse-title">Historique des Communications (Emails)</span>
                  {expandedSections.historiqueComms ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {expandedSections.historiqueComms && (
                  <div className="collapse-body">
                    {communications && communications.length > 0 ? (
                      <>
                        {communications
                          .slice((currentPageComms - 1) * ITEMS_PER_PAGE, currentPageComms * ITEMS_PER_PAGE)
                          .map((comm, i) => (
                            <div key={i} className="communication-log-item mb-4 pb-3 border-b border-slate-50 last:border-0 last:mb-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Mail size={14} className="text-blue-500" />
                                <span className="text-sm font-bold text-slate-700">{comm.subject}</span>
                              </div>
                              <div className="flex justify-between items-center text-[11px] text-slate-400 mb-2">
                                <span>Envoyé par : <strong>{comm.sender_id ? `${comm.sender_first_name} ${comm.sender_last_name}` : 'Système Automatique'}</strong></span>
                                <span>{new Date(comm.sent_at).toLocaleString('fr-FR')}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 border border-slate-100 whitespace-pre-wrap max-h-24 overflow-y-auto">
                                {comm.message}
                              </div>
                            </div>
                          ))}
                        <Pagination 
                          totalItems={communications.length} 
                          currentPage={currentPageComms} 
                          onPageChange={setCurrentPageComms} 
                        />
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Aucune communication enregistrée.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Rendez-vous */}
              <div className="profile-collapse-card">
                <div className="collapse-header" onClick={() => toggleSection('rendezvous')}>
                  <span className="collapse-title">Historique des Prises de Rendez-vous</span>
                  {expandedSections.rendezvous ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {expandedSections.rendezvous && (
                  <div className="collapse-body">
                    {appointments && appointments.length > 0 ? (
                      <>
                        {appointments
                          .slice((currentPageAppointments - 1) * ITEMS_PER_PAGE, currentPageAppointments * ITEMS_PER_PAGE)
                          .map((apt, i) => (
                            <div key={i} className="recent-request-item" style={{ borderLeft: '3px solid #3b82f6', marginBottom: 10, padding: '10px 12px' }}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-bold text-slate-700">{apt.service} - {apt.service_type}</p>
                                  <p className="text-xs text-slate-500 font-medium">{new Date(apt.appointment_date).toLocaleDateString('fr-FR')} à {apt.appointment_time}</p>
                                  {apt.office_name && <p className="text-[10px] text-blue-500 font-bold mt-1 uppercase flex items-center gap-1"><MapPin size={10} /> {apt.office_name}</p>}
                                </div>
                                <div style={{
                                  padding: '2px 8px',
                                  borderRadius: 10,
                                  fontSize: 10,
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  backgroundColor: 
                                    apt.status === 'confirmed' ? '#d1fae5' : 
                                    apt.status === 'pending' ? '#fef3c7' : 
                                    apt.status === 'completed' ? '#dbeafe' : '#fee2e2',
                                  color: 
                                    apt.status === 'confirmed' ? '#065f46' : 
                                    apt.status === 'pending' ? '#92400e' : 
                                    apt.status === 'completed' ? '#1e40af' : '#991b1b',
                                }}>
                                  {apt.status === 'pending' ? 'En attente' :
                                   apt.status === 'confirmed' ? 'Confirmé' :
                                   apt.status === 'completed' ? 'Complété' : 'Annulé'}
                                </div>
                              </div>
                            </div>
                          ))}
                        <Pagination 
                          totalItems={appointments.length} 
                          currentPage={currentPageAppointments} 
                          onPageChange={setCurrentPageAppointments} 
                        />
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Aucun rendez-vous planifié dans le système.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column : Informations personnelles (Merged with Identification) */}
            <div className="profile-info-column">
              <div className="profile-collapse-card">
                <div className="collapse-header" onClick={() => toggleSection('personnelle')}>
                  <span className="collapse-title">Informations personnelles</span>
                  {expandedSections.personnelle ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {expandedSections.personnelle && (
                  <div className="collapse-body">
                    <div className="info-grid">
                      <div className="info-field">
                        <label>Prénom</label>
                        <p>{user.first_name || '-'}</p>
                      </div>
                      <div className="info-field">
                        <label>Nom</label>
                        <p>{user.last_name || '-'}</p>
                      </div>
                      <div className="info-field">
                        <label>Date de Naissance</label>
                        <p>{user.dob ? new Date(user.dob).toLocaleDateString() : '-'}</p>
                      </div>
                      <div className="info-field">
                        <label>Lieu de Naissance</label>
                        <p>{user.pob || '-'}</p>
                      </div>
                      <div className="info-field">
                        <label>Nationalité</label>
                        <p>{user.nationality || '-'}</p>
                      </div>
                      <div className="info-field">
                        <label>Sexe</label>
                        <p>{user.sexe || '-'}</p>
                      </div>
                      <div className="info-field">
                        <label>État Civil</label>
                        <p>{user.marital_status || '-'}</p>
                      </div>
                      <div className="info-field">
                        <label>Groupe Sanguin</label>
                        <p>{user.blood_group || '-'}</p>
                      </div>
                      
                      {/* Identification elements */}
                      <div className="info-field" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                        <hr className="mb-3 border-slate-100" />
                        <label className="text-blue-600 font-semibold mb-2 block">Pièces d'Identification</label>
                      </div>
                      <div className="info-field">
                        <label>NIF</label>
                        <p className="font-medium">{user.nif || '-'}</p>
                      </div>
                      <div className="info-field">
                        <label>CIN</label>
                        <p className="font-medium">{user.cin || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Historique des Véhicules */}
              <div className="profile-collapse-card">
                <div className="collapse-header" onClick={() => toggleSection('historiqueVehicules')}>
                  <span className="collapse-title">Historique des Véhicules</span>
                  {expandedSections.historiqueVehicules ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {expandedSections.historiqueVehicules && (
                  <div className="collapse-body">
                    {(user.vehicles && user.vehicles.length > 0) ? (
                      <>
                        {user.vehicles
                          .slice((currentPageVehicules - 1) * ITEMS_PER_PAGE, currentPageVehicules * ITEMS_PER_PAGE)
                          .map((v, i) => (
                            <div key={i} className="demarche-mini-item">
                              <div>
                                <div className="demarche-name">{v.brand} {v.model}</div>
                                <div className="demarche-date">{v.license_plate} — {v.chassis_number}</div>
                              </div>
                              <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {v.color}
                              </div>
                            </div>
                          ))}
                        <Pagination 
                          totalItems={user.vehicles.length} 
                          currentPage={currentPageVehicules} 
                          onPageChange={setCurrentPageVehicules} 
                        />
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Aucun véhicule enregistré pour cet usager.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Historique des Permis */}
              <div className="profile-collapse-card">
                <div className="collapse-header" onClick={() => toggleSection('historiquePermis')}>
                  <span className="collapse-title">Historique des Permis</span>
                  {expandedSections.historiquePermis ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {expandedSections.historiquePermis && (
                  <div className="collapse-body">
                    {(user.licenses && user.licenses.length > 0) ? (
                      <>
                        {user.licenses
                          .slice((currentPagePermis - 1) * ITEMS_PER_PAGE, currentPagePermis * ITEMS_PER_PAGE)
                          .map((l, i) => (
                            <div key={i} className="demarche-mini-item">
                              <div>
                                <div className="demarche-name">Permis #{l.license_number}</div>
                                <div className="demarche-date">Catégorie : {l.category} — Expire : {new Date(l.expiry_date).toLocaleDateString()}</div>
                              </div>
                              <div className={`text-[10px] font-bold px-2 py-1 rounded ${l.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {l.status === 'active' ? 'VALIDE' : 'EXPIRE'}
                              </div>
                            </div>
                          ))}
                        <Pagination 
                          totalItems={user.licenses.length} 
                          currentPage={currentPagePermis} 
                          onPageChange={setCurrentPagePermis} 
                        />
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Aucun permis répertorié pour cet usager.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'Editer' ? (
          <div className="bg-white rounded-xl shadow-sm w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Edit3 size={20} className="text-blue-600" />
              Mettre à jour mon profil officiel
            </h3>
            
            <form className="profile-edit-form" onSubmit={async (e) => {
                e.preventDefault();
                const fData = new FormData(e.target);
                const payload = Object.fromEntries(fData.entries());
                try {
                  const res = await fetch(`/api/admin/users/${user.id}/profile`, {
                    method: 'PUT',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(payload)
                  });
                  const data = await res.json();
                  if (data.status === 'success') {
                    alert('Profil mis à jour avec succès !');
                    window.location.reload(); // Refresh to get new data
                  }
                } catch (err) {
                  console.error(err);
                }
            }}>
              <div className="info-grid">
                <div className="edit-field">
                  <label>Prénom</label>
                  <input name="first_name" defaultValue={user.first_name} className="pro-input" />
                </div>
                <div className="edit-field">
                  <label>Nom</label>
                  <input name="last_name" defaultValue={user.last_name} className="pro-input" />
                </div>
                <div className="edit-field">
                  <label>Sexe</label>
                  <select name="sexe" defaultValue={user.sexe} className="pro-select">
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div className="edit-field">
                  <label>Date de Naissance</label>
                  <input name="dob" type="date" defaultValue={user.dob ? user.dob.substring(0,10) : ''} className="pro-input" />
                </div>
                <div className="edit-field">
                  <label>Lieu de Naissance</label>
                  <input name="pob" defaultValue={user.pob} className="pro-input" />
                </div>
                <div className="edit-field">
                  <label>Nationalité</label>
                  <input name="nationality" defaultValue={user.nationality || 'Haïtienne'} className="pro-input" />
                </div>
                <div className="edit-field">
                  <label>Numéro NIF</label>
                  <input name="nif" defaultValue={user.nif} className="pro-input" />
                </div>
                <div className="edit-field">
                  <label>Numéro CIN</label>
                  <input name="cin" defaultValue={user.cin} className="pro-input" />
                </div>
                <div className="edit-field">
                   <label>État Civil</label>
                   <select name="marital_status" defaultValue={user.marital_status} className="pro-select">
                      <option value="Célibataire">Célibataire</option>
                      <option value="Marié(e)">Marié(e)</option>
                      <option value="Divorcé(e)">Divorcé(e)</option>
                      <option value="Veuf(ve)">Veuf(ve)</option>
                   </select>
                </div>
                <div className="edit-field">
                   <label>Groupe Sanguin</label>
                   <input name="blood_group" defaultValue={user.blood_group} className="pro-input" placeholder="Ex: A+" />
                </div>
                <div className="edit-field">
                   <label>Téléphone 1</label>
                   <input name="phone" defaultValue={user.phone} className="pro-input" />
                </div>
                <div className="edit-field">
                   <label>Téléphone 2 (Optionnel)</label>
                   <input name="phone2" defaultValue={user.phone2} className="pro-input" />
                </div>
                <div className="edit-field">
                   <label>Commune / Ville</label>
                   <input name="city" defaultValue={user.city} className="pro-input" />
                </div>
                <div className="edit-field">
                   <label>Département / État</label>
                   <input name="department" defaultValue={user.department} className="pro-input" />
                </div>
                <div className="edit-field">
                   <label>Pays</label>
                   <input name="country" defaultValue={user.country || 'Haiti'} className="pro-input" />
                </div>
              </div>
              <div className="edit-field mt-4">
                  <label>Adresse Complète (Rue, Numéro, Quartier)</label>
                  <textarea name="full_address" defaultValue={user.full_address || user.address} className="pro-textarea" rows="2"></textarea>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setActiveTab('General')} className="px-6 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition">
                  Annuler
                </button>
                <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-8 text-center w-full">
            <Activity size={48} className="mx-auto text-slate-200" />
            <p className="mt-4 text-slate-400 italic">Contenu bientôt disponible...</p>
          </div>
        )}
      </div>

      {/* Avatar Cropping Modal */}
      {photoSrc && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <h3 className="mb-4 text-lg font-bold">Ajuster la photo de profil</h3>
            <div className="crop-container">
              <Cropper
                image={photoSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>
            <div className="zoom-controls">
              <ZoomOut size={16} />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="zoom-slider"
              />
              <ZoomIn size={16} />
            </div>
            <div className="crop-modal-actions mt-4 flex justify-end gap-3">
              <button className="px-4 py-2 bg-slate-100 rounded text-slate-600" onClick={() => setPhotoSrc(null)}>Annuler</button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded font-medium flex items-center gap-2" 
                onClick={handleSaveAvatar}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for status names
const getStatusLabel = (s) => {
  if (s === 'completed') return 'Complétée';
  if (s === 'processing') return 'En analyse';
  if (s === 'pending') return 'En attente';
  if (s === 'rejected') return 'Refusée';
  return s;
};

export default UserProfile;
