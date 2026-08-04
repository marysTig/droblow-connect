-- Add immobilier_unlocked column to affiliates table
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS immobilier_unlocked boolean DEFAULT false;

-- Allow admins to update the affiliates table (required to activate accounts)
DROP POLICY IF EXISTS "Admins can update affiliates" ON public.affiliates;

CREATE POLICY "Admins can update affiliates"
ON public.affiliates
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.admins
        WHERE id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admins
        WHERE id = auth.uid()
    )
);
