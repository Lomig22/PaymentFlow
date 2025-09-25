// @ts-nocheck
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Création du client Supabase avec les variables d'environnement (Deno)
const supabase: SupabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
);

export { supabase };
