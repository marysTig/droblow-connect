-- Add subcategories to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS subcategories text[] DEFAULT '{}';

-- Add subcategory to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory text;
