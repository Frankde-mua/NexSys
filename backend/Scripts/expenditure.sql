CREATE TABLE IF NOT EXISTS expenditure (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    supplier VARCHAR(255),
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
