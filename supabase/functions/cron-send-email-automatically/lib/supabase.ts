import { config } from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Charger les variables d'environnement à partir du fichier .env
config();

// Création du client Supabase avec les variables d'environnement
const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export { supabase };
