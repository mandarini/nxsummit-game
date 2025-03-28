import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { requireStaffAccess } from "../lib/auth";
import { getAttendeeById } from "../lib/supabase";

interface StaffRouteProps {
  children: React.ReactNode;
}

export default function StaffRoute({ children }: StaffRouteProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const attendeeId = localStorage.getItem("attendeeId");
        const staffAccessGranted = localStorage.getItem("staff_access_granted");

        if (!attendeeId || staffAccessGranted !== "true") {
          setHasAccess(false);
          return;
        }

        const attendee = await getAttendeeById(attendeeId);
        if (
          !attendee ||
          (attendee.role !== "staff" && attendee.role !== "super_admin")
        ) {
          setHasAccess(false);
          return;
        }

        const access = await requireStaffAccess(attendee);
        setHasAccess(access);
      } catch (error) {
        console.error("Error checking staff access:", error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!hasAccess) {
    // Clear any potentially invalid staff access
    localStorage.removeItem("staff_access_granted");
    return <Navigate to="/identify" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
