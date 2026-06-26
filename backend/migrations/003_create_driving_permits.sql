-- Migration: 003_create_driving_permits.sql
-- Creates table for driving licences
CREATE TABLE IF NOT EXISTS driving_permits (
  id SERIAL PRIMARY KEY,
  permit_number VARCHAR(50) UNIQUE NOT NULL,
  issuance_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
