-- ==============================================
-- DOMAIN DEFINITIONS
-- ==============================================

CREATE DOMAIN accountno AS VARCHAR(7);  
-- Defines a custom data type 'accountno' as VARCHAR(7) to standardize account numbers across tables.

CREATE DOMAIN medicalaid AS VARCHAR(6);  
-- Defines a custom data type 'medicalaid' as VARCHAR(6) for storing medical aid identifiers.

CREATE DOMAIN truefalseentry AS CHAR(1)
    CHECK (VALUE IN ('T', 'F'));  
-- Defines a Boolean-like domain where values must be either 'T' (True) or 'F' (False).

-- ==============================================
-- TABLE: patient_trans
-- ==============================================

CREATE TABLE patient_trans (
    patient_trans_key         SERIAL PRIMARY KEY,  
    -- Auto-incrementing primary key for each transaction record.

    account_key          accountno NOT NULL,  
    -- Account number (uses the custom domain), must be provided.

    patient_key          INTEGER NOT NULL,  
    -- Links to a patient record (foreign key likely in another table).

    txdate               DATE NOT NULL,  
    -- Date the transaction occurred.

    capdate              DATE DEFAULT CURRENT_DATE NOT NULL,  
    -- Capture date (defaults to current date if not supplied).

    captime              TIME DEFAULT CURRENT_TIME NOT NULL,  
    -- Capture time (defaults to current time if not supplied).

    tariffid_key         INTEGER,  
    -- Reference to tariff (pricing) ID.

    tarifftable_key      VARCHAR(10),  
    -- Reference to tariff table identifier.

    tariffoptom_key      VARCHAR(10),  
    -- Reference to optometrist tariff key.

    txtypes_key          VARCHAR(2) NOT NULL,  
    -- Transaction type code (e.g., consultation, sale, etc.).

    narrative            VARCHAR(80),  
    -- Description or notes about the transaction.

    qty                  NUMERIC(11, 2),  
    -- Quantity involved in the transaction.

    units                NUMERIC(11, 2),  
    -- Units associated with quantity (e.g., lenses, frames).

    stockid_key          INTEGER,  
    -- Reference to stock item ID (numeric form).

    stockmed_key         VARCHAR(15),  
    -- Stock item key for medical supplies.

    stockoptom_key       VARCHAR(15),  
    -- Stock item key for optical products.

    yearperiod           INTEGER,  
    -- Accounting year of the transaction.

    monthperiod          INTEGER,  
    -- Accounting month of the transaction.

    hide                 truefalseentry NOT NULL,  
    -- Flag to hide (T/F) the transaction from normal view.

    diagnosis_key        INTEGER,  
    -- Links to diagnosis information.

    medicalaid_key       medicalaid NOT NULL,  
    -- Medical aid (insurance) reference using defined domain.

    drcr                 VARCHAR(1) NOT NULL,  
    -- Indicates Debit (D) or Credit (C) transaction type.

    debit                NUMERIC(11, 2),  
    -- Debit amount.

    credit               NUMERIC(11, 2),  
    -- Credit amount.

    vatperc              NUMERIC(11, 2),  
    -- VAT percentage applied.

    vat                  NUMERIC(11, 2),  
    -- VAT amount.

    discperc             NUMERIC(11, 2),  
    -- Discount percentage applied.

    discount             NUMERIC(11, 2),  
    -- Discount value.

    profit               NUMERIC(11, 2),  
    -- Profit on transaction (calculated or stored).

    transbalance         NUMERIC(11, 2),  
    -- Total transaction balance.

    patientportion       NUMERIC(11, 2),  
    -- Amount payable by patient.

    medaidportion        NUMERIC(11, 2),  
    -- Amount payable by medical aid.

    cappedamount         NUMERIC(11, 2),  
    -- Capped amount limit if applicable.

    priority             VARCHAR(1),  
    -- Priority flag (e.g., urgency level).

    salespersons_key     INTEGER,  
    -- Reference to salesperson involved.

    placeofservice_key   VARCHAR(2),  
    -- Location code for where service was performed.

    documentno           INTEGER,  
    -- Document reference number (invoice, etc.).

    auditno              INTEGER NOT NULL,  
    -- Audit tracking number.

    hfusers_key          INTEGER NOT NULL,  
    -- Reference to the user who entered the record.

    assistantdr_key      INTEGER,  
    -- Assistant doctor reference.

    treatingdr_key       INTEGER,  
    -- Treating doctor reference.

    defaultdr_key        INTEGER,  
    -- Default doctor for the patient.

    refertodr            INTEGER,  
    -- Doctor the patient was referred to.

    referfromdr          INTEGER,  
    -- Doctor who referred the patient.

    isgeneric            truefalseentry NOT NULL,  
    -- Flag: whether medication/item is generic.

    israms               truefalseentry NOT NULL,  
    -- Flag for RAMS (medical scheme) related transaction.

    medstype             VARCHAR(1),  
    -- Type of medication or service.

    oldprice             NUMERIC(11, 2),  
    -- Original price before any changes.

    cpt_key              VARCHAR(5),  
    -- CPT (Current Procedural Terminology) code.

    cptmodifier_key      VARCHAR(2),  
    -- Modifier for CPT code.

    referaltracking      VARCHAR(15),  
    -- Reference tracking for referrals.

    refnum               VARCHAR(15),  
    -- Reference number for the transaction.

    lorr                 VARCHAR(1),  
    -- Left or right (used for eyes, lenses, etc.).

    costprice            NUMERIC(11, 2),  
    -- Cost price of the item/service.

    unitprice            NUMERIC(11, 2),  
    -- Unit price charged.

    tariffcategory_key   INTEGER,  
    -- Tariff category reference.

    stockcategory_key    INTEGER,  
    -- Stock category reference.

    stockgroup_key       INTEGER,  
    -- Stock group reference.

    hbtrans              truefalseentry NOT NULL,  
    -- Hospital billing transaction flag.

    mktrans              truefalseentry NOT NULL,  
    -- Marketing-related transaction flag.

    qeditrans            truefalseentry NOT NULL,  
    -- Quick edit transaction flag.

    stocksubgroup_key    INTEGER,  
    -- Stock subgroup reference.

    ratestype_key        INTEGER,  
    -- Rate type key reference.

    receiptno            INTEGER,  
    -- Receipt number associated with the transaction.

    daybookprinted       INTEGER,  
    -- Flag or counter if transaction printed in daybook.

    systempract_key      INTEGER NOT NULL,  
    -- System practitioner key (organization level link).

    hfsupplier_key       VARCHAR(6),  
    -- Supplier code (health facility supplier).

    consignment          truefalseentry NOT NULL,  
    -- Indicates if item is on consignment.

    conssupplier_key     VARCHAR(6),  
    -- Supplier key for consignment stock.

    invoicenumber        VARCHAR(10),  
    -- Invoice number linked to transaction.

    trackingno           BIGINT NOT NULL,  
    -- Unique tracking number for each transaction (auto-generated by sequence).

    motivation_key       VARCHAR(7),  
    -- Key linking to motivation or justification record.

    membershipno         VARCHAR(25),  
    -- Medical aid membership number.

    barcode              VARCHAR(13),  
    -- Barcode for stock item or document.

    pastelactive         VARCHAR(1) DEFAULT 'F' NOT NULL,  
    -- Indicates if record exported to accounting (Pastel).

    pastelexportdate     DATE,  
    -- Date exported to accounting system.

    cnreason             VARCHAR(30),  
    -- Credit note reason.

    tillno               INTEGER,  
    -- Till or point-of-sale terminal number.

    ramsfacility         VARCHAR(6),  
    -- Facility code for RAMS submissions.

    edistatus            VARCHAR(1),  
    -- EDI (Electronic Data Interchange) status flag.

    stocksheet_key       INTEGER,  
    -- Reference to stock sheet.

    sent_via_itc         VARCHAR(1),  
    -- Indicator if record sent via ITC (credit system).

    itc_payment          truefalseentry DEFAULT 'F' NOT NULL,  
    -- Flag for ITC payment (T/F).

    ahgtrans             truefalseentry DEFAULT 'F' NOT NULL,  
    -- Flag for AHG (Allied Health Group) transaction.

    ahgstatus            VARCHAR(1),  
    -- AHG status indicator.

    hbclaimline_key      INTEGER,  
    -- Hospital billing claim line reference.

    auditcount           INTEGER DEFAULT 0,  
    -- Counter for number of times record was audited.

    discountforinv       truefalseentry DEFAULT 'F' NOT NULL,  
    -- Indicates if discount applies to invoice.

    perdiem              truefalseentry DEFAULT 'F' NOT NULL,  
    -- Indicates a per diem (daily rate) entry.

    labpatienttests_key  INTEGER,  
    -- Links to lab test results for the patient.

    rightiop             VARCHAR(2),  
    -- Right eye intraocular pressure.

    rightva              VARCHAR(7),  
    -- Right eye visual acuity.

    leftiop              VARCHAR(2),  
    -- Left eye intraocular pressure.

    leftva               VARCHAR(7),  
    -- Left eye visual acuity.

    hs3claim             truefalseentry DEFAULT 'F' NOT NULL,  
    -- Flag for HS3 medical claim type.

    hs3status            VARCHAR(1),  
    -- Status of HS3 claim.

    depositslipprinted   truefalseentry DEFAULT 'F' NOT NULL,  
    -- Whether a deposit slip has been printed.

    encounter_key        INTEGER,  
    -- Reference to encounter (visit) record.

    linkedcodeskey       VARCHAR(15),  
    -- Key for linked billing/medical codes.

    macrooptomkey        VARCHAR(15),  
    -- Macro key for optometry data.

    daybookno            INTEGER  
    -- Daybook number for accounting/batch grouping.
);

