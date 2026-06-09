require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432,
});

async function migratePasswords() {
    console.log('🚀 Démarrage de la migration des mots de passe...');
    try {
        const users = await pool.query('SELECT id, email, password FROM users');
        console.log(`📊 ${users.rows.length} utilisateurs trouvés.`);

        for (const user of users.rows) {
            // Un hash bcrypt commence généralement par $2a$ ou $2b$
            if (user.password && user.password.startsWith('$2')) {
                console.log(`✅ [Skipped] ${user.email} (déjà haché)`);
                continue;
            }

            console.log(`🔄 [Hashing] ${user.email}...`);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password || 'password123', salt);

            await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
        }

        console.log('\n✨ Migration terminée avec succès !');
    } catch (err) {
        console.error('❌ Erreur lors de la migration:', err.message);
    } finally {
        await pool.end();
    }
}

migratePasswords();
