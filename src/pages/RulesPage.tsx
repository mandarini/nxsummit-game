import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scan, Users, Trophy, Shield } from "lucide-react";
import { isGameOn } from "../lib/auth";

export default function RulesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isGameOn().then((enabled) => {
      setLoading(false);
      if (!enabled) navigate("/");
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate("/ticket")}
            className="text-white hover:text-gray-200 flex items-center"
          >
            <ArrowLeft size={24} />
            <span className="ml-2">Back to Ticket</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How the Nx Summit Game Works
            </h1>
            <p className="text-xl text-gray-600">
              A quick guide to playing (and winning) the game!
            </p>
          </div>

          <div className="space-y-12">
            {/* Game Rules Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🕹️ Game Rules
              </h2>
              <div className="grid gap-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Scan className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Access & Scanning
                    </h3>
                    <p className="text-gray-600">
                      After check-in, you'll get access to your ticket with a
                      unique QR code. Use the built-in scanner to scan other
                      attendees and earn points!
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Point System</h3>
                    <p className="text-gray-600">
                      Each attendee you scan earns you points. Nx team members
                      are worth extra points! Remember, you can only scan each
                      person once.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Trophy className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Winning Prizes
                    </h3>
                    <p className="text-gray-600">
                      A raffle will reward the most engaged participants. The
                      more points you earn, the better your chances of winning!
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Privacy Notice Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                <div className="flex items-center">
                  <Shield className="text-green-600 mr-2" size={24} />
                  Privacy Notice
                </div>
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Data Collection:</strong> We only store your name and
                  email from the invite list.
                </p>
                <p>
                  <strong>QR Code Privacy:</strong> Your QR code links to a
                  UUID, not your email address.
                </p>
                <p>
                  <strong>Scan Privacy:</strong> When someone scans you, they
                  can't see your personal data. They only earn points - no data
                  is shared between attendees.
                </p>
                <p>
                  <strong>Data Usage:</strong> This is a self-contained event
                  app. No tracking, no long-term storage, and no data sharing
                  with third parties.
                </p>
              </div>
            </section>

            <div className="text-center pt-6">
              <button
                onClick={() => navigate("/ticket")}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Back to Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
