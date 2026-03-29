const { Pool } = require('pg');

// Check if running in Docker environment
// When running locally but PostgreSQL is in Docker, connect to Docker container
const isDocker = process.env.DB_HOST === 'postgres';

const pool = new Pool({
  host: isDocker ? 'postgres' : (process.env.DB_HOST || 'localhost'),
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'asset_admin',
  password: process.env.DB_PASSWORD || 'asset_password',
  database: process.env.DB_NAME || 'asset_management',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);
  
  client.query = (...args) => {
    client.lastQuery = args;
    return query(...args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release();
  };
  
  return client;
};

module.exports = {
  pool,
  connectDB,
  query,
  getClient
};
