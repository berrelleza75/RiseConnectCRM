import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { office_id } = req.query;
        if (!office_id) return res.status(400).json({ message: 'office_id is required' });

        const [rows] = await pool.query(
            `SELECT id, first_name, last_name, role
             FROM users
             WHERE office_id = ? AND status = 'active'
             ORDER BY first_name, last_name`,
            [office_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

export default router;
