import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { getAttendeeByEmail } from "../lib/supabase";
import { isStaffMember, verifyStaffPassword } from "../lib/auth";
import { useLoginLimiter } from "../lib/login-limiter";
import toast from "react-hot-toast";

export default function IdentifyPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    failedAttempts,
    disableLogin,
    disableTimer,
    setFailedAttempts,
    resetLoginState,
  } = useLoginLimiter();

  const handleTicketAccess = async () => {
    try {
      const attendee = await getAttendeeByEmail(email);
      if (!attendee) {
        toast.error("Email not found. Please check and try again.");
        return;
      }

      // Clear staff-related state and storage
      setShowPasswordInput(false);
      setPassword("");
      localStorage.removeItem("staff_access_granted");

      // Set attendee ID and navigate to ticket
      localStorage.setItem("attendeeId", attendee.id);
      navigate(`/ticket?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Failed to access ticket:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if login is disabled
    if (disableLogin) {
      toast.error(
        `Too many failed attempts. Please wait ${disableTimer} seconds.`
      );
      return;
    }

    setLoading(true);

    // Add delay based on failed attempts
    await new Promise((resolve) => setTimeout(resolve, failedAttempts * 1000));

    try {
      const attendee = await getAttendeeByEmail(email);
      if (!attendee) {
        toast.error("Email not found. Please check and try again.");
        setFailedAttempts(failedAttempts + 1);
        resetLoginState();
        return;
      }

      const staffStatus = await isStaffMember(email);

      if (staffStatus) {
        if (!showPasswordInput) {
          setShowPasswordInput(true);
          setLoading(false);
          return;
        }

        if (!password) {
          toast.error("Staff password is required");
          return;
        }

        const isValidPassword = await verifyStaffPassword(password);
        if (!isValidPassword) {
          toast.error("Invalid staff password");
          setFailedAttempts(failedAttempts + 1);
          resetLoginState();
          return;
        }

        localStorage.setItem("staff_access_granted", "true");
        localStorage.setItem("attendeeId", attendee.id);
        navigate("/admin");
        return;
      }

      // Non-staff attendee
      localStorage.setItem("attendeeId", attendee.id);
      navigate(`/ticket?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Failed to identify:", error);
      toast.error("Something went wrong. Please try again.");
      setFailedAttempts(failedAttempts + 1);
      resetLoginState();
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

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || disableLogin}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : disableLogin
                ? `Please wait ${disableTimer} seconds`
                : showPasswordInput
                ? "Verify Staff Access"
                : "Access Ticket"}
            </button>

            {showPasswordInput && (
              <button
                type="button"
                onClick={handleTicketAccess}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Access Ticket Instead
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
