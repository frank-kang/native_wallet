import express from 'express';
import dotenv from 'dotenv';
import { sql } from './config/db.js'; // Adjust the path as necessary
import { rateLimiter } from './middleware/rateLimiter.js';
import job from './config/cron.js'; // Import the cron job
import transactionsRoute from './routes/transactions.js'; // Import the transactions route

dotenv.config(); // Load environment variables from .env file
const app = express();

if(process.env.NODE_ENV === "production") job.start(); // Start the cron job if in production environment
 
//middleware
app.use(rateLimiter); // Apply rate limiting middleware
app.use(express.json()); // Middleware to parse JSON bodies

const PORT = process.env.PORT || 5001;

async function initDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS transactions(
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )` // Adjust the SQL syntax as necessary for your database
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
        
    }
}

app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "API is healthy" });
});

app.use('/api/transactions', transactionsRoute); // Use the transactions route

initDB().then(() => {
    app.listen(PORT, () => {
        console.log('Server is running on PORT:', PORT);
    });
});


