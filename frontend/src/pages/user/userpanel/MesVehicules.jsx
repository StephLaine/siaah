import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Search, MapPin, Calendar, Info, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './Vehicles.css';

const MesVehicules = () => {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [token]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5001/api/vehicles/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Impossible de charger vos véhicules.');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="vehicles-container p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mes Véhicules</h1>
          <p className="text-slate-500 mt-1">Liste des véhicules enregistrés à votre nom.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {filteredVehicles.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Aucun véhicule trouvé</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">Vous n'avez pas encore de véhicule enregistré ou aucune correspondance n'a été trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition group">
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {vehicle.photo_url ? (
                  <img src={vehicle.photo_url} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Car size={48} className="mb-2 opacity-50" />
                    <span className="text-xs uppercase font-bold tracking-widest">Pas de photo</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    vehicle.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {vehicle.status === 'active' ? 'En circulation' : 'En attente'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-primary-600 font-bold text-sm tracking-widest uppercase">{vehicle.license_plate}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-slate-400 group-hover:text-primary-600 transition">
                    <Info size={18} />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Année : {vehicle.year}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>Type : {vehicle.vehicle_type}</span>
                  </div>
                </div>

                <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-primary-600 hover:text-white text-slate-700 rounded-xl font-bold text-sm transition uppercase tracking-widest">
                  Détails du véhicule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesVehicules;
