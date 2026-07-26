-- Add id_commande_review column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS id_commande_review text;
