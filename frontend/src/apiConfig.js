import axios from 'axios';

// Vite remplace ceci par votre variable d'environnement (si configurée dans Render)
const backendUrl = import.meta.env.VITE_API_URL || '';

// 1. Configurer Axios globalement
axios.defaults.baseURL = backendUrl;

// 2. Configurer fetch() globalement (intercepteur manuel très léger)
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    let [resource, config] = args;
    // Si la requête commence par /api/ et qu'il y a une URL de backend défini dans l'environnement, on l'ajoute !
    if (typeof resource === 'string' && resource.startsWith('/api/') && backendUrl) {
        resource = backendUrl + resource;
    }
    return originalFetch(resource, config);
};
