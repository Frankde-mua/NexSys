CREATE TABLE calendar_status (
    id SERIAL PRIMARY KEY,
    status_desc VARCHAR(100) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
);