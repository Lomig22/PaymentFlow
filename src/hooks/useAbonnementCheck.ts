// hooks/useAbonnementCheck.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/supabase";
import { isBefore, format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { fetchAbonnementInfo } from "../lib/supabase/server";

export default function useAbonnementCheck() {

  useEffect(() => {




    // Rafraîchir à chaud après connexion/màj session pour éviter le reload manuel
    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        fetchAbonnementInfo();
      }
    });
    fetchAbonnementInfo();

    return () => {
      authSub?.subscription?.unsubscribe();
    };
  }, []);
}
