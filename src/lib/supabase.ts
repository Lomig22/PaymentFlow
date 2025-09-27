import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

console.log("Supabase URL:", supabaseUrl);

// Compute storageKey
const storageKey = (() => {
  try {
    return `paymentflow-auth:${new URL(supabaseUrl).host}`;
  } catch {
    return 'paymentflow-auth:default';
  }
})();

// Création du client avec des options de persistance explicites
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Persister la session dans le localStorage
    // Utiliser une clé spécifique par environnement/projet pour éviter de réutiliser
    // un jeton obsolète provenant d'un autre domaine/projet (cause fréquente de 403).
    storageKey,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined, // Utiliser le localStorage pour la persistance
    autoRefreshToken: true, // Rafraîchir automatiquement le token
    detectSessionInUrl: true // Détecter la session dans l'URL pour le flow d'auth
  }
});

// Fonction utilitaire pour vérifier si l'utilisateur est connecté
export const checkAuth = async () => {
  try {
    // Vérifie d'abord côté serveur que le jeton est valide.
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return null;
    }
    // Si l'utilisateur est valide côté serveur, on peut retourner la session locale.
    const { data: { session } } = await supabase.auth.getSession();
    return session ?? null;
  } catch (error) {
    console.error('Erreur lors de la vérification de la session:', error);
    return null;
  }
};