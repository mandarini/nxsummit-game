import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft } from "lucide-react";
import { getAttendeeById, recordScan, incrementPoints } from "../lib/supabase";
import toast from "react-hot-toast";

// Define this outside your component
const SCANNER_ID = "reader";

export default function ScanPage() {
  const navigate = useNavigate();
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const attendeeId = localStorage.getItem("attendeeId");
    if (!attendeeId) {
      navigate("/identify");
      return;
    }

    // Verify the attendee exists
    getAttendeeById(attendeeId)
      .then((attendee) => {
        if (!attendee) {
          navigate("/identify");
        } else if (!attendee.checked_in) {
          navigate("/ticket");
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

            if (decodedText === attendeeId) {
              toast.error("You can't scan your own QR code!");
              setScanning(false);
              return;
            }

            try {
              const scannedAttendee = await getAttendeeById(decodedText);
              if (!scannedAttendee) {
                toast.error("Invalid QR code");
                setScanning(false);
                return;
              }

              await recordScan(attendeeId, decodedText);
              await incrementPoints(attendeeId, scannedAttendee.value);

              toast.success(
                `🎉 You scanned ${scannedAttendee.name}! +${scannedAttendee.value} point(s)`
              );
            } catch (error) {
              if (
                error instanceof Error &&
                error.message?.includes("scans_scanner_id_scanned_id_key")
              ) {
                toast.error("You've already scanned this person!");
              } else {
                toast.error("Failed to record scan");
              }
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
          onClick={() => navigate("/ticket")}
          className="mb-6 flex items-center text-white hover:text-gray-200"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Ticket
        </button>

        <div className="bg-white rounded-xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Scan QR Code</h1>
          <div id="reader" className="mb-4" style={{ height: "300px" }}></div>

          <p className="text-center text-gray-600 mb-4">
            Point your camera at another attendee's QR code to collect points!
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