-- ==============================================
-- SEQUENCE FOR trackingno (replacement for GEN_ID)
-- ==============================================

CREATE SEQUENCE gen_trackingno START 1;  
-- Creates a sequence starting from 1 to auto-generate unique tracking numbers.

-- ==============================================
-- SIMPLE TRIGGERS EXAMPLES
-- ==============================================

-- Trigger: TG_INSERT_PATIENTX
CREATE OR REPLACE FUNCTION tg_insert_patient_trans_fn()
RETURNS TRIGGER AS $$
BEGIN
    NEW.trackingno := nextval('gen_trackingno');  
    -- Automatically assign a new tracking number from the sequence.

    NEW.depositslipprinted := 'F';  
    -- Ensure new records default to not having a printed deposit slip.

    -- Check for balance mismatch
    IF ((COALESCE(NEW.patientportion,0) + COALESCE(NEW.medaidportion,0)) <> COALESCE(NEW.transbalance,0))
       AND NEW.drcr = 'D' THEN
        NEW.patientportion := NEW.transbalance;  
        -- Correct mismatch by assigning full balance to patient portion.
        NEW.medaidportion := 0;  
        -- Set medical aid portion to 0.
    END IF;

    RETURN NEW;  
    -- Return modified record to insert.
END;
$$ LANGUAGE plpgsql;  
-- Function uses PostgreSQL's procedural language.

