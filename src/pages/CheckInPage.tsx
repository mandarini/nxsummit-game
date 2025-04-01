import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { ArrowLeft } from "lucide-react";
import { checkInAttendee, getAttendeeById } from "../lib/supabase";
import { requireStaffAccess } from "../lib/auth";
import toast from "react-hot-toast";

const SCANNER_ID = "reader";

export default function CheckInPage() {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [resumable, setResumable] = useState(false);

  // Authenticate and initialize scanner
  useEffect(() => {
    const init = async () => {
      const attendeeId = localStorage.getItem("attendeeId");
      const staffAccessGranted = localStorage.getItem("staff_access_granted");

      if (!attendeeId || staffAccessGranted !== "true") {
        navigate("/identify");
        return;
      }

      const attendee = await getAttendeeById(attendeeId);
      if (!attendee || !(await requireStaffAccess(attendee))) {
        navigate("/identify");
        return;
      }

      const html5QrCode = new Html5Qrcode(SCANNER_ID, {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });

      scannerRef.current = html5QrCode;

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
              await scannerRef.current?.pause();

              const attendee = await getAttendeeById(decodedText);
              if (!attendee) {
                toast.error("Invalid QR code");
              } else if (attendee.checked_in) {
                toast.error("Attendee is already checked in!");
              } else {
                await checkInAttendee(decodedText);
                toast.success(`✅ ${attendee.name} has been checked in!`);
              }
              setResumable(true);
            } catch (error) {
              console.error("Failed to check in attendee", error);
              toast.error("Failed to check in attendee");
              setResumable(true);
            } finally {
              setScanning(false);
            }
          },
          () => {} // Silent scan errors
        );

        setScannerReady(true);
      } catch (err) {
        console.error("Failed to start scanner", err);
        toast.error("Failed to start camera. Please check permissions.");
      }
    };

    init();

    return () => {
      const scanner = scannerRef.current;
      if (scanner?.isScanning) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch((err) => {
            console.error("Error stopping scanner on unmount", err);
          });
      } else if (scanner) {
        try {
          scanner.clear();
        } catch (err) {
          console.error("Error clearing scanner on unmount", err);
        }
      }
    };
  }, [navigate]);

  const resumeScan = async () => {
    if (!scannerRef.current) return;

    try {
      setResumable(false);
      await scannerRef.current.resume();
    } catch (err) {
      console.error("Failed to resume scanner", err);
      toast.error("Failed to resume scanner");
      setResumable(true);
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
            Point your camera at an attendee's QR code to check them in.
          </p>

          <div className="mb-6">
            <div
              id={SCANNER_ID}
              className="overflow-hidden rounded-lg"
              style={{ width: "100%", height: "300px" }}
            ></div>
          </div>

          {scannerReady && resumable && (
            <button
              onClick={resumeScan}
              className="w-full bg-black text-white py-3 px-4 rounded-lg transition-all duration-200 hover:bg-gray-800 hover:shadow-lg"
            >
              Scan Another QR Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
