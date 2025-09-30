// @ts-nocheck
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Création du client Supabase avec les variables d'environnement (Deno)
const supabase: SupabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')) as string
);

export { supabase };
