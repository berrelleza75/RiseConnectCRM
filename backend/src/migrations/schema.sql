-- ============================================================
-- RiseConnectCRM — Schema completo
-- MySQL 5.7+ compatible
-- SIN CASCADE: borrar contacto NO borra leads ni loans
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── Borrar TODO primero ───────────────────────────────────
DROP TABLE IF EXISTS office_realtor;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS co_borrowers;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS offices;

-- ── Crear tablas ──────────────────────────────────────────

CREATE TABLE offices (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(50),
  email      VARCHAR(255),
  address    VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  office_id  INT,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'admin',
  phone      VARCHAR(50),
  status     VARCHAR(20)  NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  office_id       INT          NOT NULL,
  created_by      INT,
  assigned_to     INT,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(255),
  cell_phone      VARCHAR(50),
  source          VARCHAR(50)  DEFAULT 'manual',
  source_username VARCHAR(255),
  status          VARCHAR(20)  DEFAULT 'new',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_office (office_id)
);

CREATE TABLE leads (
  id                            INT AUTO_INCREMENT PRIMARY KEY,
  contact_id                    INT NOT NULL,
  office_id                     INT,
  assigned_to                   INT,
  loan_purpose                  VARCHAR(30),
  buying_stage                  VARCHAR(30),
  first_time_home_buyer         TINYINT(1),
  has_real_estate_agent         TINYINT(1),
  desired_monthly_payment       DECIMAL(10,2),
  subject_property_tbd          TINYINT(1)   DEFAULT 0,
  street_address                VARCHAR(255),
  unit_apt                      VARCHAR(50),
  city                          VARCHAR(100),
  state                         VARCHAR(50),
  postal_code                   VARCHAR(20),
  county                        VARCHAR(100),
  property_type                 VARCHAR(30),
  property_occupancy            VARCHAR(20),
  purchase_price                DECIMAL(12,2),
  gross_annual_income           DECIMAL(12,2),
  employment_type               VARCHAR(30),
  credit_score_range            VARCHAR(30),
  military_service              TINYINT(1),
  current_occupancy             VARCHAR(20),
  monthly_rent_amount           DECIMAL(10,2),
  current_interest_rate         DECIMAL(6,3),
  currently_owning_home         TINYINT(1),
  planning_to_sell              TINYINT(1),
  lead_provided_by              VARCHAR(255),
  lead_source                   VARCHAR(50),
  other_lead_source_description VARCHAR(255),
  dnc_request                   TINYINT(1) DEFAULT 0,
  email_opt_out                 TINYINT(1) DEFAULT 0,
  sms_opt_out                   TINYINT(1) DEFAULT 0,
  status                        VARCHAR(20) DEFAULT 'working',
  lost_reason                   VARCHAR(255),
  closed_at                     TIMESTAMP NULL,
  created_at                    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact (contact_id),
  INDEX idx_office  (office_id)
);

CREATE TABLE loans (
  id                                  INT AUTO_INCREMENT PRIMARY KEY,
  contact_id                          INT NOT NULL,
  lead_id                             INT,
  office_id                           INT,
  assigned_to                         INT,
  primary_lead_owner                  INT,
  ssn                                 VARCHAR(255),
  date_of_birth                       DATE,
  military_service                    TINYINT(1),
  current_address_street              VARCHAR(255),
  current_address_city                VARCHAR(100),
  current_address_state               VARCHAR(50),
  current_address_postal              VARCHAR(20),
  address_duration_years              INT,
  address_duration_months             INT,
  current_occupancy                   VARCHAR(20),
  monthly_rent_amount                 DECIMAL(10,2),
  loan_purpose                        VARCHAR(30),
  loan_type                           VARCHAR(30),
  base_loan_amount                    DECIMAL(12,2),
  purchase_price                      DECIMAL(12,2),
  appraised_value                     DECIMAL(12,2),
  lien_position                       VARCHAR(10),
  note_rate                           DECIMAL(6,3),
  qualifying_rate                     DECIMAL(6,3),
  amortization_type                   VARCHAR(10),
  amortization_term_months            INT,
  interest_only                       TINYINT(1),
  interest_only_term_months           INT,
  impound_waiver                      TINYINT(1),
  loan_fico                           INT,
  adjustable_rate                     TINYINT(1),
  initial_adjustment_period_months    INT,
  subsequent_adjustment_period_months INT,
  estimated_monthly_hoi               DECIMAL(10,2),
  estimated_monthly_property_taxes    DECIMAL(10,2),
  estimated_monthly_hoa               DECIMAL(10,2),
  gross_annual_income                 DECIMAL(12,2),
  employment_type                     VARCHAR(30),
  total_monthly_liability             DECIMAL(10,2),
  buying_stage                        VARCHAR(30),
  desired_monthly_payment             DECIMAL(10,2),
  first_time_home_buyer               TINYINT(1),
  has_real_estate_agent               TINYINT(1),
  refinance_type                      VARCHAR(20),
  cash_out_purpose                    VARCHAR(255),
  current_interest_rate               DECIMAL(6,3),
  currently_owning_home               TINYINT(1),
  planning_to_sell                    TINYINT(1),
  bankruptcy_last_7_years             TINYINT(1),
  years_since_bankruptcy              INT,
  foreclosure_last_7_years            TINYINT(1),
  years_since_foreclosure             INT,
  subject_property_tbd                TINYINT(1),
  property_street                     VARCHAR(255),
  property_city                       VARCHAR(100),
  property_county                     VARCHAR(100),
  property_postal                     VARCHAR(20),
  property_state                      VARCHAR(50),
  property_unit                       VARCHAR(50),
  property_occupancy                  VARCHAR(20),
  property_type                       VARCHAR(30),
  lead_provided_by                    VARCHAR(255),
  lead_source                         VARCHAR(50),
  other_lead_source_description       VARCHAR(255),
  dnc_request                         TINYINT(1) DEFAULT 0,
  email_opt_out                       TINYINT(1) DEFAULT 0,
  sms_opt_out                         TINYINT(1) DEFAULT 0,
  status                              VARCHAR(30) DEFAULT 'in_progress',
  denied_reason                       VARCHAR(255),
  closed_at                           TIMESTAMP NULL,
  created_at                          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact (contact_id),
  INDEX idx_lead    (lead_id),
  INDEX idx_office  (office_id)
);

CREATE TABLE co_borrowers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  loan_id          INT          NOT NULL,
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  email            VARCHAR(255),
  phone            VARCHAR(50),
  ssn              VARCHAR(255),
  date_of_birth    DATE,
  military_service TINYINT(1),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_loan (loan_id)
);

CREATE TABLE notes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL,
  entity_id   INT         NOT NULL,
  created_by  INT,
  text        TEXT        NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id)
);

CREATE TABLE appointments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  office_id   INT,
  contact_id  INT,
  lead_id     INT,
  assigned_to INT,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  date        DATE,
  time        TIME,
  status      VARCHAR(20) DEFAULT 'scheduled',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_office  (office_id),
  INDEX idx_contact (contact_id)
);

CREATE TABLE messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  office_id  INT,
  from_user  INT NOT NULL,
  to_user    INT NOT NULL,
  content    TEXT       NOT NULL,
  is_read    TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_from (from_user),
  INDEX idx_to   (to_user)
);

CREATE TABLE office_realtor (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  office_id  INT NOT NULL,
  user_id    INT NOT NULL,
  status     VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_office_user (office_id, user_id)
);

SET FOREIGN_KEY_CHECKS = 1;
