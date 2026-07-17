import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();


// LOGGING MIDDLEWARE
app.use((req, res, next) => {
    console.log(`[DEBUG] Received ${req.method} request at ${req.url}`);
    next();
});


// CORS MIDDLEWARE
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


// BODY PARSER
app.use(express.json());


// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/booking', bookingRoutes);


export default app;