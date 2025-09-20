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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("_SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Environment variables check:", {
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey,
        allEnvVars: Object.keys(Deno.env.toObject())
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing required environment variables",
          debug: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseServiceKey
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /fournisseurs - Get all fournisseurs for assignment
    if (req.method === "GET") {
      console.log("Making request to:", `${supabaseUrl}/rest/v1/fournisseurs?select=id,email`);
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/fournisseurs?select=id,email`,
        {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch fournisseurs:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Database error: ${response.status} ${response.statusText}`,
            details: errorText
          }),
          {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const fournisseurs = await response.json();
      console.log("Successfully fetched fournisseurs:", fournisseurs.length);
      
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