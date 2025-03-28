import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isGameOn } from "../lib/auth";

export default function Footer() {
  const [gameEnabled, setGameEnabled] = useState(false);

  useEffect(() => {
    isGameOn().then(setGameEnabled);
  }, []);

  if (!gameEnabled) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="flex justify-center space-x-6">
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
        </nav>
      </div>
    </footer>
  );
}
