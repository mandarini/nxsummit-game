import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { attendeeId, winnerId, raffleType } = await req.json();

    if (!attendeeId || !winnerId || !raffleType) {
      throw new Error("Missing required parameters");
    }

    // Verify the user is a super_admin
    const { data: admin, error: adminError } = await supabase
      .from("attendees")
      .select("role")
      .eq("id", attendeeId)
      .single();

    if (adminError || admin?.role !== "super_admin") {
      throw new Error("Unauthorized - Not a super admin");
    }

    // Create the raffle winner record
    const { error: insertError } = await supabase
      .from("raffle_winners")
      .insert({
        attendee_id: winnerId,
        raffle_type: raffleType,
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: error.message.includes("Unauthorized") ? 403 : 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
