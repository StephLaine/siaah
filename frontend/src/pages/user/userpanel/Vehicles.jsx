import React, { useState, useEffect } from 'react';
import { Car, Search, Eye, AlertCircle, Loader2, ChevronRight, Fuel, Users, Calendar, Fingerprint } from 'lucide-react';
import axios from 'axios';
import './Vehicles.css';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/vehicles/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVehicles(res.data.data);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = vehicles.filter(v => 
        (v.vin || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.license_plate || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.make || '').toLowerCase().includes(search.toLowerCase())
    );

    if (selectedVehicle) {
        return (
            <div className="vehicle-profile-view animate-fade-in">
                <button className="back-btn-pro" onClick={() => setSelectedVehicle(null)}>
                    <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} /> Retour à la liste
                </button>
                
                <div className="vehicle-header">
                    <div className="vehicle-icon-large">
                        <Car size={48} />
                    </div>
                    <div className="vehicle-title">
                        <h2>{selectedVehicle.make} {selectedVehicle.model}</h2>
                        <span className="plate-badge">{selectedVehicle.license_plate || 'SANS PLAQUE'}</span>
                    </div>
                </div>

                <div className="vehicle-details-grid">
                    <div className="detail-card">
                        <Fingerprint size={20} />
                        <div className="detail-info">
                            <label>VIN (Châssis)</label>
                            <p>{selectedVehicle.vin}</p>
                        </div>
                    </div>
                    <div className="detail-card">
                        <Calendar size={20} />
                        <div className="detail-info">
                            <label>Année</label>
                            <p>{selectedVehicle.year}</p>
                        </div>
                    </div>
                    <div className="detail-card">
                        <Fuel size={20} />
                        <div className="detail-info">
                            <label>Carburant</label>
                            <p>{selectedVehicle.fuel_type || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="detail-card">
                        <Users size={20} />
                        <div className="detail-info">
                            <label>Places</label>
                            <p>{selectedVehicle.seats_count || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="vehicle-meta">
                    <h3>Autres informations</h3>
                    <ul>
                        <li><strong>Couleur:</strong> {selectedVehicle.color}</li>
                        <li><strong>Type:</strong> {selectedVehicle.vehicle_type || 'N/A'}</li>
                        <li><strong>Moteur:</strong> {selectedVehicle.engine_number || 'N/A'}</li>
                        <li><strong>Statut:</strong> <span className={`status-tag ${selectedVehicle.status}`}>{selectedVehicle.status}</span></li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="vehicles-module animate-fade-in">
            <div className="module-header">
                <div>
                    <h2>Gestion des Véhicules</h2>
                    <p>Liste de tous les véhicules identifiés sur votre compte.</p>
                </div>
                <div className="search-wrapper-pro">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher par VIN, Plaque ou Marque..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="animate-spin" />
                    <span>Chargement de vos véhicules...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <AlertCircle size={40} />
                    <p>Aucun véhicule trouvé.</p>
                </div>
            ) : (
                <div className="vehicles-grid">
                    {filtered.map(v => (
                        <div key={v.id} className="vehicle-item-card" onClick={() => setSelectedVehicle(v)}>
                            <div className="v-card-icon">
                                <Car size={24} />
                            </div>
                            <div className="v-card-info">
                                <h3>{v.make} {v.model}</h3>
                                <span>{v.license_plate || 'Plaque en attente'}</span>
                                <p>VIN: {v.vin}</p>
                            </div>
                            <Eye size={20} className="eye-icon" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Vehicles;
