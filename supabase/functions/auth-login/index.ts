interface LoginRequest {
  email: string;
  password: string;
  role: 'admin' | 'fournisseur' | 'client';
}

interface User {
  id: string;
  email: string;
  password: string;
  first_login: boolean;
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

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, message: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { email, password, role }: LoginRequest = await req.json();

    // Validate input
    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const tableMap = {
      admin: "admin",
      fournisseur: "fournisseurs", 
      client: "client"
    };

    const tableName = tableMap[role];

    // Query the appropriate table based on role
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${tableName}?email=eq.${email}&select=*`,
      {
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Database query failed");
    }

    const users: User[] = await response.json();

    if (users.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const user = users[0];

    // Check password (simple comparison - in production use proper hashing)
    if (user.password !== password) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid credentials" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate simple token (in production use proper JWT)
    const token = btoa(`${user.id}:${Date.now()}`);

    // Check if password change is required
    const requirePasswordChange = user.first_login || user.password === "password";

    const responseData = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: role,
        first_login: user.first_login
      },
      token: token,
      requirePasswordChange: requirePasswordChange
    };

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});