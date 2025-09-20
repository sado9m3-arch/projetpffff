const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Check for required environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Server configuration error: Missing environment variables" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /fournisseurs - Get all fournisseurs for assignment
    if (req.method === "GET") {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/fournisseurs?select=id,email`,
        {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch fournisseurs:", response.status, response.statusText);
        throw new Error("Failed to fetch fournisseurs");
      }

      const fournisseurs = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: fournisseurs }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Fournisseurs API error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});