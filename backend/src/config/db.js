const { Pool } = require('pg');

// Create a new pool using the DATABASE_URL from environment variables.
// This file is required by various controllers to execute queries.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = { pool };
