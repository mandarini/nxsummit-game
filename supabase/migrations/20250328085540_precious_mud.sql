/*
  # Add role column to attendees table

  1. Changes
    - Add `role` column to `attendees` table with default value 'attendee'
    - Update existing rows to have the default role
    - Make the column non-nullable

  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attendees' AND column_name = 'role'
  ) THEN
    ALTER TABLE attendees 
    ADD COLUMN role text DEFAULT 'attendee' NOT NULL;
  END IF;
END $$;