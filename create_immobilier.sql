-- Drop the table and recreate it with the exact CSV headers from the user
DROP TABLE IF EXISTS public.immobilier_products;

CREATE TABLE public.immobilier_products (
  id           text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  category     text,
  title        text,
  phone        text,
  type         text,
  location     text,
  price        text,
  rooms        text,
  surface_m2   text,
  detail_url   text,
  image_url    text,
  created_at   timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.immobilier_products ENABLE ROW LEVEL SECURITY;

-- Policy: admin full access
CREATE POLICY "Admin full access immobilier" ON public.immobilier_products
  FOR ALL USING (true) WITH CHECK (true);
