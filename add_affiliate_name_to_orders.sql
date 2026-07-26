-- Add affiliate_name to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS affiliate_name text;

-- If you want to backfill existing orders with their affiliate names:
-- UPDATE public.orders o
-- SET affiliate_name = a.name
-- FROM public.affiliates a
-- WHERE o.affiliate_id = a.id AND o.affiliate_name IS NULL;
