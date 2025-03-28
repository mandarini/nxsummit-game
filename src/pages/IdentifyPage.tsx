import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { getAttendeeByEmail } from "../lib/supabase";
import { isStaffMember, verifyStaffPassword } from "../lib/auth";
import toast from "react-hot-toast";

export default function IdentifyPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attendee = await getAttendeeByEmail(email);
      if (!attendee) {
        toast.error("Email not found. Please check and try again.");
        return;
      }

      const staffStatus = await isStaffMember(email);

      if (staffStatus) {
        setShowPasswordInput(true);
        if (!password) {
          setLoading(false);
          return;
        }

        const isValidPassword = await verifyStaffPassword(password);
        if (!isValidPassword) {
          toast.error("Invalid staff password");
          return;
        }
      }

      localStorage.setItem("attendeeId", attendee.id);
      localStorage.setItem("isStaff", String(staffStatus));

      if (staffStatus) {
        navigate("/admin");
      } else {
        navigate(`/ticket?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error("Error identifying attendee", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Nx Summit!
          </h1>
          <p className="text-gray-600">
            Enter your email to access your digital ticket
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {showPasswordInput && (
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter staff password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : showPasswordInput
              ? "Verify Staff Access"
              : "Access Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}
