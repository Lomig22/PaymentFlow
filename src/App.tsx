import { useState, useEffect } from "react";
import { supabase, checkAuth } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import AuthMFA from "./components/AuthMFA";
import AppRoutes from "./AppRoutes";

export default function AppWithMFA() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // chargement global
  const [showMFAScreen, setShowMFAScreen] = useState(false);

  const handleMFASuccess = () => {
    setShowMFAScreen(false);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await checkAuth();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await checkMFAStatus();
        }
      } catch (error) {
        console.error("Erreur d'authentification ou MFA :", error);
      } finally {
        setIsLoading(false);
      }
    };

    const checkMFAStatus = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error) throw error;

        const { currentLevel, nextLevel } = data ?? {};
        console.log("MFA Status:", { currentLevel, nextLevel });

        // Affiche l'écran MFA si nécessaire
        if (nextLevel === "aal2" && currentLevel !== nextLevel) {
          setShowMFAScreen(true);
        } else {
          setShowMFAScreen(false);
        }
      } catch (err) {
        console.error("Erreur MFA :", err);
        setShowMFAScreen(false); // Choix de fallback
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        console.log("Auth state changed:", _event, currentUser);
        setUser(currentUser);

        // MFA terminé ?
        if (_event === "MFA_CHALLENGE_VERIFIED") {
          handleMFASuccess();
        }

        // Toujours re-check
        await checkMFAStatus();
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Loader tant que authentification/MFA n'a pas été vérifiée
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Pas connecté
  if (!user) {
    return <AppRoutes user={null} mfaRequired={false} />;
  }

  // Connecté mais pas encore passé MFA (TOTP)
  if (showMFAScreen) {
    return <AuthMFA onMFASuccess={handleMFASuccess} />;
  }

  // Connecté et MFA OK
  return <AppRoutes user={user} mfaRequired={false} />;
}
