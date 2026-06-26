import { useState, useEffect } from 'react';
import { Building2, Users, MapPin, FileCheck, TrendingUp, Activity, AlertCircle, Layers } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import './SuperAdmin.css';

const StatCard = ({ icon, label, value, color, trend }) => (
    <div className={`sa-stat-card sa-stat-${color}`}>
        <div className="sa-stat-icon">{icon}</div>
        <div className="sa-stat-body">
            <div className="sa-stat-value">{value}</div>
            <div className="sa-stat-label">{label}</div>
        </div>
        {trend && <div className="sa-stat-trend"><TrendingUp size={14} /><span>{trend}</span></div>}
    </div>
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#7c3aed', '#6366f1', '#ef4444'];

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEntities: 0, totalUsers: 0, totalEmployees: 0, totalOffices: 0,
        deptData: [], evolutionData: [], officePieData: []
    });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month'); // day, month, year
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/admin/stats?period=${period}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.status === 'success') setStats(data.data);
            } catch (err) {
                setError('Impossible de charger les statistiques.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [period]);

    // Provide defaults if data is missing
    const deptData = stats.deptData?.length > 0 ? stats.deptData : [{ name: 'Aucune donnée', services: 0 }];
    const evolutionData = stats.evolutionData?.length > 0 ? stats.evolutionData : [{ label: 'N/A', users: 0 }];
    const officePieData = stats.officePieData?.length > 0 ? stats.officePieData : [{ name: 'Aucune donnée', value: 1 }];

    return (
        <div className="sa-page sa-page-full">
            <div className="sa-page-header">
                <div>
                    <h2>Tableau de Bord</h2>
                    <p>Vue d'ensemble du système — MEF</p>
                </div>
                <div className="sa-system-status">
                    <Activity size={14} className="status-dot" />
                    <span>Système Actif</span>
                </div>
            </div>

            {error && <div className="sa-alert-error"><AlertCircle size={16} />{error}</div>}

            {loading ? (
                <div className="sa-loading-grid">
                    {[...Array(4)].map((_, i) => <div key={i} className="sa-skeleton-card" />)}
                </div>
            ) : (
                <div className="sa-stats-grid">
                    <StatCard
                        icon={<Building2 size={28} />}
                        label="Entités Enregistrées"
                        value={stats.totalEntities}
                        color="blue"
                        trend="+2 ce mois"
                    />
                    <StatCard
                        icon={<Users size={28} />}
                        label="Utilisateurs Totaux"
                        value={stats.totalUsers}
                        color="purple"
                        trend="Actifs"
                    />
                    <StatCard
                        icon={<FileCheck size={28} />}
                        label="Employés"
                        value={stats.totalEmployees}
                        color="green"
                    />
                    <StatCard
                        icon={<MapPin size={28} />}
                        label="Bureaux Actifs"
                        value={stats.totalOffices}
                        color="orange"
                    />
                </div>
            )}

            {/* Advanced Stats Section */}
            <div className="sa-charts-row" style={{ marginBottom: '2rem' }}>
                <div className="sa-info-card sa-chart-card">
                    <div className="sa-chart-header">
                        <h3><MapPin size={18} /> Bureaux par Département</h3>
                        <p>Répartition des points de service physiques sur le territoire</p>
                    </div>
                    <div style={{ height: 320, width: '100%', minHeight: 0, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.officePieData?.length > 0 ? stats.officePieData : [{ name: 'Aucun', value: 0 }]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="value" name="Nombre de bureaux" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="sa-info-card sa-chart-card">
                    <div className="sa-chart-header sa-chart-header-flex">
                        <div>
                            <h3><Users size={18} /> Évolution des Utilisateurs</h3>
                            <p>Inscriptions et croissance par étape</p>
                        </div>
                        <div className="sa-chart-period-tabs">
                            <button className={period === 'day' ? 'active' : ''} onClick={() => setPeriod('day')}>Jour</button>
                            <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>Mois</button>
                            <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')}>Année</button>
                        </div>
                    </div>
                    <div style={{ height: 320, width: '100%', minHeight: 0, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="users" name="Inscriptions" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="sa-charts-row" style={{ marginBottom: '2rem' }}>
                <div className="sa-info-card sa-chart-card" style={{ flex: '0.4' }}>
                    <div className="sa-chart-header">
                        <h3><Users size={18} /> Utilisateurs par Dép.</h3>
                        <p>Répartition géographique des usagers</p>
                    </div>
                    <div style={{ height: 260, width: '100%', minHeight: 0, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.usersByDept?.length > 0 ? stats.usersByDept : [{ name: 'Aucun', value: 1 }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.usersByDept?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="sa-info-card sa-stats-summary-card" style={{ flex: '0.6' }}>
                    <div className="sa-chart-header">
                        <h3><Activity size={18} /> Performance du Réseau</h3>
                        <p>Efficacité et couverture opérationnelle</p>
                    </div>
                    <div className="sa-perf-grid">
                        <div className="sa-perf-item">
                            <span className="sa-perf-label">Couverture Nationale</span>
                            <div className="sa-perf-bar-bg"><div className="sa-perf-bar-fill" style={{ width: '85%', background: '#3b82f6' }}></div></div>
                            <span className="sa-perf-val">85%</span>
                        </div>
                        <div className="sa-perf-item">
                            <span className="sa-perf-label">Délai de Traitement Moyen</span>
                            <div className="sa-perf-bar-bg"><div className="sa-perf-bar-fill" style={{ width: '72%', background: '#10b981' }}></div></div>
                            <span className="sa-perf-val">4.2 Jours</span>
                        </div>
                        <div className="sa-perf-item">
                            <span className="sa-perf-label">Taux de Satisfaction</span>
                            <div className="sa-perf-bar-bg"><div className="sa-perf-bar-fill" style={{ width: '91%', background: '#f59e0b' }}></div></div>
                            <span className="sa-perf-val">91%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sa-dashboard-grid">
                <div className="sa-info-card">
                    <h3>Accès Rapide</h3>
                    <div className="sa-quick-links">
                        <a href="/superadmin/entites" className="sa-quick-link sa-ql-blue">
                            <Building2 size={22} />
                            <span>Gérer les Entités</span>
                        </a>
                        <a href="/superadmin/services-summary" className="sa-quick-link sa-ql-orange">
                            <Layers size={22} />
                            <span>Profil des Services</span>
                        </a>
                        <a href="/superadmin/bureaux" className="sa-quick-link sa-ql-green">
                            <MapPin size={22} />
                            <span>Gérer les Bureaux</span>
                        </a>
                        <a href="/superadmin/utilisateurs" className="sa-quick-link sa-ql-purple">
                            <Users size={22} />
                            <span>Gérer les Utilisateurs</span>
                        </a>
                    </div>
                </div>

                <div className="sa-info-card">
                    <h3>Informations Système</h3>
                    <div className="sa-sys-info-list">
                        <div className="sa-sys-info-item">
                            <span className="sa-sys-label">Plateforme</span>
                            <span className="sa-sys-value">SIAAH v1.0</span>
                        </div>
                        <div className="sa-sys-info-item">
                            <span className="sa-sys-label">Autorité</span>
                            <span className="sa-sys-value">MEF — Haïti</span>
                        </div>
                        <div className="sa-sys-info-item">
                            <span className="sa-sys-label">Rôle</span>
                            <span className="sa-sys-value sa-role-badge">Super Administrateur</span>
                        </div>
                        <div className="sa-sys-info-item">
                            <span className="sa-sys-label">Base de données</span>
                            <span className="sa-sys-value sa-status-ok">• Connectée</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
