CREATE TABLE sos_contacts (
    contact_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,

    contact_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    relationship VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);