import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Mail, Twitter, Facebook, Linkedin, Phone, Menu, X, LogIn, ChevronDown, ChevronRight, User, Send, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


// ─── Données de recherche globale ────────────────────────────────────────────
const SEARCH_DATA = [
    // Services
    { label: 'Permis de conduire', path: '/services/permis', category: 'Services' },
    { label: 'Renouveler un permis', path: '/services/permis/renouveler', category: 'Services' },
    { label: 'Remplacer un permis', path: '/services/permis/remplacer', category: 'Services' },
    { label: 'Contraventions', path: '/services/permis/contraventions', category: 'Services' },
    { label: 'Immatriculation', path: '/services/immatriculation', category: 'Services' },
    { label: 'Remplacer immatriculation', path: '/services/immatriculation/remplacer', category: 'Services' },
    { label: 'Renouveler immatriculation', path: '/services/immatriculation/renouveler', category: 'Services' },
    { label: 'Transfert immatriculation', path: '/services/immatriculation/transfert', category: 'Services' },
    { label: "Demande d'assurance", path: '/services/assurances', category: 'Services' },
    { label: 'Renouveler une assurance', path: '/services/assurances/renouveler', category: 'Services' },
    { label: 'Déclaration sinistre', path: '/services/assurances/sinistre', category: 'Services' },
    { label: 'Payer une contravention', path: '/services/contravention', category: 'Services' },
    // Rendez-vous
    { label: 'Prendre un rendez-vous', path: '/appointment', category: 'Rendez-vous' },
    // Connaissance
    { label: 'Code de la route', path: '/knowledge/code', category: 'Tout savoir' },
    { label: 'Transport de marchandises', path: '/knowledge/transport', category: 'Tout savoir' },
    { label: 'Station de services', path: '/knowledge/stations', category: 'Tout savoir' },
    { label: 'FAQs', path: '/knowledge/faqs', category: 'Tout savoir' },
    { label: 'Tous les formulaires', path: '/knowledge', category: 'Tout savoir' },
    // Information
    { label: 'À propos de nous', path: '/about', category: 'Information' },
    { label: 'Actualités', path: '/actualites', category: 'Information' },
    { label: 'Contacts', path: '/contact', category: 'Information' },
    // Compte
    { label: 'Mon profil', path: '/user/profile', category: 'Mon compte' },
    { label: 'Mes demandes', path: '/user/nouvelle-demande', category: 'Mon compte' },
    { label: 'Statut des demandes', path: '/user/statut', category: 'Mon compte' },
    { label: 'Paiements', path: '/user/paiements', category: 'Mon compte' },
];

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
        setActiveDropdown(null);
    };

    // Click outside: fermer dropdown profile + recherche
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (activeDropdown === 'profile') setActiveDropdown(null);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    // ─── Recherche globale ──────────────────────────────────────────────────
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const lower = query.toLowerCase();
        const filtered = SEARCH_DATA.filter(item =>
            item.label.toLowerCase().includes(lower) ||
            item.category.toLowerCase().includes(lower)
        ).slice(0, 8);
        setSearchResults(filtered);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchResults.length > 0) {
            navigate(searchResults[0].path);
            setSearchQuery('');
            setSearchResults([]);
            setSearchFocused(false);
        }
    };

    const handleResultClick = (path) => {
        navigate(path);
        setSearchQuery('');
        setSearchResults([]);
        setSearchFocused(false);
    };

    // ─── Scroll vers la section Services ───────────────────────────────────
    const handleServicesClick = (e) => {
        e.preventDefault();
        setIsMenuOpen(false);

        if (location.pathname === '/') {
            // Déjà sur l'accueil → scroll direct vers #services
            const el = document.getElementById('services');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Autre page → naviguer vers accueil et scroller après
            navigate('/');
            setTimeout(() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 350);
        }
    };

    const navLinks = [
        {
            name: 'SERVICES',
            path: '/#services',
            isServicesLink: true,              // marqueur spécial pour le scroll
            dropdown: [
                {
                    name: 'PERMIS DE CONDUIRE',
                    path: '/services/permis',
                    submenu: [
                        { name: 'DEMANDER UN PERMIS', path: '/services/permis' },
                        { name: 'RENOUVELER UN PERMIS', path: '/services/permis/renouveler' },
                        { name: 'REMPLACER', path: '/services/permis/remplacer' },
                        { name: 'CONTRAVENTIONS', path: '/services/permis/contraventions' },
                        { name: 'AUTRES', path: '/services/permis/autres' },
                    ]
                },
                {
                    name: 'IMMATRICULATION',
                    path: '/services/immatriculation',
                    submenu: [
                        { name: 'IMMATRICULER', path: '/services/immatriculation' },
                        { name: 'REMPLACER', path: '/services/immatriculation/remplacer' },
                        { name: 'RENOUVELLER', path: '/services/immatriculation/renouveler' },
                        { name: 'TRANSFERT', path: '/services/immatriculation/transfert' },
                    ]
                },
                {
                    name: 'ASSURANCES',
                    path: '/services/assurances',
                    submenu: [
                        { name: "DEMANDE D'ASSURANCE", path: '/services/assurances' },
                        { name: 'REMPLACER', path: '/services/assurances/remplacer' },
                        { name: 'RENOUVELER UNE ASSURANCE', path: '/services/assurances/renouveler' },
                        { name: 'TRANSFERT', path: '/services/assurances/transfert' },
                        { name: 'DECLARATION SINISTRE', path: '/services/assurances/sinistre' },
                    ]
                },
                { name: 'PAYER UNE CONTRAVENTION', path: '/services/contravention' },
                { name: 'PRENDRE UN RENDEZ-VOUS', path: '/appointment' },
                { name: 'TOUS LES FORMULAIRES', path: '/knowledge' },
            ]
        },
        {
            name: 'QUI SOMMES NOUS',
            path: '/about',
            dropdown: [
                { name: 'A PROPOS DE NOUS', path: '/about#intro' },
                { name: 'NOTRE MISSION', path: '/about#mission' },
                { name: 'NOS RESULTAT', path: '/about#results' },
                { name: 'POURQUOI CHOISIR SIAAH', path: '/about#why' },
            ]
        },
        {
            name: 'TOUT SAVOIR',
            path: '/knowledge',
            dropdown: [
                { name: 'CODE DE LA ROUTE', path: '/knowledge/code' },
                { name: 'TRANSPORT DES BIEN ET MARCHANDISES', path: '/knowledge/transport' },
                { name: 'STATION DE SERVICES', path: '/knowledge/stations' },
                { name: 'FAQS', path: '/knowledge/faqs' },
            ]
        },
        { name: 'ACTUALITES', path: '/actualites' },
        { name: 'CONTACTS', path: '/contact' },
    ];

    // Groupe les résultats de recherche par catégorie
    const groupedResults = searchResults.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <header className="w-full bg-white font-sans overflow-visible z-50 relative">
            {/* Row 1: Logo and Search/CTA */}
            <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex flex-col items-start leading-none hidden sm:flex">
                        <h1 className="text-2xl font-extrabold text-[#C1272D] tracking-tight">SIAAH</h1>
                        <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tighter mt-1">
                            société d'immatriculation et d'assurance des vehicules Haitienne
                        </span>


                    </div>
                </Link>

                {/* Search, Connect & Lang Group */}
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">

                    {/* ── Barre de Recherche Globale ── */}
                    <div ref={searchRef} className="relative hidden md:block">
                        <form onSubmit={handleSearchSubmit}>
                            <div className={`flex items-center border bg-white transition-all duration-300 ${searchFocused ? 'border-[#3b5998] shadow-md' : 'border-gray-200'}`}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    placeholder="Rechercher un service..."
                                    className="px-3 py-1.5 text-sm text-gray-700 outline-none w-32 sm:w-48 xl:w-64 placeholder:italic placeholder:text-gray-400"
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    className="bg-gray-100 p-2 text-gray-600 border-l border-gray-200 hover:bg-gray-200 transition"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#3b5998] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-slate-700 transition whitespace-nowrap"
                                >
                                    RECHERCHER
                                </button>
                            </div>
                        </form>

                        {/* Résultats de recherche */}
                        {searchFocused && searchQuery.length >= 2 && (
                            <div className="absolute left-0 top-full mt-1 w-full min-w-[320px] bg-white border border-gray-100 shadow-2xl rounded-b-xl overflow-hidden z-[200]">
                                {searchResults.length === 0 ? (
                                    <div className="px-5 py-4 text-center text-xs text-gray-400 font-medium">
                                        Aucun résultat pour « {searchQuery} »
                                    </div>
                                ) : (
                                    <div>
                                        {Object.entries(groupedResults).map(([cat, items]) => (
                                            <div key={cat}>
                                                <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#3b5998]">{cat}</span>
                                                </div>
                                                {items.map((item) => (
                                                    <button
                                                        key={item.path}
                                                        onClick={() => handleResultClick(item.path)}
                                                        className="w-full flex items-center justify-between px-5 py-3 text-left text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#3b5998] group transition-all border-b border-gray-50 last:border-0"
                                                    >
                                                        <span>{item.label}</span>
                                                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#3b5998]" />
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                        <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 text-center">
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {searchResults.length} résultat(s) — Appuyez sur Entrée pour le premier
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Search Toggle */}
                    <button
                        className="md:hidden p-1.5 text-gray-600 hover:text-[#3b5998] transition"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        title="Rechercher"
                    >
                        <Search className="h-5 w-5" />
                    </button>

                    {/* Auth Section */}
                    {!user ? (
                        <Link
                            to="/login"
                            className="bg-[#3b5998] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-2 hover:bg-slate-700 transition"
                        >
                            <LogIn className="h-4 w-4" />
                            <span>SE CONNECTER</span>
                        </Link>
                    ) : (
                        <div className="relative profile-dropdown-container" ref={dropdownRef}>
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                                className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-all bg-white shadow-sm group"
                            >
                                <div className="flex flex-col items-end hidden sm:flex">
                                    <span className="text-[10px] font-black text-[#1a1a1a] uppercase leading-none">
                                        {user.first_name} {user.last_name}
                                    </span>
                                    <span className="text-[9px] font-bold text-[#3b5998] uppercase tracking-tighter">
                                        {user.role_id === 1 ? 'Super Admin' : user.role_id === 2 ? 'Admin' : user.role_id === 3 ? 'Employé' : 'Citoyen'}
                                    </span>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-[#f4f1f1] flex items-center justify-center border-2 border-[#3b5998] text-[#3b5998] overflow-hidden group-hover:border-[#C1272D] transition-colors">
                                    {user.profile_image ? (
                                        <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-black">{user.first_name[0]}</span>
                                    )}
                                </div>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${activeDropdown === 'profile' ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown Menu */}
                            {activeDropdown === 'profile' && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compte connecté</p>
                                        <p className="text-xs font-black text-gray-800 truncate">{user.email}</p>
                                    </div>

                                    <Link
                                        to={user.role_id <= 3 ? "/admin/dashboard" : "/user/profile"}
                                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[#3b5998] transition-all"
                                        onClick={() => setActiveDropdown(null)}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>MON PROFIL</span>
                                    </Link>

                                    <Link
                                        to={user.role_id <= 3 ? "/admin/dashboard" : "/user/nouvelle-demande"}
                                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[#3b5998] transition-all"
                                        onClick={() => setActiveDropdown(null)}
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>MES DEMANDES</span>
                                    </Link>

                                    <div className="h-px bg-gray-50 my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-[#C1272D] hover:bg-red-50 transition-all"
                                    >
                                        <LogIn className="h-4 w-4 rotate-180" />
                                        <span>DÉCONNEXION</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Language Selector */}
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-800 cursor-pointer hover:text-primary-600 transition">
                        <span>FR</span>
                        <ChevronDown className="h-4 w-4" />
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-1 bg-gray-50 rounded border"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar (slide down) */}
            {isSearchOpen && (
                <div className="md:hidden px-4 pb-3 bg-white border-b border-gray-100">
                    <form onSubmit={handleSearchSubmit} className="flex items-center border border-gray-200 bg-white rounded overflow-hidden">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Rechercher un service..."
                            autoFocus
                            className="flex-1 px-3 py-2 text-sm outline-none placeholder:text-gray-400"
                            autoComplete="off"
                        />
                        <button type="submit" className="bg-[#3b5998] text-white px-4 py-2 text-xs font-bold uppercase">
                            <Search className="h-4 w-4" />
                        </button>
                    </form>
                    {searchResults.length > 0 && (
                        <div className="mt-1 bg-white border border-gray-100 rounded shadow-xl overflow-hidden">
                            {searchResults.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => { handleResultClick(item.path); setIsSearchOpen(false); }}
                                    className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#3b5998] border-b border-gray-50 last:border-0 transition"
                                >
                                    <span>{item.label}</span>
                                    <span className="text-[9px] text-gray-400 font-medium">{item.category}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Row 2: Navigation Links */}
            <div className={`${isMenuOpen ? 'block' : 'hidden lg:block'} border-y border-gray-50 shadow-sm relative z-40 bg-white`}>
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-center">
                        {/* Accueil */}
                        <Link
                            to="/"
                            className="w-full lg:w-auto bg-[#3b5998] text-white px-10 py-2.5 text-center text-xs font-bold uppercase tracking-widest"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            ACCUEIL
                        </Link>
                        <div className="flex flex-col lg:flex-row items-center w-full lg:w-auto">
                            {navLinks.map((link) => (
                                <div
                                    key={link.name}
                                    className="relative group w-full lg:w-auto border-b border-gray-100 lg:border-none"
                                    onMouseEnter={() => setActiveDropdown(link.name)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    {/* Lien principal — comportement spécial pour SERVICES */}
                                    {link.isServicesLink ? (
                                        <button
                                            onClick={handleServicesClick}
                                            className="w-full block px-8 py-3 text-center lg:py-2.5 text-xs font-bold text-gray-800 uppercase tracking-widest hover:bg-gray-50 lg:hover:bg-transparent lg:hover:text-[#3b5998] transition-colors cursor-pointer"
                                        >
                                            {link.name}
                                        </button>
                                    ) : (
                                        <Link
                                            to={link.path}
                                            className="block px-8 py-3 text-center lg:py-2.5 text-xs font-bold text-gray-800 uppercase tracking-widest hover:bg-gray-50 lg:hover:bg-transparent lg:hover:text-[#3b5998] transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.name}
                                        </Link>
                                    )}

                                    {/* Dropdown level 1 */}
                                    {link.dropdown && (
                                        <div className="lg:absolute left-0 top-full w-full lg:w-72 bg-gray-50 lg:bg-white shadow-none lg:shadow-xl border-t lg:border border-gray-100 hidden group-hover:block z-50">
                                            {link.dropdown.map((subItem) => (
                                                <div key={subItem.name} className="relative group/sub border-b border-gray-100 lg:border-gray-50 last:border-0 pl-10 lg:pl-0">
                                                    <Link
                                                        to={subItem.path}
                                                        className="flex items-center justify-between px-6 py-4 text-[11px] font-bold text-gray-600 uppercase hover:bg-gray-100 lg:hover:bg-gray-50 hover:text-[#3b5998] transition-all"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        <span>{subItem.name}</span>
                                                        {subItem.submenu && <ChevronRight className="h-3 w-3 hidden lg:block" />}
                                                    </Link>

                                                    {/* Dropdown level 2 (Submenu) */}
                                                    {subItem.submenu && (
                                                        <div className="lg:absolute lg:left-full lg:top-0 w-full lg:w-64 bg-gray-100 lg:bg-white shadow-none lg:shadow-2xl border-t lg:border border-gray-100 hidden group-hover/sub:block z-[60] pl-6 lg:pl-0">
                                                            {subItem.submenu.map((lastItem) => (
                                                                <Link
                                                                    key={lastItem.name}
                                                                    to={lastItem.path}
                                                                    className="block px-6 py-4 text-[11px] font-bold text-gray-600 uppercase hover:bg-gray-200 lg:hover:bg-gray-50 hover:text-[#3b5998] border-b border-gray-200 lg:border-gray-50 last:border-0"
                                                                    onClick={() => setIsMenuOpen(false)}
                                                                >
                                                                    {lastItem.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: Blue Social Bar */}
            <div className="bg-[#3b5998] py-1 hidden lg:block relative z-30">
                <div className="container mx-auto px-4 flex justify-end items-center gap-5">
                    <Linkedin className="h-3.5 w-3.5 text-white cursor-pointer hover:scale-110 transition shrink-0" />
                    <Facebook className="h-3.5 w-3.5 text-white cursor-pointer hover:scale-110 transition shrink-0" />
                    <Mail className="h-3.5 w-3.5 text-white cursor-pointer hover:scale-110 transition shrink-0" />
                    <Twitter className="h-3.5 w-3.5 text-white cursor-pointer hover:scale-110 transition shrink-0" />
                    <Phone className="h-3.5 w-3.5 text-white cursor-pointer hover:scale-110 transition shrink-0" />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
