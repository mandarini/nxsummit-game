import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, type Attendee } from "../lib/supabase";
import { isSuperAdmin, isGameOn, toggleGame } from "../lib/auth";
import toast from "react-hot-toast";
import AdminHeader from "../components/admin/AdminHeader";
import AdminActions from "../components/admin/AdminActions";
import AttendeesTable from "../components/admin/AttendeesTable";

export default function AdminPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Attendee | null>(null);
  const [gameEnabled, setGameEnabled] = useState(false);
  const navigate = useNavigate();

  async function loadAttendees() {
    try {
      const { data, error } = await supabase
        .from("attendees")
        .select("*")
        .order("points", { ascending: false });

      if (error) throw error;
      setAttendees(data || []);
    } catch (error) {
      console.error("Failed to load attendees:", error);
      toast.error("Failed to load attendees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const attendeeId = localStorage.getItem("attendeeId");
    if (!attendeeId) {
      navigate("/identify");
      return;
    }

    // Load current user and game state
    Promise.all([
      supabase.from("attendees").select().eq("id", attendeeId).single(),
      isGameOn(),
    ])
      .then(([{ data: attendee }, gameState]) => {
        setCurrentUser(attendee);
        setGameEnabled(gameState);
        loadAttendees();
      })
      .catch(() => {
        navigate("/identify");
      });
  }, [navigate]);

  const handleGameToggle = async () => {
    const newState = !gameEnabled;
    const success = await toggleGame(newState);

    if (success) {
      setGameEnabled(newState);
      toast.success(`Game is now ${newState ? "enabled" : "disabled"}`);
    } else {
      toast.error("Failed to update game state");
    }
  };

  const addPoints = async (attendeeId: string, points: number) => {
    try {
      const { error } = await supabase.rpc("increment_points", {
        p_attendee_id: attendeeId,
        p_points: points,
      });

      if (error) throw error;

      toast.success(`Added ${points} points successfully!`);
      loadAttendees();
    } catch (error) {
      console.error("Failed to add points:", error);
      toast.error("Failed to add points");
    }
  };

  const exportCsv = () => {
    const headers = ["Name", "Email", "Points", "Checked In", "Value"];
    const csvContent = [
      headers.join(","),
      ...attendees.map((a) =>
        [a.name, a.email, a.points, a.checked_in ? "Yes" : "No", a.value].join(
          ","
        )
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nx-summit-attendees.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
          <AdminHeader title="Admin Dashboard" />
          <AdminActions
            currentUser={currentUser}
            gameEnabled={gameEnabled}
            isSuperAdmin={isSuperAdmin}
            onGameToggle={handleGameToggle}
            onRefresh={loadAttendees}
            onExport={exportCsv}
          />
        </div>

        <AttendeesTable attendees={attendees} onAddPoints={addPoints} />
      </div>
    </div>
  );
}
