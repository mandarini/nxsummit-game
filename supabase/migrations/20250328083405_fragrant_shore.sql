/*
  # Initial Schema Setup for Nx Summit Game

  1. New Tables
    - `attendees`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `checked_in` (boolean, default false)
      - `points` (integer, default 0)
      - `value` (integer, default 1)
      - `created_at` (timestamptz)
    - `scans`
      - `id` (uuid, primary key)
      - `scanner_id` (uuid, foreign key)
      - `scanned_id` (uuid, foreign key)
      - `timestamp` (timestamptz)

  2. Indexes
    - Email lookup optimization
    - Scan analytics indexes

  3. Security
    - Enable RLS on both tables
    - Public read access policies
    - Controlled scan creation policy
    - Public update policy for attendees
    - Secure points increment function
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

-- Optional: for faster email lookup
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

-- Optional: for scan analytics/performance
CREATE INDEX IF NOT EXISTS scans_scanner_id_idx ON scans(scanner_id);
CREATE INDEX IF NOT EXISTS scans_scanned_id_idx ON scans(scanned_id);

-- ============================
-- RLS: Enable row-level security
-- ============================

ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- ============================
-- RLS Policies
-- ============================

-- 🟢 Allow public read access
CREATE POLICY "Allow public read access to attendees"
  ON attendees
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to scans"
  ON scans
  FOR SELECT
  TO public
  USING (true);

-- 🟡 Allow public scan creation only if:
-- - scanner and scanned are different
-- - scanner is a checked-in attendee
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

-- 🟡 Allow public updates to points/check-in (if not using service role)
-- You can tighten this to use Supabase service role only
CREATE POLICY "Allow public updates to attendees"
  ON attendees
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

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