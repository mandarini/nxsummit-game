import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isGameOn } from "../lib/auth";

export default function Footer() {
  const [gameEnabled, setGameEnabled] = useState(false);
  const [hasAttendee, setHasAttendee] = useState(false);

  useEffect(() => {
    // Check if there's a valid attendee ID in localStorage
    const attendeeId = localStorage.getItem("attendeeId");
    setHasAttendee(!!attendeeId);

    // Only check game status if there's an attendee
    if (attendeeId) {
      isGameOn().then(setGameEnabled);
    }
  }, []);

  // Don't render footer if no attendee or game is disabled
  if (!hasAttendee || !gameEnabled) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
          <div className="flex space-x-6">
            <Link
              to="/rules"
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              Rules
            </Link>
            <Link
              to="/info"
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              About
            </Link>
            <Link
              to="/links"
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              Links
            </Link>
            <a
              href="https://nx.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              nx.dev
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
