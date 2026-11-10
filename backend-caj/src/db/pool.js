// src/db/pool.js
const { Pool } = require("pg");

let pool;

/**
 * Pool de conexões com o Postgres (Supabase).
 * Use a connection string do "Transaction pooler" (porta 6543) em ambiente serverless (Vercel).
 */
function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL não configurada.");
    }
    const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
    pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

function query(text, params) {
  return getPool().query(text, params);
}

module.exports = { getPool, query };
