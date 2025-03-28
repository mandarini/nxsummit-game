import React from "react";
import {
  Download,
  RefreshCcw,
  QrCode,
  Power,
  Gift,
  Ticket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Attendee } from "../../lib/supabase";

interface AdminActionsProps {
  currentUser: Attendee | null;
  gameEnabled: boolean;
  isSuperAdmin: (user: Attendee | null) => boolean;
  onGameToggle: () => Promise<void>;
  onRefresh: () => void;
  onExport: () => void;
}

export default function AdminActions({
  currentUser,
  gameEnabled,
  isSuperAdmin,
  onGameToggle,
  onRefresh,
  onExport,
}: AdminActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {isSuperAdmin(currentUser) && (
        <>
          <button
            onClick={onGameToggle}
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              gameEnabled
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white`}
          >
            <Power size={18} className="mr-2" />
            {gameEnabled ? "Disable Game" : "Enable Game"}
          </button>
          <button
            onClick={() => navigate("/raffle")}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
          >
            <Gift size={18} className="mr-2" />
            Raffle
          </button>
        </>
      )}
      <button
        onClick={() => navigate("/checkin")}
        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
      >
        <QrCode size={18} className="mr-2" />
        Check-in
      </button>
      <button
        onClick={onRefresh}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        <RefreshCcw size={18} className="mr-2" />
        Refresh
      </button>
      <button
        onClick={onExport}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
      >
        <Download size={18} className="mr-2" />
        Export
      </button>
      <button
        onClick={() => navigate("/ticket")}
        className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
      >
        <Ticket size={18} className="mr-2" />
        My Ticket
      </button>
    </div>
  );
}
