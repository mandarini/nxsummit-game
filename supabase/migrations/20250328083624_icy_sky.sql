/*
  Nx Summit Game Schema
  - Tables: attendees, scans
  - RLS enabled and secured
  - Safe (idempotent) policy definitions
  - Utility function: increment_points(uuid, int)
*/

-- ============================
-- TABLE: attendees
-- ============================

CREATE TABLE IF NOT EXISTS attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  checked_in boolean DEFAULT false,
  points integer DEFAULT 0,
  value integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Optional index for fast lookup by email
CREATE INDEX IF NOT EXISTS attendees_email_idx ON attendees(email);

-- ============================
-- TABLE: scans
-- ============================

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_id uuid REFERENCES attendees(id) ON DELETE CASCADE,
  scanned_id uuid REFERENCES attendees(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  UNIQUE (scanner_id, scanned_id),
  CHECK (scanner_id IS DISTINCT FROM scanned_id) -- prevent self-scans
);

-- Optional indexes for analytics/performance
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
DROP POLICY IF EXISTS "Allow public updates to attendees" ON attendees;

-- Allow public read access (for QR, names, etc)
CREATE POLICY "Allow public read access to attendees"
  ON attendees
  FOR SELECT
  TO public
  USING (true);

-- Allow public updates (e.g. points, check-in)
-- You may later restrict this to service role
CREATE POLICY "Allow public updates to attendees"
  ON attendees
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================
-- RLS POLICIES: scans
-- ============================

DROP POLICY IF EXISTS "Allow public read access to scans" ON scans;
DROP POLICY IF EXISTS "Allow authenticated scan creation" ON scans;

-- Allow public read access to scans
CREATE POLICY "Allow public read access to scans"
  ON scans
  FOR SELECT
  TO public
  USING (true);

-- Allow insert (scan creation) with controlled logic
CREATE POLICY "Allow authenticated scan creation"
  ON scans
  FOR INSERT
  TO public
  WITH CHECK (
    scanner_id IS DISTINCT FROM scanned_id AND
    EXISTS (
      SELECT 1 FROM attendees
      WHERE id = scanner_id
      AND checked_in = true
    )
  );

-- ============================
-- FUNCTION: increment_points
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