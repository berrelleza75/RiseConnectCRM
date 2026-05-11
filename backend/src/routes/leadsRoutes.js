import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const [[{ active }]] = await pool.query(
            `SELECT COUNT(*) AS active FROM leads WHERE status NOT IN ('converted','lost')`
        );
        const [recent] = await pool.query(
            `SELECT l.id, l.status, l.loan_purpose, l.created_at,
                    c.first_name AS contact_first_name, c.last_name AS contact_last_name,
                    c.source AS contact_source,
                    u.first_name AS assigned_first_name, u.last_name AS assigned_last_name
             FROM leads l
             JOIN contacts c ON l.contact_id = c.id
             LEFT JOIN users u ON l.assigned_to = u.id
             ORDER BY l.created_at DESC LIMIT 5`
        );
        res.json({ active, recent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT l.id, l.contact_id, l.office_id, l.assigned_to,
                    l.loan_purpose,
                    l.property_type, l.property_occupancy, l.purchase_price,
                    l.buying_stage, l.credit_score_range, l.status,
                    l.created_at, l.closed_at,
                    c.first_name AS contact_first_name,
                    c.last_name AS contact_last_name,
                    c.email AS contact_email,
                    c.cell_phone AS contact_phone,
                    c.source AS contact_source,
                    u.first_name AS assigned_first_name,
                    u.last_name AS assigned_last_name
             FROM leads l
             JOIN contacts c ON l.contact_id = c.id
             LEFT JOIN users u ON l.assigned_to = u.id
             ORDER BY l.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leads', error: error.message });
    }
});

router.get('/contact/:contactId', async (req, res) => {
    const { contactId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT l.*,
                    u.first_name AS assigned_first_name,
                    u.last_name AS assigned_last_name
             FROM leads l
             LEFT JOIN users u ON l.assigned_to = u.id
             WHERE l.contact_id = ?
             ORDER BY l.created_at DESC`,
            [contactId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leads for contact', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [[lead]] = await pool.query(
            `SELECT l.*,
                    c.first_name AS contact_first_name,
                    c.last_name AS contact_last_name,
                    c.email AS contact_email,
                    c.cell_phone AS contact_phone,
                    c.source AS contact_source,
                    u.first_name AS assigned_first_name,
                    u.last_name AS assigned_last_name
             FROM leads l
             JOIN contacts c ON l.contact_id = c.id
             LEFT JOIN users u ON l.assigned_to = u.id
             WHERE l.id = ?`,
            [id]
        );

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const [notes] = await pool.query(
            `SELECT n.id, n.text, n.created_at,
                    u.first_name, u.last_name
             FROM notes n
             LEFT JOIN users u ON n.created_by = u.id
             WHERE n.entity_type = 'lead' AND n.entity_id = ?
             ORDER BY n.created_at DESC`,
            [id]
        );

        res.json({ ...lead, notes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lead', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            contact_id, office_id, assigned_to, loan_purpose,
            subject_property_tbd, street_address, unit_apt, city, state,
            postal_code, county, property_type, property_occupancy,
            purchase_price, buying_stage, first_time_home_buyer,
            has_real_estate_agent, desired_monthly_payment,
            current_interest_rate, currently_owning_home, planning_to_sell,
            gross_annual_income, employment_type, credit_score_range,
            military_service, current_occupancy, monthly_rent_amount,
            lead_provided_by, lead_source, other_lead_source_description,
            dnc_request, email_opt_out, sms_opt_out
        } = req.body;

        if (!contact_id || !office_id) {
            return res.status(400).json({
                message: 'contact_id and office_id are required'
            });
        }

        const [[contact]] = await pool.query(
            'SELECT id FROM contacts WHERE id = ?',
            [contact_id]
        );

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        const [result] = await pool.query(
            `INSERT INTO leads (
                contact_id, office_id, assigned_to, loan_purpose,
                subject_property_tbd, street_address, unit_apt, city, state,
                postal_code, county, property_type, property_occupancy,
                purchase_price, buying_stage, first_time_home_buyer,
                has_real_estate_agent, desired_monthly_payment,
                current_interest_rate, currently_owning_home, planning_to_sell,
                gross_annual_income, employment_type, credit_score_range,
                military_service, current_occupancy, monthly_rent_amount,
                lead_provided_by, lead_source, other_lead_source_description,
                dnc_request, email_opt_out, sms_opt_out, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'working')`,
            [
                contact_id, office_id, assigned_to || null, loan_purpose || null,
                subject_property_tbd || false, street_address || null, unit_apt || null,
                city || null, state || null, postal_code || null, county || null,
                property_type || null, property_occupancy || null,
                purchase_price || null, buying_stage || null,
                first_time_home_buyer !== undefined ? first_time_home_buyer : null,
                has_real_estate_agent !== undefined ? has_real_estate_agent : null,
                desired_monthly_payment || null,
                current_interest_rate || null,
                currently_owning_home !== undefined ? currently_owning_home : null,
                planning_to_sell !== undefined ? planning_to_sell : null,
                gross_annual_income || null, employment_type || null,
                credit_score_range || null,
                military_service !== undefined ? military_service : null,
                current_occupancy || null, monthly_rent_amount || null,
                lead_provided_by || null, lead_source || null,
                other_lead_source_description || null,
                dnc_request || false, email_opt_out || false, sms_opt_out || false
            ]
        );

        res.status(201).json({ id: result.insertId, message: 'Lead created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating lead', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const allowedFields = [
            'assigned_to', 'loan_purpose', 'subject_property_tbd',
            'street_address', 'unit_apt', 'city', 'state', 'postal_code',
            'county', 'property_type', 'property_occupancy',
            'purchase_price', 'buying_stage', 'first_time_home_buyer',
            'has_real_estate_agent', 'desired_monthly_payment',
            'current_interest_rate', 'currently_owning_home', 'planning_to_sell',
            'gross_annual_income', 'employment_type', 'credit_score_range',
            'military_service', 'current_occupancy', 'monthly_rent_amount',
            'lead_provided_by', 'lead_source', 'other_lead_source_description',
            'dnc_request', 'email_opt_out', 'sms_opt_out',
            'status', 'lost_reason'
        ];

        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field] === '' ? null : req.body[field]);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        if (req.body.status === 'lost' || req.body.status === 'converted') {
            updates.push('closed_at = CURRENT_TIMESTAMP');
        }

        values.push(id);

        const [[existing]] = await pool.query('SELECT id FROM leads WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        await pool.query(
            `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: 'Lead updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating lead', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query(`DELETE FROM leads WHERE id = ?`, [req.params.id]);
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting lead', error: error.message });
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
             VALUES ('lead', ?, ?, ?)`,
            [req.params.id, created_by, text]
        );

        res.status(201).json({ id: result.insertId, message: 'Note added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding note', error: error.message });
    }
});

export default router;
