import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";


import todoRoutes from "./routes/todoRoutes.js";
import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import vaultRoutes from "./routes/vaultRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import itineraryRoutes from "./routes/itineraryRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import path from "path";






const app = express();


// LOGGING MIDDLEWARE
app.use((req, res, next) => {
    console.log(`[DEBUG] Received ${req.method} request at ${req.url}`);
    next();
});


// CORS MIDDLEWARE
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));


// BODY PARSER
app.use(express.json());

// COOKIE PARSER
app.use(cookieParser());

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/booking', bookingRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/vault", vaultRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/gallery", galleryRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
export default app; 