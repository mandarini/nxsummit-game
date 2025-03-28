import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Code2, Database, Layout, Gift } from "lucide-react";
import { isGameOn } from "../lib/auth";

export default function InfoPage() {
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
              About This App
            </h1>
            <p className="text-xl text-gray-600">
              How it was built for Nx Summit
            </p>
          </div>

          <div className="space-y-12">
            {/* Tech Stack Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🛠 Technologies Used
              </h2>
              <div className="grid gap-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Layout className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Frontend Stack
                    </h3>
                    <p className="text-gray-600">
                      Built with React for UI components, styled with Tailwind
                      CSS for a modern look, and React Router for seamless
                      navigation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Database className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Backend & Database
                    </h3>
                    <p className="text-gray-600">
                      Powered by Supabase for real-time data and PostgreSQL with
                      Row Level Security for secure data access.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Code2 className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Core Features
                    </h3>
                    <p className="text-gray-600">
                      QR code scanning with html5-qrcode, real-time updates, and
                      secure authentication system.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Raffle Logic Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                <div className="flex items-center">
                  <Gift className="text-yellow-600 mr-2" size={24} />
                  Raffle Logic Summary
                </div>
              </h2>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    🥇 Weighted Raffle
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Your chance of winning is proportional to your points:
                  </p>
                  <pre className="bg-white p-3 rounded border border-gray-200 font-mono text-sm">
                    P(winner) = points / totalPoints
                  </pre>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    🎟 Shares-Based Raffle
                  </h3>
                  <p className="text-gray-600">
                    Every point counts as one entry in the pool. Multiple
                    winners possible, with each point increasing your chances
                    linearly.
                  </p>
                </div>
              </div>
            </section>

            <div className="text-center space-y-6 pt-6">
              <a
                href="https://github.com/mandarini/nxsummit-game"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-purple-600 hover:text-purple-700"
              >
                <Code2 size={20} className="mr-2" />
                View source on GitHub
              </a>

              <div>
                <button
                  onClick={() => navigate("/ticket")}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Back to Ticket
                </button>
              </div>

              <p className="text-sm text-gray-500 pt-8">
                Built by{" "}
                <a
                  href="https://github.com/mandarini"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700"
                >
                  mandarini
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
