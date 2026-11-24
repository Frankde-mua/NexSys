CREATE TABLE calendar (
    id SERIAL PRIMARY KEY,
    agenda TEXT NOT NULL,
    status_id INT REFERENCES calendar_status(id) ON DELETE RESTRICT,
     created_at TIMESTAMP DEFAULT NOW()
);