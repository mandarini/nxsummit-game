import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, QrCode, StopCircle } from "lucide-react";
import { checkInAttendee, getAttendeeById } from "../lib/supabase";
import toast from "react-hot-toast";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
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
  }, [navigate]);

  const startScanning = () => {
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
        rememberLastUsedCamera: false,
      },
      false
    );

    qrScanner.render(
      async (decodedText) => {
        if (scanning) return;
        setScanning(true);

        try {
          const attendee = await getAttendeeById(decodedText);
          if (!attendee) {
            toast.error("Invalid QR code");
            return;
          }

          if (attendee.checked_in) {
            toast.error("Attendee is already checked in!");
            stopScanning();
            return;
          }

          await checkInAttendee(decodedText);
          toast.success(`✅ ${attendee.name} has been checked in!`);
          stopScanning();
        } catch (error) {
          console.error(error);
          toast.error("Failed to check in attendee");
        } finally {
          setScanning(false);
        }
      },
      (error) => {
        console.error(error);
      }
    );

    setScanner(qrScanner);
    setScanning(true);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear().catch(console.error);
      setScanner(null);
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [scanner]);

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

          <div id="reader" className="mb-6"></div>

          <div className="flex justify-center">
            {!scanning ? (
              <button
                onClick={startScanning}
                className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <QrCode size={20} />
                <span>Start Scanning</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                <StopCircle size={20} />
                <span>Stop Scanning</span>
              </button>
            )}
          </div>

          <p className="text-center text-gray-600 mt-4">
            {scanning
              ? "Point your camera at an attendee's QR code"
              : "Press Start Scanning to begin"}
          </p>
        </div>
      </div>
    </div>
  );
}
