import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scan, Trophy, Shield, MessageSquare } from "lucide-react";
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
                      Scanning & Points
                    </h3>
                    <p className="text-gray-600">
                      After check-in, scan other attendees' QR codes to earn
                      points. Each attendee is worth 1 point, while Nx team
                      members are worth 4 points - so make sure to find and
                      interact with the team! Remember: You can only scan each
                      QR code once.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MessageSquare className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Engagement Rewards
                    </h3>
                    <p className="text-gray-600">
                      Get involved in group discussions and Q&A sessions to earn
                      bonus points. Staff members will provide special QR codes
                      for participation.
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
                      The more points you collect, the better your chances of
                      winning! Points are awarded for interactions,
                      participation, and engagement throughout the event.
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
