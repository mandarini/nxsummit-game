import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Trophy, QrCode, Scan, Home } from "lucide-react";
import {
  getAttendeeByEmail,
  getAttendeeById,
  type Attendee,
} from "../lib/supabase";
import toast from "react-hot-toast";

export default function TicketPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendee() {
      try {
        const id = searchParams.get("id");
        const email = searchParams.get("email");
        const storedId = localStorage.getItem("attendeeId");

        let foundAttendee: Attendee | null = null;

        if (id) {
          foundAttendee = await getAttendeeById(id);
          if (foundAttendee) {
            localStorage.setItem("attendeeId", id);
          }
        } else if (email) {
          foundAttendee = await getAttendeeByEmail(email);
          if (foundAttendee) {
            localStorage.setItem("attendeeId", foundAttendee.id);
          }
        } else if (storedId) {
          foundAttendee = await getAttendeeById(storedId);
        }

        if (!foundAttendee) {
          navigate("/identify");
          return;
        }

        setAttendee(foundAttendee);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load ticket information");
      } finally {
        setLoading(false);
      }
    }

    loadAttendee();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!attendee) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <button
        onClick={() => {
          localStorage.removeItem("attendeeId");
          localStorage.removeItem("isStaff");
          navigate("/identify");
        }}
        className="absolute top-4 left-4 text-white/50 hover:text-white flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
        title="Sign in as someone else"
      >
        <Home size={18} />
        <span className="text-sm">Switch User</span>
      </button>
      
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Nx Summit Ticket
          </h1>
          <p className="text-gray-600">{attendee.name}</p>
          <p className="text-gray-500 text-sm">{attendee.email}</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="p-4 bg-gray-50 rounded-lg">
            <QRCodeSVG value={attendee.id} size={200} />
          </div>
        </div>

        <div className="space-y-4">
          {attendee.checked_in && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Trophy className="text-yellow-500 mr-3" size={24} />
                <div>
                  <p className="font-medium">Points</p>
                  <p className="text-gray-500 text-sm">Your current score</p>
                </div>
              </div>
              <span className="text-2xl font-bold">{attendee.points}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <QrCode className="text-purple-500 mr-3" size={24} />
              <div>
                <p className="font-medium">Status</p>
                {!attendee.checked_in && (
                  <p className="text-gray-500 text-sm">Check-in required</p>
                )}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                attendee.checked_in
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {attendee.checked_in ? "Checked In" : "Not Checked In"}
            </span>
          </div>

          {attendee.checked_in && (
            <button
              onClick={() => navigate("/scan")}
              className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Scan size={20} />
              <span>Start Scanning</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}