import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const handler = async (_req: Request): Promise<Response> => {
  console.log("SYNCING EXTERNAL PAYMENTS");
  try {
    // 1. Get all unsynced external payments
    const { data: payments, error: fetchError } = await supabase
      .from("external_payments")
      .select("*")
      .eq("synched", false);

    if (fetchError) throw fetchError;

    if (!payments || payments.length === 0) {
      return new Response("No unsynced payments", { status: 200 });
    }

    for (const payment of payments) {
      // 2. Update receivable
      const { error: updateError } = await supabase.rpc("increment_receivable_paid_amount", {
        p_invoice_number: payment.invoice_number,
        p_amount: payment.amount,
      });

      if (updateError) {
        console.error("Failed to update receivable:", updateError);
        continue;
      }

      // 3. Mark payment as synched
      await supabase
        .from("external_payments")
        .update({ synched: true })
        .eq("id", payment.id);
    }

    return new Response("Sync completed", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error: " + err.message, { status: 500 });
  }
};

Deno.serve(handler);
