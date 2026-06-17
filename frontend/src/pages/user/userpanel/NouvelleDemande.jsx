import React from 'react';
import {
    Car,
    Contact,
    ShieldCheck,
    Settings,
    Info,
    ArrowRight,
    MessageSquare,
    AlertCircle,
    ArrowLeft,
    User,
    CreditCard,
    RefreshCw,
    FileEdit,
    AlertTriangle,
    FileCheck,
    FileSearch,
    FileStack,
    FileSignature,
    FileText,
    Trash2,
    UploadCloud,
    Loader2,
    Globe2,
    ChevronDown,
    ChevronUp,
    Edit3,
    Tag,
    Plus,
    X as CloseIcon
} from 'lucide-react';
import './NouvelleDemande.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

// Import Modular Operation Forms
// Permis
import * as PermisNouveau from './forms/permis/Nouveau';
import * as PermisRenouvellement from './forms/permis/Renouvellement';
import * as PermisRemplacement from './forms/permis/Remplacement';
import * as PermisCorrection from './forms/permis/Correction';

// Immatriculation
import * as ImmatInitial from './forms/immatriculation/Initial';
import * as ImmatRenouvellement from './forms/immatriculation/RenouvellementPlaque';
import * as ImmatRemplacement from './forms/immatriculation/RemplacementPlaque';
import * as ImmatCorrection from './forms/immatriculation/CorrectionPlaque';

// Assurance & Contravention
import * as AssurNouvelle from './forms/assurance/Nouvelle';
import * as ConPaiement from './forms/contravention/Paiement';

const HAITI_GEOGRAPHY = {
    "Ouest": ["Port-au-Prince", "Delmas", "Pétion-Ville", "Carrefour", "Tabarre", "Cité Soleil", "Gressier", "Léogâne", "Grand-Goâve", "Petit-Goâve", "Arcahaie", "Cabaret", "Cornillon", "Thomazeau", "Ganthier", "Croix-des-Bouquets", "Kenscoff", "Fond-Verrettes", "Anse-à-Galets", "Pointe-à-Raquette"],
    "Nord": ["Cap-Haïtien", "Limonade", "Quartier-Morin", "Grande-Rivière-du-Nord", "Bahon", "Saint-Raphaël", "Dondon", "Ranquitte", "Pignon", "Victoire", "Borgne", "Port-Margot", "Limbé", "Bas-Limbé", "Plaisance", "Pilate", "Acul-du-Nord", "Milot", "Plaine-du-Nord"],
    "Nord-Est": ["Fort-Liberté", "Ferrier", "Perches", "Ouanaminthe", "Capotille", "Mont-Organisé", "Trou-du-Nord", "Caracol", "Ste-Suzanne", "Terrière-Rouge", "Vallières", "Carice", "Mombin-Crochu"],
    "Nord-Ouest": ["Port-de-Paix", "Bassin-Bleu", "Chansolme", "La Tortue", "Saint-Louis-du-Nord", "Anse-à-Foleur", "Jean-Rabel", "Mole-Saint-Nicolas", "Baie-de-Henne", "Bombardopolis"],
    "Artibonite": ["Gonaïves", "Ennery", "Estère", "Gros-Morne", "Terre-Neuve", "Anse-Rouge", "Saint-Marc", "La Chapelle", "Verrettes", "Petite-Rivière-de-l'Artibonite", "Dessalines", "Desdunes", "Grande-Saline", "Saint-Michel-de-l'Attalaye", "Marmelade"],
    "Centre": ["Hinche", "Maïssade", "Thomonde", "Cerca-Cavajal", "Mirebalais", "Saut-d'Eau", "Boucan-Carré", "Lascahobas", "Belladère", "Savanette", "Cerca-la-Source", "Thomassique"],
    "Sud": ["Les Cayes", "Camp-Perrin", "Torbeck", "Chantal", "Maniche", "Île-à-Vache", "Port-Salut", "Arniquet", "Saint-Jean-du-Sud", "Côteaux", "Roche-à-Bateau", "Port-à-Piment", "Chardonnières", "Les Anglais", "Tiburon", "Aquin", "St-Louis-du-Sud", "Cavaillon"],
    "Sud-Est": ["Jacmel", "Cayes-Jacmel", "Marigot", "La Vallée-de-Jacmel", "Bainet", "Côtes-de-Fer", "Belle-Anse", "Grand-Gosier", "Thiotte", "Anse-à-Pitre"],
    "Grand’Anse": ["Jérémie", "Abricots", "Bonbon", "Chambellan", "Moron", "Marfranc", "Anse-d'Hainault", "Dame-Marie", "Les Irois", "Corail", "Roseaux", "Beaumont", "Pestel", "Îles Cayemites"],
    "Nippes": ["Miragoâne", "Petite-Rivière-de-Nippes", "Fonds-des-Nègres", "Paillant", "Anse-à-Veau", "L'Asile", "Petit-Trou-de-Nippes", "Plaisance-du-Sud", "Arnaud", "Baradères", "Grand-Boucan"]
};

// Dynamic prices are now fetched from dbServices (operations.price)

