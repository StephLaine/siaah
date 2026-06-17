const jwt = require('jsonwebtoken');

/**
 * ══════════════════════════════════════════════════
 * MIDDLEWARE D'AUTHENTIFICATION ET D'AUTORISATION
 * ══════════════════════════════════════════════════
 *
 *  ROLE MAPPING:
 *    role_id = 1  →  Super Admin            (MEF — accès total)
 *    role_id = 2  →  Admin Entité           (chef d'entité)
 *    role_id = 3  →  Employé               (accès complet à son entité)
 *    role_id = 4  →  Agent Immatriculation  (module immatriculation)
 *    role_id = 5  →  Agent Assurance        (module assurances)
 *    role_id = 6  →  Agent Permis           (module permis de conduire)
 *    role_id = 7  →  Agent Routier          (module contraventions/routier)
 *    role_id = 8  →  User/Citoyen           (espace citoyen uniquement)
 */

/**
 * authMiddleware — vérifie la présence et la validité du token JWT.
 * Attache req.user = { id, role_id, office_id }
 */
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Accès refusé : aucun token fourni',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            status: 'error',
            message: 'Token invalide ou expiré',
        });
    }
};

/**
 * lazyAuthMiddleware — tente d'extraire req.user si le token est présent,
 * mais ne bloque pas l'exécution si le token est manquant ou invalide.
 */
const lazyAuthMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            // Supprimer le token invalide (optionnel, on ignore juste l'erreur ici)
        }
    }
    next();
};

/**
 * roleMiddleware — vérifie que l'utilisateur possède l'un des rôles autorisés.
 * @param {number[]} roles - Tableau de role_id autorisés
 */
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Utilisateur non authentifié',
            });
        }

        if (!roles.includes(req.user.role_id)) {
            return res.status(403).json({
                status: 'error',
                message: 'Accès refusé : permissions insuffisantes',
                required_roles: roles,
                your_role: req.user.role_id,
            });
        }

        next();
    };
};

/**
 * Raccourcis sémantiques pour les vérifications de rôle les plus courantes.
 */
// Raccourcis sémantiques
const isSuperAdmin    = roleMiddleware([1]);
const isAdmin         = roleMiddleware([1, 2]);
const isStaff         = roleMiddleware([1, 2, 3]);
const isAgent         = roleMiddleware([4, 5, 6, 7]);         // agents spécialisés
const isStaffOrAgent  = roleMiddleware([1, 2, 3, 4, 5, 6, 7]); // tout le personnel
const isUser          = roleMiddleware([8]);                   // citoyens

module.exports = {
    authMiddleware,
    lazyAuthMiddleware,
    roleMiddleware,
    isSuperAdmin,
    isAdmin,
    isStaff,
    isAgent,
    isStaffOrAgent,
    isUser,
};
