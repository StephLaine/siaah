const { Client } = require('pg');
require('dotenv').config();

const migrate = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME
    });

    try {
        await client.connect();
        console.log('Connected. Running second migration...');

        const migrations = [
            // Add location alias to offices (standardize)
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS location TEXT`,
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS city VARCHAR(100)`,
            // Add location alias to entities
            `ALTER TABLE entities ADD COLUMN IF NOT EXISTS location TEXT`,
            `ALTER TABLE entities ADD COLUMN IF NOT EXISTS city VARCHAR(100)`,
            
            // Ensure address and adresse are standard
            `ALTER TABLE offices ADD COLUMN IF NOT EXISTS address TEXT`,
            `ALTER TABLE entities ADD COLUMN IF NOT EXISTS address TEXT`,

            // Ensure type column in offices is not strict
            `ALTER TABLE offices ALTER COLUMN type DROP NOT NULL`,
        ];

        for (const sql of migrations) {
            try {
                await client.query(sql);
                console.log('OK:', sql.substring(0, 60));
            } catch (e) {
                console.warn('SKIP:', e.message.substring(0, 80));
            }
        }

        // Copy data if possible to maintain sync
        await client.query(`UPDATE offices SET location = COALESCE(location, adresse, address)`);
        await client.query(`UPDATE offices SET adresse = COALESCE(adresse, location, address)`);
        await client.query(`UPDATE offices SET address = COALESCE(address, adresse, location)`);
        
        await client.query(`UPDATE entities SET location = COALESCE(location, adresse, address)`);
        await client.query(`UPDATE entities SET adresse = COALESCE(adresse, location, address)`);
        await client.query(`UPDATE entities SET address = COALESCE(address, adresse, location)`);

        console.log('\n✅ Second migration completed successfully!');
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err.message);
        process.exit(1);
    }
};

migrate();
