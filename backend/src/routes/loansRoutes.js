import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

const ALL_FIELDS = [
    'assigned_to', 'primary_lead_owner',
    'loan_purpose', 'loan_type', 'base_loan_amount', 'status',
    'ssn', 'date_of_birth', 'military_service',
    'current_address_street', 'current_address_city', 'current_address_state', 'current_address_postal',
    'address_duration_years', 'address_duration_months', 'current_occupancy', 'monthly_rent_amount',
    'purchase_price', 'appraised_value', 'lien_position',
    'note_rate', 'qualifying_rate', 'amortization_type', 'amortization_term_months',
    'interest_only', 'interest_only_term_months', 'impound_waiver', 'loan_fico',
    'adjustable_rate', 'initial_adjustment_period_months', 'subsequent_adjustment_period_months',
    'estimated_monthly_hoi', 'estimated_monthly_property_taxes', 'estimated_monthly_hoa',
    'gross_annual_income', 'employment_type', 'total_monthly_liability',
    'buying_stage', 'desired_monthly_payment', 'first_time_home_buyer', 'has_real_estate_agent',
    'refinance_type', 'cash_out_purpose', 'current_interest_rate', 'currently_owning_home', 'planning_to_sell',
    'bankruptcy_last_7_years', 'years_since_bankruptcy', 'foreclosure_last_7_years', 'years_since_foreclosure',
    'subject_property_tbd', 'property_street', 'property_city', 'property_county',
    'property_postal', 'property_state', 'property_unit', 'property_occupancy', 'property_type',
    'lead_provided_by', 'lead_source', 'other_lead_source_description',
    'dnc_request', 'email_opt_out', 'sms_opt_out',
    'denied_reason',
];

router.get('/stats', async (req, res) => {
    try {
        const [[{ active }]] = await pool.query(
            `SELECT COUNT(*) AS active FROM loans WHERE status NOT IN ('closed','denied','withdrawn')`
        );
        res.json({ active });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT l.*,
                    c.first_name AS contact_first_name,
                    c.last_name  AS contact_last_name,
                    c.email      AS contact_email,
                    c.cell_phone AS contact_phone,
                    u.first_name AS assigned_first_name,
                    u.last_name  AS assigned_last_name
             FROM loans l
             JOIN contacts c ON l.contact_id = c.id
             LEFT  JOIN users   u ON l.assigned_to = u.id
             ORDER BY l.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loans', error: error.message });
    }
});

