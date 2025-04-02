import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileSpreadsheet, MessageSquare } from "lucide-react";
import { isGameOn } from "../lib/auth";

export default function LinksPage() {
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
              Important Links
            </h1>
            <p className="text-xl text-gray-600">
              Submit your feedback and discussion topics
            </p>
          </div>

          <div className="grid gap-6 max-w-xl mx-auto">
            <a
              href={import.meta.env.VITE_ROUNDTABLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
            >
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <FileSpreadsheet className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg text-purple-900">
                  Roundtable Discussion Points
                </h3>
                <p className="text-purple-600">
                  Vote for discussion topics you're interested in
                </p>
              </div>
            </a>

            <a
              href={import.meta.env.VITE_FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg text-blue-900">
                  Event Feedback
                </h3>
                <p className="text-blue-600">
                  Help us improve by sharing your thoughts
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
