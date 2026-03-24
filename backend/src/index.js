import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.use('/api/auth', authRoutes);

// Test DB connection
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ message: 'DB connected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'DB connection failed', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});