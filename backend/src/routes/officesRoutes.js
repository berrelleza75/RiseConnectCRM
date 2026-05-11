import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/offices/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM offices WHERE id = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Office not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/offices/:id
router.put('/:id', async (req, res) => {
    const { name, phone, email, address, city, state, zip, website, nmls_id, license_number, logo_url } = req.body;
    try {
        await pool.query(
            `UPDATE offices SET name=?, phone=?, email=?, address=?, city=?, state=?, zip=?, website=?, nmls_id=?, license_number=?, logo_url=?
             WHERE id=?`,
            [name, phone, email, address, city, state, zip, website, nmls_id, license_number, logo_url, req.params.id]
        );
        const [rows] = await pool.query(`SELECT * FROM offices WHERE id = ?`, [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
