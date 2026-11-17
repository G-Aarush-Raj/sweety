require('dotenv').config();
const { Pool, types } = require('pg');
// Return DATE columns as plain 'YYYY-MM-DD' strings (avoids timezone shifts)
types.setTypeParser(1082, (v) => v);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

// Without this, a dropped idle connection (common on Neon) crashes the server
pool.on('error', (err) => console.error('Database connection error:', err.message));

module.exports = pool;