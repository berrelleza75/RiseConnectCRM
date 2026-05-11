import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contactsRoutes from './routes/contactsRoutes.js';
import leadsRoutes from './routes/leadsRoutes.js';
import loansRoutes from './routes/loansRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import callsRoutes from './routes/callsRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';
import appointmentsRoutes from './routes/appointmentsRoutes.js';
import officesRoutes from './routes/officesRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/offices', officesRoutes);

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