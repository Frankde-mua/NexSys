-- 1️⃣ Create the expense_category table
CREATE TABLE IF NOT EXISTS expense_category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ Insert the expense categories
INSERT INTO expense_category (category_name)
VALUES
    ('Office & Admin'),
    ('Employee & Staff'),
    ('Travel & Transport'),
    ('Marketing & Sales'),
    ('Professional & Consulting'),
    ('Insurance & Licences'),
    ('Repairs & Maintenance'),
    ('Financial & Bank Charges'),
    ('Depreciation / Assets'),
    ('Miscellaneous / Sundry')
ON CONFLICT (category_name) DO NOTHING;  -- avoid duplicates if run multiple times

