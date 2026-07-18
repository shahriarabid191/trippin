import pool from '../config/db.js';

// Find a user by their id
export const findUserById = async (id) => {
    const result = await pool.query(
        'SELECT id, email, role FROM users WHERE id = $1',
        [id]
    );

    return result.rows[0];
};

// Find a user by their email address
export const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

// Insert a new user into the database
export const createUser = async (email, hashedPassword, role) => {
    const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
        [email, hashedPassword, role]
    );
    return newUser.rows[0];
};