CREATE TRIGGER tg_insert_patient_trans
BEFORE INSERT ON patient_trans
FOR EACH ROW
EXECUTE FUNCTION tg_insert_patient_trans_fn();  
-- Trigger that fires the above function before inserting any new record.

-- Trigger: TG_UPDATE_PATIENTX (simplified)
CREATE OR REPLACE FUNCTION tg_update_patient_trans_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.trackingno <> OLD.trackingno THEN
        RAISE EXCEPTION 'Record altered concurrently';  
        -- Prevent concurrent or conflicting updates to the same record.
    END IF;

    NEW.trackingno := nextval('gen_trackingno');  
    -- Generate a new tracking number on update (audit/version control).

    IF (NEW.transbalance = 0 AND (NEW.patientportion < 0 OR NEW.medaidportion < 0)) THEN
        NEW.patientportion := 0;  
        NEW.medaidportion := 0;  
        -- Reset portions if they have invalid (negative) values when balance is zero.
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_update_patient_trans
BEFORE UPDATE ON patient_trans
FOR EACH ROW
EXECUTE FUNCTION tg_update_patient_trans_fn();  
-- Trigger executes before updating any record in the table.

-- Trigger: TG_DELETE_PATIENTX
CREATE OR REPLACE FUNCTION tg_delete_patient_trans_fn()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Delete not allowed on patient_trans';  
    -- Prevents deletion of records from patient_trans (audit protection).
    RETURN OLD;  
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_delete_patient_trans
BEFORE DELETE ON patient_trans
FOR EACH ROW
EXECUTE FUNCTION tg_delete_patient_transfn();  
-- Trigger to prevent deletion of any record.
