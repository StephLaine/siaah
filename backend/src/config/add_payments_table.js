const { Client } = require('pg');
require('dotenv').config();

const addPaymentsTable = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME
    });

    try {
        await client.connect();
        console.log('Connected to database to add payments table');

        const query = `
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                request_id INT REFERENCES service_requests(id) ON DELETE SET NULL,
                violation_id INT REFERENCES violations(id) ON DELETE SET NULL,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'HTG',
                payment_method VARCHAR(50) NOT NULL, -- 'moncash', 'credit_card'
                payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
                transaction_id TEXT UNIQUE,
                payment_details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await client.query(query);
        console.log('Payments table created successfully');

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Error adding payments table:', err);
        process.exit(1);
    }
};

addPaymentsTable();
