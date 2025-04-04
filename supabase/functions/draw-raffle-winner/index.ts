import { createClient } from "npm:@supabase/supabase-js@2.39.7";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const { attendeeId, raffleType } = await req.json();
    if (!attendeeId || !raffleType) {
      throw new Error("Missing required parameters");
    }
    // Verify the user is a super_admin
    const { data: admin, error: adminError } = await supabase.from("attendees").select("role").eq("id", attendeeId).single();
    if (adminError || admin?.role !== "super_admin") {
      throw new Error("Unauthorized - Not a super admin");
    }
    // Get eligible attendees (checked in and more than 1 point)
    const { data: eligibleAttendees, error: attendeesError } = await supabase.from("attendees").select("id, name, points").gt("points", 0).eq("checked_in", true).not("role", "in", '("staff","super_admin")');
    if (attendeesError) throw attendeesError;
    if (!eligibleAttendees?.length) {
      throw new Error("No eligible attendees found");
    }
    let winner;
    if (raffleType === "weighted") {
      winner = drawWeightedWinner(eligibleAttendees);
    } else if (raffleType === "shares") {
      winner = drawSharesWinner(eligibleAttendees);
    } else {
      throw new Error("Invalid raffle type");
    }
    // Record the winner
    const { error: insertError } = await supabase.from("raffle_winners").insert({
      attendee_id: winner.id,
      raffle_type: raffleType
    });
    if (insertError) throw insertError;
    return new Response(JSON.stringify({
      success: true,
      winner: {
        id: winner.id,
        name: winner.name,
        points: winner.points
      }
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: error.message.includes("Unauthorized") ? 403 : 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
function drawWeightedWinner(attendees) {
  const power = 3; // tweak this for more/less bias (try 3+ for even more weight to big scorers)
  const total = attendees.reduce((sum, a)=>sum + Math.pow(a.points, power), 0);
  const cumulativeProbs = [];
  let cumulative = 0;
  for (const attendee of attendees){
    const amplified = Math.pow(attendee.points, power);
    cumulative += amplified / total;
    cumulativeProbs.push({
      attendee,
      cumProb: cumulative
    });
  }
  const rand = Math.random();
  for (const entry of cumulativeProbs){
    if (rand <= entry.cumProb) {
      return entry.attendee;
    }
  }
  return cumulativeProbs[cumulativeProbs.length - 1].attendee;
}
function drawSharesWinner(attendees) {
  const pool = [];
  // Add each attendee to the pool once per point
  attendees.forEach((attendee)=>{
    for(let i = 0; i < attendee.points; i++){
      pool.push(attendee);
    }
  });
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
