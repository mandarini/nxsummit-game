import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft } from "lucide-react";
import { getAttendeeById, recordScan, incrementPoints } from "../lib/supabase";
import toast from "react-hot-toast";

export default function ScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const attendeeId = localStorage.getItem("attendeeId");
    if (!attendeeId) {
      navigate("/identify");
      return;
    }

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      },
      /* verbose */ true
    );

    scanner.render(
      async (decodedText) => {
        if (scanning) return;
        setScanning(true);

        try {
          if (decodedText === attendeeId) {
            toast.error("You can't scan your own QR code!");
            return;
          }

          const scannedAttendee = await getAttendeeById(decodedText);
          if (!scannedAttendee) {
            toast.error("Invalid QR code");
            return;
          }

          await recordScan(attendeeId, decodedText);
          await incrementPoints(attendeeId, scannedAttendee.value);

          toast.success(
            `🎉 You scanned ${scannedAttendee.name}! +${scannedAttendee.value} point(s)`
          );
        } catch (error: any) {
          if (error.message?.includes("scans_scanner_id_scanned_id_key")) {
            toast.error("You've already scanned this person!");
          } else {
            toast.error("Failed to record scan");
          }
        } finally {
          setScanning(false);
        }
      },
      (error) => {
        console.error(error);
      }
    );

    return () => {
      scanner.clear();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate("/ticket")}
          className="mb-6 flex items-center text-white hover:text-gray-200"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Ticket
        </button>

        <div className="bg-white rounded-xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Scan QR Code</h1>
          <div
            id="reader"
            className="mb-4"
            style={{ width: "100%", height: "300px" }}
          ></div>
          <p className="text-center text-gray-600">
            Point your camera at another attendee's QR code to collect points!
          </p>
        </div>
      </div>
    </div>
  );
}
