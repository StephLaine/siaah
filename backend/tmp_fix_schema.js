const { pool } = require('./src/config/db');

async function fixSchema() {
  try {
    console.log('Updating service_requests status check constraint...');
    
    // Drop ALL check constraints on status column to be safe
    const findRes = await pool.query(`
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'service_requests'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%status%';
    `);
    
    for (const row of findRes.rows) {
      console.log(`Dropping constraint: ${row.conname}`);
      await pool.query(`ALTER TABLE service_requests DROP CONSTRAINT "${row.conname}"`);
    }
    
    // Now add the new one with comprehensive list
    console.log('Adding new constraint...');
    await pool.query("ALTER TABLE service_requests ADD CONSTRAINT service_requests_status_check CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'validated', 'paused', 'to_deliver', 'draft'))");
    
    console.log('Schema updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating schema:', err);
    process.exit(1);
  }
}

fixSchema();
