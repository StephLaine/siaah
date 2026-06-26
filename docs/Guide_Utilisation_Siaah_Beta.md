# Guide d’utilisation – Siaah Beta

## 📖 Introduction
Ce guide décrit comment **utiliser** l’application Siaah Beta, tant du côté **backend** (API) que du côté **frontend** (interface Super‑Admin). Vous y trouverez les étapes d’installation, le démarrage, les principales fonctionnalités, la documentation des API et des conseils de dépannage.

---

## 🛠️ Prérequis
| Élément | Version minimale |
|---------|-----------------|
| **Node.js** | v24.12.0 (ou supérieur) |
| **npm** | v10.8.0 |
| **PostgreSQL** | 13+ |
| **Git** | 2.30+ |
> ⚠️ Assurez‑vous que les variables d’environnement sont correctement définies dans `backend/.env`.

---

## 📂 Structure du projet
```
Siaah‑Beta/
├─ backend/                     # API Node/Express
│   ├─ src/                     # Code source
│   │   ├─ app.js               # Express app + routes
│   │   └─ server.js            # Création du serveur HTTP
│   ├─ migrations/             # Scripts SQL de création du schéma
│   ├─ seeders/                # Données par défaut (services, entités…)
│   ├─ add_default_services_to_entities.js   # Lien services ↔ entités par défaut
│   └─ .env                    # Variables d’environnement
├─ frontend/                    # Application React + Vite
│   └─ src/ …
└─ package.json                 # Racine – dépendances front+back (legacy)
```

---

## 🚀 Démarrage du **backend**
1. **Installer les dépendances**
```bash
cd backend
npm install
```
2. **Configurer la base** (une fois uniquement) :
```bash
npm run db:reset   # supprime toutes les tables, recrée le schéma, exécute les migrations
npm run seed       # insère les services, entités, opérations par défaut
node add_default_services_to_entities.js   # lie chaque service à son entité par défaut
```
3. **Lancer le serveur** :
```bash
npm run dev        # nodemon → écoute les changements
```
Le serveur écoute le port indiqué dans `backend/.env` (`PORT=5003`).
> 📌 Le serveur expose l’endpoint de santé : `GET /health`.

---

## 💻 Démarrage du **frontend** (Super‑Admin)
```bash
cd ../frontend
npm install
npm start          # démarre Vite (http://localhost:5173)
```
Le proxy Vite redirige les appels `/api/*` vers le backend (`http://localhost:5003`).

---

## 🔐 Authentification
- **Login** : `POST /api/auth/login` (email + password) → renvoie un JWT.
- **Profil** : `GET /api/auth/profile` (Bearer token) → infos de l’utilisateur connecté.
- Le token doit être envoyé dans l’en‑tête `Authorization: Bearer <token>` pour toutes les routes `/api/admin/*` et `/api/superadmin/*`.

---

## 📦 Gestion des **services**, **entités**, **utilisateurs**, **bureaux**, **rôles**
Voir la section *Documentation de l’API* ci‑dessous pour les routes détaillées (GET, POST, PUT, DELETE).

---

## 📚 Documentation de l’API (extraits)
> Vous pouvez consulter le Swagger (ou Postman) généré dans `backend/src/routes/admin.routes.js`. Chaque route possède un *handler* détaillé dans `backend/src/controllers/admin.controller.js`.

### Exemple – GET `/api/admin/services`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Permis de conduire",
      "operations": [{"id":10,"name":"Renouveler",...}],
      "entities": [{"id":5,"name":"DGI"}]
    }
  ]
}
```

---

## 🔁 Réinitialisation de la base de données
```bash
# 1️⃣ Supprimer tout le schéma public
npm run db:reset   # (exécute le script psql qui drop‑create le schema)
# 2️⃣ Appliquer les migrations
npm run migrate    # exécute `backend/migrations/run_migrations.js`
# 3️⃣ Charger les données de base
npm run seed       # exécute `backend/seeders/001_default_services_and_operations.js`
# 4️⃣ Lier services ↔ entités par défaut
node add_default_services_to_entities.js
```
> ⚡ Après ces étapes, le système retrouve son état **initial**.

---

## 🐞 Dépannage fréquent
| Symptom | Cause probable | Solution |
|---------|----------------|----------|
| `ECONNREFUSED` sur `/api/...` | Backend non lancé ou mauvais port | Vérifier `backend/.env` → `PORT`, lancer `npm run dev`, s’assurer que le proxy Vite pointe sur le même port. |
| `COALESCE could not convert type jsonb to json` | Casts `jsonb` → `json` dans le SELECT. | Le correctif a déjà été appliqué dans `admin.controller.js`. Redémarrer le serveur. |
| `EADDRINUSE` | Port déjà occupé (ex. 5000) | Kill le processus (`npx kill-port 5000`) ou change le port dans `.env`. |
| Page blanche du Super‑Admin | API renvoie 500 ou 404 | Ouvrir la console du navigateur → vérifier la réponse des appels `/api/admin/*`. S’assurer que les migrations ont été exécutées. |

---

## 📦 Scripts npm utiles (backend)
| Script | Action |
|--------|--------|
| `npm run dev` | Lancer le serveur avec **nodemon** (rechargement à chaque changement). |
| `npm start` | Lancer le serveur en production (sans reload). |
| `npm run db:reset` | Supprimer le schéma et le recréer (DROP SCHEMA public). |
| `npm run migrate` | Exécuter toutes les migrations SQL. |
| `npm run seed` | Insérer les données de base (services, entités, opérations). |
| `npm run reset‑full` *(custom)* | Combinaison de `db:reset`, `migrate`, `seed` et `add_default_services_to_entities.js`. |

---

## 📄 Références de fichiers
- **Backend** :
  - [src/app.js](file:///c:/Users/teach/Desktop/Siaah-Beta/backend/src/app.js)
  - [src/server.js](file:///c:/Users/teach/Desktop/Siaah-Beta/backend/src/server.js)
  - [src/controllers/admin.controller.js](file:///c:/Users/teach/Desktop/Siaah-Beta/backend/src/controllers/admin.controller.js)
  - [migrations/run_migrations.js](file:///c:/Users/teach/Desktop/Siaah-Beta/backend/migrations/run_migrations.js)
  - [seeders/001_default_services_and_operations.js](file:///c:/Users/teach/Desktop/Siaah-Beta/backend/seeders/001_default_services_and_operations.js)
- **Frontend** :
  - [src/pages/superadmin/ServicesManager.jsx](file:///c:/Users/teach/Desktop/Siaah-Beta/frontend/src/pages/superadmin/ServicesManager.jsx)
  - [vite.config.js](file:///c:/Users/teach/Desktop/Siaah-Beta/frontend/vite.config.js)

---

## 🎉 Fin
Vous avez maintenant toutes les informations nécessaires pour **installer**, **configurer**, **utiliser** et **déboguer** Siaah Beta. N’hésitez pas à consulter le code source pour approfondir les comportements spécifiques et à contribuer aux améliorations !

*Guide rédigé le 2026‑06‑22.*