const NouvelleDemande = ({ initialService = null, initialOperation = null, initialDraftId = null }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = React.useState((initialOperation || initialDraftId) ? 3 : (initialService ? 2 : 1));
    const [selectedService, setSelectedService] = React.useState(initialService);
    const [selectedOperation, setSelectedOperation] = React.useState(initialOperation);
    const [currentDraftId, setCurrentDraftId] = React.useState(initialDraftId);
    const [createdRequestId, setCreatedRequestId] = React.useState(null);
    const [paymentMethod, setPaymentMethod] = React.useState('Carte Bancaire');
    const [subStep, setSubStep] = React.useState(1); // 1: Form, 2: Documents, 3: Recap
    const [searchOffice, setSearchOffice] = React.useState('');
    const [showOfficeList, setShowOfficeList] = React.useState(false);
    const [hasPreviousData, setHasPreviousData] = React.useState(false);
    const [showDraftModal, setShowDraftModal] = React.useState(false);
    const [expandedPersonal, setExpandedPersonal] = React.useState(true);
    const [expandedLocation, setExpandedLocation] = React.useState(true);
    const [expandedService, setExpandedService] = React.useState(true);
    const [officesList, setOfficesList] = React.useState([]);
    const [selectedOfficeId, setSelectedOfficeId] = React.useState(null);
    const [requiredDocs, setRequiredDocs] = React.useState([]);
    const [dbServices, setDbServices] = React.useState([]);
    const [vehMakes, setVehMakes] = React.useState([]);
    const [vehModels, setVehModels] = React.useState([]);
    const [vehColors, setVehColors] = React.useState([]);
    const [licenseCats, setLicenseCats] = React.useState([]);

    // Fetch offices and services from DB
    React.useEffect(() => {
        const h = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        fetch('/api/requests/offices', { headers: h })
            .then(r => r.json())
            .then(data => { if (data.status === 'success') setOfficesList(data.data); })
            .catch(err => console.error('Error fetching offices:', err));

        fetch('/api/requests/services', { headers: h })
            .then(r => r.json())
            .then(data => { if (data.status === 'success') setDbServices(data.data); })
            .catch(err => console.error('Error fetching services:', err));

        // Fetch vehicle refs
        fetch('/api/vehicles/refs/makes', { headers: h })
            .then(r => r.json())
            .then(data => { if (data.status === 'success') setVehMakes(data.data); })
            .catch(err => console.error('Error fetching makes:', err));

        fetch('/api/vehicles/refs/models', { headers: h })
            .then(r => r.json())
            .then(data => { if (data.status === 'success') setVehModels(data.data); })
            .catch(err => console.error('Error fetching models:', err));

        fetch('/api/vehicles/refs/colors', { headers: h })
            .then(r => r.json())
            .then(data => { if (data.status === 'success') setVehColors(data.data); })
            .catch(err => console.error('Error fetching colors:', err));

        fetch('/api/licenses/refs/categories', { headers: h })
            .then(r => r.json())
            .then(data => { if (data.status === 'success') setLicenseCats(data.data); })
            .catch(err => console.error('Error fetching license categories:', err));
    }, []);

    // Update state if props change (e.g. from sidebar navigation)
    React.useEffect(() => {
        if (!dbServices || dbServices.length === 0) return;

        const findServiceId = (slug) => {
            if (!slug || !dbServices) return null;
            const s = dbServices.find(svc =>
                (svc && svc.name && svc.name.toLowerCase().includes(slug.toLowerCase())) ||
                String(svc?.id) === String(slug)
            );
            return s ? s.id : null;
        };

        const findOpId = (sId, slug) => {
            if (!sId || !slug || !dbServices) return null;
            const svc = dbServices.find(s => s.id === sId);
            if (!svc || !svc.operations || !Array.isArray(svc.operations)) return null;
            const op = svc.operations.find(o =>
                (o && o.name && o.name.toLowerCase().includes(slug.toLowerCase())) ||
                String(o?.id) === String(slug)
            );
            return op ? op.id : null;
        };

        if (initialOperation || initialDraftId) {
            setStep(3);
            setSubStep(1);
            const sId = findServiceId(initialService);
            const oId = findOpId(sId, initialOperation);
            if (sId) setSelectedService(sId);
            if (oId) setSelectedOperation(oId);
        } else if (initialService) {
            const sId = findServiceId(initialService);
            if (sId) {
                setSelectedService(sId);
                setStep(2);
            }
        }
    }, [initialService, initialOperation, initialDraftId, dbServices]);

    // UI Identification Helpers
    const getServiceName = (id) => {
        if (!id || !dbServices) return '';
        const s = dbServices.find(svc => svc.id === id);
        return s ? (s.name || '').toLowerCase() : '';
    };

    const isImmatriculation = (id) => getServiceName(id).includes('immatriculation');
    const isPermis = (id) => getServiceName(id).includes('permis');
    const isAssurance = (id) => getServiceName(id).includes('assurance');
    const isContravention = (id) => getServiceName(id).includes('contravention') || getServiceName(id).includes('infraction') || getServiceName(id).includes('amende');


    React.useEffect(() => {
        const fetchPersonalData = async () => {
            try {
                // If loading a specific draft, use that
                if (initialDraftId) {
                    const response = await fetch(`/api/requests/${initialDraftId}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    const result = await response.json();
                    if (result.status === 'success' && result.data) {
                        const d = result.data.details;
                        if (d) {
                            setFormData(prev => ({ ...prev, ...d }));
                            if (d.serviceId) setSelectedService(d.serviceId);
                            if (d.operationId) setSelectedOperation(d.operationId);
                        }
                    }
                }

                // Check for ANY previous COMMITTED requests (not drafts) to lock identity
                const response = await fetch('/api/requests', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const result = await response.json();

                if (result.status === 'success' && result.data && result.data.length > 0) {
                    // Check if any request is committed
                    const hasCommitted = result.data.some(r => r.status && r.status !== 'draft');
                    setHasPreviousData(hasCommitted);

                    const lastRequest = result.data[0];
                    const d = lastRequest.details;
                    if (d) {
                        // We always pre-fill from previous info if not already in draft
                        setFormData(prev => ({
                            ...prev,
                            lastName: prev.lastName || d.lastName || '',
                            firstName: prev.firstName || d.firstName || '',
                            sexe: prev.sexe || d.sexe || '',
                            dob: prev.dob || d.dob || '',
                            pob: prev.pob || d.pob || '',
                            nationality: prev.nationality || d.nationality || '',
                            nifCin: prev.nifCin || d.nifCin || '',
                            maritalStatus: prev.maritalStatus || d.maritalStatus || '',
                            street: prev.street || d.street || '',
                            city: prev.city || d.city || '',
                            state: prev.state || d.state || '',
                            country: prev.country || d.country || '',
                            phone: prev.phone || d.phone || '',
                            houseNumber: prev.houseNumber || d.houseNumber || '',
                            email: prev.email || d.email || ''
                        }));
                        if (hasCommitted) {
                            setExpandedPersonal(false);
                            setExpandedLocation(false);
                        }
                    }
                }

                // If no previous requests or some fields still empty, fill from Auth User
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        firstName: prev.firstName || user.first_name || '',
                        lastName: prev.lastName || user.last_name || '',
                        email: prev.email || user.email || '',
                        phone: prev.phone || user.phone || '',
                        phone2: prev.phone2 || user.phone2 || '',
                        nifCin: prev.nifCin || user.nif || '',
                        sexe: prev.sexe || user.sexe || '',
                        dob: prev.dob || (user.dob ? user.dob.substring(0, 10) : '') || '',
                        pob: prev.pob || user.pob || '',
                        nationality: prev.nationality || user.nationality || 'Haïtienne',
                        cinNumber: prev.cinNumber || user.cin || '',
                        maritalStatus: prev.maritalStatus || user.marital_status || '',
                        bloodGroup: prev.bloodGroup || user.blood_group || '',
                        country: prev.country || user.country || 'Haiti',
                        state: prev.state || user.department || '',
                        city: prev.city || user.city || '',
                        street: prev.street || user.address || '',
                        houseNumber: prev.houseNumber || ''
                    }));
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };

        fetchPersonalData();
    }, [initialService, initialOperation, initialDraftId, user]);

    // Set required documents when selectedService or selectedOperation changes
    React.useEffect(() => {
        if (!selectedService || !dbServices) return;
        const svc = dbServices.find(s => parseInt(s.id) === parseInt(selectedService));
        if (!svc) return;

        let rawDocs = [];
        if (selectedOperation) {
            const op = (svc.operations || []).find(o => parseInt(o.id) === parseInt(selectedOperation));
            if (op && op.required_documents && op.required_documents.length > 0) {
                rawDocs = op.required_documents;
            } else if (svc.required_documents) {
                rawDocs = svc.required_documents;
            }
        } else if (svc.required_documents) {
            rawDocs = svc.required_documents;
        }

        // Normalize to array of strings
        if (Array.isArray(rawDocs)) {
            const normalized = rawDocs.map(rd => (typeof rd === 'object' && rd !== null ? rd.name : rd)).filter(Boolean);
            setRequiredDocs(normalized);
        } else {
            setRequiredDocs([]);
        }
    }, [selectedService, selectedOperation, dbServices]);

    const [formData, setFormData] = React.useState({
        // common personal fields
        firstName: '',
        lastName: '',
        sexe: '',
        dob: '',
        pob: '',
        nationality: 'Haïtienne',
        nifCin: '',
        maritalStatus: '',
        cinNumber: '',
        matriculeFiscal: '',
        idType: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        phone2: '',
        email: '',
        office: '',
        otherCountry: '',
        officialPhotoAtOffice: false,
        street: '',
        houseNumber: '',
        bloodGroup: '',

        // Permis fields
        permitType: '',
        permitTypeDetail: '',

        // Vehicle fields (Immatriculation / Assurance / Contravention)
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        vinNumber: '',
        chassisNumber: '',
        engineNumber: '',
        vehicleColor: '',
        vehiclePlate: '',
        declaredAccurate: false,

        // Assurance fields
        insuranceCompany: '',
        policyType: '',

        // Contravention fields
        ticketNumber: '',
        infractionDate: '',
        infractionLocation: '',

        medicalCert: '',
        visionOk: '',
        medicalObs: '',

        // License Category
        licenseCategory: '',

        // Request Nature
        requestNature: 'Première demande',

        // Training
        followedDrivingSchool: false,
        drivingSchoolName: '',
        trainingDate: '',
        drivingExperienceYears: '',

        // Medical
        wearsGlasses: false,
        hasMedicalCondition: false,
        medicalConditionDetails: '',

        // Permis Remplacer fields
        currentLicenseNumber: '',
        currentLicenseIssueDate: '',
        currentLicenseExpiryDate: '',
        currentLicenseCategories: '',
        replacementMotive: '',
        otherMotiveDetails: '',

        // Emergency
        emergencyName: '',
        emergencyRelation: '',
        emergencyPhone: '',

        signatureDate: new Date().toLocaleDateString('fr-FR')
    });
    const [documents, setDocuments] = React.useState([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
    const [payoutOption, setPayoutOption] = React.useState(null); // 'now' or 'later'
    const [errors, setErrors] = React.useState({});

    const filteredOffices = officesList.filter(o =>
        (o.name || "").toLowerCase().includes(searchOffice.toLowerCase())
    );

    const uiMetadata = {
        'Immatriculation': { icon: <Car size={28} className="text-blue-600" />, code: 'XYZ 000', price: 5000 },
        'Permis de Conduire': { icon: <User size={28} className="text-blue-600" />, code: '', price: 2500 },
        'Assurances': { icon: <ShieldCheck size={28} className="text-blue-600" />, code: '', price: 3500 },
        'Contraventions': { icon: <AlertTriangle size={28} className="text-red-600" />, code: '', price: 1000 },
    };

    const services = dbServices.map(s => ({
        ...s,
        icon: (uiMetadata[s.name] || {}).icon || <FileText size={28} />,
        code: (uiMetadata[s.name] || {}).code || '',
        description: s.description || `Service ${s.name}`
    }));

    const getPriceForService = (serviceId) => {
        const svc = services.find(s => s.id === serviceId);
        if (!svc) return 2500;
        if (selectedOperation) {
            const op = (svc.operations || []).find(o => String(o.id) === String(selectedOperation));
            if (op) {
                return Number(op.price || 0);
            }
        }
        return (uiMetadata[svc.name] || {}).price || 2500;
    };

    const getOperationsByService = (serviceId) => {
        const svc = services.find(s => s.id === serviceId);
        if (!svc || !svc.operations) return [];

        const opIcons = {
            'Car': <Car size={18} />,
            'User': <User size={18} />,
            'ShieldCheck': <ShieldCheck size={18} />,
            'AlertTriangle': <AlertTriangle size={18} />,
            'FileEdit': <FileEdit size={18} />,
            'RefreshCw': <RefreshCw size={18} />,
            'CreditCard': <CreditCard size={18} />,
            'FileSearch': <FileSearch size={18} />,
            'Info': <Info size={18} />
        };

        return svc.operations.map(op => {
            let icon = <Tag size={18} />;
            const n = op.name.toLowerCase();
            if (n.includes('renouvel') || n.includes('remplac')) icon = <RefreshCw size={18} />;
            else if (n.includes('nouve') || n.includes('init')) icon = <Plus size={18} />;
            else if (n.includes('corriger')) icon = <FileEdit size={18} />;
            else if (n.includes('payer')) icon = <CreditCard size={18} />;
            else if (n.includes('déclar')) icon = <AlertTriangle size={18} />;

            return {
                ...op,
                icon,
                price: op.price || 0
            };
        });
    };

    const operations = getOperationsByService(selectedService);

    const isOperationRemplacement = (opId) => {
        const op = (operations || []).find(o => String(o.id) === String(opId));
        return op && op.name.toLowerCase().includes('remplac');
    };

    const handleNext = () => {
        if (step === 1 && selectedService) {
            setStep(2);
        } else if (step === 2 && selectedOperation) {
            setStep(3);
            setSubStep(1);
        } else if (step === 3) {
            if (subStep === 2) setSubStep(3);
            else if (subStep === 3) handleFinalSubmit();
        }
    };

    /**
     * Map current service/operation to a form module
     */
    const getOperationForm = () => {
        const op = (operations || []).find(o => String(o.id) === String(selectedOperation));
        if (!op) return null;
        const n = op.name.toLowerCase();

        if (isPermis(selectedService)) {
            if (n.includes('remplac')) return PermisRemplacement;
            if (n.includes('renouvel')) return PermisRenouvellement;
            if (n.includes('corriger') || n.includes('correction')) return PermisCorrection;
            return PermisNouveau; // Default for nouveau
        }

        if (isImmatriculation(selectedService)) {
            if (n.includes('remplac')) return ImmatRemplacement;
            if (n.includes('renouvel')) return ImmatRenouvellement;
            if (n.includes('corriger') || n.includes('correction')) return ImmatCorrection;
            return ImmatInitial;
        }

        if (isAssurance(selectedService)) {
            if (n.includes('nouv')) return AssurNouvelle;
        }

        if (isContravention(selectedService)) {
            if (n.includes('payer')) return ConPaiement;
        }

        return null;
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
            setSelectedOperation(null);
        } else if (step === 3) {
            if (subStep === 1) {
                setStep(2);
            } else {
                setSubStep(subStep - 1);
            }
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleFormSubmit = (e) => {
        if (e) e.preventDefault();

        const newErrors = {};
        const commonLabels = {
            lastName: 'Nom',
            firstName: 'Prénom',
            sexe: 'Sexe',
            dob: 'Date de Naissance',
            pob: 'Lieu de Naissance',
            nationality: 'Nationalité',
            nifCin: 'NIF / CIN',
            office: 'Bureau de Traitement',
            country: 'Pays',
            state: 'Département / État',
            city: 'Ville / Commune',
            houseNumber: 'Numéro Maison',
            street: 'Adresse précise (Rue, Quartier)',
            email: 'Email',
            phone: 'Téléphone',
            otherCountry: 'Pays (Autre)'
        };

        const formModule = getOperationForm();
        const serviceSpecificLabels = formModule ? formModule.labels : {};

        const labelsToValidate = { ...commonLabels, ...serviceSpecificLabels };
        if (formData.country !== 'Other') delete labelsToValidate.otherCountry;

        for (const [key, label] of Object.entries(labelsToValidate)) {
            if (!formData[key]) {
                newErrors[key] = `Veuillez remplir le champ : ${label}`;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);

            // Define field groups for each accordion
            const personalFields = ['lastName', 'firstName', 'sexe', 'maritalStatus', 'dob', 'pob', 'nationality', 'nifCin'];
            const locationFields = ['country', 'otherCountry', 'state', 'city', 'houseNumber', 'email', 'phone'];

            // Expand accordions that have errors
            if (personalFields.some(f => newErrors[f])) setExpandedPersonal(true);
            if (locationFields.some(f => newErrors[f])) setExpandedLocation(true);

            // For service fields, they are anything that is not personal/location
            const otherFields = Object.keys(newErrors).filter(f => !personalFields.includes(f) && !locationFields.includes(f));
            if (otherFields.length > 0) setExpandedService(true);

            // Scroll to the first error
            const firstErrorField = Object.keys(newErrors)[0];
            const element = document.getElementById(`field-${firstErrorField}`);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
            return;
        }

        setErrors({});
        setSubStep(2);
    };

    const isFormValid = () => {
        const commonRequired = ['firstName', 'lastName', 'sexe', 'dob', 'pob', 'nationality', 'nifCin', 'office', 'country', 'state', 'city', 'houseNumber', 'street', 'phone'];
        if (formData.country === 'Other') commonRequired.push('otherCountry');

        const formModule = getOperationForm();
        const serviceSpecificRequired = formModule ? formModule.required : [];

        const required = [...commonRequired, ...serviceSpecificRequired];
        const basicValid = required.every(f => !!formData[f]);

        return basicValid;
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Calculate price dynamically from selected operation
            const currentSvc = dbServices.find(s => s.id === selectedService);
            const currentOp = (currentSvc?.operations || []).find(o => o.id === selectedOperation);
            const price = currentOp?.price || 0;
            const serviceName = currentSvc?.name || 'Inconnu';
            const opName = currentOp?.name || 'Inconnu';

            const formDataToSubmit = new FormData();
            formDataToSubmit.append('type', `${serviceName} - ${opName}`);
            formDataToSubmit.append('price', price);
            formDataToSubmit.append('office_id', selectedOfficeId);
            formDataToSubmit.append('status', 'pending');

            const details = {
                ...formData,
                operationId: selectedOperation,
                serviceId: selectedService,
                filesCount: documents.length,
                submittedDocuments: documents.map((d, idx) => ({
                    name: typeof d.type === 'string' ? d.type : (d.type?.name || 'Document'),
                    field: `doc_${idx}`, // Map to multipart field
                    fileName: d.file?.name || null,
                    fileSize: d.file?.size || null,
                }))
            };
            formDataToSubmit.append('details', JSON.stringify(details));

            // Append each file with a stable field name
            documents.forEach((d, idx) => {
                if (d.file) {
                    formDataToSubmit.append(`doc_${idx}`, d.file);
                }
            });

            // Using fetch to post to the API
            const url = currentDraftId ? `/api/requests/${currentDraftId}` : '/api/requests';
            const method = currentDraftId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formDataToSubmit
            });

            if (response.ok) {
                const result = await response.json();
                setCreatedRequestId(result.data.id);
                setDone(true);
                setShowPaymentModal(true);
            } else {
                alert("Erreur lors de la soumission");
            }
        } catch (error) {
            console.error("Submission Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        try {
            // Calculate price dynamically from selected operation
            const currentSvc = dbServices.find(s => s.id === selectedService);
            const currentOp = (currentSvc?.operations || []).find(o => o.id === selectedOperation);
            const price = currentOp?.price || 0;
            const serviceName = currentSvc?.name || 'Inconnu';
            const opName = currentOp?.name || 'Inconnu';

            const formDataToSubmit = new FormData();
            formDataToSubmit.append('type', `${serviceName} - ${opName}`);
            formDataToSubmit.append('price', price);
            formDataToSubmit.append('status', 'draft');

            const details = {
                ...formData,
                operationId: selectedOperation,
                serviceId: selectedService,
                filesCount: documents.length,
                submittedDocuments: documents.map((d, idx) => ({
                    name: typeof d.type === 'string' ? d.type : (d.type?.name || 'Document'),
                    field: `doc_${idx}`
                }))
            };
            formDataToSubmit.append('details', JSON.stringify(details));

            // Append files with stable field names
            documents.forEach((d, idx) => {
                if (d.file) {
                    formDataToSubmit.append(`doc_${idx}`, d.file);
                }
            });

            const url = currentDraftId ? `/api/requests/${currentDraftId}` : '/api/requests';
            const method = currentDraftId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formDataToSubmit
            });

            if (response.ok) {
                const result = await response.json();
                setCurrentDraftId(result.data.id);
                setShowDraftModal(true);
            } else {
                alert("Erreur lors de la sauvegarde du brouillon.");
            }
        } catch (error) {
            console.error("Draft Save Error:", error);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="nouvelle-demande-container">
            {/* Removed Blue Header Tab as requested */}

            <div className="demande-main-card">
                {/* Card Header */}
                <div className="card-inner-header">
                    <div className="header-left">
                        <div className="title-with-gear">
                            {step === 3 && selectedOperation && <div className="op-badge-pre">{(services.find(s => s.id === selectedService) || {}).name}</div>}
                            <h2>
                                {step === 1 && 'Services disponibles'}
                                {step === 2 && `Opérations : ${(services.find(s => s.id === selectedService) || {}).name}`}
                                {step === 3 && ((operations.find(o => o.id === selectedOperation) || {}).name || 'Formulaire de demande')}
                            </h2>
                        </div>
                        <div className="header-gears">
                            <Contact size={22} className="header-icon-main" />
                            <ShieldCheck size={16} className="header-icon-sub" />
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="siaah-definition-header">
                            SIAAH <br />
                            <span>Société d'immatriculation et d'assurance et d'automobile Haïti</span>
                        </div>
                        <Info size={20} className="info-icon-form" />
                        <button
                            className="close-request-btn"
                            onClick={() => window.location.href = '/user'}
                            title="Annuler et fermer"
                        >
                            <CloseIcon size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="card-content-body">
                    {step < 3 && (
                        <div className="instruction-msg">
                            <p>
                                {step === 1
                                    ? 'Veuillez choisir un Service pour progresser.'
                                    : 'Veuillez choisir une Operation pour progresser.'}
                            </p>
                            <AlertCircle size={18} className="warn-icon" />
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="service-selection-list">
                            {services.map(service => (
                                <button
                                    key={service.id}
                                    className={`service-btn-item ${selectedService === service.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedService(service.id);
                                        // Navigate to sync URL as requested
                                        const slug = service.name.toLowerCase().includes('immatriculation') ? 'immatriculation' :
                                            service.name.toLowerCase().includes('permis') ? 'permis' :
                                                service.name.toLowerCase().includes('assurance') ? 'assurance' :
                                                    service.name.toLowerCase().includes('contravention') ? 'contravention' : '';
                                        if (slug) navigate(`/user/nouvelle-demande?type=${slug}`);
                                        setStep(2);
                                    }}
                                >
                                    <span className="service-btn-label">{service.name}</span>
                                    <div className="service-btn-icon-area">
                                        {isImmatriculation(service.id) && (
                                            <div className="license-plate-badge">
                                                <span className="plate-circles"></span>
                                                <span className="plate-text">{service.code || 'VEH'}</span>
                                            </div>
                                        )}
                                        {isPermis(service.id) && (
                                            <div className="human-icon-badge">
                                                <div className="user-silhouette">
                                                    <User size={30} fill="currentColor" strokeWidth={1} />
                                                </div>
                                            </div>
                                        )}
                                        {isAssurance(service.id) && (
                                            <div className="security-icon-badge">
                                                <div className="shield-icon-wrapper">
                                                    <ShieldCheck size={30} fill="rgba(30, 58, 138, 0.1)" strokeWidth={2} />
                                                </div>
                                            </div>
                                        )}
                                        {isContravention(service.id) && (
                                            <div className="alert-icon-badge">
                                                <div className="alert-icon-wrapper">
                                                    <AlertTriangle size={30} color="white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : step === 2 ? (
                        <div className="operations-view">
                            <div className="category-marker">
                                <span className="category-title">{(services.find(s => s.id === selectedService) || {}).name}</span>
                                <div className="category-icon-box">
                                    {(services.find(s => s.id === selectedService) || {}).icon}
                                </div>
                            </div>

                            <div className="operations-grid">
                                {operations.map(op => (
                                    <button
                                        key={op.id}
                                        className={`op-grid-btn ${selectedOperation === op.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedOperation(op.id);
                                            // Sync URL
                                            const sSlug = isImmatriculation(selectedService) ? 'immatriculation' :
                                                isPermis(selectedService) ? 'permis' :
                                                    isAssurance(selectedService) ? 'assurance' :
                                                        isContravention(selectedService) ? 'contravention' : '';

                                            const opSlug = op.name.toLowerCase().includes('immatricule') ? 'immatriculer' :
                                                op.name.toLowerCase().includes('renouveler') ? 'renouveler' :
                                                    op.name.toLowerCase().includes('transfert') ? 'transferer' :
                                                        op.name.toLowerCase().includes('remplacer') ? 'remplacer' :
                                                            op.name.toLowerCase().includes('nouveau') ? 'nouveau' :
                                                                op.name.toLowerCase().includes('assurance') ? 'nouvelle' :
                                                                    op.name.toLowerCase().includes('payer') ? 'payer' : op.id;

                                            navigate(`/user/nouvelle-demande?type=${sSlug}&op=${opSlug}`);
                                            setStep(3);
                                            setSubStep(1);
                                        }}
                                    >
                                        <span className="op-text">{op.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="forms-docs-view">
                            {done ? (
                                <div className="success-screen">
                                    <div className="success-icon-bg">
                                        <FileCheck size={64} className="text-green-500" />
                                    </div>
                                    <h3>Demande Soumise avec Succès !</h3>
                                    <p>Votre demande est maintenant en cours d'analyse par nos services.</p>
                                    <button
                                        className="btn-status-view"
                                        onClick={() => window.location.href = '/user/statut'}
                                    >
                                        Voir mes demandes
                                    </button>
                                </div>
                            ) : subStep === 1 ? (
                                <div className="form-overlay-area animate-fade-in">
                                    <div className="pro-form-card">
                                        <div className="pro-form-header">
                                            <h3>Formulaire de Demande</h3>
                                            <p>Veuillez remplir avec précision toutes les sections ci-dessous.</p>
                                        </div>

                                        <form onSubmit={handleFormSubmit} className="actual-form scrollable-form">
                                            {/* Section 1: Informations Personnelles */}
                                            <div className="pro-section">
                                                <div
                                                    className={`pro-section-title accordion-header ${['lastName', 'firstName', 'sexe', 'maritalStatus', 'dob', 'pob', 'nationality', 'nifCin'].some(f => errors[f]) ? 'has-error' : ''}`}
                                                    onClick={() => hasPreviousData && setExpandedPersonal(!expandedPersonal)}
                                                    style={{ cursor: hasPreviousData ? 'pointer' : 'default' }}
                                                >
                                                    <div className="pro-section-num">1</div>
                                                    <h4>Informations Personnelles</h4>
                                                    {hasPreviousData && (
                                                        <button
                                                            type="button"
                                                            className="accordion-toggle-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedPersonal(!expandedPersonal);
                                                            }}
                                                        >
                                                            {expandedPersonal ? <><ChevronUp size={18} /> <span className="toggle-text">Réduire</span></> : <><Edit3 size={18} /> <span className="toggle-text">Modifier</span></>}
                                                        </button>
                                                    )}
                                                </div>

                                                {expandedPersonal && (
                                                    <div className="accordion-content-box animate-fade-in">

                                                        <div className="pro-row">
                                                            <div className="pro-field-group" id="field-lastName">
                                                                <label>Nom <span className="required-mark">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className={`pro-input ${errors.lastName ? 'has-error' : ''} ${hasPreviousData ? 'is-locked' : ''}`}
                                                                    placeholder="EX: JEAN"
                                                                    value={formData.lastName}
                                                                    onChange={e => handleFieldChange('lastName', e.target.value)}
                                                                    readOnly={hasPreviousData}
                                                                />
                                                                {errors.lastName && <div className="field-error-msg"><AlertCircle size={14} /> {errors.lastName}</div>}
                                                            </div>
                                                            <div className="pro-field-group" id="field-firstName">
                                                                <label>Prénom <span className="required-mark">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className={`pro-input ${errors.firstName ? 'has-error' : ''} ${hasPreviousData ? 'is-locked' : ''}`}
                                                                    placeholder="EX: PIERRE"
                                                                    value={formData.firstName}
                                                                    onChange={e => handleFieldChange('firstName', e.target.value)}
                                                                    readOnly={hasPreviousData}
                                                                />
                                                                {errors.firstName && <div className="field-error-msg"><AlertCircle size={14} /> {errors.firstName}</div>}
                                                            </div>
                                                        </div>

                                                        <div className="pro-row">
                                                            <div className="pro-field-group" id="field-sexe">
                                                                <label>Sexe <span className="required-mark">*</span></label>
                                                                <select
                                                                    className={`pro-select ${errors.sexe ? 'has-error' : ''} ${hasPreviousData ? 'is-locked' : ''}`}
                                                                    value={formData.sexe}
                                                                    onChange={e => handleFieldChange('sexe', e.target.value)}
                                                                    disabled={hasPreviousData}
                                                                >
                                                                    <option value="">Sélectionner</option>
                                                                    <option value="M">Masculin</option>
                                                                    <option value="F">Féminin</option>
                                                                </select>
                                                                {errors.sexe && <div className="field-error-msg"><AlertCircle size={14} /> {errors.sexe}</div>}
                                                            </div>
                                                            <div className="pro-field-group" id="field-maritalStatus">
                                                                <label>État Civil <span className="required-mark">*</span></label>
                                                                <select
                                                                    className={`pro-select ${errors.maritalStatus ? 'has-error' : ''}`}
                                                                    value={formData.maritalStatus}
                                                                    onChange={e => handleFieldChange('maritalStatus', e.target.value)}
                                                                >
                                                                    <option value="">Sélectionner</option>
                                                                    <option value="Célibataire">Célibataire</option>
                                                                    <option value="Marié(e)">Marié(e)</option>
                                                                    <option value="Divorcé(e)">Divorcé(e)</option>
                                                                    <option value="Veuf(ve)">Veuf(ve)</option>
                                                                </select>
                                                                {errors.maritalStatus && <div className="field-error-msg"><AlertCircle size={14} /> {errors.maritalStatus}</div>}
                                                            </div>
                                                        </div>

                                                        <div className="pro-row">
                                                            <div className="pro-field-group" id="field-dob">
                                                                <label>Date de Naissance <span className="required-mark">*</span></label>
                                                                <input
                                                                    type="date"
                                                                    className={`pro-input ${errors.dob ? 'has-error' : ''} ${hasPreviousData ? 'is-locked' : ''}`}
                                                                    value={formData.dob}
                                                                    onChange={e => handleFieldChange('dob', e.target.value)}
                                                                    readOnly={hasPreviousData}
                                                                />
                                                                {errors.dob && <div className="field-error-msg"><AlertCircle size={14} /> {errors.dob}</div>}
                                                            </div>
                                                            <div className="pro-field-group" id="field-pob">
                                                                <label>Lieu de Naissance <span className="required-mark">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className={`pro-input ${errors.pob ? 'has-error' : ''} ${hasPreviousData ? 'is-locked' : ''}`}
                                                                    placeholder="Ville / Commune"
                                                                    value={formData.pob}
                                                                    onChange={e => handleFieldChange('pob', e.target.value)}
                                                                    readOnly={hasPreviousData}
                                                                />
                                                                {errors.pob && <div className="field-error-msg"><AlertCircle size={14} /> {errors.pob}</div>}
                                                            </div>
                                                        </div>

                                                        <div className="pro-row">
                                                            <div className="pro-field-group" id="field-nationality">
                                                                <label>Nationalité <span className="required-mark">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className={`pro-input ${errors.nationality ? 'has-error' : ''} ${hasPreviousData ? 'is-locked' : ''}`}
                                                                    placeholder="EX: Haïtienne"
                                                                    value={formData.nationality}
                                                                    onChange={e => handleFieldChange('nationality', e.target.value)}
                                                                    readOnly={hasPreviousData}
                                                                />
                                                                {errors.nationality && <div className="field-error-msg"><AlertCircle size={14} /> {errors.nationality}</div>}
                                                            </div>
                                                            <div className="pro-field-group" id="field-nifCin">
                                                                <label>NIF <span className="required-mark">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className={`pro-input ${errors.nifCin ? 'has-error' : ''} ${hasPreviousData ? 'is-locked' : ''}`}
                                                                    placeholder="000-000-000-0"
                                                                    value={formData.nifCin}
                                                                    onChange={e => handleFieldChange('nifCin', e.target.value)}
                                                                    readOnly={hasPreviousData}
                                                                />
                                                                {errors.nifCin && <div className="field-error-msg"><AlertCircle size={14} /> {errors.nifCin}</div>}
                                                            </div>
                                                            <div className="pro-field-group" id="field-cinNumber">
                                                                <label>CIN (Optionnel)</label>
                                                                <input
                                                                    type="text"
                                                                    className={`pro-input ${errors.cinNumber ? 'has-error' : ''}`}
                                                                    placeholder="00-00-00-0000-00-00000"
                                                                    value={formData.cinNumber}
                                                                    onChange={e => handleFieldChange('cinNumber', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="pro-field-group" id="field-bloodGroup">
                                                                <label>Groupe Sanguin</label>
                                                                <input
                                                                    type="text"
                                                                    className="pro-input"
                                                                    placeholder="Ex: A+"
                                                                    value={formData.bloodGroup}
                                                                    onChange={e => handleFieldChange('bloodGroup', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 2: Contact & Localisation */}
                                            <div className="pro-section">
                                                <div
                                                    className={`pro-section-title accordion-header ${['street', 'city', 'state', 'phone', 'country'].some(f => errors[f]) ? 'has-error' : ''}`}
                                                    onClick={() => hasPreviousData && setExpandedLocation(!expandedLocation)}
                                                    style={{ cursor: hasPreviousData ? 'pointer' : 'default' }}
                                                >
                                                    <div className="pro-section-num">2</div>
                                                    <h4>2. Coordonnées (Contact & Localisation)</h4>
                                                    {hasPreviousData && (
                                                        <button
                                                            type="button"
                                                            className="accordion-toggle-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedLocation(!expandedLocation);
                                                            }}
                                                        >
                                                            {expandedLocation ? <><ChevronUp size={18} /> Réduire</> : <><Edit3 size={18} /> Modifier</>}
                                                        </button>
                                                    )}
                                                </div>

                                                {expandedLocation && (
                                                    <div className="accordion-content-box animate-fade-in">

                                                        <div className="pro-field-group" id="field-country">
                                                            <label>Pays <span className="required-mark">*</span></label>
                                                            <select
                                                                className={`pro-select ${errors.country ? 'has-error' : ''}`}
                                                                value={formData.country}
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    handleFieldChange('country', val);
                                                                    handleFieldChange('state', ''); // Reset dependent
                                                                    handleFieldChange('city', '');
                                                                }}
                                                            >
                                                                <option value="">Sélectionner Pays</option>
                                                                <option value="Haiti">Haïti</option>
                                                                <option value="USA">États-Unis</option>
                                                                <option value="Canada">Canada</option>
                                                                <option value="France">France</option>
                                                                <option value="DR">République Dominicaine</option>
                                                                <option value="Brazil">Brésil</option>
                                                                <option value="Chile">Chili</option>
                                                                <option value="Other">Autre (Préciser)</option>
                                                            </select>
                                                            {errors.country && <div className="field-error-msg"><AlertCircle size={14} /> {errors.country}</div>}
                                                        </div>

                                                        {formData.country === 'Other' && (
                                                            <div className="pro-field-group animate-fade-in" id="field-otherCountry" style={{ marginTop: '15px' }}>
                                                                <label>Précisez le Pays <span className="required-mark">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className={`pro-input ${errors.otherCountry ? 'has-error' : ''}`}
                                                                    placeholder="Nom du pays"
                                                                    value={formData.otherCountry}
                                                                    onChange={e => handleFieldChange('otherCountry', e.target.value)}
                                                                />
                                                                {errors.otherCountry && <div className="field-error-msg"><AlertCircle size={14} /> {errors.otherCountry}</div>}
                                                            </div>
                                                        )}

                                                        {formData.country === 'Haiti' ? (
                                                            <div className="pro-row">
                                                                <div className="pro-field-group" id="field-state">
                                                                    <label>Département <span className="required-mark">*</span></label>
                                                                    <select
                                                                        className={`pro-select ${errors.state ? 'has-error' : ''}`}
                                                                        value={formData.state}
                                                                        onChange={e => {
                                                                            handleFieldChange('state', e.target.value);
                                                                            handleFieldChange('city', ''); // reset city
                                                                        }}
                                                                    >
                                                                        <option value="">Sélectionner Département</option>
                                                                        {Object.keys(HAITI_GEOGRAPHY).map(dept => (
                                                                            <option key={dept} value={dept}>{dept}</option>
                                                                        ))}
                                                                    </select>
                                                                    {errors.state && <div className="field-error-msg"><AlertCircle size={14} /> {errors.state}</div>}
                                                                </div>
                                                                <div className="pro-field-group" id="field-city">
                                                                    <label>Ville / Commune <span className="required-mark">*</span></label>
                                                                    <select
                                                                        className={`pro-select ${errors.city ? 'has-error' : ''}`}
                                                                        value={formData.city}
                                                                        onChange={e => handleFieldChange('city', e.target.value)}
                                                                        disabled={!formData.state}
                                                                    >
                                                                        <option value="">Sélectionner Commune</option>
                                                                        {formData.state && HAITI_GEOGRAPHY[formData.state]?.map(commune => (
                                                                            <option key={commune} value={commune}>{commune}</option>
                                                                        ))}
                                                                    </select>
                                                                    {errors.city && <div className="field-error-msg"><AlertCircle size={14} /> {errors.city}</div>}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="pro-row">
                                                                <div className="pro-field-group" id="field-state">
                                                                    <label>État / Province / Région <span className="required-mark">*</span></label>
                                                                    <input type="text" className={`pro-input ${errors.state ? 'has-error' : ''}`} placeholder="Ex: Québec, Florida..." value={formData.state} onChange={e => handleFieldChange('state', e.target.value)} />
                                                                    {errors.state && <div className="field-error-msg"><AlertCircle size={14} /> {errors.state}</div>}
                                                                </div>
                                                                <div className="pro-field-group" id="field-city">
                                                                    <label>Ville <span className="required-mark">*</span></label>
                                                                    <input type="text" className={`pro-input ${errors.city ? 'has-error' : ''}`} placeholder="Ville" value={formData.city} onChange={e => handleFieldChange('city', e.target.value)} />
                                                                    {errors.city && <div className="field-error-msg"><AlertCircle size={14} /> {errors.city}</div>}
                                                                </div>
                                                            </div>
                                                        )}




                                                        <div className="pro-row">
                                                            <div className="pro-field-group" id="field-email">
                                                                <label>Email (Optionnel)</label>
                                                                <input
                                                                    type="email"
                                                                    className={`pro-input ${errors.email ? 'has-error' : ''} ${hasPreviousData ? 'is-locked' : ''}`}
                                                                    placeholder="exemple@mail.com"
                                                                    value={formData.email}
                                                                    onChange={e => handleFieldChange('email', e.target.value)}
                                                                    readOnly={hasPreviousData}
                                                                />
                                                                {errors.email && <div className="field-error-msg"><AlertCircle size={14} /> {errors.email}</div>}
                                                            </div>
                                                            <div className="pro-field-group" id="field-phone">
                                                                <label>Téléphone 1 <span className="required-mark">*</span></label>
                                                                <input
                                                                    type="tel"
                                                                    className={`pro-input ${errors.phone ? 'has-error' : ''} ${hasPreviousData ? 'is-locked' : ''}`}
                                                                    placeholder="+509 XXXX-XXXX"
                                                                    value={formData.phone}
                                                                    onChange={e => handleFieldChange('phone', e.target.value)}
                                                                    readOnly={hasPreviousData}
                                                                />
                                                                {errors.phone && <div className="field-error-msg"><AlertCircle size={14} /> {errors.phone}</div>}
                                                            </div>
                                                            <div className="pro-field-group" id="field-phone2">
                                                                <label>Téléphone 2 (Optionnel)</label>
                                                                <input
                                                                    type="tel"
                                                                    className="pro-input"
                                                                    placeholder="+509 XXXX-XXXX"
                                                                    value={formData.phone2}
                                                                    onChange={e => handleFieldChange('phone2', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="pro-row">
                                                            <div className="pro-field-group" id="field-houseNumber">
                                                                <label>Numéro maison / No <span className="required-mark">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className={`pro-input ${errors.houseNumber ? 'has-error' : ''}`}
                                                                    placeholder="Ex: #45"
                                                                    value={formData.houseNumber}
                                                                    onChange={e => handleFieldChange('houseNumber', e.target.value)}
                                                                />
                                                                {errors.houseNumber && <div className="field-error-msg"><AlertCircle size={14} /> {errors.houseNumber}</div>}
                                                            </div>
                                                            <div className="pro-field-group" style={{ flex: 2 }} id="field-street">
                                                                <label>Adresse précise (Rue, Quartier) <span className="required-mark">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className={`pro-input ${errors.street ? 'has-error' : ''}`}
                                                                    placeholder="Ex: Rue des Miracles"
                                                                    value={formData.street}
                                                                    onChange={e => handleFieldChange('street', e.target.value)}
                                                                />
                                                                {errors.street && <div className="field-error-msg"><AlertCircle size={14} /> {errors.street}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Section 3: Détails du Service */}
                                            <div className="pro-section">
                                                <div
                                                    className={`pro-section-title accordion-header ${[
                                                        'vehicleMake', 'vehicleModel', 'vehicleYear', 'chassisNumber', 'engineNumber',
                                                        'height', 'weight', 'eyeColor', 'hairColor', 'licenseCategory', 'bloodGroup',
                                                        'insuranceCompany', 'vehiclePlate', 'ticketNumber', 'office'
                                                    ].some(f => errors[f]) ? 'has-error' : ''}`}
                                                    onClick={() => setExpandedService(!expandedService)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="pro-section-num">3</div>
                                                    <h4>3. Détails du Service</h4>
                                                    <button
                                                        type="button"
                                                        className="accordion-toggle-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedService(!expandedService);
                                                        }}
                                                    >
                                                        {expandedService ? <><ChevronUp size={18} /> Réduire</> : <><ChevronDown size={18} /> Voir</>}
                                                    </button>
                                                </div>

                                                {expandedService && (
                                                    <div className="accordion-content-box animate-fade-in">

                                                        <div className="service-specific-fields">
                                                            {(() => {
                                                                const FormMod = getOperationForm();
                                                                if (FormMod && FormMod.FormFields) {
                                                                    return <FormMod.FormFields
                                                                        formData={formData}
                                                                        handleFieldChange={handleFieldChange}
                                                                        errors={errors}
                                                                        vehMakes={vehMakes}
                                                                        vehModels={vehModels}
                                                                        vehColors={vehColors}
                                                                        licenseCats={licenseCats}
                                                                    />;
                                                                }
                                                                return (
                                                                    <div className="empty-state-card" style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
                                                                        <Info size={32} color="#94a3b8" />
                                                                        <p style={{ marginTop: '10px', color: '#64748b' }}>Ce formulaire est en cours de configuration pour cette opération spécifique.</p>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>

                                                        <div className="pro-field-group" id="field-office" style={{ marginTop: '20px' }}>
                                                            <label>Bureau de Traitement <span className="required-mark">*</span></label>
                                                            <div className={`search-select-pro ${errors.office ? 'has-error' : ''}`}>
                                                                <div className="search-input-wrapper">
                                                                    <FileSearch size={20} color="#64748b" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Rechercher un bureau..."
                                                                        value={formData.office || searchOffice}
                                                                        onChange={(e) => {
                                                                            setSearchOffice(e.target.value);
                                                                            handleFieldChange('office', '');
                                                                            setShowOfficeList(true);
                                                                        }}
                                                                        onFocus={() => setShowOfficeList(true)}
                                                                    />
                                                                </div>
                                                                {showOfficeList && (
                                                                    <div className="search-results-overlay">
                                                                        {officesList
                                                                            .filter(o => (!selectedService || !(o.service_ids || []).includes(selectedService)))
                                                                            .filter(o => (o.name || "").toLowerCase().includes(searchOffice.toLowerCase())).length === 0 && (
                                                                                <div className="search-item" style={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucun bureau trouvé pour ce service</div>
                                                                            )}
                                                                        {officesList
                                                                            .filter(o => (!selectedService || (o.service_ids || []).includes(selectedService)))
                                                                            .filter(o => (o.name || "").toLowerCase().includes(searchOffice.toLowerCase()))
                                                                            .map((off, idx) => (
                                                                                <div key={idx} className="search-item" onClick={() => {
                                                                                    handleFieldChange('office', off.name);
                                                                                    setSelectedOfficeId(off.id);
                                                                                    setSearchOffice(off.name);
                                                                                    setShowOfficeList(false);
                                                                                }}>
                                                                                    <strong>{off.name}</strong>
                                                                                    {off.type && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>{off.type}</span>}
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {errors.office && <div className="field-error-msg"><AlertCircle size={14} /> {errors.office}</div>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>


                                            <div className="pro-confirm-footer">
                                                <button type="submit" className="btn-pro-next">
                                                    Enregistrer & Continuer <ArrowRight size={20} />
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            ) : subStep === 2 ? (
                                <div className="forms-docs-grid animate-fade-in">
                                    <div className="doc-instruction">
                                        <h3>Documents Requis</h3>
                                        <p>Veuillez fournir les pièces justificatives listées ci-dessous.</p>
                                    </div>

                                    <div className="pro-required-docs-list">
                                        {(() => {
                                            const age = calculateAge(formData.dob);
                                            const docTypes = requiredDocs;

                                            return docTypes.map((req, idx) => {
                                                const isObj = typeof req === 'object' && req !== null;
                                                const reqType = isObj ? req.name : req;
                                                const isRequired = isObj ? req.required : true;

                                                // Handle Photo specially
                                                if (reqType === "Photo") {
                                                    const uploadedPhoto = documents.find(d => d.type === "Photo");
                                                    const isMet = uploadedPhoto || formData.officialPhotoAtOffice;

                                                    return (
                                                        <div key={idx} className={`req-doc-row ${isMet ? 'is-uploaded' : ''}`}>
                                                            <div className="req-doc-info">
                                                                <div className="doc-status-icon">
                                                                    {isMet ? <FileCheck size={20} color="#10b981" /> : <Info size={20} color="#94a3b8" />}
                                                                </div>
                                                                <div className="req-doc-text-complex">
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span className="req-doc-name">Photo d'identité</span>
                                                                        <span className={`status-pill ${isRequired ? 'pill-required' : 'pill-optional'}`}>
                                                                            {isRequired ? 'Obligatoire' : 'Optionnel'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="req-doc-hint">Importer une photo ou cocher l'option bureau</span>
                                                                </div>
                                                            </div>

                                                            <div className="req-doc-actions-complex">
                                                                <div className="photo-office-toggle" onClick={() => {
                                                                    setFormData({ ...formData, officialPhotoAtOffice: !formData.officialPhotoAtOffice });
                                                                    if (!formData.officialPhotoAtOffice) {
                                                                        // If checking office, remove uploaded photo
                                                                        setDocuments(documents.filter(d => d.type !== "Photo"));
                                                                    }
                                                                }}>
                                                                    <input type="checkbox" checked={formData.officialPhotoAtOffice} onChange={() => { }} />
                                                                    <span>Prise de photo officielle au bureau</span>
                                                                </div>

                                                                {!formData.officialPhotoAtOffice && (
                                                                    uploadedPhoto ? (
                                                                        <div className="uploaded-file-info">
                                                                            <span className="filename-small">{(uploadedPhoto.file || {}).name}</span>
                                                                            <button className="btn-trash-only" onClick={() => setDocuments(documents.filter(d => d.type !== "Photo"))}>
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button className="btn-upload-modern" onClick={() => {
                                                                            const input = document.createElement('input');
                                                                            input.type = 'file';
                                                                            input.onchange = (ev) => {
                                                                                const file = ev.target.files[0];
                                                                                if (file) setDocuments([...documents, { file, type: "Photo" }]);
                                                                            };
                                                                            input.click();
                                                                        }}>
                                                                            <UploadCloud size={16} /> Importer
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                const existingDoc = documents.find(d => d.type === reqType);

                                                return (
                                                    <div key={idx} className={`req-doc-row ${existingDoc ? 'is-uploaded' : ''}`}>
                                                        <div className="req-doc-info">
                                                            <div className="doc-status-icon">
                                                                {existingDoc ? <FileCheck size={20} color="#10b981" /> : <Info size={20} color="#94a3b8" />}
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <span className="req-doc-name">{reqType}</span>
                                                                    <span className={`status-pill ${isRequired ? 'pill-required' : 'pill-optional'}`}>
                                                                        {isRequired ? 'Obligatoire' : 'Optionnel'}
                                                                    </span>
                                                                </div>
                                                                {existingDoc && (
                                                                    <span className="filename-attached">
                                                                        <Tag size={12} /> {(existingDoc.file || {}).name || "Fichier joint"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="req-doc-actions">
                                                            {existingDoc ? (
                                                                <div className="uploaded-actions-row">
                                                                    {existingDoc.file && existingDoc.file.type.startsWith('image/') && (
                                                                        <div className="doc-mini-preview">
                                                                            <img src={URL.createObjectURL(existingDoc.file)} alt="preview" />
                                                                        </div>
                                                                    )}
                                                                    <button
                                                                        className="btn-trash-only"
                                                                        onClick={() => setDocuments(documents.filter(d => d.type !== (existingDoc.type)))}
                                                                        title="Supprimer"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    className="btn-upload-modern"
                                                                    onClick={() => {
                                                                        const input = document.createElement('input');
                                                                        input.type = 'file';
                                                                        input.onchange = (ev) => {
                                                                            const file = ev.target.files[0];
                                                                            if (file) {
                                                                                setDocuments([...documents, { file, type: reqType }]);
                                                                            }
                                                                        };
                                                                        input.click();
                                                                    }}
                                                                >
                                                                    <UploadCloud size={16} /> Importer
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>

                                    <div className="sub-actions">
                                        <button
                                            className="btn-next-recap-modern"
                                            onClick={() => {
                                                const age = calculateAge(formData.dob);
                                                const newErrors = {};
                                                const mandatoryDocs = requiredDocs;

                                                for (const req of mandatoryDocs) {
                                                    const isObj = typeof req === 'object' && req !== null;
                                                    const docTitle = isObj ? req.name : req;
                                                    const isRequired = isObj ? req.required : true;

                                                    if (!isRequired) continue;

                                                    // Handle "Autorisation parentale" specially if it was in the default list but we want it mandatory only for minors
                                                    if (docTitle.includes("Autorisation parentale") && age >= 18) continue;

                                                    if (!documents.find(d => d.type === docTitle)) {
                                                        newErrors.docs = `Veuillez ajouter le document : ${docTitle}`;
                                                        break;
                                                    }
                                                }

                                                // Photo Check (only if in mandatory list)
                                                const photoIsRequired = mandatoryDocs.some(d => (typeof d === 'string' ? d : d.name) === "Photo");
                                                if (photoIsRequired && !newErrors.docs && !formData.officialPhotoAtOffice && !documents.find(d => d.type === "Photo")) {
                                                    newErrors.docs = "Veuillez importer une photo ou choisir l'option de prise de photo au bureau.";
                                                }

                                                if (Object.keys(newErrors).length > 0) {
                                                    setErrors(newErrors);
                                                    return;
                                                }

                                                setErrors({});
                                                setSubStep(3);
                                            }}
                                        >
                                            Récapitulatif <ArrowRight size={18} />
                                        </button>
                                        {errors.docs && (
                                            <div className="field-error-msg center-msg">
                                                <AlertCircle size={14} /> {errors.docs}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="recap-view animate-fade-in">
                                    <div className="recap-card-modern">
                                        <div className="recap-header-blue">
                                            <div className="header-info">
                                                <h3>Vérification finale</h3>
                                                <p>Vérifiez vos données avant l'envoi</p>
                                            </div>
                                            <div className="recap-status-pill">Prêt pour envoi</div>
                                        </div>

                                        <div className="recap-body-scroll">
                                            <div className="recap-section-title">Informations personnelles</div>
                                            <div className="recap-row">
                                                <div className="recap-col">
                                                    <span className="label-recap">Nom</span>
                                                    <p>{formData.lastName}</p>
                                                    <span className="label-recap">Prénom</span>
                                                    <p>{formData.firstName}</p>
                                                    <span className="label-recap">Sexe</span>
                                                    <p>{formData.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                                                </div>
                                                <div className="recap-col">
                                                    <span className="label-recap">Date de naissance</span>
                                                    <p>{formData.dob}</p>
                                                    <span className="label-recap">Lieu de naissance</span>
                                                    <p>{formData.pob}</p>
                                                    <span className="label-recap">Nationalité</span>
                                                    <p>{formData.nationality}</p>
                                                </div>
                                                <div className="recap-col">
                                                    <span className="label-recap">État civil</span>
                                                    <p>{formData.maritalStatus || 'Non renseigné'}</p>
                                                </div>
                                            </div>

                                            <div className="recap-section-title">Identification & Détails du Service</div>
                                            <div className="recap-row">
                                                <div className="recap-col">
                                                    <span className="label-recap">NIF / CIN</span>
                                                    <p>{formData.nifCin}</p>
                                                    <span className="label-recap">Bureau de traitement</span>
                                                    <p>{formData.office}</p>
                                                </div>
                                                <div className="recap-col">
                                                    {isImmatriculation(selectedService) && (
                                                        <>
                                                            <span className="label-recap">Véhicule</span>
                                                            <p>{formData.vehicleMake} {formData.vehicleModel}</p>
                                                            <span className="label-recap">N° Châssis</span>
                                                            <p>{formData.chassisNumber}</p>
                                                        </>
                                                    )}
                                                    {isPermis(selectedService) && (
                                                        <>
                                                            <span className="label-recap">Catégorie demandée</span>
                                                            <p>{formData.permitType}</p>
                                                            <span className="label-recap">Type de permis</span>
                                                            <p>{formData.permitTypeDetail}</p>
                                                        </>
                                                    )}
                                                    {isAssurance(selectedService) && (
                                                        <>
                                                            <span className="label-recap">Compagnie</span>
                                                            <p>{formData.insuranceCompany}</p>
                                                            <span className="label-recap">Plaque</span>
                                                            <p>{formData.vehiclePlate}</p>
                                                        </>
                                                    )}
                                                    {isContravention(selectedService) && (
                                                        <>
                                                            <span className="label-recap">N° Contravention</span>
                                                            <p>{formData.ticketNumber}</p>
                                                            <span className="label-recap">Date Infraction</span>
                                                            <p>{formData.infractionDate}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="recap-section-title">Contact & localisation</div>
                                            <div className="recap-row">
                                                <div className="recap-col">
                                                    <span className="label-recap">Pays</span>
                                                    <p>{formData.country}</p>
                                                    <span className="label-recap">Département / État</span>
                                                    <p>{formData.state}</p>
                                                    <span className="label-recap">Ville / Commune</span>
                                                    <p>{formData.city}</p>
                                                </div>
                                                <div className="recap-col">
                                                    <span className="label-recap">Rue / Quartier</span>
                                                    <p>{formData.street}</p>
                                                    <span className="label-recap">Téléphone</span>
                                                    <p>{formData.phone}</p>
                                                    <span className="label-recap">Email</span>
                                                    <p>{formData.email || 'Non renseigné'}</p>
                                                </div>
                                            </div>

                                            <div className="recap-section-title">Documents Importés ({documents.length + (formData.officialPhotoAtOffice ? 1 : 0)})</div>
                                            <div className="recap-row doc-full-row">
                                                <div className="file-preview-list-recap">
                                                    {formData.officialPhotoAtOffice && (
                                                        <div className="file-tag-large">
                                                            <div className="doc-status-icon"><FileCheck size={16} color="#10b981" /></div>
                                                            <div className="file-info">
                                                                <span className="f-type">PHOTO</span>
                                                                <span className="f-name">Prise de photo officielle au bureau (Sélectionné)</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {documents.map((doc, i) => (
                                                        <div key={i} className="file-tag-large">
                                                            <FileCheck size={16} color="#10b981" />
                                                            <div className="file-info">
                                                                <span className="f-type">{doc.type.toUpperCase()}</span>
                                                                <span className="f-name">{(doc.file || {}).name || doc.name}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="submission-notice">
                                            <AlertCircle size={20} className="notice-icon" />
                                            <p>En soumettant cette demande, vous confirmez l'exactitude des informations fournies.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Card Footer with Steps */}
                <div className="card-inner-footer">
                    <div className="step-progress-wrapper">
                        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                            <span className="step-indicator-dot"></span>
                            <span className="step-name">Services</span>
                        </div>
                        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                            <span className="step-indicator-dot"></span>
                            <span className="step-name">Opérations</span>
                        </div>
                        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                            <span className="step-indicator-dot"></span>
                            <span className="step-name">Demandes</span>
                        </div>
                    </div>

                    <div className="footer-actions">
                        {step > 1 && !done && (
                            <button className="icon-nav-btn back" onClick={handleBack} data-tooltip="Précédent">
                                <ArrowLeft size={22} />
                            </button>
                        )}
                        {step < 3 && (
                            <button className="icon-nav-btn next" onClick={handleNext} disabled={step === 1 ? !selectedService : !selectedOperation} data-tooltip="Suivant">
                                <ArrowRight size={22} />
                            </button>
                        )}
                        {step === 3 && subStep === 1 && (
                            <>
                                <button className="icon-nav-btn draft" onClick={handleSaveDraft} disabled={isSubmitting} data-tooltip="Sauvegarder Brouillon">
                                    <FileEdit size={22} />
                                </button>
                                <button className="icon-nav-btn next" onClick={() => {
                                    const btn = document.querySelector('.btn-pro-next');
                                    if (btn) btn.click();
                                }} data-tooltip="Valider Infos">
                                    <ArrowRight size={22} />
                                </button>
                            </>
                        )}
                        {step === 3 && subStep === 2 && (
                            <>
                                <button className="icon-nav-btn draft" onClick={handleSaveDraft} disabled={isSubmitting} data-tooltip="Sauvegarder Brouillon">
                                    <FileEdit size={22} />
                                </button>
                                <button className="icon-nav-btn next" onClick={() => setSubStep(3)} disabled={documents.length === 0} data-tooltip="Récapitulatif">
                                    <ArrowRight size={22} />
                                </button>
                            </>
                        )}
                        {step === 3 && !done && subStep === 3 && (
                            <button
                                className="icon-nav-btn submit"
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Envoi...' : 'Soumettre'} <ArrowRight size={22} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment & Finish Modal */}
            {showPaymentModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal-card animate-scale-up">
                        {payoutOption === null ? (
                            <div className="payment-decision-view">
                                <div className="decision-icon">
                                    <ShieldCheck size={48} color="#10b981" />
                                </div>
                                <h3 className="pay-title">Demande Soumise avec Succès !</h3>
                                <p className="pay-desc">C'est l'étape finale. Souhaitez-vous procéder au paiement des frais de dossier maintenant ?</p>

                                <div className="price-tag-big">
                                    <span className="p-short">Total à régler :</span>
                                    <span className="p-amount">{Number(getPriceForService(selectedService)).toLocaleString()} HTG</span>
                                </div>

                                <div className="decision-buttons">
                                    <button className="btn-pay-now" onClick={() => setPayoutOption('now')}>
                                        Payer maintenant <ArrowRight size={18} />
                                    </button>
                                    <button className="btn-pay-later" onClick={() => window.location.href = '/user/statut'}>
                                        Payer plus tard
                                    </button>
                                </div>
                            </div>
                        ) : payoutOption === 'now' ? (
                            <div className="payment-methods-view">
                                <div className="pm-header">
                                    <button className="btn-back-pm" onClick={() => setPayoutOption(null)}>
                                        <ArrowLeft size={16} /> Retour
                                    </button>
                                    <h3>Modes de Paiement</h3>
                                </div>

                                <div className="pm-list">
                                    <div className={`pm-item ${paymentMethod === 'Carte Bancaire' ? 'active' : ''}`} onClick={() => setPaymentMethod('Carte Bancaire')}>
                                        <CreditCard size={24} />
                                        <div className="pm-info">
                                            <span className="pm-name">Carte Bancaire</span>
                                            <span className="pm-desc">Visa, Mastercard</span>
                                        </div>
                                    </div>
                                    <div className={`pm-item ${paymentMethod === 'Mon Cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('Mon Cash')}>
                                        <Globe2 size={24} color="#f59e0b" />
                                        <div className="pm-info">
                                            <span className="pm-name">Mon Cash</span>
                                            <span className="pm-desc">Paiement mobile</span>
                                        </div>
                                    </div>
                                    <div className={`pm-item ${paymentMethod === 'Virement' ? 'active' : ''}`} onClick={() => setPaymentMethod('Virement')}>
                                        <FileText size={24} color="#3b82f6" />
                                        <div className="pm-info">
                                            <span className="pm-name">Virement</span>
                                            <span className="pm-desc">Banque locale</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-mock-input">
                                    <input type="text" placeholder="#### #### #### ####" disabled />
                                    <div className="card-row">
                                        <input type="text" placeholder="MM/YY" disabled style={{ width: '50%' }} />
                                        <input type="text" placeholder="CVV" disabled style={{ width: '50%' }} />
                                    </div>
                                </div>

                                <button
                                    className="btn-confirm-payment"
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(`/api/requests/${createdRequestId}/pay`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                },
                                                body: JSON.stringify({ paymentMethod })
                                            });
                                            if (response.ok) {
                                                alert("Paiement réussi ! Votre dossier est maintenant en cours de traitement.");
                                                window.location.href = '/user/statut';
                                            } else {
                                                alert("Erreur lors de la validation du paiement.");
                                            }
                                        } catch (error) {
                                            console.error("Payment confirmation error:", error);
                                            alert("Une erreur est survenue lors du paiement.");
                                        }
                                    }}
                                >
                                    Confirmer le paiement de {Number(getPriceForService(selectedService)).toLocaleString()} HTG
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
            {/* Draft Success Modal */}
            {showDraftModal && (
                <div className="payment-modal-overlay">
                    <div className="payment-modal-card animate-scale-up">
                        <div className="payment-decision-view">
                            <div className="decision-icon" style={{ background: '#fef3c7' }}>
                                <FileEdit size={48} color="#d97706" />
                            </div>
                            <h3 className="pay-title">Brouillon Enregistré</h3>
                            <p className="pay-desc">
                                Dossier incomplet transmis dans brouillons. Vous pouvez le compléter à tout moment dans la section "Mes Dossiers".
                            </p>

                            <div className="decision-buttons">
                                <button
                                    className="btn-pay-now"
                                    style={{ background: '#1e3a8a' }}
                                    onClick={() => navigate('/user/statut', { state: { openDrafts: true } })}
                                >
                                    Aller à mes brouillons <ArrowRight size={18} />
                                </button>
                                <button
                                    className="btn-pay-later"
                                    onClick={() => setShowDraftModal(false)}
                                >
                                    Continuer à remplir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <footer className="page-official-footer">
                <em>SIAAH - Plateforme officielle MEF</em>
            </footer>

            {isSubmitting && (
                <div className="loading-overlay-full">
                    <div className="loader-box">
                        <Loader2 className="animate-spin" size={48} color="#1e3a8a" />
                        <h3>Traitement en cours</h3>
                        <p>Veuillez ne pas fermer cette page...</p>
                    </div>
                </div>
            )}
        </main>
    );
};

export default NouvelleDemande;
