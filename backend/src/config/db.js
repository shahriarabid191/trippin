import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// We now pass an object with the individual pieces instead of connectionString
const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
});

pool.connect()
    .then(() => console.log('Successfully connected to Supabase PostgreSQL'))
    .catch((err) => console.error('Database connection error:', err));

export default pool;