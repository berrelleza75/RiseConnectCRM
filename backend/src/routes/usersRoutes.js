import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/users?office_id=
router.get('/', async (req, res) => {
    const { office_id } = req.query;
    if (!office_id) return res.status(400).json({ message: 'office_id is required' });
    try {
        const [rows] = await pool.query(
            `SELECT id, first_name, last_name, email, phone, role, status, created_at
             FROM users
             WHERE office_id = ?
             ORDER BY FIELD(role,'admin','loan_officer','realtor'), first_name`,
            [office_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/users — create team member
router.post('/', async (req, res) => {
    const { office_id, first_name, last_name, email, phone, role, password } = req.body;
    if (!first_name || !last_name || !email || !password || !role) {
        return res.status(400).json({ message: 'first_name, last_name, email, role and password are required' });
    }
    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length) return res.status(409).json({ message: 'Email already in use' });

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            `INSERT INTO users (office_id, first_name, last_name, email, phone, password, role, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
            [office_id, first_name, last_name, email, phone || null, hashed, role]
        );
        const [rows] = await pool.query(
            `SELECT id, first_name, last_name, email, phone, role, status FROM users WHERE id = ?`,
            [result.insertId]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/users/:id — update member info
router.put('/:id', async (req, res) => {
    const { first_name, last_name, email, phone, role, password, status } = req.body;
    try {
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await pool.query(
                `UPDATE users SET first_name=?, last_name=?, email=?, phone=?, role=?, password=?, status=? WHERE id=?`,
                [first_name, last_name, email, phone || null, role, hashed, status || 'active', req.params.id]
            );
        } else {
            await pool.query(
                `UPDATE users SET first_name=?, last_name=?, email=?, phone=?, role=?, status=? WHERE id=?`,
                [first_name, last_name, email, phone || null, role, status || 'active', req.params.id]
            );
        }
        const [rows] = await pool.query(
            `SELECT id, first_name, last_name, email, phone, role, status FROM users WHERE id = ?`,
            [req.params.id]
        );
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/users/:id/contacts-count — contacts assigned to this user
router.get('/:id/contacts-count', async (req, res) => {
    try {
        const [[{ count }]] = await pool.query(
            `SELECT COUNT(*) AS count FROM contacts WHERE assigned_to = ? AND status != 'deleted'`,
            [req.params.id]
        );
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/users/:id/reassign — reassign all contacts to another LO then deactivate
router.post('/:id/reassign', async (req, res) => {
    const { new_user_id } = req.body;
    if (!new_user_id) return res.status(400).json({ message: 'new_user_id is required' });
    try {
        await pool.query(`UPDATE contacts SET assigned_to = ? WHERE assigned_to = ?`, [new_user_id, req.params.id]);
        await pool.query(`UPDATE leads SET assigned_to = ? WHERE assigned_to = ?`, [new_user_id, req.params.id]);
        await pool.query(`UPDATE loans SET assigned_to = ? WHERE assigned_to = ?`, [new_user_id, req.params.id]);
        await pool.query(`UPDATE users SET status = 'inactive' WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/users/:id — soft delete (set inactive)
router.delete('/:id', async (req, res) => {
    try {
        await pool.query(`UPDATE users SET status = 'inactive' WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
