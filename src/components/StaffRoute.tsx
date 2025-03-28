import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { requireStaffAccess } from '../lib/auth';
import { getAttendeeById } from '../lib/supabase';
import type { Attendee } from '../lib/supabase';

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
        const attendeeId = localStorage.getItem('attendeeId');
        if (!attendeeId) {
          setHasAccess(false);
          return;
        }

        const attendee = await getAttendeeById(attendeeId);
        const access = await requireStaffAccess(attendee);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking staff access:', error);
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
    return <Navigate to="/identify" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}