-- =====================================================
-- Loans full schema migration (compatible con MySQL 5.7+)
-- Agrega columnas solo si no existen
-- =====================================================

DROP PROCEDURE IF EXISTS _add_col;

DELIMITER //
CREATE PROCEDURE _add_col(
    IN tbl  VARCHAR(100),
    IN col  VARCHAR(100),
    IN def  TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = tbl
          AND COLUMN_NAME  = col
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', def);
        PREPARE s FROM @sql;
        EXECUTE s;
        DEALLOCATE PREPARE s;
    END IF;
END //
DELIMITER ;

-- Linkage
CALL _add_col('loans', 'lead_id',            'INT');
CALL _add_col('loans', 'office_id',          'INT');
CALL _add_col('loans', 'assigned_to',        'INT');
CALL _add_col('loans', 'primary_lead_owner', 'INT');

-- Borrower
CALL _add_col('loans', 'ssn',                     'VARCHAR(255)');
CALL _add_col('loans', 'date_of_birth',            'DATE');
CALL _add_col('loans', 'military_service',         'TINYINT(1)');
CALL _add_col('loans', 'current_address_street',   'VARCHAR(255)');
CALL _add_col('loans', 'current_address_city',     'VARCHAR(100)');
CALL _add_col('loans', 'current_address_state',    'VARCHAR(50)');
CALL _add_col('loans', 'current_address_postal',   'VARCHAR(20)');
CALL _add_col('loans', 'address_duration_years',   'INT');
CALL _add_col('loans', 'address_duration_months',  'INT');
CALL _add_col('loans', 'current_occupancy',        'VARCHAR(20)');
CALL _add_col('loans', 'monthly_rent_amount',      'DECIMAL(10,2)');

-- Mortgage technical
CALL _add_col('loans', 'purchase_price',            'DECIMAL(12,2)');
CALL _add_col('loans', 'appraised_value',           'DECIMAL(12,2)');
CALL _add_col('loans', 'loan_type',                 'VARCHAR(30)');
CALL _add_col('loans', 'lien_position',             'VARCHAR(10)');
CALL _add_col('loans', 'note_rate',                 'DECIMAL(6,3)');
CALL _add_col('loans', 'qualifying_rate',           'DECIMAL(6,3)');
CALL _add_col('loans', 'amortization_type',         'VARCHAR(10)');
CALL _add_col('loans', 'amortization_term_months',  'INT');
CALL _add_col('loans', 'interest_only',             'TINYINT(1)');
CALL _add_col('loans', 'interest_only_term_months', 'INT');
CALL _add_col('loans', 'impound_waiver',            'TINYINT(1)');
CALL _add_col('loans', 'loan_fico',                 'INT');

-- ARM
CALL _add_col('loans', 'adjustable_rate',                     'TINYINT(1)');
CALL _add_col('loans', 'initial_adjustment_period_months',    'INT');
CALL _add_col('loans', 'subsequent_adjustment_period_months', 'INT');

-- Monthly costs
CALL _add_col('loans', 'estimated_monthly_hoi',            'DECIMAL(10,2)');
CALL _add_col('loans', 'estimated_monthly_property_taxes', 'DECIMAL(10,2)');
CALL _add_col('loans', 'estimated_monthly_hoa',            'DECIMAL(10,2)');

-- Income & debts
CALL _add_col('loans', 'gross_annual_income',     'DECIMAL(12,2)');
CALL _add_col('loans', 'employment_type',         'VARCHAR(30)');
CALL _add_col('loans', 'total_monthly_liability', 'DECIMAL(10,2)');

-- Buying stage
CALL _add_col('loans', 'buying_stage',            'VARCHAR(30)');
CALL _add_col('loans', 'desired_monthly_payment', 'DECIMAL(10,2)');
CALL _add_col('loans', 'first_time_home_buyer',   'TINYINT(1)');
CALL _add_col('loans', 'has_real_estate_agent',   'TINYINT(1)');

-- Refinance
CALL _add_col('loans', 'refinance_type',        'VARCHAR(20)');
CALL _add_col('loans', 'cash_out_purpose',      'VARCHAR(255)');
CALL _add_col('loans', 'current_interest_rate', 'DECIMAL(6,3)');
CALL _add_col('loans', 'currently_owning_home', 'TINYINT(1)');
CALL _add_col('loans', 'planning_to_sell',      'TINYINT(1)');

-- Bankruptcy / foreclosure
CALL _add_col('loans', 'bankruptcy_last_7_years',  'TINYINT(1)');
CALL _add_col('loans', 'years_since_bankruptcy',   'INT');
CALL _add_col('loans', 'foreclosure_last_7_years', 'TINYINT(1)');
CALL _add_col('loans', 'years_since_foreclosure',  'INT');

-- Property
CALL _add_col('loans', 'subject_property_tbd', 'TINYINT(1)');
CALL _add_col('loans', 'property_street',      'VARCHAR(255)');
CALL _add_col('loans', 'property_city',        'VARCHAR(100)');
CALL _add_col('loans', 'property_county',      'VARCHAR(100)');
CALL _add_col('loans', 'property_postal',      'VARCHAR(20)');
CALL _add_col('loans', 'property_state',       'VARCHAR(50)');
CALL _add_col('loans', 'property_unit',        'VARCHAR(50)');
CALL _add_col('loans', 'property_occupancy',   'VARCHAR(20)');
CALL _add_col('loans', 'property_type',        'VARCHAR(30)');

-- Lead origin
CALL _add_col('loans', 'lead_provided_by',                'VARCHAR(255)');
CALL _add_col('loans', 'lead_source',                     'VARCHAR(50)');
CALL _add_col('loans', 'other_lead_source_description',   'VARCHAR(255)');

-- Compliance
CALL _add_col('loans', 'dnc_request',   'TINYINT(1) DEFAULT 0');
CALL _add_col('loans', 'email_opt_out', 'TINYINT(1) DEFAULT 0');
CALL _add_col('loans', 'sms_opt_out',   'TINYINT(1) DEFAULT 0');

-- Status extras
CALL _add_col('loans', 'denied_reason', 'VARCHAR(255)');
CALL _add_col('loans', 'closed_at',     'TIMESTAMP NULL');

DROP PROCEDURE IF EXISTS _add_col;

-- Co-borrowers (sin FK para evitar incompatibilidad de tipos)
CREATE TABLE IF NOT EXISTS co_borrowers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  loan_id          INT NOT NULL,
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  email            VARCHAR(255),
  phone            VARCHAR(50),
  ssn              VARCHAR(255),
  date_of_birth    DATE,
  military_service TINYINT(1),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_loan_id (loan_id)
);
