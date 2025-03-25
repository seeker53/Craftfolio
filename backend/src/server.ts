import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { app } from './app';
import connectDB from './config/db.config';

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

// // Graceful shutdown
// process.on('SIGINT', async () => {
//     try {
//         await mongoose.connection.close();
//         console.log('MongoDB connection closed');
//         process.exit(0);
//     } catch (error) {
//         console.error('Error closing MongoDB connection:', error.message);
//         process.exit(1);
//     }
// });
