import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft } from "lucide-react";
import { checkInAttendee, getAttendeeById } from "../lib/supabase";
import toast from "react-hot-toast";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const attendeeId = localStorage.getItem("attendeeId");
    if (!attendeeId) {
      navigate("/identify");
      return;
    }

    // Verify the staff member exists and has proper access
    getAttendeeById(attendeeId)
      .then((attendee) => {
        if (!attendee || attendee.role !== "staff") {
          navigate("/identify");
        }
      })
      .catch(() => {
        navigate("/identify");
      });

    const qrScanner = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
        videoConstraints: {
          facingMode: "environment",
        },
      },
      false
    );

    qrScanner.render(
      async (decodedText) => {
        try {
          const attendee = await getAttendeeById(decodedText);
          if (!attendee) {
            toast.error("Invalid QR code");
            return;
          }

          if (attendee.checked_in) {
            toast.error("Attendee is already checked in!");
            qrScanner.clear();
            return;
          }

          await checkInAttendee(decodedText);
          toast.success(`✅ ${attendee.name} has been checked in!`);
          qrScanner.clear();
        } catch (error) {
          console.error(error);
          toast.error("Failed to check in attendee");
        }
      },
      (error) => {
        console.error(error);
      }
    );

    setScanner(qrScanner);

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [navigate]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 flex items-center text-white hover:text-gray-200"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Admin
        </button>

        <div className="bg-white rounded-xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Check In Scanner
          </h1>
          <div id="reader" className="mb-4"></div>
          <p className="text-center text-gray-600">
            Point your camera at an attendee's QR code to check them in
          </p>
        </div>
      </div>
    </div>
  );
}
