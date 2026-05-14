import express from 'express';
import pool from '../config/db.js';
import twilio from 'twilio';

const router = express.Router();

// GET /api/offices/twilio/numbers
router.get('/twilio/numbers', async (req, res) => {
    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const [current, available] = await Promise.all([
            client.incomingPhoneNumbers.list({ limit: 20 }),
            client.availablePhoneNumbers('US').local.list({ limit: 20 }),
        ]);
        res.json({
            current: current.map(n => ({
                sid: n.sid, phoneNumber: n.phoneNumber,
                friendlyName: n.friendlyName, capabilities: n.capabilities,
            })),
            available: available.map(n => ({
                phoneNumber: n.phoneNumber, friendlyName: n.friendlyName,
                locality: n.locality, region: n.region,
                capabilities: n.capabilities, monthlyFee: '$1.15/mo',
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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
