-- Add cancellation_reason column to orders table
-- Run this in your Supabase SQL editor

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT DEFAULT NULL;

-- Optional: add a comment for clarity
COMMENT ON COLUMN orders.cancellation_reason IS 'Reason provided by admin when an order is cancelled — visible to the affiliate';
