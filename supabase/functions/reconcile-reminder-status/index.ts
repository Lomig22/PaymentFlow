import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase Edge runtime provides Deno; declare it for TS tooling
// deno-lint-ignore no-explicit-any
declare const Deno: any;

Deno.serve(async (_req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Mode de calcul: considérer seulement les créances impayées ?
    // Par défaut false (toute ligne dans receivables => needs_reminder = true)
    const unpaidOnly = (Deno.env.get('RECONCILE_UNPAID_ONLY') || 'false').toLowerCase() === 'true';

    // 1) Charger tous les clients (id, needs_reminder)
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, needs_reminder');
    if (clientsError) {
      return new Response(JSON.stringify({ error: clientsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2) Charger tous les client_id présents dans receivables (distinct en mémoire)
    let receivablesQuery = supabase.from('receivables').select('client_id');
    if (unpaidOnly) {
      receivablesQuery = receivablesQuery.not('status', 'eq', 'paid');
    }
    const { data: recs, error: recsError } = await receivablesQuery;
    if (recsError) {
      return new Response(JSON.stringify({ error: recsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const receivableClientIds = new Set<string>(
      (recs || []).map((r: any) => r.client_id).filter((id: string | null) => Boolean(id)) as string[]
    );

    const clientsTrue = (clients || []).filter((c: any) => c.needs_reminder).map((c: any) => c.id as string);
    const clientsFalse = (clients || []).filter((c: any) => !c.needs_reminder).map((c: any) => c.id as string);

    // 3) A désactiver: needs_reminder = true mais aucune (ou aucune impayée si unpaidOnly) créance
    const toDisable = clientsTrue.filter((id) => !receivableClientIds.has(id));
    // 4) A activer: needs_reminder = false mais au moins 1 créance (ou 1 impayée si unpaidOnly)
    const toEnable = clientsFalse.filter((id) => receivableClientIds.has(id));

    let disableCount = 0;
    let enableCount = 0;

    if (toDisable.length > 0) {
      const { error } = await supabase
        .from('clients')
        .update({ needs_reminder: false })
        .in('id', toDisable);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      disableCount = toDisable.length;
    }

    if (toEnable.length > 0) {
      const { error } = await supabase
        .from('clients')
        .update({ needs_reminder: true })
        .in('id', toEnable);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      enableCount = toEnable.length;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        unpaidOnly,
        updated: { enabled: enableCount, disabled: disableCount },
        totals: {
          clients: clients?.length || 0,
          receivableClientIds: receivableClientIds.size,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as any)?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/* To invoke locally:

1) Run `supabase start` (https://supabase.com/docs/reference/cli/supabase-start)
2) Make an HTTP request:

curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reconcile-reminder-status' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json'
*/
