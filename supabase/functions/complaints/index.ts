interface UpdateComplaintRequest {
  id: string;
  status?: string;
  fournisseur_id?: string;
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const action = pathParts[pathParts.length - 1];

    // GET /complaints - Get complaints based on user role
    if (req.method === "GET" && action === "complaints") {
      const userRole = url.searchParams.get("role");
      const userId = url.searchParams.get("userId");

      if (!userRole || !userId) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing role or userId" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      let query = `${supabaseUrl}/rest/v1/complaints?select=*,client(email),fournisseur:fournisseurs(email)`;

      if (userRole === "client") {
        query += `&client_id=eq.${userId}`;
      } else if (userRole === "fournisseur") {
        query += `&fournisseur_id=eq.${userId}`;
      }
      // Admin gets all complaints (no filter)

      query += "&order=created_at.desc";

      const response = await fetch(query, {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const complaints = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: complaints }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // POST /complaints - Create new complaint (dynamic fields)
    if (req.method === "POST" && action === "complaints") {
      const body = await req.json();

      if (!body.title || !body.description || !body.client_id) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Missing required fields (title, description, client_id)",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // ensure default status
      body.status = body.status ?? "pending";

      const response = await fetch(`${supabaseUrl}/rest/v1/complaints`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(body), // 👈 forward everything from frontend
      });

      if (!response.ok) {
        throw new Error("Failed to create complaint");
      }

      const complaint = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: complaint[0] }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // PUT /complaints - Update complaint
    if (req.method === "PUT" && action === "complaints") {
      const { id, status, fournisseur_id }: UpdateComplaintRequest =
        await req.json();

      if (!id) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing complaint ID" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (fournisseur_id !== undefined)
        updateData.fournisseur_id = fournisseur_id;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/complaints?id=eq.${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update complaint");
      }

      const complaint = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: complaint[0] }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // DELETE /complaints/:id - Delete complaint
    if (req.method === "DELETE") {
      const complaintId = pathParts[pathParts.length - 1];

      if (!complaintId || complaintId === "complaints") {
        return new Response(
          JSON.stringify({ success: false, message: "Missing complaint ID" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/complaints?id=eq.${complaintId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete complaint");
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Complaint deleted successfully",
        }),
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
    console.error("Complaints API error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});