const { pool } = require('./src/config/db');

async function migrateAppointments() {
    try {
        console.log("Creating appointments table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                service VARCHAR(100) NOT NULL,
                service_type VARCHAR(200),
                appointment_date DATE NOT NULL,
                appointment_time TIME,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(200),
                phone VARCHAR(30),
                nif VARCHAR(50),
                notes TEXT,
                status VARCHAR(30) DEFAULT 'pending'  CHECK (status IN ('pending','confirmed','cancelled','completed')),
                office_id INTEGER REFERENCES offices(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log("appointments table created successfully.");
        pool.end();
    } catch (err) {
        console.error("Migration error:", err);
        pool.end();
    }
}
migrateAppointments();
