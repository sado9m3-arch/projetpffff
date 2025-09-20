interface CreateUserRequest {
  email: string;
  role: 'client' | 'fournisseur';
}

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

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1];

    // GET /users - Get all users (clients and fournisseurs)
    if (req.method === "GET" && action === "users") {
      // Fetch clients
      const clientsResponse = await fetch(
        `${supabaseUrl}/rest/v1/client?select=id,email,created_at`,
        {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
          },
        }
      );

      // Fetch fournisseurs
      const fournisseursResponse = await fetch(
        `${supabaseUrl}/rest/v1/fournisseurs?select=id,email,created_at`,
        {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
          },
        }
      );

      if (!clientsResponse.ok || !fournisseursResponse.ok) {
        console.error("Failed to fetch users:", {
          clientsStatus: clientsResponse.status,
          fournisseursStatus: fournisseursResponse.status
        });
        throw new Error("Failed to fetch users");
      }

      const clients = await clientsResponse.json();
      const fournisseurs = await fournisseursResponse.json();

      // Combine and add role information
      const allUsers = [
        ...clients.map((user: any) => ({ ...user, role: 'client' })),
        ...fournisseurs.map((user: any) => ({ ...user, role: 'fournisseur' }))
      ];

      return new Response(
        JSON.stringify({ success: true, data: allUsers }),
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
    console.error("Users API error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});