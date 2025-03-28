/*
  # Add role column and update policies
  
  1. Changes
    - Add role column to attendees table
    - Update RLS policies to restrict updates to service role
  
  2. Security
    - Restrict updates to service role only
    - Maintain public read access
*/

-- ============================
-- 1. TABLE: attendees (updated)
-- ============================

CREATE TABLE IF NOT EXISTS attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  checked_in boolean DEFAULT false,
  points integer DEFAULT 0,
  value integer DEFAULT 1,
  role text DEFAULT 'attendee', -- 'attendee' or 'staff'
  created_at timestamptz DEFAULT now()
);

-- Index for fast email lookup
CREATE INDEX IF NOT EXISTS attendees_email_idx ON attendees(email);

-- ============================
-- TABLE: scans (unchanged)
-- ============================

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_id uuid REFERENCES attendees(id) ON DELETE CASCADE,
  scanned_id uuid REFERENCES attendees(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  UNIQUE (scanner_id, scanned_id),
  CHECK (scanner_id IS DISTINCT FROM scanned_id)
);

CREATE INDEX IF NOT EXISTS scans_scanner_id_idx ON scans(scanner_id);
CREATE INDEX IF NOT EXISTS scans_scanned_id_idx ON scans(scanned_id);

-- ============================
-- ENABLE RLS
-- ============================

ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- ============================
-- RLS POLICIES: attendees
-- ============================

DROP POLICY IF EXISTS "Allow public read access to attendees" ON attendees;
DROP POLICY IF EXISTS "Allow updates by service role only" ON attendees;

CREATE POLICY "Allow public read access to attendees"
  ON attendees FOR SELECT TO public USING (true);

CREATE POLICY "Allow updates by service role only"
  ON attendees FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- ============================
-- RLS POLICIES: scans
-- ============================

DROP POLICY IF EXISTS "Allow public read access to scans" ON scans;
DROP POLICY IF EXISTS "Allow authenticated scan creation" ON scans;

CREATE POLICY "Allow public read access to scans"
  ON scans FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated scan creation"
  ON scans FOR INSERT TO public
  WITH CHECK (
    scanner_id IS DISTINCT FROM scanned_id AND
    EXISTS (
      SELECT 1 FROM attendees
      WHERE id = scanner_id AND checked_in = true
    )
  );

-- ============================
-- Function: increment_points
-- ============================

CREATE OR REPLACE FUNCTION increment_points(
  p_attendee_id uuid,
  p_points integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Points must be greater than zero';
  END IF;

  UPDATE attendees
  SET points = points + p_points
  WHERE id = p_attendee_id;
END;
$$;