import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, first_name, last_name, email, phone, source, status, created_at 
       FROM prospects ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prospects', error });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [[prospect]] = await pool.query(`SELECT * FROM prospects WHERE id = ?`, [id]);
    if (!prospect) return res.status(404).json({ message: 'Prospect not found' });

    const [[borrower]] = await pool.query(
      `SELECT * FROM prospect_persons WHERE prospect_id = ? AND type = 'borrower'`, [id]
    );
    const [[coBorrower]] = await pool.query(
      `SELECT * FROM prospect_persons WHERE prospect_id = ? AND type = 'co_borrower'`, [id]
    );
    const [[mortgage]] = await pool.query(
      `SELECT * FROM prospect_mortgage WHERE prospect_id = ?`, [id]
    );
    const [[property]] = await pool.query(
      `SELECT * FROM prospect_property WHERE prospect_id = ?`, [id]
    );
    const [[lead]] = await pool.query(
      `SELECT * FROM prospect_lead WHERE prospect_id = ?`, [id]
    );
    const [notes] = await pool.query(
      `SELECT * FROM prospect_notes WHERE prospect_id = ? ORDER BY created_at DESC`, [id]
    );

    res.json({ ...prospect, borrower, coBorrower, mortgage, property, lead, notes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prospect', error });
  }
});

