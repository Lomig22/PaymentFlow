import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const email_id = url.searchParams.get("id");
  const user_agent = req.headers.get("user-agent") || "";
  const ip_address = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";

  if (!email_id) {
    return new Response("Missing id", { status: 400 });
  }

  // Appel HTTP direct à l'API REST Supabase (table email_opens)
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const { error } = await fetch(`${SUPABASE_URL}/rest/v1/email_opens`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_ROLE_KEY!,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ email_id, user_agent, ip_address })
  }).then(async (res) => {
    if (!res.ok) {
      return { error: await res.text() };
    }
    return { error: null };
  });

  if (error) {
    return new Response(`Error inserting open: ${error}`, { status: 500 });
  }

  // Retourne une image transparente 1x1
  const pixel = new Uint8Array([
    71,73,70,56,57,97,1,0,1,0,128,0,0,0,0,0,255,255,255,33,249,4,1,0,0,1,0,44,0,0,0,0,1,0,1,0,0,2,2,68,1,0,59
  ]);
  return new Response(pixel, {
    headers: {
      "content-type": "image/gif",
      "cache-control": "no-store"
    }
  });
});
