import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  Html5QrcodeScannerState,
} from "html5-qrcode";
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
  const [isScanning, setIsScanning] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerPaused, setScannerPaused] = useState(false);

  useEffect(() => {
    const attendeeId = localStorage.getItem("attendeeId");
    if (!attendeeId) {
      navigate("/identify");
      return;
    }

    // Validate attendee
    getAttendeeById(attendeeId)
      .then((attendee) => {
        if (!attendee) {
          navigate("/identify");
        } else if (!attendee.checked_in) {
          navigate("/ticket");
        }
      })
      .catch(() => navigate("/identify"));

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
            if (isScanning || scannerPaused) return;
            setIsScanning(true);

            try {
              // 🛑 Pause only if it's scanning
              if (
                html5QrCode.getState &&
                html5QrCode.getState() === Html5QrcodeScannerState.SCANNING
              ) {
                await html5QrCode.pause();
                setScannerPaused(true);
              }

              if (decodedText === attendeeId) {
                toast.error("You can't scan your own QR code!");
                return;
              }

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
                const bonusCode = await getBonusCode(decodedText);
                if (bonusCode) {
                  const claimed = await claimBonusPoints(
                    attendeeId,
                    decodedText
                  );
                  if (claimed) {
                    toast.success(
                      `🎉 Bonus claimed! +${bonusCode.points} points\n${bonusCode.description}`
                    );
                  } else {
                    toast.error("Bonus code already claimed or maxed out.");
                  }
                } else {
                  toast.error("Invalid QR code");
                }
              }
            } finally {
              setIsScanning(false);
            }
          },
          () => {
            // Silent error handling
          }
        );

        setScannerReady(true);
      } catch (err) {
        console.error("Failed to start scanner", err);
        toast.error("Could not access camera. Check browser permissions.");
      }
    };

    startScanner();

    return () => {
      if (scannerReady) {
        html5QrCode.stop().catch(() => {});
      }
      try {
        html5QrCode.clear();
      } catch (error) {
        console.error("Failed to clear scanner", error);
      }
    };
  }, [navigate]);

  const resumeScan = async () => {
    if (!scanner) return;

    try {
      await scanner.resume();
      setScannerPaused(false);
    } catch (err) {
      console.error("Failed to resume scanner", err);
      toast.error("Failed to resume scanner");
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
            Point your camera at another attendee’s QR code to collect points!
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

          {scanner && scannerPaused && (
            <button
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-all"
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
