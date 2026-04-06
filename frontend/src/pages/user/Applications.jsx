import { useLocation } from 'react-router-dom';
import NouvelleDemande from './userpanel/NouvelleDemande';

const Applications = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const typeUri = queryParams.get('type');
    const opUri = queryParams.get('op');

    let { service: initialService, op: initialOp, draftId } = location.state || {};

    // Auto-map from URL query parameters (higher priority than state)
    let finalService = initialService;
    let finalOp = initialOp;

    if (typeUri) {
        const sMap = { 'immatriculation': 1, 'permis': 2, 'assurance': 3, 'contravention': 4 };
        finalService = sMap[typeUri.toLowerCase()] || typeUri;

        // Map operations for Immatriculation
        if (finalService === 1) {
            const oMap = { 'immatriculer': 1, 'renouveler': 2, 'transferer': 3, 'remplacer': 4 };
            if (opUri) finalOp = oMap[opUri.toLowerCase()] || opUri;
        } 
        // Map operations for Permis
        else if (finalService === 2) {
            const oMap = { 'nouveau': 1, 'renouveler': 2, 'remplacer': 3 };
            if (opUri) finalOp = oMap[opUri.toLowerCase()] || opUri;
        }
        // Map operations for Assurance
        else if (finalService === 3) {
            const oMap = { 'nouvelle': 1, 'renouveler': 2 };
            if (opUri) finalOp = oMap[opUri.toLowerCase()] || opUri;
        }
        // Map operations for Contravention
        else if (finalService === 4) {
            const oMap = { 'payer': 1 };
            if (opUri) finalOp = oMap[opUri.toLowerCase()] || opUri;
        }
    }

    return <NouvelleDemande 
        initialService={typeUri || initialService} 
        initialOperation={opUri || initialOp} 
        initialDraftId={draftId} 
    />;
};

export default Applications;
