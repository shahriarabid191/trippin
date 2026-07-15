import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import hotelRoutes from './src/routes/hotelRoutes.js';

const app = express();

// LOGGING MIDDLEWARE - Add this to see what is happening in your terminal
app.use((req, res, next) => {
    console.log(`[DEBUG] Received ${req.method} request at ${req.url}`);
    next();
});

// CORS MIDDLEWARE
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly include OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));