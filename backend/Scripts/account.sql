-- ==============================================
-- TABLE: account
-- Converted from Firebird to PostgreSQL
-- ==============================================

CREATE TABLE account (
    account_key         accountno NOT NULL,                    -- Unique account number (uses custom domain 'accountno')
    defaultaddress      INTEGER NOT NULL,                      -- Default address ID (likely a reference to address table)
    medicalaid_key      medicalaid NOT NULL,                   -- Reference to medical aid (uses custom domain 'medicalaid')
    statementlanguage   INTEGER NOT NULL,                      -- Preferred language for statements
    accountgroup_key    INTEGER,                               -- Reference to account group (may be null)
    markaccount         truefalseentry NOT NULL,               -- Flag: whether account is marked (T/F)
    dispute             truefalseentry NOT NULL,               -- Flag: indicates a dispute (T/F)
    handover            truefalseentry NOT NULL,               -- Flag: handed over to collections (T/F)
    handoverinnextrun   truefalseentry NOT NULL,               -- Flag: to be handed over in next batch (T/F)
    noedi               truefalseentry NOT NULL,               -- Flag: no electronic data interchange (EDI)
    interest            truefalseentry NOT NULL,               -- Flag: whether interest applies
    dateopened          DATE,                                  -- Date when account was opened
    consolidated        truefalseentry NOT NULL,               -- Flag: consolidated account (T/F)
    laststatementdate   DATE,                                  -- Date last statement was generated
    qtystmtsprinted     INTEGER,                               -- Quantity of statements printed
    alertmsg            VARCHAR(100),                          -- Alert message or warning text for this account
    accounttype         VARCHAR(1) NOT NULL,                   -- Account type code (e.g., 'P' for personal, 'C' for company)
    membersplus         INTEGER NOT NULL,                      -- Member count or extended attribute
    printstatement      truefalseentry NOT NULL,               -- Whether to print statement for this account
    laybye              truefalseentry NOT NULL,               -- Flag for lay-bye accounts
    creditlimit         NUMERIC(11, 2) DEFAULT 0,              -- Credit limit assigned to this account
    systempract_key     INTEGER NOT NULL,                      -- Reference to practitioner/system key
    drstodate           NUMERIC(11, 2) DEFAULT 0,              -- Total debits to date
    crstodate           NUMERIC(11, 2) DEFAULT 0,              -- Total credits to date
    lastcrdate          DATE,                                  -- Date of last credit transaction
    lastdrdate          DATE,                                  -- Date of last debit transaction
    patliable           NUMERIC(11, 2) DEFAULT 0,              -- Patient portion liability
    medliable           NUMERIC(11, 2) DEFAULT 0,              -- Medical aid portion liability
    accbalance          NUMERIC(11, 2) DEFAULT 0,              -- Total account balance
    trackingno          INTEGER NOT NULL,                      -- Unique tracking number (auto-generated via sequence)
    itcsoftletter       truefalseentry DEFAULT 'F' NOT NULL,   -- Flag: ITC soft letter sent
    itchardletter       truefalseentry DEFAULT 'F' NOT NULL,   -- Flag: ITC hard letter sent
    itclisted           truefalseentry DEFAULT 'F' NOT NULL,   -- Flag: ITC listing active
    itccollection       truefalseentry DEFAULT 'F' NOT NULL,   -- Flag: ITC collection process active
    itclegal            truefalseentry DEFAULT 'F' NOT NULL,   -- Flag: ITC legal process active
    itctype             INTEGER,                               -- Type of ITC action or classification
    cashaccount         truefalseentry DEFAULT 'F' NOT NULL,   -- Indicates cash-only account
    notinuse            truefalseentry DEFAULT 'F' NOT NULL,   -- Marks account as inactive
    sent_via_itc        VARCHAR(1),                            -- Flag indicating if sent via ITC
    datehandover        DATE,                                  -- Date account was handed over
    insurance           truefalseentry DEFAULT 'F' NOT NULL,   -- Flag: linked to insurance
    nolabrequired       truefalseentry DEFAULT 'F' NOT NULL,   -- Flag: no lab required
    webpassword         VARCHAR(10),                           -- Password for online access
    debtpackindex       INTEGER DEFAULT 0 NOT NULL,            -- Debt pack index for collections tracking
    lastdebtpackdate    DATE,                                  -- Date of last debt pack run
    privateaccount      truefalseentry DEFAULT 'F' NOT NULL,   -- Indicates a private account (non-medical aid)
    lastpaymentdate     DATE,                                  -- Date of last payment made
    accountwo           truefalseentry DEFAULT 'F' NOT NULL,   -- Write-off flag (account written off)
    currenttxexists     VARCHAR(1) DEFAULT 'F',                -- Flag if current transactions exist
    PRIMARY KEY (account_key)                                  -- Primary key constraint on account_key
);

