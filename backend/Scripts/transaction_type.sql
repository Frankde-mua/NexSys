-- ==============================================
--  MEDICAL DATABASE CORE STRUCTURE
-- ==============================================

-- 1. Medical aids
CREATE TABLE medical_aids (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(150),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Patients
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    patient_key VARCHAR(5) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(50),
    email VARCHAR(150),
    address TEXT,
    medical_aid_id INTEGER REFERENCES medical_aids(id) ON DELETE SET NULL,
    medical_aid_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE SEQUENCE patient_key_seq START 1;
CREATE OR REPLACE FUNCTION generate_patient_key()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.patient_key IS NULL THEN
        NEW.patient_key := LPAD(NEXTVAL('patient_key_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_patient_key
BEFORE INSERT ON patients
FOR EACH ROW
EXECUTE FUNCTION generate_patient_key();

-- 3. Accounts
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    account_number VARCHAR(10) UNIQUE,
    current_balance NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE account_patients (
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    PRIMARY KEY (account_id, patient_id)
);

CREATE SEQUENCE account_number_seq START 1;
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix VARCHAR(2);
BEGIN
    SELECT UPPER(SUBSTRING(last_name FROM 1 FOR 2)) INTO prefix
    FROM patients WHERE id = NEW.patient_id;

    IF prefix IS NULL THEN
        prefix := 'AC';
    END IF;

    NEW.account_number := prefix || LPAD(NEXTVAL('account_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_account_number
BEFORE INSERT ON accounts
FOR EACH ROW
EXECUTE FUNCTION generate_account_number();

CREATE OR REPLACE FUNCTION link_or_create_account_by_medical_aid()
RETURNS TRIGGER AS $$
DECLARE
    existing_account_id INTEGER;
    new_account_number VARCHAR(10);
BEGIN
    -- 1️⃣ Try to find existing account for the same medical aid number
    IF NEW.medical_aid_no IS NOT NULL THEN
        SELECT a.id INTO existing_account_id
        FROM accounts a
        JOIN account_patients ap ON ap.account_id = a.id
        JOIN patients p ON p.id = ap.patient_id
        WHERE p.medical_aid_no = NEW.medical_aid_no
        LIMIT 1;
    END IF;

    -- 2️⃣ If found, link new patient to that account
    IF existing_account_id IS NOT NULL THEN
        INSERT INTO account_patients (account_id, patient_id)
        VALUES (existing_account_id, NEW.id);
        RAISE NOTICE 'Linked patient % (%) to existing account % (via medical aid no %)',
            NEW.first_name, NEW.id, existing_account_id, NEW.medical_aid_no;

    -- 3️⃣ Otherwise, create a new account and link it
    ELSE
        new_account_number := 'ACC' || LPAD(NEXTVAL('patient_key_seq')::TEXT, 5, '0');

        INSERT INTO accounts (patient_id, account_number, current_balance)
        VALUES (NEW.id, new_account_number, 0.00)
        RETURNING id INTO existing_account_id;

        INSERT INTO account_patients (account_id, patient_id)
        VALUES (existing_account_id, NEW.id);

        RAISE NOTICE 'Created new account % for patient % (%) - no matching medical aid found',
            new_account_number, NEW.first_name, NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger for create patient
CREATE TRIGGER trg_link_or_create_account_by_medical_aid
AFTER INSERT ON patients
FOR EACH ROW
EXECUTE FUNCTION link_or_create_account_by_medical_aid();


-- 4. Practitioners
CREATE TABLE practitioners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    practitioner_type VARCHAR(50) NOT NULL, -- Optometrist, Medical Doctor, Dentist
    registration_no VARCHAR(50),
    email VARCHAR(150),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tariffs & Inventory
CREATE TABLE optom_tariffs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    standard_fee NUMERIC(12,2) NOT NULL,
    category VARCHAR(50),
    icd10_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE medical_tariffs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    standard_fee NUMERIC(12,2) NOT NULL,
    category VARCHAR(50),
    icd10_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50),
    unit_price NUMERIC(12,2),
    quantity_in_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Transaction types
CREATE TABLE transaction_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,       -- INV, PAY, CRN, JRN
    name VARCHAR(50) NOT NULL,
    description TEXT,
    prefix VARCHAR(5) NOT NULL,
    is_debit BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO transaction_types (code, name, description, prefix, is_debit) VALUES
('INV', 'Invoice', 'Charges for goods or services', 'INV', TRUE),
('PAY', 'Payment', 'Payment received from patient or insurer', 'PAY', FALSE),
('CRN', 'Credit Note', 'Refund or reversal of charge', 'CRN', FALSE),
('JRN', 'Journal', 'Manual adjustment', 'JRN', TRUE);

-- 7. Patient transactions
CREATE TABLE patientx (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    practitioner_id INTEGER REFERENCES practitioners(id) ON DELETE SET NULL,
    optom_tariff_id INTEGER REFERENCES optom_tariffs(id) ON DELETE SET NULL,
    medical_tariff_id INTEGER REFERENCES medical_tariffs(id) ON DELETE SET NULL,
    inventory_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
    transaction_type_id INTEGER NOT NULL REFERENCES transaction_types(id),

    document_number VARCHAR(15) UNIQUE,
    reference_no VARCHAR(50),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    narrative TEXT,  -- tariff description 
    qty NUMERIC(6,2) DEFAULT 1,
    fee NUMERIC(12,2) DEFAULT 0.00,
    discount NUMERIC(12,2) DEFAULT 0.00,
    patient_portion NUMERIC(12,2) DEFAULT 0.00,
    medical_aid_portion NUMERIC(12,2) DEFAULT 0.00,

    debit NUMERIC(12,2) DEFAULT 0.00,
    credit NUMERIC(12,2) DEFAULT 0.00,
    balance NUMERIC(12,2) DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Sequences for document numbers
CREATE SEQUENCE inv_number_seq START 1;
CREATE SEQUENCE pay_number_seq START 1;
CREATE SEQUENCE crn_number_seq START 1;
CREATE SEQUENCE jrn_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_document_number()
RETURNS TRIGGER AS $$
DECLARE
    t_prefix VARCHAR(5);
    next_num BIGINT;
    seq_name TEXT;
BEGIN
    SELECT prefix INTO t_prefix FROM transaction_types WHERE id = NEW.transaction_type_id;
    CASE t_prefix
        WHEN 'INV' THEN seq_name := 'inv_number_seq';
        WHEN 'PAY' THEN seq_name := 'pay_number_seq';
        WHEN 'CRN' THEN seq_name := 'crn_number_seq';
        WHEN 'JRN' THEN seq_name := 'jrn_number_seq';
    END CASE;
    EXECUTE format('SELECT nextval(%L)', seq_name) INTO next_num;
    NEW.document_number := format('%s-%05s', t_prefix, next_num);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_document_number
BEFORE INSERT ON patientx
FOR EACH ROW
EXECUTE FUNCTION generate_document_number();

-- 9. Balance updater
CREATE OR REPLACE FUNCTION update_balances()
RETURNS TRIGGER AS $$
DECLARE
    debit_flag BOOLEAN;
    prev_balance NUMERIC(12,2);
    new_balance NUMERIC(12,2);
BEGIN
    SELECT is_debit INTO debit_flag FROM transaction_types WHERE id = NEW.transaction_type_id;
    SELECT COALESCE(SUM(debit - credit), 0) INTO prev_balance
    FROM patientx WHERE patient_id = NEW.patient_id;

    IF debit_flag THEN
        NEW.debit := COALESCE(NEW.patient_portion + NEW.medical_aid_portion, 0);
        new_balance := prev_balance + NEW.debit;
    ELSE
        NEW.credit := COALESCE(NEW.patient_portion + NEW.medical_aid_portion, 0);
        new_balance := prev_balance - NEW.credit;
    END IF;

    NEW.balance := new_balance;

    UPDATE accounts
    SET current_balance = new_balance, updated_at = NOW()
    WHERE id = NEW.account_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_balances
BEFORE INSERT ON patientx
FOR EACH ROW
EXECUTE FUNCTION update_balances();

-- 10. Patient statements
CREATE TABLE patient_statements (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    statement_number VARCHAR(15) UNIQUE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    opening_balance NUMERIC(12,2) DEFAULT 0.00,
    total_debit NUMERIC(12,2) DEFAULT 0.00,
    total_credit NUMERIC(12,2) DEFAULT 0.00,
    closing_balance NUMERIC(12,2) DEFAULT 0.00,
    generated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),
    remarks TEXT
);

-- 11. Calendar stats
CREATE TABLE calendar_status (
    id SERIAL PRIMARY KEY,
    status_desc VARCHAR(100) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
);

-- 12. Calendar
CREATE TABLE calendar (
    id SERIAL PRIMARY KEY,
    agenda TEXT NOT NULL,
    status_id INT REFERENCES calendar_status(id) ON DELETE RESTRICT,
     created_at TIMESTAMP DEFAULT NOW()
);

-- 13. Expense categories
CREATE TABLE IF NOT EXISTS expense_category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 14. Expenditures
CREATE TABLE IF NOT EXISTS expenditure (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    Counterparty VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50),
    receipt_no VARCHAR(100),
    scan TEXT, -- store Google Drive link
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE expenditure
ADD COLUMN vat_amount NUMERIC(12,2) DEFAULT 0;


ALTER TABLE expenditure
ADD COLUMN category_id INT;

ALTER TABLE expenditure
ADD CONSTRAINT fk_category
FOREIGN KEY (category_id)
REFERENCES expense_category(id)
ON DELETE RESTRICT;

-- 15. Views and Functions for Patient Statements
CREATE OR REPLACE VIEW v_patient_statement_detail AS
SELECT
    px.id AS transaction_id,
    px.document_number,
    px.date,
    tt.code AS transaction_type,
    tt.description AS transaction_description,
    p.id AS patient_id,
    p.patient_key,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    a.account_number,
    a.current_balance AS account_balance,
    pr.id AS practitioner_id,
    pr.name AS practitioner_name,
    pr.practitioner_type,
    COALESCE(o.code, i.sku) AS item_or_tariff_code,
    COALESCE(o.description, i.item_name) AS item_or_tariff_name,
    px.description AS narrative,
    px.qty,
    px.fee AS unit_fee,
    px.discount,
    (px.fee * px.qty) - COALESCE(px.discount, 0) AS line_total,
    px.patient_portion,
    px.medical_aid_portion,
    px.debit,
    px.credit,
    (px.debit - px.credit) AS net_movement,
    SUM(px.debit - px.credit) OVER (
        PARTITION BY px.patient_id ORDER BY px.date, px.id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_balance
FROM
    patientx px
LEFT JOIN patients p ON p.id = px.patient_id
LEFT JOIN accounts a ON a.id = px.account_id
LEFT JOIN practitioners pr ON pr.id = px.practitioner_id
LEFT JOIN transaction_types tt ON tt.id = px.transaction_type_id
LEFT JOIN optom_tariffs o ON o.id = px.optom_tariff_id
LEFT JOIN inventory i ON i.id = px.inventory_id
ORDER BY
    px.patient_id, px.date, px.id;


CREATE OR REPLACE VIEW v_patient_statement_period AS
SELECT 
    ps.statement_number,
    v.*
FROM v_patient_statement_detail v
JOIN patient_statements ps 
  ON v.patient_id = ps.patient_id
 AND v.date BETWEEN ps.period_start AND ps.period_end
ORDER BY v.date;

-- 16 . Statement generation function
CREATE OR REPLACE FUNCTION generate_all_monthly_statements()
RETURNS VOID AS $$
DECLARE
    p RECORD;
    start_date DATE := date_trunc('month', CURRENT_DATE) - INTERVAL '1 month';
    end_date DATE := (date_trunc('month', CURRENT_DATE) - INTERVAL '1 day');
BEGIN
    FOR p IN SELECT DISTINCT patient_id FROM patientx LOOP
        PERFORM generate_patient_statement(p.patient_id, start_date, end_date, 'auto');
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- Example query to retrieve statement details for a specific patient
-- SELECT 
--     document_number,
--     date,
--     transaction_type,
--     item_or_tariff_name,
--     diagnosis_codes,
--     patient_portion,
--     medical_aid_portion,
--     line_total,
--     running_balance
-- FROM v_patient_statement_detail
-- WHERE patient_id = 1
-- ORDER BY date;

-- Example query to retrieve statement for a specific statement number
-- SELECT * FROM v_patient_statement_period WHERE statement_number = 'STM-00003';

INSERT INTO medical_aids (id, name, code, contact_person, phone, email)
VALUES
(1, 'Bonitas', 'BON', 'Samantha Khumalo', '0114567890', 'info@bonitas.co.za'),
(2, 'Discovery Health', 'DISC', 'Johan Meyer', '0112345678', 'support@discovery.co.za'),
(3, 'Medihelp', 'MED', 'Rene Williams', '0123456789', 'enquiries@medihelp.co.za'),
(4, 'Hosmed', 'HOS', 'Lerato Molefe', '0105551212', 'client@hosmed.co.za');