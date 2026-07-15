import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // 2. In a real app, use bcrypt.compare(). Since your admin placeholder is raw text, 
        // we'll do a simple check just to get you working today.
        const isMatch = password === user.password_hash; // Replace with bcrypt later!
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 3. Create the JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'super_secret_fallback_key',
            { expiresIn: '1d' }
        );

        // 4. Send the token in an HTTP-Only cookie for security
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS in production
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ message: 'Logged in successfully', user: { email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
    const { email, password, adminCode } = req.body;

    try {
        // 1. Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // 2. Securely hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Check for Admin Code (Change this secret code in production!)
        const role = adminCode === 'TRIPPIN_ADMIN_2026' ? 'admin' : 'user';

        // 4. Save to Database
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
            [email, hashedPassword, role]
        );

        const user = newUser.rows[0];

        // 5. Issue JWT Cookie so they are instantly logged in
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'super_secret_fallback_key',
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({ message: 'User registered', user: { email: user.email, role: user.role } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};