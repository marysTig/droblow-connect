ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS selling_price numeric,
ADD COLUMN IF NOT EXISTS commission numeric,
ADD COLUMN IF NOT EXISTS delivery_type text,
ADD COLUMN IF NOT EXISTS delivery_price numeric;
