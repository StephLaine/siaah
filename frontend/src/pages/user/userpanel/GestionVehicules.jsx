import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Car, Users, Zap, LayoutDashboard, Search, Plus, 
  MoreHorizontal, Edit2, Trash2, Eye, Camera, X, Check,
  ChevronRight, AlertCircle, TrendingUp, Settings, Database,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './Vehicles.css';

const API_BASE = 'http://localhost:5001/api/vehicles';

const GestionVehicules = ({ defaultSection }) => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'config', or 'profile'

  useEffect(() => {
    if (defaultSection === 'flotte-vehicules') setActiveTab('dashboard');
    else if (defaultSection === 'config-marques' || defaultSection === 'config-couleurs') setActiveTab('config');
  }, [defaultSection]);
  const [stats, setStats] = useState({ total: 0, byType: [] });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Search for config
  const [makeSearch, setMakeSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  // Reference data
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [colors, setColors] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    owner_nif: '',
    vin: '',
    license_plate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    engine_number: '',
    seats_count: 5,
    fuel_type: 'Essence',
    vehicle_type: 'Voiture',
    photo_url: '',
    status: 'active'
  });

  // Config Form states
  const [showMakeModal, setShowMakeModal] = useState(false);
  const [newMake, setNewMake] = useState({ name: '' });
  const [showModelModal, setShowModelModal] = useState(false);
  const [newModel, setNewModel] = useState({ make_id: '', name: '' });
  const [showColorModal, setShowColorModal] = useState(false);
  const [newColor, setNewColor] = useState({ name: '' });
  const [colorSearch, setColorSearch] = useState('');

  // Role identification: 1=SuperAdmin, 2=Admin, 3=Employee
  const isAdmin = user?.role_id === 1 || user?.role_id === 2;

  useEffect(() => {
    fetchData();
    fetchRefs();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, vehiclesRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/admin/all?limit=50`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data.data);
      setVehicles(vehiclesRes.data.data);
    } catch (err) {
      console.error('Error fetching admin vehicles data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefs = async () => {
    try {
      const [makesRes, colorsRes, modelsRes] = await Promise.all([
        axios.get(`${API_BASE}/refs/makes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/refs/colors`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/refs/models`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMakes(makesRes.data.data);
      setColors(colorsRes.data.data);
      setModels(modelsRes.data.data);
    } catch (err) {
      console.error('Error fetching refs:', err);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`${API_BASE}/admin/${currentVehicle.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE}/admin`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement du véhicule.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        await axios.delete(`${API_BASE}/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
        if (activeTab === 'profile') setActiveTab('dashboard');
      } catch (err) {
        console.error('Error deleting vehicle:', err);
      }
    }
  };

  const handleAddMake = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/makes`, newMake, { headers: { Authorization: `Bearer ${token}` } });
      setShowMakeModal(false);
      setNewMake({ name: '' });
      fetchRefs();
    } catch (err) { alert('Erreur lors de l\'ajout de la marque'); }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/models`, newModel, { headers: { Authorization: `Bearer ${token}` } });
      setShowModelModal(false);
      setNewModel({ make_id: '', name: '' });
      fetchRefs();
    } catch (err) { alert('Erreur lors de l\'ajout du modèle'); }
  };

  const handleAddColor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/colors`, newColor, { headers: { Authorization: `Bearer ${token}` } });
      setShowColorModal(false);
      setNewColor({ name: '' });
      fetchRefs();
    } catch (err) { alert('Erreur lors de l\'ajout de la couleur'); }
  };

  const handleDeleteColor = async (id) => {
    if (window.confirm('Supprimer cette couleur ?')) {
      try {
        await axios.delete(`${API_BASE}/admin/colors/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchRefs();
      } catch (err) { console.error(err); }
    }
  };

  const handleDeleteMake = async (id) => {
    if (window.confirm('Supprimer cette marque et TOUS ses modèles ?')) {
      try {
        await axios.delete(`${API_BASE}/admin/makes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchRefs();
      } catch (err) { console.error(err); }
    }
  };

  const resetForm = () => {
    setFormData({
      owner_nif: '',
      vin: '',
      license_plate: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      engine_number: '',
      seats_count: 5,
      fuel_type: 'Essence',
      vehicle_type: 'Voiture',
      photo_url: '',
      status: 'active'
    });
    setEditMode(false);
    setCurrentVehicle(null);
  };

  const openEditModal = (v) => {
    setFormData({
        owner_nif: v.nif || '',
        vin: v.vin,
        license_plate: v.license_plate,
        make: v.make,
        model: v.model,
        year: v.year,
        color: v.color,
        engine_number: v.engine_number,
        seats_count: v.seats_count,
        fuel_type: v.fuel_type,
        vehicle_type: v.vehicle_type,
        photo_url: v.photo_url,
        status: v.status
    });
    setCurrentVehicle(v);
    setEditMode(true);
    setShowModal(true);
  };

  const openProfileView = (v) => {
    setCurrentVehicle(v);
    setActiveTab('profile');
  };

  // Filtered vehicles for dashboard search
  const filteredVehicles = vehicles.filter(v => 
    v.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="vehicles-container p-6 animate-fade-in text-slate-900">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
             {activeTab === 'profile' && (
                <button onClick={() => setActiveTab('dashboard')} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition text-slate-600">
                    <X size={20} />
                </button>
             )}
            <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <Car className="text-primary-600" size={32} />
                {activeTab === 'profile' ? `Profil : ${currentVehicle?.license_plate}` : 'Gestion des Véhicules'}
            </h1>
            <p className="text-slate-500 mt-1">Interface d'administration du parc automobile national.</p>
            </div>
        </div>
        
        {/* Tabs - Only Admin can see Config */}
        {activeTab !== 'profile' && (
            <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutDashboard size={16} /> Dashboard
                </button>
                {isAdmin && (
                    <button 
                        onClick={() => setActiveTab('config')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 ${activeTab === 'config' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Settings size={16} /> Configuration
                    </button>
                )}
            </div>
        )}
      </div>

      {activeTab === 'dashboard' && (
        <>
            {/* Dashboard and Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center text-primary-600 mb-2 font-black">
                    <TrendingUp size={28} />
                    </div>
                    <div>
                    <p className="text-4xl font-black">{stats.total}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Véhicules</p>
                    </div>
                </div>
                {stats.byType.slice(0, 3).map((type, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center text-slate-400 mb-2">
                        <Car size={28} />
                    </div>
                    <div>
                        <p className="text-4xl font-black">{type.count}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{type.vehicle_type}</p>
                    </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-12">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h2 className="text-xl font-bold">Liste des véhicules</h2>
                
                <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                    type="text"
                    placeholder="Plaque, Marque, VIN..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-600 outline-none text-sm font-medium transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
                >
                    <Plus size={18} /> Nouveau
                </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Véhicule</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Marque & Modèle</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Plaque</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Propriétaire</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {loading ? (
                    <tr><td colSpan="5" className="px-8 py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></td></tr>
                    ) : filteredVehicles.length === 0 ? (
                    <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-400 italic font-medium">Aucun véhicule</td></tr>
                    ) : filteredVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/30 transition group">
                        <td className="px-8 py-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
                                {v.photo_url ? <img src={v.photo_url} className="w-full h-full object-cover" /> : <Car className="text-slate-300" size={20} />}
                            </div>
                        </td>
                        <td className="px-8 py-4">
                            <p className="text-sm font-bold text-slate-800">{v.make} {v.model}</p>
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-tighter">{v.vehicle_type} • {v.year}</p>
                        </td>
                        <td className="px-8 py-4">
                            <p className="text-sm font-black text-primary-600 tracking-wider bg-primary-50 px-3 py-1.5 rounded-lg inline-block uppercase">{v.license_plate}</p>
                        </td>
                        <td className="px-8 py-4">
                            <p className="text-sm font-bold text-slate-700">{v.first_name} {v.last_name}</p>
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-tight">NIF: {v.nif || '—'}</p>
                        </td>
                        <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => openProfileView(v)} className="px-4 py-2 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition">
                                Voir plus
                            </button>
                            <button onClick={() => openEditModal(v)} className="p-2.5 text-slate-400 hover:text-amber-600 transition"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(v.id)} className="p-2.5 text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </>
      )}

      {activeTab === 'config' && isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-slide-up">
            {/* Marques Module */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Database className="text-primary-600" size={20} /> Marques
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">Référentiel des constructeurs</p>
                        </div>
                        <button onClick={() => setShowMakeModal(true)} className="p-3 bg-primary-50 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition shadow-sm shadow-primary-200">
                            <Plus size={20} />
                        </button>
                    </div>
                    {/* Search Make */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Procurer une marque..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            value={makeSearch}
                            onChange={e => setMakeSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto max-h-[400px]">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-50">
                            {makes.filter(m => m.name.toLowerCase().includes(makeSearch.toLowerCase())).map(m => (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition">
                                    <td className="px-8 py-5 text-sm font-bold">{m.name}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button onClick={() => handleDeleteMake(m.id)} className="p-2 text-slate-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modèles Module */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Car className="text-primary-600" size={20} /> Modèles
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">Référentiel par marque</p>
                        </div>
                        <button onClick={() => setShowModelModal(true)} className="p-3 bg-primary-50 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition shadow-sm shadow-primary-200">
                            <Plus size={20} />
                        </button>
                    </div>
                    {/* Search Model */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Chercher un modèle..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            value={modelSearch}
                            onChange={e => setModelSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto max-h-[400px]">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-50">
                            {models.filter(mod => mod.name.toLowerCase().includes(modelSearch.toLowerCase())).map(mod => {
                                const make = makes.find(mk => mk.id === mod.make_id);
                                return (
                                    <tr key={mod.id} className="hover:bg-slate-50/50 transition">
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-bold">{mod.name}</p>
                                            <p className="text-[10px] text-primary-500 font-black uppercase tracking-widest">{make?.name || '—'}</p>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2 text-slate-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Colors Module */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full col-span-1 lg:col-span-2 mt-6">
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Plus className="text-primary-600" size={20} /> Couleurs
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">Référentiel des couleurs</p>
                        </div>
                        <button onClick={() => setShowColorModal(true)} className="p-3 bg-primary-50 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition shadow-sm shadow-primary-200">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto max-h-[300px]">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-8">
                        {colors.map(c => (
                            <div key={c.id} className="bg-slate-50 p-4 rounded-xl flex items-center justify-between group hover:bg-white hover:shadow-md transition">
                                <span className="text-sm font-bold text-slate-700">{c.name}</span>
                                <button onClick={() => handleDeleteColor(c.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'profile' && currentVehicle && (
        <div className="animate-slide-up bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Photo & Identity */}
                <div className="space-y-8">
                    <div className="aspect-square bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-inner group">
                        {currentVehicle.photo_url ? (
                            <img src={currentVehicle.photo_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" title="Photo du véhicule" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Car size={80} strokeWidth={1} />
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Plaque d'Immatriculation</label>
                        <div className="bg-white px-6 py-4 rounded-2xl border-2 border-slate-900 shadow-lg text-center font-black text-2xl text-slate-900 tracking-[0.2em] font-mono">
                            {currentVehicle.license_plate}
                        </div>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="lg:col-span-2 space-y-10">
                    <div>
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Zap className="text-amber-500" size={24} /> Fiche Technique
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { label: 'Marque', val: currentVehicle.make },
                                { label: 'Modèle', val: currentVehicle.model },
                                { label: 'Année', val: currentVehicle.year },
                                { label: 'Couleur', val: currentVehicle.color },
                                { label: 'Type', val: currentVehicle.vehicle_type },
                                { label: 'Carburant', val: currentVehicle.fuel_type || '—' },
                                { label: 'VIN', val: currentVehicle.vin },
                                { label: 'Moteur #', val: currentVehicle.engine_number || '—' }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-50 hover:border-primary-100 transition">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{item.label}</p>
                                    <p className="text-lg font-bold">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-100">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Users className="text-primary-500" size={24} /> Propriétaire
                        </h3>
                        <div className="bg-primary-50/30 p-8 rounded-3xl border border-primary-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-grow">
                                <p className="text-xl font-black text-slate-900">{currentVehicle.first_name || 'Nom Inconnu'} {currentVehicle.last_name || ''}</p>
                                <p className="text-sm font-bold text-primary-600 mt-1 uppercase tracking-wider">NIF : {currentVehicle.nif || 'Non renseigné'}</p>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                                         <p className="text-sm font-medium">{currentVehicle.phone || '—'} / {currentVehicle.email || '—'}</p>
                                     </div>
                                     <div>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adresse</p>
                                         <p className="text-sm font-medium">{currentVehicle.owner_address || '—'} {currentVehicle.owner_city ? `(${currentVehicle.owner_city})` : ''}</p>
                                     </div>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center text-primary-600 shadow-md">
                                <Users size={28} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-10">
                        <button onClick={() => setActiveTab('dashboard')} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition">
                            Retour à la liste
                        </button>
                        <button onClick={() => openEditModal(currentVehicle)} className="flex-1 py-4 border-2 border-slate-200 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition">
                            Modifier la fiche
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- Addition/Edit Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <h2 className="text-2xl font-black text-slate-900">{editMode ? 'Modifier le Véhicule' : 'Nouveau Véhicule'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-slate-50 p-3 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">NIF Propriétaire</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: 000-000-000-0"
                    value={formData.owner_nif}
                    onChange={(e) => setFormData({...formData, owner_nif: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary-600/10 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Type de véhicule</label>
                  <select 
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary-600/10 outline-none font-bold appearance-none bg-chevron-down bg-no-repeat bg-[right_1.25rem_center]"
                  >
                    {['Voiture', 'Moto', 'Bicyclette', 'Camion', 'Bus'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Numéro VIN</label>
                  <input 
                    type="text" 
                    required
                    value={formData.vin}
                    onChange={(e) => setFormData({...formData, vin: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary-600/10 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Plaque d'immatriculation</label>
                  <input 
                    type="text" 
                    required
                    value={formData.license_plate}
                    onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary-600/10 outline-none font-bold text-primary-600 uppercase"
                  />
                </div>

                {/* Marques & Modèles Selects */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Marque</label>
                  <select 
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary-600/10 outline-none font-bold"
                  >
                    <option value="">Sélectionner...</option>
                    {makes.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Modèle</label>
                  <select 
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary-600/10 outline-none font-bold"
                  >
                    <option value="">Sélectionner...</option>
                    {models.filter(m => {
                        const make = makes.find(mk => mk.name === formData.make);
                        return !formData.make || m.make_id === make?.id;
                    }).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Couleur</label>
                    <select 
                        required
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary-600/10 outline-none font-bold"
                    >
                        <option value="">Sélectionner...</option>
                        {colors.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Année</label>
                  <input 
                    type="number" 
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary-600/10 outline-none font-bold"
                  />
                </div>

                {/* Photo Section */}
                <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-50">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Photo du véhicule</label>
                   <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 overflow-hidden relative group cursor-pointer">
                         {formData.photo_url ? (
                           <img src={formData.photo_url} className="w-full h-full object-cover" />
                         ) : (
                           <Camera size={24} />
                         )}
                         <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Plus size={20} />
                         </div>
                      </div>
                      <div className="flex-grow space-y-2">
                        <input 
                          type="text" 
                          placeholder="Lien de la photo (URL)..."
                          value={formData.photo_url}
                          onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary-600/10 outline-none font-medium"
                        />
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 mt-12 bg-white sticky bottom-0 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition flex items-center justify-center gap-2"
                >
                  <Check size={18} /> {editMode ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Make Config Modal --- */}
      {showMakeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-scale-in">
                <h3 className="text-xl font-bold mb-6">Ajouter une Marque</h3>
                <form onSubmit={handleAddMake} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Nom de la marque (ex: Toyota)"
                        required
                        className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary-600/20 outline-none font-bold"
                        value={newMake.name}
                        onChange={e => setNewMake({name: e.target.value})}
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setShowMakeModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-slate-500 font-bold">Annuler</button>
                        <button type="submit" className="flex-1 py-3 bg-primary-600 rounded-xl text-white font-bold">Ajouter</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- Model Config Modal --- */}
      {showModelModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-scale-in">
                <h3 className="text-xl font-bold mb-6">Ajouter un Modèle</h3>
                <form onSubmit={handleAddModel} className="space-y-4">
                    <select 
                        required
                        className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary-600/20 outline-none font-bold"
                        value={newModel.make_id}
                        onChange={e => setNewModel({...newModel, make_id: e.target.value})}
                    >
                        <option value="">Sélectionner une Marque...</option>
                        {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input 
                        type="text" 
                        placeholder="Nom du modèle (ex: Camry)"
                        required
                        className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary-600/20 outline-none font-bold"
                        value={newModel.name}
                        onChange={e => setNewModel({...newModel, name: e.target.value})}
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setShowModelModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-slate-500 font-bold">Annuler</button>
                        <button type="submit" className="flex-1 py-3 bg-primary-600 rounded-xl text-white font-bold">Ajouter</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- Color Config Modal --- */}
      {showColorModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold mb-6">Ajouter une Couleur</h3>
            <form onSubmit={handleAddColor} className="space-y-4">
              <input 
                type="text" 
                placeholder="Nom de la couleur (ex: Noir Cosmos)"
                required
                className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary-600/20 outline-none font-bold"
                value={newColor.name}
                onChange={e => setNewColor({name: e.target.value})}
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowColorModal(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-slate-500 font-bold">Annuler</button>
                <button type="submit" className="flex-1 py-3 bg-primary-600 rounded-xl text-white font-bold">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionVehicules;
