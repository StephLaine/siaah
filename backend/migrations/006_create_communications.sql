/*
  Migration: create communications table
  This migration adds a `communications` table to store all email logs for users.
  Columns:
    - id: primary key
    - user_id: reference to the user receiving the email (foreign key)
    - sender_id: reference to the admin/employee sending the email (nullable)
    - type: short string indicating the email purpose (e.g., 'welcome', 'request_received', 'status_update', 'custom')
    - subject: email subject
    - message: email body (text)
    - created_at: timestamp when the record was created
    - updated_at: timestamp when the record was last updated
*/

CREATE TABLE IF NOT EXISTS communications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: create an index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_communications_user_id ON communications(user_id);
