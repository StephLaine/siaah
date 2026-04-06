const { pool } = require('./src/config/db');
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'", (err, res) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(res.rows.map(r => r.column_name), null, 2));
    pool.end();
});
