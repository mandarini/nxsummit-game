/*
  # Initial Schema for Nx Summit Game

  1. New Tables
    - `attendees`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `checked_in` (boolean)
      - `points` (integer)
      - `value` (integer)
    - `scans`
      - `id` (uuid, primary key)
      - `scanner_id` (uuid, foreign key)
      - `scanned_id` (uuid, foreign key)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for controlled write access
*/

-- Create attendees table
CREATE TABLE IF NOT EXISTS attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  checked_in boolean DEFAULT false,
  points integer DEFAULT 0,
  value integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_id uuid REFERENCES attendees(id),
  scanned_id uuid REFERENCES attendees(id),
  timestamp timestamptz DEFAULT now(),
  UNIQUE(scanner_id, scanned_id)
);

-- Enable RLS
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Policies for attendees
CREATE POLICY "Allow public read access to attendees"
  ON attendees
  FOR SELECT
  TO public
  USING (true);

-- Policies for scans
CREATE POLICY "Allow public read access to scans"
  ON scans
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated scan creation"
  ON scans
  FOR INSERT
  TO public
  WITH CHECK (
    scanner_id != scanned_id AND
    EXISTS (
      SELECT 1 FROM attendees
      WHERE id = scanner_id
      AND checked_in = true
    )
  );

-- Function to increment points
CREATE OR REPLACE FUNCTION increment_points(
  p_attendee_id uuid,
  p_points integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE attendees
  SET points = points + p_points
  WHERE id = p_attendee_id;
END;
$$;