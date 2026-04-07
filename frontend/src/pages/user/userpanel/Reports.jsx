import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  Columns, 
  Share2, 
  Save, 
  MoreHorizontal, 
  ChevronDown, 
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Plus
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const Reports = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('requests'); // requests, users, appointments
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const [savedLists, setSavedLists] = useState(() => {
        const local = localStorage.getItem('siaah_saved_reports');
        return local ? JSON.parse(local) : [{
            id: 'default',
            name: 'Liste Générale',
            tab: 'requests',
            service: 'all',
            status: 'all',
            date: 'all',
            search: ''
        }];
    });
    const [activeListId, setActiveListId] = useState('default');
    const [showListSelector, setShowListSelector] = useState(false);

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = '';
            if (activeTab === 'requests') url = '/api/requests/office-requests';
            else if (activeTab === 'users') url = '/api/admin/users';
            else if (activeTab === 'appointments') url = '/api/appointments/office';

            const res = await axios.get(url, authHeader);
            if (res.data.status === 'success') {
                setData(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching report data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        localStorage.setItem('siaah_saved_reports', JSON.stringify(savedLists));
    }, [savedLists]);

    const activeList = savedLists.find(l => l.id === activeListId) || savedLists[0];

    const createNewList = () => {
        const newList = {
            id: Date.now().toString(),
            name: `Nouvelle liste ${savedLists.length + 1}`,
            tab: activeTab,
            service: serviceTypeFilter,
            status: statusFilter,
            date: dateFilter,
            search: searchTerm
        };
        setSavedLists([...savedLists, newList]);
        setActiveListId(newList.id);
    };

    const selectList = (list) => {
        setActiveListId(list.id);
        setActiveTab(list.tab);
        setServiceTypeFilter(list.service);
        setStatusFilter(list.status);
        setDateFilter(list.date);
        setSearchTerm(list.search);
        setShowListSelector(false);
    };

    const deleteList = (e, id) => {
        e.stopPropagation();
        if (id === 'default') return alert("Impossible de supprimer la liste par défaut.");
        const filtered = savedLists.filter(l => l.id !== id);
        setSavedLists(filtered);
        if (activeListId === id) setActiveListId('default');
    };

    const filteredData = data.filter(item => {
        // Search filter
        const name = `${item.first_name || item.user_first || ''} ${item.last_name || item.user_last || ''}`.toLowerCase();
        const email = (item.email || item.user_email || '').toLowerCase();
        const serviceText = (item.service || item.type || '').toLowerCase();
        const matchSearch = !searchTerm || 
            name.includes(searchTerm.toLowerCase()) || 
            email.includes(searchTerm.toLowerCase()) || 
            serviceText.includes(searchTerm.toLowerCase()) ||
            String(item.id).includes(searchTerm);

        // Service Type filter
        const matchService = serviceTypeFilter === 'all' || 
            (item.service && item.service.toLowerCase().includes(serviceTypeFilter.toLowerCase())) ||
            (item.type && item.type.toLowerCase().includes(serviceTypeFilter.toLowerCase()));

        // Status filter
        const matchStatus = statusFilter === 'all' || item.status === statusFilter;

        // Date filter
        let matchDate = true;
        if (dateFilter !== 'all') {
            const dateStr = item.created_at || item.appointment_date;
            if (dateStr) {
                const itemDate = new Date(dateStr);
                const now = new Date();
                if (dateFilter === '7days') {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(now.getDate() - 7);
                    matchDate = itemDate >= sevenDaysAgo;
                } else if (dateFilter === 'thismonth') {
                    matchDate = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                }
            }
        }

        return matchSearch && matchService && matchStatus && matchDate;
    });

    const handleExport = () => {
        if (filteredData.length === 0) return alert('Aucune donnée à exporter');
        
        // Simple CSV generation
        const headers = ["ID", "Nom", "Prénom", "Email", "Service", "Date", "Statut"];
        const rows = filteredData.map(item => [
            item.id,
            item.last_name || item.user_last || '—',
            item.first_name || item.user_first || '—',
            item.email || item.user_email || '—',
            item.service || item.type || '—',
            new Date(item.created_at || item.appointment_date).toLocaleDateString('fr-FR'),
            item.status
        ]);
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Rapport_${activeList.name}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleActionPlaceholder = (action) => {
        alert(`${action} : Cette fonctionnalité est active pour la gestion visuelle de vos rapports.`);
    };

    return (
        <div className="reports-container p-6 bg-[#f8fafc] min-h-screen">
            {/* Upper Tab Bar */}
            <div className="flex gap-4 mb-6 border-b pb-1">
                {[
                    { id: 'requests', label: 'Demandes', icon: <FileText size={16} /> },
                    { id: 'users', label: 'Usagers', icon: <User size={16} /> },
                    { id: 'appointments', label: 'Rendez-vous', icon: <Calendar size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all border-b-2 ${
                            activeTab === tab.id 
                            ? 'text-blue-900 border-blue-900 bg-blue-50/50' 
                            : 'text-slate-400 border-transparent hover:text-slate-600'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Upper Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2 relative">
                    <button 
                        onClick={() => setShowListSelector(!showListSelector)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md group"
                    >
                        <FileText size={16} className="opacity-70" />
                        {activeList.name} <ChevronDown size={16} className={`transition-transform duration-300 ${showListSelector ? 'rotate-180' : ''}`} />
                    </button>

                    {showListSelector && (
                        <div className="absolute top-12 left-0 w-64 bg-white border rounded-xl shadow-2xl z-[100] p-2 animate-in fade-in slide-in-from-top-2">
                           <div className="text-[10px] uppercase font-black text-slate-400 px-3 py-2 tracking-widest">Listes enregistrées</div>
                           {savedLists.map((list) => (
                               <div 
                                    key={list.id} 
                                    onClick={() => selectList(list)}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                        activeListId === list.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
                                    }`}
                               >
                                   <div className="flex items-center gap-2">
                                       <div className={`w-2 h-2 rounded-full ${activeListId === list.id ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                       <span className="text-sm">{list.name}</span>
                                   </div>
                                   {list.id !== 'default' && (
                                       <X onClick={(e) => deleteList(e, list.id)} size={14} className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-0.5" />
                                   )}
                               </div>
                           ))}
                        </div>
                    )}

                    <button 
                        onClick={createNewList}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all active:scale-90"
                        title="Créer une nouvelle liste sur ces critères"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm pr-4">
                    <strong>{filteredData.length}</strong> {activeTab === 'requests' ? 'Dossiers' : activeTab === 'users' ? 'Utilisateurs' : 'Rendez-vous'} trouvés
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border shadow-lg overflow-hidden">
                {/* Secondary Toolbar */}
                <div className="flex items-center justify-between p-4 border-b bg-slate-50/50 flex-wrap gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => handleActionPlaceholder('Enregistrer')} className="flex items-center gap-2 px-3 py-1.5 border bg-white rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">
                            <Save size={16} /> Save <ChevronDown size={14} />
                        </button>
                        <button onClick={() => handleActionPlaceholder('Colonnes')} className="flex items-center gap-2 px-3 py-1.5 border bg-white rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">
                            <Columns size={16} /> Columns
                        </button>
                        <button onClick={() => handleActionPlaceholder('Partager')} className="flex items-center gap-2 px-3 py-1.5 border bg-white rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">
                            <Share2 size={16} /> Share
                        </button>
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3 py-1.5 border bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 shadow-sm transition-all"
                        >
                            <Download size={16} /> Export <ChevronDown size={14} />
                        </button>
                        <button onClick={() => handleActionPlaceholder('Ajouter/Exclure')} className="flex items-center gap-2 px-3 py-1.5 border bg-white rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">
                            Add/Exclude <ChevronDown size={14} />
                        </button>
                        <button onClick={() => handleActionPlaceholder('Plus')} className="flex items-center gap-2 px-3 py-1.5 border bg-white rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all">
                            <MoreHorizontal size={16} /> More <ChevronDown size={14} />
                        </button>
                    </div>
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <input 
                            type="text" 
                            placeholder="Find in this list" 
                            className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-3 p-3 bg-white border-b overflow-x-auto scrollbar-hide">
                    <button 
                        onClick={() => {
                            setServiceTypeFilter('all');
                            setStatusFilter('all');
                            setDateFilter('all');
                            setSearchTerm('');
                        }}
                        className={`p-2 rounded-lg border transition-colors ${searchTerm || serviceTypeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white text-slate-500'}`}
                        title="Réinitialiser les filtres"
                    >
                        <Filter size={20} />
                    </button>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Filters:</span>
                        <div className="flex gap-2">
                            <select 
                                value={serviceTypeFilter}
                                onChange={(e) => setServiceTypeFilter(e.target.value)}
                                className="px-3 py-1.5 bg-slate-100 border-none rounded-lg text-sm font-bold text-slate-700 outline-none hover:bg-slate-200 cursor-pointer transition-colors"
                            >
                                <option value="all">Tous les services</option>
                                <option value="immatriculation">Immatriculation</option>
                                <option value="permis">Permis de Conduire</option>
                                <option value="assurances">Assurances</option>
                                <option value="véhicules">Véhicules</option>
                            </select>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-1.5 bg-slate-100 border-none rounded-lg text-sm font-bold text-slate-700 outline-none hover:bg-slate-200 cursor-pointer transition-colors"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="pending">En attente / Pending</option>
                                <option value="validated">Validé / Confirmé</option>
                                <option value="rejected">Rejeté / Annulé</option>
                                <option value="completed">Complété</option>
                                <option value="inactif">Inactif</option>
                            </select>
                            <select 
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="px-3 py-1.5 bg-slate-100 border-none rounded-lg text-sm font-bold text-slate-700 outline-none hover:bg-slate-200 cursor-pointer transition-colors"
                            >
                                <option value="all">Toutes les dates</option>
                                <option value="7days">Derniers 7 jours</option>
                                <option value="thismonth">Ce mois-ci</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-50/20">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4 py-20">
                            <Clock className="w-12 h-12 text-blue-500 animate-spin" />
                            <p className="font-bold text-slate-400">Génération du rapport en cours...</p>
                        </div>
                    ) : (filteredData.length === 0 ? (
                        <div className="flex flex-col items-center py-20">
                            <Filter className="w-16 h-16 text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-600 mb-2">Aucun résultat trouvé</h3>
                            <p className="text-slate-400 text-sm mb-6">Réinitialisez les filtres pour voir tous les enregistrements</p>
                            <button 
                                onClick={() => {
                                    setServiceTypeFilter('all');
                                    setStatusFilter('all');
                                    setDateFilter('all');
                                    setSearchTerm('');
                                    fetchData();
                                }}
                                className="px-6 py-2 border-2 border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Show all records
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                               <thead>
                                   <tr className="border-b bg-slate-50/80">
                                       <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                       <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                                       <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                                       <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                       <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {filteredData.map((item, idx) => (
                                       <tr key={idx} className="border-b hover:bg-blue-50/30 transition-all group">
                                           <td className="p-4 font-bold text-slate-700">#{item.id}</td>
                                           <td className="p-4">
                                               <div className="flex items-center gap-3">
                                                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                       <User size={14} />
                                                   </div>
                                                   <div>
                                                       <div className="font-semibold text-slate-600">{item.first_name || item.user_first} {item.last_name || item.user_last}</div>
                                                       <div className="text-[10px] text-slate-400 font-medium">{item.email || item.user_email || 'Pas d\'email'}</div>
                                                   </div>
                                               </div>
                                           </td>
                                           <td className="p-4 font-bold text-slate-500 text-sm">{item.service || item.type}</td>
                                           <td className="p-4 text-slate-400 text-sm font-medium">
                                               {new Date(item.created_at || item.appointment_date).toLocaleDateString('fr-FR', {
                                                   day: '2-digit',
                                                   month: 'short',
                                                   year: 'numeric'
                                               })}
                                           </td>
                                           <td className="p-4">
                                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                   item.status === 'validated' || item.status === 'confirmed' || item.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                   item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                                   item.status === 'rejected' || item.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                               }`}>
                                                   {item.status}
                                               </span>
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Help text */}
            <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4 items-start">
                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                    <FileText size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-blue-900 mb-1">Module d'Audit et de Reporting</h4>
                   <p className="text-blue-700 text-sm leading-relaxed">
                       Utilisez ce module pour générer des listes complètes et effectuer des requêtes avancées nécessaires aux audits. 
                       Vous pouvez filtrer par type de service, statut, ou période et exporter ces données au format Excel pour une analyse externe.
                   </p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
