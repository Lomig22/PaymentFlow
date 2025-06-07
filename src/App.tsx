import { useState, useEffect } from "react";
import { supabase, checkAuth } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import AuthMFA from "./components/AuthMFA";
import AppRoutes from "./AppRoutes";

export default function AppWithMFA() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMFAScreen, setShowMFAScreen] = useState(false);

 /*  useEffect(() => {
    // Vérifie s'il y a un MFA en attente dans la session
    const mfaPending = sessionStorage.getItem("mfa_pending") === "true";
    if (mfaPending) {
      setShowMFAScreen(true);
    }
  }, []); */

  const handleMFASuccess = () => {
    sessionStorage.removeItem("mfa_pending");
    setShowMFAScreen(false);
  };
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await checkAuth();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
  
        if (currentUser) {
          await checkMFAStatus(); // Vérifie AAL dès le chargement
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
  
 /*        if (nextLevel === "aal2" && currentLevel !== nextLevel) {
          setShowMFAScreen(true);
        } else {
          setShowMFAScreen(false);
        } */
      } catch (err) {
        console.error("Erreur MFA :", err);
        setShowMFAScreen(false);
      }
    };
  
    initAuth();
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      console.log("Auth state changed:", _event, currentUser);
      if (_event==="MFA_CHALLENGE_VERIFIED"){
        handleMFASuccess()
      }
      // Toujours appeler checkMFAStatus, même si currentUser ne change pas
      await checkMFAStatus();
  
      // On met à jour l'utilisateur *même s'il n’a pas changé*
       setUser(currentUser);
    });
  
    return () => {
      subscription?.unsubscribe();
    };
  }, []); // pas de dépendance à `user`
  

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
