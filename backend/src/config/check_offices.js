const { Client } = require('pg');
require('dotenv').config();

const check = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, is_nullable, column_default, data_type
            FROM information_schema.columns 
            WHERE table_name = 'offices'
        `);
        console.log(JSON.stringify(res.rows, null, 2));
        await client.end();
    } catch (err) {
        console.error(err);
    }
};

check();
