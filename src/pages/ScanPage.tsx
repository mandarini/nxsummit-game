import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { ArrowLeft } from "lucide-react";
import {
  getAttendeeById,
  recordScan,
  incrementPoints,
  getBonusCode,
  claimBonusPoints,
} from "../lib/supabase";
import toast from "react-hot-toast";

const SCANNER_ID = "reader";

export default function ScanPage() {
  const navigate = useNavigate();
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);

  useEffect(() => {
    const attendeeId = localStorage.getItem("attendeeId");
    if (!attendeeId) {
      navigate("/identify");
      return;
    }

    // Verify the attendee exists and is checked in
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

    const html5QrCode = new Html5Qrcode(SCANNER_ID, {
      verbose: false,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    });
    setScanner(html5QrCode);

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            if (scanning) return;

            setScanning(true);
            try {
              await html5QrCode.pause();

              if (decodedText === attendeeId) {
                toast.error("You can't scan your own QR code!");
                setScanning(false);
                return;
              }

              // First try to match as an attendee
              const scannedAttendee = await getAttendeeById(decodedText);

              if (scannedAttendee) {
                try {
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
                }
              } else {
                // Try to match as a bonus code
                const bonusCode = await getBonusCode(decodedText);

                if (bonusCode) {
                  const claimed = await claimBonusPoints(
                    attendeeId,
                    decodedText
                  );
                  if (claimed) {
                    toast.success(
                      `🎉 Bonus points claimed! +${bonusCode.points} points\n${bonusCode.description}`
                    );
                  } else {
                    toast.error(
                      "This bonus code has already been claimed or reached its limit!"
                    );
                  }
                } else {
                  toast.error("Invalid QR code");
                }
              }
            } finally {
              setScanning(false);
            }
          },
          () => {} // Silent error handling
        );

        setScannerStarted(true);
      } catch (err) {
        console.error("Failed to start scanner", err);
        toast.error("Failed to start camera. Please check permissions.");
      }
    };

    startScanner();

    return () => {
      if (scannerStarted) {
        html5QrCode.stop().catch(() => {});
      }
      try {
        html5QrCode.clear();
      } catch (error) {
        console.error("Failed to clear scanner", error);
      }
    };
  }, [navigate, scannerStarted, scanning]);

  const resumeScan = async () => {
    if (!scanner) return;

    try {
      setIsActive(true);
      await scanner.resume();
      setTimeout(() => setIsActive(false), 200);
    } catch (err) {
      console.error("Failed to resume scanner", err);
      setIsActive(false);
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

          <p className="text-center text-gray-600 mb-4">
            Point your camera at another attendee's QR code to collect points!
          </p>

          <div className="mb-6">
            <div
              id={SCANNER_ID}
              className="overflow-hidden rounded-lg"
              style={{
                width: "100%",
                maxWidth: "100%",
                height: "300px",
              }}
            ></div>
          </div>

          <div className="mt-6">
            {scanner && !scanning && (
              <button
                className={`w-full bg-black text-white py-3 px-4 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "transform scale-95 bg-gray-800 ring-2 ring-purple-500 ring-offset-2"
                    : "hover:bg-gray-800 hover:shadow-lg"
                }`}
                onClick={resumeScan}
              >
                Scan Another QR Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
