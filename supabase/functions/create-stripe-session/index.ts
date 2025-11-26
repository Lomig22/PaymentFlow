// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: create-stripe-session
// - Creates a Stripe Checkout Session for a subscription using a given price_id
// - Handles CORS (OPTIONS preflight)
// - Requires secret STRIPE_SECRET_KEY defined in Supabase project settings

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13?target=deno";

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin ?? "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

serve(async (req: Request) => {
  const headers = cors(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_SECRET");
    if (!stripeSecret) {
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY in environment" }),
        { status: 500, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const price_id: string | undefined = body?.price_id;
    const success_url: string | undefined = body?.success_url;
    const cancel_url: string | undefined = body?.cancel_url;

    if (!price_id || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: price_id, success_url, cancel_url" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: price_id, quantity: 1 }],
      success_url,
      cancel_url,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...headers, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? "Unknown error" }),
      { status: 500, headers: { ...cors(req.headers.get("origin")), "Content-Type": "application/json" } },
    );
  }
});
