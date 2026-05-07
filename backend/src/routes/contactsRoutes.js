import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT c.id, c.first_name, c.last_name, c.email, c.cell_phone, 
                    c.source, c.source_username, c.status, c.created_at,
                    c.assigned_to,
                    u.first_name AS assigned_first_name, 
                    u.last_name AS assigned_last_name
             FROM contacts c
             LEFT JOIN users u ON c.assigned_to = u.id
             ORDER BY c.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contacts', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [[contact]] = await pool.query(
            `SELECT c.*, 
                    u.first_name AS assigned_first_name, 
                    u.last_name AS assigned_last_name
             FROM contacts c
             LEFT JOIN users u ON c.assigned_to = u.id
             WHERE c.id = ?`,
            [id]
        );

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        const [leads] = await pool.query(
            `SELECT id, status, loan_purpose, created_at 
             FROM leads WHERE contact_id = ? ORDER BY created_at DESC`,
            [id]
        );

        const [loans] = await pool.query(
            `SELECT id, status, loan_purpose, base_loan_amount, created_at 
             FROM loans WHERE contact_id = ? ORDER BY created_at DESC`,
            [id]
        );

        const [notes] = await pool.query(
            `SELECT n.id, n.text, n.created_at, 
                    u.first_name, u.last_name 
             FROM notes n
             LEFT JOIN users u ON n.created_by = u.id
             WHERE n.entity_type = 'contact' AND n.entity_id = ?
             ORDER BY n.created_at DESC`,
            [id]
        );

        res.json({ ...contact, leads, loans, notes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contact', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { 
            first_name, last_name, email, cell_phone, 
            source, source_username, office_id, created_by, assigned_to 
        } = req.body;

        if (!first_name || !last_name || !office_id || !created_by) {
            return res.status(400).json({ 
                message: 'first_name, last_name, office_id and created_by are required' 
            });
        }

        const [result] = await pool.query(
            `INSERT INTO contacts 
             (office_id, created_by, assigned_to, first_name, last_name, email, cell_phone, source, source_username, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
            [office_id, created_by, assigned_to || null, first_name, last_name, 
             email || null, cell_phone || null, source || 'manual', source_username || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Contact created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating contact', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { 
            first_name, last_name, email, cell_phone, 
            source, source_username, assigned_to, status 
        } = req.body;

        if (!first_name || !last_name) {
            return res.status(400).json({ 
                message: 'first_name and last_name are required' 
            });
        }

        const [[existing]] = await pool.query('SELECT id FROM contacts WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        await pool.query(
            `UPDATE contacts 
             SET first_name = ?, last_name = ?, email = ?, cell_phone = ?, 
                 source = ?, source_username = ?, assigned_to = ?, status = ?
             WHERE id = ?`,
            [
                first_name, 
                last_name, 
                email || null, 
                cell_phone || null, 
                source || 'manual', 
                source_username || null, 
                assigned_to || null, 
                status || 'new', 
                id
            ]
        );

        res.json({ message: 'Contact updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating contact', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query(`DELETE FROM contacts WHERE id = ?`, [req.params.id]);
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contact', error: error.message });
    }
});

router.post('/:id/notes', async (req, res) => {
    try {
        const { text, created_by } = req.body;

        if (!text || !created_by) {
            return res.status(400).json({ message: 'text and created_by are required' });
        }

        const [result] = await pool.query(
            `INSERT INTO notes (entity_type, entity_id, created_by, text) 
             VALUES ('contact', ?, ?, ?)`,
            [req.params.id, created_by, text]
        );

        res.status(201).json({ id: result.insertId, message: 'Note added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding note', error: error.message });
    }
});

export default router;