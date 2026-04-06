import { useState, useEffect } from 'react';
import { Layers, Tag, Info, FileText, CheckCircle2, ChevronRight, Search, LayoutGrid, List } from 'lucide-react';
import './SuperAdmin.css';

const ServiceSummary = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/admin/services', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.status === 'success') {
                    setServices(data.data);
                }
            } catch (err) {
                console.error('Error fetching services:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const filteredServices = services.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.categorie || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="sa-page sa-page-full">
            <div className="sa-page-header">
                <div>
                    <h2><Layers size={22} /> Profil des Services</h2>
                    <p>Résumé détaillé de tous les services et sous-modules enregistrés dans le système.</p>
                </div>
                <div className="sa-view-toggles">
                    <button className={`sa-view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}><LayoutGrid size={18} /></button>
                    <button className={`sa-view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}><List size={18} /></button>
                </div>
            </div>

            <div className="sa-filters-bar">
                <div className="sa-search-box">
                    <Search size={16} className="sa-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un service..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="sa-loading-list">
                    {[...Array(6)].map((_, i) => <div key={i} className="sa-skeleton-row" style={{ height: 100, marginBottom: 15 }} />)}
                </div>
            ) : (
                <div className={view === 'grid' ? "sa-service-summary-grid" : "sa-service-summary-list"}>
                    {filteredServices.map(svc => (
                        <div key={svc.id} className="sa-summary-card">
                            <div className="sa-summary-header">
                                <div className="sa-summary-title">
                                    <div className="sa-summary-icon">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <h4>{svc.name}</h4>
                                        <span className="sa-summary-category"><Tag size={12} /> {svc.categorie || 'Autre'}</span>
                                    </div>
                                </div>
                                <div className={`sa-summary-status ${svc.actif !== false ? 'active' : 'inactive'}`}>
                                    {svc.actif !== false ? 'Actif' : 'Inactif'}
                                </div>
                            </div>

                            <div className="sa-summary-body">
                                {svc.description && (
                                    <div 
                                        className="sa-summary-desc" 
                                        dangerouslySetInnerHTML={{ __html: svc.description }} 
                                    />
                                )}
                                
                                <div className="sa-summary-details">
                                    <div className="sa-detail-section">
                                        <h5><FileText size={14} /> Documents ({svc.required_documents?.length || 0})</h5>
                                        <div className="sa-summary-tags">
                                            {(svc.required_documents || []).length > 0 ? (
                                                svc.required_documents.slice(0, 3).map((d, i) => (
                                                    <span key={i} className="sa-mini-tag">{typeof d === 'string' ? d : d.name}</span>
                                                ))
                                            ) : (
                                                <span className="sa-empty-tag">Aucun document</span>
                                            )}
                                            {(svc.required_documents || []).length > 3 && <span className="sa-more-tag">+{svc.required_documents.length - 3}</span>}
                                        </div>
                                    </div>

                                    <div className="sa-detail-section">
                                        <h5><CheckCircle2 size={14} /> Opérations ({svc.operations?.length || 0})</h5>
                                        <div className="sa-summary-tags">
                                            {(svc.operations || []).length > 0 ? (
                                                svc.operations.slice(0, 2).map((op, i) => (
                                                    <span key={i} className="sa-mini-tag op-tag">{op.name}</span>
                                                ))
                                            ) : (
                                                <span className="sa-empty-tag">Aucun sous-module</span>
                                            )}
                                            {(svc.operations || []).length > 2 && <span className="sa-more-tag">+{svc.operations.length - 2}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sa-summary-footer">
                                <button className="sa-view-more-btn" onClick={() => window.location.href=`/superadmin/services?edit=${svc.id}`}>
                                    Voir plus <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceSummary;