-- ==============================================
-- FOREIGN KEYS
-- ==============================================

ALTER TABLE account
ADD CONSTRAINT fk_account_medicalaid
FOREIGN KEY (medicalaid_key)
REFERENCES medicalaid (medicalaid_key);  -- Links to medical aid table

ALTER TABLE account
ADD CONSTRAINT fk_account_accountgroup
FOREIGN KEY (accountgroup_key)
REFERENCES accountgroup (accountgroup_key);  -- Links to account group

ALTER TABLE account
ADD CONSTRAINT fk_account_practitioner
FOREIGN KEY (systempract_key)
REFERENCES practitioner (practitioner_key);  -- Links to practitioner table


-- ==============================================
-- SEQUENCE FOR trackingno (replacement for GEN_ID)
-- ==============================================

CREATE SEQUENCE gen_trackingno START 1;  -- Sequence to auto-generate tracking numbers


-- ==============================================
-- TRIGGER: BEFORE INSERT
-- ==============================================

CREATE OR REPLACE FUNCTION tg_insert_account_fn()
RETURNS TRIGGER AS $$
BEGIN
    NEW.trackingno := nextval('gen_trackingno');  -- Generate new tracking number from sequence
    NEW.dateopened := CURRENT_DATE;               -- Automatically set the opened date to today
    RETURN NEW;                                   -- Return modified record for insertion
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_insert_account
BEFORE INSERT ON account
FOR EACH ROW
EXECUTE FUNCTION tg_insert_account_fn();          -- Trigger function executes before inserting a new row


-- ==============================================
-- TRIGGER: BEFORE UPDATE
-- ==============================================

CREATE OR REPLACE FUNCTION tg_update_account_fn()
RETURNS TRIGGER AS $$
BEGIN
    -- If account just got handed over (from F → T), update the handover date
    IF OLD.handover = 'F' AND NEW.handover = 'T' THEN
        NEW.datehandover := CURRENT_DATE;
    END IF;

    -- Prevent concurrent updates by checking tracking number changes
    IF NEW.trackingno <> OLD.trackingno THEN
        RAISE EXCEPTION 'Record altered concurrently';
    END IF;

    -- Refresh tracking number after update (new version)
    NEW.trackingno := nextval('gen_trackingno');

    RETURN NEW;  -- Return updated record
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_update_account
BEFORE UPDATE ON account
FOR EACH ROW
EXECUTE FUNCTION tg_update_account_fn();


-- ==============================================
-- TRIGGER: BEFORE DELETE
-- ==============================================

CREATE OR REPLACE FUNCTION tg_delete_account_fn()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM companyname WHERE account_key = OLD.account_key;  -- Remove related company name records before account deletion
    RETURN OLD;                                                   -- Return deleted record reference
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_delete_account_companyname
BEFORE DELETE ON account
FOR EACH ROW
EXECUTE FUNCTION tg_delete_account_fn();  -- Attach delete trigger to account table