router.get('/contact/:contactId', async (req, res) => {
    const { contactId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT l.id, l.contact_id, l.office_id, l.status, l.loan_purpose, l.loan_type,
                    l.base_loan_amount, l.created_at, l.closed_at, l.assigned_to,
                    u.first_name AS assigned_first_name, u.last_name AS assigned_last_name
             FROM loans l
             LEFT JOIN users u ON l.assigned_to = u.id
             WHERE l.contact_id = ?
             ORDER BY l.created_at DESC`,
            [contactId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loans for contact', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [[loan]] = await pool.query(
            `SELECT l.*,
                    c.first_name AS contact_first_name,
                    c.last_name  AS contact_last_name,
                    c.email      AS contact_email,
                    c.cell_phone AS contact_phone,
                    u.first_name AS assigned_first_name,
                    u.last_name  AS assigned_last_name
             FROM loans l
             JOIN contacts c ON l.contact_id = c.id
             LEFT  JOIN users   u ON l.assigned_to = u.id
             WHERE l.id = ?`,
            [id]
        );

        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        const [notes] = await pool.query(
            `SELECT n.id, n.text, n.created_at,
                    u.first_name, u.last_name
             FROM notes n
             LEFT JOIN users u ON n.created_by = u.id
             WHERE n.entity_type = 'loan' AND n.entity_id = ?
             ORDER BY n.created_at DESC`,
            [id]
        );

        let coBorrowers = [];
        try {
            const [rows] = await pool.query(
                'SELECT * FROM co_borrowers WHERE loan_id = ? ORDER BY created_at ASC',
                [id]
            );
            coBorrowers = rows;
        } catch (_) {}

        res.json({ ...loan, notes, co_borrowers: coBorrowers });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching loan', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            contact_id, lead_id, office_id, assigned_to, loan_purpose, loan_type, base_loan_amount,
            subject_property_tbd,
            property_street, property_unit, property_city, property_state, property_postal, property_county,
            property_type, property_occupancy,
            purchase_price, buying_stage,
            first_time_home_buyer, has_real_estate_agent, desired_monthly_payment,
            current_interest_rate, currently_owning_home, planning_to_sell,
            gross_annual_income, employment_type,
            military_service, current_occupancy, monthly_rent_amount,
            lead_provided_by, lead_source, other_lead_source_description,
            dnc_request, email_opt_out, sms_opt_out,
        } = req.body;

        if (!contact_id || !office_id) {
            return res.status(400).json({ message: 'contact_id and office_id are required' });
        }

        const [[contact]] = await pool.query('SELECT id FROM contacts WHERE id = ?', [contact_id]);
        if (!contact) return res.status(404).json({ message: 'Contact not found' });

        const [result] = await pool.query(
            `INSERT INTO loans
             (contact_id, lead_id, office_id, assigned_to, loan_purpose, loan_type, base_loan_amount,
              subject_property_tbd,
              property_street, property_unit, property_city, property_state, property_postal, property_county,
              property_type, property_occupancy,
              purchase_price, buying_stage,
              first_time_home_buyer, has_real_estate_agent, desired_monthly_payment,
              current_interest_rate, currently_owning_home, planning_to_sell,
              gross_annual_income, employment_type,
              military_service, current_occupancy, monthly_rent_amount,
              lead_provided_by, lead_source, other_lead_source_description,
              dnc_request, email_opt_out, sms_opt_out,
              status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress')`,
            [
                contact_id,
                lead_id || null,
                office_id,
                assigned_to || null,
                loan_purpose || null,
                loan_type || null,
                base_loan_amount || null,
                subject_property_tbd ?? null,
                property_street || null,
                property_unit || null,
                property_city || null,
                property_state || null,
                property_postal || null,
                property_county || null,
                property_type || null,
                property_occupancy || null,
                purchase_price || null,
                buying_stage || null,
                first_time_home_buyer ?? null,
                has_real_estate_agent ?? null,
                desired_monthly_payment || null,
                current_interest_rate || null,
                currently_owning_home ?? null,
                planning_to_sell ?? null,
                gross_annual_income || null,
                employment_type || null,
                military_service ?? null,
                current_occupancy || null,
                monthly_rent_amount || null,
                lead_provided_by || null,
                lead_source || null,
                other_lead_source_description || null,
                dnc_request ?? false,
                email_opt_out ?? false,
                sms_opt_out ?? false,
            ]
        );

        res.status(201).json({ id: result.insertId, message: 'Loan created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating loan', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updates = [];
        const values = [];

        for (const field of ALL_FIELDS) {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field] === '' ? null : req.body[field]);
            }
        }

        if (updates.length === 0) return res.status(400).json({ message: 'No valid fields to update' });

        if (['closed', 'denied', 'withdrawn'].includes(req.body.status)) {
            updates.push('closed_at = CURRENT_TIMESTAMP');
        }

        const [[existing]] = await pool.query('SELECT id FROM loans WHERE id = ?', [id]);
        if (!existing) return res.status(404).json({ message: 'Loan not found' });

        values.push(id);
        await pool.query(`UPDATE loans SET ${updates.join(', ')} WHERE id = ?`, values);
        res.json({ message: 'Loan updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating loan', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM loans WHERE id = ?', [req.params.id]);
        res.json({ message: 'Loan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting loan', error: error.message });
    }
});

router.post('/:id/notes', async (req, res) => {
    try {
        const { text, created_by } = req.body;
        if (!text || !created_by) return res.status(400).json({ message: 'text and created_by are required' });

        const [result] = await pool.query(
            `INSERT INTO notes (entity_type, entity_id, created_by, text) VALUES ('loan', ?, ?, ?)`,
            [req.params.id, created_by, text]
        );
        res.status(201).json({ id: result.insertId, message: 'Note added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding note', error: error.message });
    }
});

router.get('/:id/co-borrowers', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM co_borrowers WHERE loan_id = ? ORDER BY created_at ASC',
            [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching co-borrowers', error: error.message });
    }
});

router.post('/:id/co-borrowers', async (req, res) => {
    try {
        const { first_name, last_name, email, phone, ssn, date_of_birth, military_service } = req.body;
        if (!first_name || !last_name) return res.status(400).json({ message: 'first_name and last_name are required' });

        const [result] = await pool.query(
            `INSERT INTO co_borrowers
             (loan_id, first_name, last_name, email, phone, ssn, date_of_birth, military_service)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.id, first_name, last_name, email || null, phone || null, ssn || null, date_of_birth || null, military_service ?? null]
        );
        res.status(201).json({ id: result.insertId, message: 'Co-borrower added' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding co-borrower', error: error.message });
    }
});

router.delete('/:id/co-borrowers/:cobId', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM co_borrowers WHERE id = ? AND loan_id = ?',
            [req.params.cobId, req.params.id]
        );
        res.json({ message: 'Co-borrower removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing co-borrower', error: error.message });
    }
});

export default router;
