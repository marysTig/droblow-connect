-- Add payout details to affiliates table
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS payout_method text,
ADD COLUMN IF NOT EXISTS account_number text;
