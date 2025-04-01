import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Html5Qrcode,
  Html5QrcodeScannerState,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import { getAttendeeById, checkInAttendee } from "../lib/supabase";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const SCANNER_ID = "reader";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerPaused, setScannerPaused] = useState(false);

  useEffect(() => {
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
              if (
                html5QrCode.getState &&
                html5QrCode.getState() === Html5QrcodeScannerState.SCANNING
              ) {
                await html5QrCode.pause();
                setScannerPaused(true);
              }

              const attendee = await getAttendeeById(decodedText);

              if (!attendee) {
                toast.error("Attendee not found");
                return;
              }

              if (attendee.checked_in) {
                toast.error(`${attendee.name} is already checked in!`);
                return;
              }

              await checkInAttendee(attendee.id);
              toast.success(`✅ ${attendee.name} is now checked in`);
            } catch (error) {
              console.error("Failed to check in attendee", error);
              toast.error("Failed to check in attendee");
            } finally {
              setIsScanning(false);
            }
          },
          () => {
            // Silent scan error
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
  }, []);

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
          onClick={() => navigate("/admin")}
          className="mb-6 flex items-center text-white hover:text-gray-200"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Admin Panel
        </button>

        <div className="bg-white rounded-xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Check In Attendee
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Scan attendee QR codes to mark them as checked in.
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
