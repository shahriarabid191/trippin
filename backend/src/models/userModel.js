import pool from '../config/db.js';

// Find a user by their id
export const findUserById = async (id) => {
    const result = await pool.query(
        'SELECT id, email, username, role FROM users WHERE id = $1',
        [id]
    );

    return result.rows[0];
};

// Find a user by their email address
export const findUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    return result.rows[0];
};

// Find a user by their username
export const getUserByUsername = async (username) => {

    const result = await pool.query(
        `
        SELECT id, username
        FROM users
        WHERE username = $1
        `,
        [username]
    );

    return result.rows[0];

};

// Insert a new user into the database
export const createUser = async (email, hashedPassword, role) => {

    const result = await pool.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, $3)
         RETURNING id, email, role`,
        [email, hashedPassword, role]
    );

    const user = result.rows[0];

    // adding username
    const username = `${email.split("@")[0]}_${user.id}`;

    // Save username and return updated user
    const updatedUser = await pool.query(
        `UPDATE users
         SET username = $1
         WHERE id = $2
         RETURNING id, email, username, role`,
        [username, user.id]
    );

    return updatedUser.rows[0];
};