router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { firstName, lastName, email, cellPhone, source } = req.body;

    const [result] = await conn.query(
      `INSERT INTO prospects (first_name, last_name, email, phone, source, status)
       VALUES (?, ?, ?, ?, ?, 'new')`,
      [firstName, lastName, email, cellPhone, source]
    );
    const prospectId = result.insertId;

    await conn.query(
      `INSERT INTO prospect_persons (prospect_id, type, first_name, last_name, email, phone)
       VALUES (?, 'borrower', ?, ?, ?, ?)`,
      [prospectId, firstName, lastName, email, cellPhone]
    );

    await conn.query(`INSERT INTO prospect_mortgage (prospect_id) VALUES (?)`, [prospectId]);
    await conn.query(`INSERT INTO prospect_property (prospect_id) VALUES (?)`, [prospectId]);
    await conn.query(`INSERT INTO prospect_lead (prospect_id) VALUES (?)`, [prospectId]);

    await conn.commit();
    res.status(201).json({ id: prospectId, message: 'Prospect created' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ message: 'Error creating prospect', error });
  } finally {
    conn.release();
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { borrower, coBorrower, mortgage, property, lead } = req.body;

    if (borrower) {
      await conn.query(
        `UPDATE prospect_persons SET first_name=?, last_name=?, email=?, phone=?,
         ssn=?, dob=?, military_service=?, current_address=?, address_months=?, address_years=?
         WHERE prospect_id=? AND type='borrower'`,
        [borrower.firstName, borrower.lastName, borrower.email, borrower.phone,
         borrower.ssn, borrower.dob, borrower.militaryService,
         borrower.currentAddress, borrower.addressMonths, borrower.addressYears, id]
      );
    }

    if (coBorrower) {
      const [[existing]] = await conn.query(
        `SELECT id FROM prospect_persons WHERE prospect_id=? AND type='co_borrower'`, [id]
      );
      if (existing) {
        await conn.query(
          `UPDATE prospect_persons SET first_name=?, last_name=?, email=?, phone=?,
           ssn=?, dob=?, military_service=?
           WHERE prospect_id=? AND type='co_borrower'`,
          [coBorrower.firstName, coBorrower.lastName, coBorrower.email, coBorrower.phone,
           coBorrower.ssn, coBorrower.dob, coBorrower.militaryService, id]
        );
      } else {
        await conn.query(
          `INSERT INTO prospect_persons (prospect_id, type, first_name, last_name, email, phone, ssn, dob, military_service)
           VALUES (?, 'co_borrower', ?, ?, ?, ?, ?, ?, ?)`,
          [id, coBorrower.firstName, coBorrower.lastName, coBorrower.email,
           coBorrower.phone, coBorrower.ssn, coBorrower.dob, coBorrower.militaryService]
        );
      }
    }

    if (mortgage) {
      await conn.query(
        `UPDATE prospect_mortgage SET loan_purpose=?, purchase_price=?, appraised_value=?,
         base_loan_amount=?, mortgage_type=?, lien_position=?, note_rate=?, qualifying_rate=?,
         amortization_term=?, loan_fico=?, estimated_hoi=?, estimated_property_taxes=?,
         estimated_hoa=?, gross_annual_income=?, employment_type=?, total_monthly_liability=?,
         buying_stage=?, desired_monthly_payment=?, first_time_home_buyer=?, has_real_estate_agent=?,
         interest_only=?, interest_only_term_months=?, impound_waiver=?, occupancy=?,
         monthly_rent_amount=?, refinance_type=?, cash_out_purpose=?, current_interest_rate=?,
         adjustable_rate=?, initial_adjustment_period=?, subsequent_adjustment_period=?,
         currently_owning_home=?, planning_to_sell=?, bankruptcy_last7=?, years_since_bankruptcy=?,
         foreclosure_last7=?, years_since_foreclosure=?
         WHERE prospect_id=?`,
        [mortgage.loanPurpose, mortgage.purchasePrice, mortgage.appraisedValue,
         mortgage.baseLoanAmount, mortgage.mortgageType, mortgage.lienPosition,
         mortgage.noteRate, mortgage.qualifyingRate, mortgage.amortizationTerm,
         mortgage.loanFico, mortgage.estimatedHOI, mortgage.estimatedPropertyTaxes,
         mortgage.estimatedHOA, mortgage.grossAnnualIncome, mortgage.employmentType,
         mortgage.totalMonthlyLiability, mortgage.buyingStage, mortgage.desiredMonthlyPayment,
         mortgage.firstTimeHomeBuyer, mortgage.hasRealEstateAgent, mortgage.interestOnly,
         mortgage.interestOnlyTermMonths, mortgage.impoundWaiver, mortgage.occupancy,
         mortgage.monthlyRentAmount, mortgage.refinanceType, mortgage.cashOutPurpose,
         mortgage.currentInterestRate, mortgage.adjustableRate, mortgage.initialAdjustmentPeriod,
         mortgage.subsequentAdjustmentPeriod, mortgage.currentlyOwningHome, mortgage.planningToSell,
         mortgage.bankruptcyLast7, mortgage.yearsSinceBankruptcy, mortgage.foreclosureLast7,
         mortgage.yearsSinceForeclosure, id]
      );
    }

    if (property) {
      await conn.query(
        `UPDATE prospect_property SET subject_property_tbd=?, street_address=?, city=?,
         county=?, postal_code=?, state=?, unit_apt=?, property_type=?
         WHERE prospect_id=?`,
        [property.subjectPropertyTBD, property.streetAddress, property.city,
         property.county, property.postalCode, property.state,
         property.unitApt, property.propertyType, id]
      );
    }

    if (lead) {
      await conn.query(
        `UPDATE prospect_lead SET lead_provided_by=?, lead_source=?, other_lead_source=?,
         primary_lead_owner=?, dnc_request=?, email_opt_out=?, sms_opt_out=?
         WHERE prospect_id=?`,
        [lead.leadProvidedBy, lead.leadSource, lead.otherLeadSource,
         lead.primaryLeadOwner, lead.dncRequest, lead.emailOptOut, lead.smsOptOut, id]
      );
    }

    await conn.commit();
    res.json({ message: 'Prospect updated' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ message: 'Error updating prospect', error });
  } finally {
    conn.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM prospects WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Prospect deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prospect', error });
  }
});

router.post('/:id/notes', async (req, res) => {
  try {
    const { text } = req.body;
    const [result] = await pool.query(
      `INSERT INTO prospect_notes (prospect_id, text) VALUES (?, ?)`,
      [req.params.id, text]
    );
    res.status(201).json({ id: result.insertId, text, message: 'Note added' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding note', error });
  }
});

export default router;