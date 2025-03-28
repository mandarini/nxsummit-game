import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { ArrowLeft } from "lucide-react";
import { checkInAttendee, getAttendeeById } from "../lib/supabase";
import { requireStaffAccess } from "../lib/auth";
import toast from "react-hot-toast";

const SCANNER_ID = "reader";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);

  useEffect(() => {
    const attendeeId = localStorage.getItem("attendeeId");
    const staffAccessGranted = localStorage.getItem("staff_access_granted");

    if (!attendeeId || staffAccessGranted !== "true") {
      navigate("/identify");
      return;
    }

    // Verify the staff member exists and has proper access
    getAttendeeById(attendeeId)
      .then(async (attendee) => {
        if (!attendee) {
          navigate("/identify");
          return;
        }

        const hasAccess = await requireStaffAccess(attendee);
        if (!hasAccess) {
          navigate("/identify");
          return;
        }

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
                  console.error("Failed to check in attendee", error);
                  toast.error("Failed to check in attendee");
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
      })
      .catch(() => {
        navigate("/identify");
      });

    return () => {
      if (scanner) {
        if (scannerStarted) {
          scanner.stop().catch(() => {});
        }
        try {
          scanner.clear();
        } catch (err) {
          console.error("Failed to clear scanner", err);
        }
      }
    };
  }, [navigate, scanner, scanning, scannerStarted]);

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

          <p className="text-center text-gray-600 mb-4">
            Point your camera at an attendee's QR code to check them in
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
