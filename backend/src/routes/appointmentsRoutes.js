import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/appointments?year=2026&month=5
router.get('/', async (req, res) => {
    const { year, month } = req.query;
    const user = req.user;
    const restricted = user && (user.role === 'loan_officer' || user.role === 'realtor');
    try {
        const conditions = [];
        const params = [];

        if (year && month) {
            conditions.push(`YEAR(a.date) = ? AND MONTH(a.date) = ?`);
            params.push(year, month);
        }
        if (restricted) {
            conditions.push(`(a.assigned_to = ? OR c.assigned_to = ?)`);
            params.push(user.id, user.id);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const sql = `
            SELECT a.*,
                   c.first_name AS contact_first_name, c.last_name AS contact_last_name,
                   u.first_name AS assigned_first_name, u.last_name AS assigned_last_name
            FROM appointments a
            LEFT JOIN contacts c ON a.contact_id = c.id
            LEFT JOIN users u ON a.assigned_to = u.id
            ${where}
            ORDER BY a.date ASC, a.time ASC
        `;
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/appointments
router.post('/', async (req, res) => {
    const { office_id, contact_id, lead_id, assigned_to, title, description, date, time, end_time, location, status } = req.body;
    if (!title || !date) return res.status(400).json({ message: 'title and date are required' });
    try {
        const [result] = await pool.query(
            `INSERT INTO appointments (office_id, contact_id, lead_id, assigned_to, title, description, date, time, end_time, location, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [office_id || null, contact_id || null, lead_id || null, assigned_to || null,
             title, description || null, date, time || null, end_time || null, location || null, status || 'scheduled']
        );
        const [rows] = await pool.query(
            `SELECT a.*, c.first_name AS contact_first_name, c.last_name AS contact_last_name,
                    u.first_name AS assigned_first_name, u.last_name AS assigned_last_name
             FROM appointments a
             LEFT JOIN contacts c ON a.contact_id = c.id
             LEFT JOIN users u ON a.assigned_to = u.id
             WHERE a.id = ?`, [result.insertId]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { contact_id, lead_id, assigned_to, title, description, date, time, end_time, location, status } = req.body;
    try {
        await pool.query(
            `UPDATE appointments SET contact_id=?, lead_id=?, assigned_to=?, title=?, description=?, date=?, time=?, end_time=?, location=?, status=?
             WHERE id=?`,
            [contact_id || null, lead_id || null, assigned_to || null,
             title, description || null, date, time || null, end_time || null, location || null, status || 'scheduled', id]
        );
        const [rows] = await pool.query(
            `SELECT a.*, c.first_name AS contact_first_name, c.last_name AS contact_last_name,
                    u.first_name AS assigned_first_name, u.last_name AS assigned_last_name
             FROM appointments a
             LEFT JOIN contacts c ON a.contact_id = c.id
             LEFT JOIN users u ON a.assigned_to = u.id
             WHERE a.id = ?`, [id]
        );
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`DELETE FROM appointments WHERE id = ?`, [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
