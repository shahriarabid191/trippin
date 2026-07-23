import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserById, findUserByEmail, createUser } from '../models/userModel.js';


const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    path: "/"
};

// Signs a JWT and sets it as an HTTP-Only cookie on the response
const issueAuthCookie = (res, user) => {

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role

        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );


    res.cookie("token", token, cookieOptions);
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 2. Compare submitted password against the stored bcrypt hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 3. Issue JWT via HTTP-Only cookie
        issueAuthCookie(res, user);

        res.status(200).json({
            message: 'Logged in successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
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
        const userExists = await findUserByEmail(email);
        if (userExists) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // 2. Securely hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const role = adminCode === process.env.ADMIN_CODE ? 'admin' : 'user';

        // 4. Save to Database
        const user = await createUser(email, hashedPassword, role);

        // 5. Issue JWT Cookie so they are instantly logged in
        issueAuthCookie(res, user);

        res.status(201).json({
            message: 'User registered',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};


export const getMe = async (req, res) => {

    try {

        const user = await findUserById(req.user.id);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

};


export const logoutUser = (req, res) => {
    res.clearCookie("token", cookieOptions);

    res.json({
        message: "Logged out"
    });
};