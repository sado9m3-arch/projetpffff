interface PasswordChangeRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
  role: string;
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

    const { email, currentPassword, newPassword, role }: PasswordChangeRequest = await req.json();

    // Validate input
    if (!email || !currentPassword || !newPassword || !role) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Password must be at least 8 characters with uppercase, lowercase, number and special character" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const tableMap = {
      admin: "admin",
      fournisseur: "fournisseurs",
      client: "client"
    };

    const tableName = tableMap[role as keyof typeof tableMap];
    if (!tableName) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid role" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // First, verify current password
    const getUserResponse = await fetch(
      `${supabaseUrl}/rest/v1/${tableName}?email=eq.${email}&select=*`,
      {
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!getUserResponse.ok) {
      console.error("Failed to fetch user:", getUserResponse.status, getUserResponse.statusText);
      throw new Error("Failed to fetch user");
    }

    const users = await getUserResponse.json();
    if (users.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const user = users[0];

    // Verify current password
    if (user.password !== currentPassword) {
      return new Response(
        JSON.stringify({ success: false, message: "Current password is incorrect" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update password and first_login status
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/${tableName}?email=eq.${email}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          password: newPassword,
          first_login: false
        })
      }
    );

    if (!updateResponse.ok) {
      console.error("Failed to update password:", updateResponse.status, updateResponse.statusText);
      throw new Error("Failed to update password");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Password updated successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Password change error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});