import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { app } from './app';
import connectDB from './db/index';

// Load environment variables
dotenv.config({
    path: './.env',
});

// Connect to MongoDB
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message);
    });
