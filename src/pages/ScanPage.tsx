import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, Scan, StopCircle } from "lucide-react";
import { getAttendeeById, recordScan, incrementPoints } from "../lib/supabase";
import toast from "react-hot-toast";

export default function ScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  const startScanning = () => {
    const attendeeId = localStorage.getItem("attendeeId");
    if (!attendeeId) {
      navigate("/identify");
      return;
    }

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

          // Stop scanning after successful scan
          stopScanning();
        } catch (error) {
          if (
            error instanceof Error &&
            error.message?.includes("scans_scanner_id_scanned_id_key")
          ) {
            toast.error("You've already scanned this person!");
            stopScanning();
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
          onClick={() => navigate("/ticket")}
          className="mb-6 flex items-center text-white hover:text-gray-200"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Ticket
        </button>

        <div className="bg-white rounded-xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Scan QR Code</h1>
          
          <div id="reader" className="mb-6"></div>

          <div className="flex justify-center">
            {!scanning ? (
              <button
                onClick={startScanning}
                className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Scan size={20} />
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
              ? "Point your camera at another attendee's QR code"
              : "Press Start Scanning to begin"}
          </p>
        </div>
      </div>
    </div>
  );
}