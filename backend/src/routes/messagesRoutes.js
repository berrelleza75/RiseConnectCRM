import express from 'express';
import pool from '../config/db.js';
import twilio from 'twilio';

const router = express.Router();

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Extend existing messages table with contact-messaging columns
const migrateTable = async () => {
    const alterStatements = [
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS contact_id INT`,
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS channel ENUM('sms','email','internal') DEFAULT 'internal'`,
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS direction ENUM('outbound','inbound') DEFAULT 'outbound'`,
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS from_address VARCHAR(255)`,
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS to_address VARCHAR(255)`,
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject VARCHAR(500)`,
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS twilio_sid VARCHAR(100)`,
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS msg_status VARCHAR(50) DEFAULT 'sent'`,
        `ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_by INT DEFAULT NULL`,
    ];
    for (const sql of alterStatements) {
        try { await pool.query(sql); } catch (_) { /* column already exists */ }
    }
};
migrateTable().catch(err => console.error('Messages migration error:', err));

// GET /api/messages/stats  — unread counts + last message per contact
router.get('/stats', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT contact_id,
                    MAX(created_at) AS last_message_at,
                    SUM(CASE WHEN (is_read = 0 OR is_read IS NULL) AND direction = 'inbound' THEN 1 ELSE 0 END) AS unread_count
             FROM messages
             WHERE contact_id IS NOT NULL
             GROUP BY contact_id`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/messages/read/:contactId  — mark all inbound as read
router.put('/read/:contactId', async (req, res) => {
    const { contactId } = req.params;
    try {
        await pool.query(
            `UPDATE messages SET is_read = 1 WHERE contact_id = ? AND direction = 'inbound'`,
            [contactId]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/messages/contact/:contactId?channel=sms|email
router.get('/contact/:contactId', async (req, res) => {
    const { contactId } = req.params;
    const { channel } = req.query;
    try {
        let sql = `SELECT * FROM messages WHERE contact_id = ?`;
        const params = [contactId];
        if (channel) { sql += ` AND channel = ?`; params.push(channel); }
        sql += ` ORDER BY created_at ASC`;
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
});

// POST /api/messages/sms  — send SMS via Twilio and persist
router.post('/sms', async (req, res) => {
    const { contact_id, to, body, office_id, created_by } = req.body;
    if (!to || !body) return res.status(400).json({ message: 'to and body required' });
    try {
        const msg = await twilioClient.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        const [result] = await pool.query(
            `INSERT INTO messages
                (office_id, contact_id, channel, direction, from_address, to_address, content, msg_status, twilio_sid, created_by)
             VALUES (?, ?, 'sms', 'outbound', ?, ?, ?, ?, ?, ?)`,
            [office_id, contact_id, process.env.TWILIO_PHONE_NUMBER, to, body, msg.status, msg.sid, created_by]
        );
        const [rows] = await pool.query(`SELECT * FROM messages WHERE id = ?`, [result.insertId]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/messages/email  — persist email (sending requires SMTP config)
router.post('/email', async (req, res) => {
    const { contact_id, to, subject, body, office_id, created_by } = req.body;
    if (!to || !body) return res.status(400).json({ message: 'to and body required' });
    try {
        const [result] = await pool.query(
            `INSERT INTO messages
                (office_id, contact_id, channel, direction, to_address, subject, content, msg_status, created_by)
             VALUES (?, ?, 'email', 'outbound', ?, ?, ?, 'sent', ?)`,
            [office_id, contact_id, to, subject || '(no subject)', body, created_by]
        );
        const [rows] = await pool.query(`SELECT * FROM messages WHERE id = ?`, [result.insertId]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/messages/webhook/sms  — Twilio incoming SMS webhook
router.post('/webhook/sms', async (req, res) => {
    const { From, To, Body, MessageSid } = req.body;
    try {
        const phone = From.replace(/\D/g, '');
        const [contacts] = await pool.query(
            `SELECT id, office_id FROM contacts
             WHERE REPLACE(REPLACE(cell_phone,' ',''),'-','') LIKE ?
             LIMIT 1`,
            [`%${phone.slice(-10)}`]
        );
        if (contacts.length > 0) {
            const c = contacts[0];
            await pool.query(
                `INSERT INTO messages
                    (office_id, contact_id, channel, direction, from_address, to_address, content, msg_status, twilio_sid)
                 VALUES (?, ?, 'sms', 'inbound', ?, ?, ?, 'received', ?)`,
                [c.office_id, c.id, From, To, Body, MessageSid]
            );
        }
        res.set('Content-Type', 'text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
    } catch (err) {
        console.error('SMS webhook error:', err);
        res.set('Content-Type', 'text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
    }
});

export default router;
