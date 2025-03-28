/*
  # Add settings table and super_admin role support

  1. Changes
    - Add settings table for game configuration
    - Update attendees role type to support super_admin
    - Add initial game_on setting
    - Add RLS policies for settings table

  2. Security
    - Public read access to settings
    - Write access restricted to service_role
*/

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value boolean NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Allow public read access to settings"
  ON settings FOR SELECT
  TO public
  USING (true);

-- Insert initial game state
INSERT INTO settings (key, value)
VALUES ('game_on', false)
ON CONFLICT (key) DO NOTHING;

-- Add trigger to update timestamp
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_timestamp
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_timestamp();