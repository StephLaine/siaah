/*
  Migration: Add extra fields to service_operations
  - detailed_description TEXT (optional detailed description & procedure)
  - price_htg NUMERIC (service price in Haitian gourde)
*/

ALTER TABLE service_operations
  ADD COLUMN detailed_description TEXT,
  ADD COLUMN price_htg NUMERIC DEFAULT 0;
