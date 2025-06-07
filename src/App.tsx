import { useState, useEffect } from "react";
import { supabase, checkAuth } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import AuthMFA from "./components/AuthMFA";
import AppRoutes from "./AppRoutes";

export default function AppWithMFA() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMFAScreen, setShowMFAScreen] = useState(false);

  const handleMFASuccess = () => {
    setShowMFAScreen(false);
  };

  // Vérifie l'authentification et récupère l'utilisateur
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await checkAuth();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AppRoutes user={null} mfaRequired={false} />;
  }

  if (showMFAScreen) {
    return <AuthMFA onMFASuccess={handleMFASuccess} />;
  }

  return <AppRoutes user={user} mfaRequired={false} />;
}
