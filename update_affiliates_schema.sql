-- Add missing profile and payment details to affiliates table
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS wilaya text,
ADD COLUMN IF NOT EXISTS commune text,
ADD COLUMN IF NOT EXISTS payout_method text,
ADD COLUMN IF NOT EXISTS account_number text;

-- Enable RLS for the affiliates table (if not already enabled)
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Drop existing update policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own affiliate profile" ON public.affiliates;

-- Allow users to update their own affiliate profile
CREATE POLICY "Users can update their own affiliate profile" 
ON public.affiliates 
FOR UPDATE 
USING (auth.uid() = id);
