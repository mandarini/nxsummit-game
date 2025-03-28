import { supabase } from "./supabase";
import type { Attendee } from "./supabase";

export async function isStaffMember(email: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-staff`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();
    return data.success && data.isStaff;
  } catch (error) {
    console.error("Error checking staff status:", error);
    return false;
  }
}

export async function verifyStaffPassword(password: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-staff-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ password }),
      }
    );

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error verifying staff password:", error);
    return false;
  }
}

// Helper functions that rely on server-verified status
export async function requireStaffAccess(
  attendee: Attendee | null
): Promise<boolean> {
  if (!attendee?.email) return false;

  const stored = localStorage.getItem("staff_access_granted");
  if (stored === "true") {
    // Verify the stored access is still valid
    const isStaff = await isStaffMember(attendee.email);
    if (!isStaff) {
      localStorage.removeItem("staff_access_granted");
      return false;
    }
    return true;
  }

  const isStaff = await isStaffMember(attendee.email);
  if (!isStaff) return false;

  const password = prompt("Please enter staff password to continue");
  if (!password) return false;

  const success = await verifyStaffPassword(password);
  if (success) {
    localStorage.setItem("staff_access_granted", "true");
    return true;
  } else {
    alert("Invalid password");
    return false;
  }
}

export function isStaff(attendee: Attendee | null): boolean {
  return attendee?.role === "staff" || attendee?.role === "super_admin";
}

export function isSuperAdmin(attendee: Attendee | null): boolean {
  return attendee?.role === "super_admin";
}

export async function isGameOn(): Promise<boolean> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "game_on")
    .single();

  if (error) {
    console.error("Failed to load game toggle:", error);
    return false;
  }

  return data?.value ?? false;
}

export async function toggleGame(value: boolean): Promise<boolean> {
  try {
    const attendeeId = localStorage.getItem("attendeeId");
    if (!attendeeId) return false;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/toggle-game`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ value, attendeeId }),
      }
    );

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error toggling game:", error);
    return false;
  }
}
