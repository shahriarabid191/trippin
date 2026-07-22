import pg from 'pg';

const { Pool } = pg;

// We now pass an object with the individual pieces instead of connectionString
const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    keepAlive: true,
});

// Supabase's pooler drops idle connections, which makes pg emit an 'error'
// event on the idle client. Without a listener, Node treats it as an
// unhandled 'error' and crashes the whole process. Log and swallow it —
// the pool discards the dead client and opens a fresh one on next query.
pool.on('error', (err) => {
    console.error('Unexpected Postgres pool error (idle client):', err.message);
});

pool.connect()
    .then((client) => {
        console.log('Successfully connected to Supabase PostgreSQL');
        client.release();
    })
    .catch((err) => console.error('Database connection error:', err));

export default pool;