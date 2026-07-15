import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// This connects directly to your Supabase database using your connection string
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Test the connection
pool.connect()
    .then(() => console.log('Successfully connected to Supabase PostgreSQL'))
    .catch((err) => console.error('Database connection error:', err));

export default pool;