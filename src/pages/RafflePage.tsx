import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Trophy, Shuffle } from "lucide-react";
import { supabase, type Attendee } from "../lib/supabase";
import { isSuperAdmin } from "../lib/auth";
import toast from "react-hot-toast";

type RaffleType = "weighted" | "shares";
type Winner = { attendee: Attendee; type: RaffleType; timestamp: string };

export default function RafflePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [eligibleAttendees, setEligibleAttendees] = useState<Attendee[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [raffleType, setRaffleType] = useState<RaffleType>("weighted");
  const [allowRepeatWinners, setAllowRepeatWinners] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const attendeeId = localStorage.getItem("attendeeId");
    if (!attendeeId) {
      navigate("/identify");
      return;
    }

    try {
      // Load current user and verify super_admin status
      supabase
        .from("attendees")
        .select()
        .eq("id", attendeeId)
        .single()
        .then(({ data: attendee }) => {
          if (!attendee || !isSuperAdmin(attendee)) {
            navigate("/admin");
            return;
          }
          loadEligibleAttendees();
        });
    } catch (error) {
      console.error("Error loading user:", error);
      navigate("/admin");
    }
  }, [navigate]);

  const loadEligibleAttendees = async () => {
    try {
      const { data: attendees, error } = await supabase
        .from("attendees")
        .select("*")
        .eq("checked_in", true)
        .gt("points", 0)
        .not("role", "in", '("staff","super_admin")')
        .order("points", { ascending: false });

      if (error) throw error;

      setEligibleAttendees(attendees || []);
      setTotalPoints(attendees?.reduce((sum, a) => sum + a.points, 0) || 0);
    } catch (error) {
      console.error("Error loading eligible attendees:", error);
      toast.error("Failed to load eligible attendees");
    } finally {
      setLoading(false);
    }
  };

  const drawWeightedWinner = () => {
    const random = Math.random() * totalPoints;
    let sum = 0;

    for (const attendee of eligibleAttendees) {
      sum += attendee.points;
      if (random <= sum) {
        return attendee;
      }
    }

    return eligibleAttendees[eligibleAttendees.length - 1];
  };

  const drawSharesWinner = () => {
    const pool: string[] = [];

    // Add each attendee to the pool once per point
    eligibleAttendees.forEach((attendee) => {
      for (let i = 0; i < attendee.points; i++) {
        pool.push(attendee.id);
      }
    });

    const randomIndex = Math.floor(Math.random() * pool.length);
    const winnerId = pool[randomIndex];
    return eligibleAttendees.find((a) => a.id === winnerId)!;
  };

  const drawWinner = async () => {
    if (eligibleAttendees.length === 0) {
      toast.error("No eligible attendees remaining");
      return;
    }

    setDrawing(true);

    // Simulate drawing animation
    setTimeout(async () => {
      try {
        const winner =
          raffleType === "weighted" ? drawWeightedWinner() : drawSharesWinner();

        // Record the winner
        const { error } = await supabase.from("raffle_winners").insert({
          attendee_id: winner.id,
          raffle_type: raffleType,
        });

        if (error) throw error;

        // Add to winners list
        setWinners((prev) => [
          ...prev,
          {
            attendee: winner,
            type: raffleType,
            timestamp: new Date().toISOString(),
          },
        ]);

        // Remove winner from eligible pool if repeat winners aren't allowed
        if (!allowRepeatWinners) {
          setEligibleAttendees((prev) =>
            prev.filter((a) => a.id !== winner.id)
          );
          setTotalPoints((prev) => prev - winner.points);
        }

        toast.success(`🎉 Winner drawn: ${winner.name}!`);
      } catch (error) {
        console.error("Error drawing winner:", error);
        toast.error("Failed to record winner");
      } finally {
        setDrawing(false);
      }
    }, 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="text-white hover:text-gray-200 flex items-center"
          >
            <ArrowLeft size={24} />
            <span className="ml-2">Back to Admin</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Raffle Drawing</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Drawing Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Drawing Controls</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Allow Repeat Winners
                  </span>
                  <button
                    onClick={() => setAllowRepeatWinners(!allowRepeatWinners)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      allowRepeatWinners ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        allowRepeatWinners ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Trophy className="text-yellow-500" size={20} />
                    <span className="font-medium">Eligible Attendees</span>
                  </div>
                  <span className="text-xl font-bold">
                    {eligibleAttendees.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shuffle className="text-purple-500" size={20} />
                    <span className="font-medium">Total Points in Pool</span>
                  </div>
                  <span className="text-xl font-bold">{totalPoints}</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Raffle Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setRaffleType("weighted")}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        raffleType === "weighted"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      <div className="font-medium">Weighted</div>
                      <div className="text-sm text-gray-500">
                        Based on points ratio
                      </div>
                    </button>
                    <button
                      onClick={() => setRaffleType("shares")}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        raffleType === "shares"
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      <div className="font-medium">Shares-Based</div>
                      <div className="text-sm text-gray-500">
                        One entry per point
                      </div>
                    </button>
                  </div>
                </div>

                {raffleType === "weighted" && (
                  <div className="relative p-4 bg-gray-50 rounded-lg">
                    <div className="absolute top-2 right-2">
                      <HelpCircle
                        size={16}
                        className="text-gray-400 cursor-help"
                        data-tooltip="Probability formula for weighted raffle"
                      />
                    </div>
                    <pre className="text-sm font-mono bg-white p-3 rounded border border-gray-200">
                      P(winner) = points / {totalPoints}
                    </pre>
                  </div>
                )}

                <button
                  onClick={drawWinner}
                  disabled={drawing || eligibleAttendees.length === 0}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                    drawing
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {drawing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Drawing Winner...
                    </div>
                  ) : (
                    "Draw Winner"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Winners & Eligible List */}
          <div className="space-y-6">
            {/* Winners List */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Winners</h2>
              {winners.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No winners drawn yet
                </p>
              ) : (
                <div className="space-y-3">
                  {winners.map((winner, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {winner.attendee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {winner.type === "weighted"
                            ? "Weighted Draw"
                            : "Shares-Based Draw"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {winner.attendee.points} points
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(winner.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Eligible Attendees List */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Eligible Attendees</h2>
              <div className="space-y-2">
                {eligibleAttendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span>{attendee.name}</span>
                    <span className="font-medium">
                      {attendee.points} points
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
