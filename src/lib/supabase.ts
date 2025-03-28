import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Attendee {
  id: string;
  email: string;
  name: string;
  checked_in: boolean;
  points: number;
  value: number;
  role: "attendee" | "staff" | "super_admin";
  created_at: string;
}

export interface Scan {
  id: string;
  scanner_id: string;
  scanned_id: string;
  timestamp: string;
}

export async function getAttendeeByEmail(
  email: string
): Promise<Attendee | null> {
  const { data, error } = await supabase
    .from("attendees")
    .select()
    .eq("email", email)
    .single();

  if (error) throw error;
  return data;
}

export async function getAttendeeById(id: string): Promise<Attendee | null> {
  const { data, error } = await supabase
    .from("attendees")
    .select()
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function recordScan(
  scannerId: string,
  scannedId: string
): Promise<void> {
  const { error } = await supabase.from("scans").insert([
    {
      scanner_id: scannerId,
      scanned_id: scannedId,
    },
  ]);

  if (error) throw error;
}

export async function incrementPoints(
  attendeeId: string,
  points: number
): Promise<void> {
  const { error } = await supabase.rpc("increment_points", {
    p_attendee_id: attendeeId,
    p_points: points,
  });

  if (error) throw error;
}

export async function checkInAttendee(attendeeId: string): Promise<void> {
  const { error } = await supabase
    .from("attendees")
    .update({ checked_in: true })
    .eq("id", attendeeId);

  if (error) throw error;
}
