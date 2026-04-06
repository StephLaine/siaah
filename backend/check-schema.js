const { pool } = require('./src/config/db');

async function main() {
    try {
        const r = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='service_operations' ORDER BY ordinal_position");
        console.log('service_operations columns:', r.rows.map(c => c.column_name).join(', '));
        process.exit(0);
    } catch (e) {
        console.error('ERROR:', e.message);
        process.exit(1);
    }
}
main();
