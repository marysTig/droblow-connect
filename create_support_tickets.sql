-- =========================================================
-- Support Tickets Table
-- Run this in your Supabase SQL Editor
-- =========================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  affiliate_name TEXT,
  affiliate_email TEXT,
  subject     TEXT        NOT NULL,
  description TEXT        NOT NULL,
  status      TEXT        DEFAULT 'open'
                          CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_reply TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "affiliates_read_own_tickets"  ON support_tickets;
DROP POLICY IF EXISTS "affiliates_insert_own_tickets" ON support_tickets;
DROP POLICY IF EXISTS "admin_all_tickets"             ON support_tickets;

-- Affiliés : lecture de leurs propres tickets
CREATE POLICY "affiliates_read_own_tickets"
  ON support_tickets FOR SELECT
  USING (affiliate_id = auth.uid());

-- Affiliés : insertion de leurs propres tickets
CREATE POLICY "affiliates_insert_own_tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (affiliate_id = auth.uid());

-- Create a secure function to check admin role (bypasses affiliates RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM affiliates
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Admin : accès complet
CREATE POLICY "admin_all_tickets"
  ON support_tickets FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER set_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
