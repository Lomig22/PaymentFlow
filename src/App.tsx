import { useState, useEffect } from "react";
import { supabase, checkAuth } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import AuthMFA from "./components/AuthMFA";
import AppRoutes from "./AppRoutes";

import { useUser } from "../components/context/UserContext";

function clearSupabaseAuthOnly() {
  try {
    const supabaseUrl = process.env.NEXT_SUPABASE_URL as string;
    const host = new URL(supabaseUrl).host;
    // Supprimer uniquement les clés d'auth Supabase locales
    localStorage.removeItem(`paymentflow-auth:${host}`);
    localStorage.removeItem("paymentflow-auth"); // rétrocompatibilité éventuelle
    // Ne pas toucher aux clés d'onboarding (onboarding_*), ni aux autres données
  } catch { }
}

export default function AppWithMFA() {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [showMFAScreen, setShowMFAScreen] = useState(false);

  const handleMFASuccess = () => {
    setShowMFAScreen(false);
  };

  // Vérifie l'authentification et récupère l'utilisateur
  useEffect(() => {
    const initAuth = async () => {
      try {        // Capture très tôt le déclencheur d'onboarding depuis l'URL (query ou hash)

        try {
          const search = typeof window !== 'undefined' ? window.location.search : '';
          const hash = typeof window !== 'undefined' ? window.location.hash : '';
          const qs = new URLSearchParams(search);
          const hp = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
          const shouldTrigger = qs.get('onboarding') === '1' || hp.get('type') === 'signup' || qs.get('type') === 'signup';
          if (shouldTrigger) {
            localStorage.setItem('onboarding_deferred', '1');
          }
        } catch { }

        const session = await checkAuth();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        // Si l'utilisateur n'est plus connecté, ne nettoyer que l'auth Supabase
        if (!currentUser) {
          clearSupabaseAuthOnly();
        } else {
          // Assurer qu'une ligne d'abonnement existe pour les nouveaux comptes
          try {
            const { data: existing, error: checkErr } = await supabase
              .from('subscriptions')
              .select('id')
              .eq('user_id', currentUser.id)
              .maybeSingle();
            if (!existing && !checkErr) {
              await supabase
                .from('subscriptions')
                .upsert([
                  {
                    user_id: currentUser.id,
                    status: 'active',
                    plan: 'free',
                    email: currentUser.email ?? null,
                    created_at: new Date().toISOString(),
                  },
                ], { onConflict: 'user_id' });
            }
          } catch (e) {
            console.warn('Ensure default subscription failed:', e);
          }
        }
      } catch (error) {
        console.error("Erreur d'authentification :", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (_event === "MFA_CHALLENGE_VERIFIED") {
        handleMFASuccess();
      }
      const checkMFAStatus = async () => {
        if (!user) return;

        try {
          const { data, error } =
            await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (error) throw error;

          const { currentLevel, nextLevel } = data ?? {};
          console.log("🔐 MFA status:", { currentLevel, nextLevel });

          if (nextLevel === "aal2" && currentLevel !== nextLevel) {
            console.log("➡️ Need MFA challenge screen");
            setShowMFAScreen(true);
          } else {
            console.log("✅ MFA already satisfied");
            setShowMFAScreen(false);
          }
        } catch (err) {
          console.error("❌ Erreur MFA (fallback sur AuthMFA) :", err);
          setShowMFAScreen(true); // Fallback MFA
        }
      };
      // Toujours revérifier
      await checkMFAStatus();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 🔁 Nouvelle vérification MFA quand `user` est défini (ex. après refresh)
  useEffect(() => {
    const checkMFAStatus = async () => {
      if (!user) return;

      try {
        const { data, error } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error) throw error;

        const { currentLevel, nextLevel } = data ?? {};
        console.log("🔐 MFA status:", { currentLevel, nextLevel });

        if (nextLevel === "aal2" && currentLevel !== nextLevel) {
          console.log("➡️ Need MFA challenge screen");
          setShowMFAScreen(true);
        } else {
          console.log("✅ MFA already satisfied");
          setShowMFAScreen(false);
        }
      } catch (err) {
        console.error("❌ Erreur MFA (fallback sur AuthMFA) :", err);
        setShowMFAScreen(true); // Fallback MFA
      }
    };

    checkMFAStatus();
  }, [user]); // ⬅️ se déclenche dès que `user` est défini

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <AppRoutes user={null} mfaRequired={false} />;
  }

  if (showMFAScreen) {
    return <AuthMFA onMFASuccess={handleMFASuccess} />;
  }

  return <AppRoutes user={user} mfaRequired={false} onMFASuccess={handleMFASuccess} />;
}
