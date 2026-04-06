const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'service_requests'", (err, res) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(res.rows, null, 2));
    pool.end();
});
