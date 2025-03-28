import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft } from "lucide-react";
import { checkInAttendee, getAttendeeById } from "../lib/supabase";
import toast from "react-hot-toast";

// Define this outside your component
const SCANNER_ID = "reader";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

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

    const html5QrCode = new Html5Qrcode(SCANNER_ID);

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 5,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            if (scanning) return;

            setScanning(true);
            await html5QrCode.pause(); // ✅ stop scanning immediately

            try {
              const attendee = await getAttendeeById(decodedText);
              if (!attendee) {
                toast.error("Invalid QR code");
                setScanning(false);
                return;
              }

              if (attendee.checked_in) {
                toast.error("Attendee is already checked in!");
                setScanning(false);
                return;
              }

              await checkInAttendee(decodedText);
              toast.success(`✅ ${attendee.name} has been checked in!`);
            } catch (error) {
              console.error(error);
              toast.error("Failed to check in attendee");
            } finally {
              setScanning(false);
            }
          },
          (errorMessage) => {
            console.warn("QR Code scan error:", errorMessage);
          }
        );

        setScanner(html5QrCode);
      } catch (err) {
        console.error("Failed to start scanner", err);
      }
    };

    startScanner();

    return () => {
      html5QrCode.stop();
      html5QrCode.clear();
    };
  }, [navigate]);

  const resumeScan = async () => {
    if (!scanner) return;

    try {
      await scanner.resume();
    } catch (err) {
      console.error("Failed to resume scanner", err);
    }
  };

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
          <h1 className="text-2xl font-bold text-center mb-6">Check In Scanner</h1>
          <div id="reader" className="mb-4" style={{ height: "300px" }}></div>

          <p className="text-center text-gray-600 mb-4">
            Point your camera at an attendee's QR code to check them in
          </p>

          {scanner && !scanning && (
            <button
              className="block mx-auto bg-black text-white py-2 px-4 rounded"
              onClick={resumeScan}
            >
              Scan Another QR Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}