const { Pool } = require('pg');
require('dotenv').config();

// ─────────────────────────────────────────────────────────────────────────────
// Connexion automatique :
//   • Si DATABASE_URL est défini  → Base EXTERNE (Render / Supabase / etc.)
//   • Sinon                       → Base LOCALE  (variables DB_HOST, etc.)
// Pour switcher, commentez / décommentez dans .env
// ─────────────────────────────────────────────────────────────────────────────

let poolConfig;

if (process.env.DATABASE_URL) {
    console.log('🌐 Connexion à la base de données EXTERNE (DATABASE_URL)');
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // requis pour Render/Heroku
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    };
} else if (process.env.DB_HOST) {
    console.log('🏠 Connexion à la base de données LOCALE (DB_HOST)');
    poolConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER || process.env.DB_USER,
        password: process.env.DB_PASS || process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT) || 5432,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    };
} else {
    throw new Error(
        '❌ Aucune configuration de base de données trouvée.\n' +
        '   → Activez DATABASE_URL (base externe) OU DB_HOST (base locale) dans .env'
    );
}

const pool = new Pool(poolConfig);

// Test de connexion au démarrage
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('✅ Base de données connectée avec succès');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
