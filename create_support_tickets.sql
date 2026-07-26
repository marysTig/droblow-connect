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

-- Admin : accès complet (basé sur le champ is_admin dans les métadonnées ou email admin)
-- Ajustez la condition selon votre logique admin (ici on autorise tous les utilisateurs authentifiés à lire pour l'admin)
CREATE POLICY "admin_all_tickets"
  ON support_tickets FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin') = 'true'
    OR affiliate_id = auth.uid()
  );

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
