// hooks/useAbonnementCheck.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/supabase";
import { isBefore, format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

export default function useAbonnementCheck() {
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [abonnement, setAbonnement] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [rawExpiryDate, setRawExpiryDate] = useState<Date | null>(null);
  const [resteEmail, setResteEmail] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (!user) {
          setIsExpired(true);
          setLoading(false);
          return;
        }

        // Étape 1 : Vérification période d'essai
        const userCreatedAt = new Date(user.created_at);
        const now = new Date();
        const daysSinceCreation = differenceInDays(now, userCreatedAt);
        const essaiDuration = 30;

        if (daysSinceCreation < essaiDuration) {
          setAbonnement("Essai gratuit");
          setRawExpiryDate(null);
          setExpiryDate(`${essaiDuration - daysSinceCreation} jour(s)`);
          setIsExpired(false);
          setLoading(false);
        } else {
          // Étape 2 : Vérifier abonnement actif
          const { data: abonnementData, error: abonnementError } = await supabase
            .from("subscriptions")
            .select("plan, status, subscription_expiry")
            .eq("user_id", user.id);

          if (abonnementError) {
            console.error("Erreur récupération abonnement:", abonnementError);
            setError("Erreur récupération abonnement: " + abonnementError.message);
            setIsExpired(true);
            setLoading(false);
            return;
          }

          if (abonnementData && abonnementData.length > 0) {
            // 2.a: plan 'free' actif sans expiration -> considérer comme non expiré
            const hasActiveFree = abonnementData.some(
              (row: any) => (row.plan === "free" || row.plan === "gratuit") && (row.status ?? "active") === "active"
            );
            if (hasActiveFree) {
              setAbonnement("free");
              setRawExpiryDate(null);
              setExpiryDate("illimité");
              setIsExpired(false);
              setLoading(false);
              return;
            }

            // 2.b: sinon, on regarde la dernière date d'expiration disponible
            const latest = abonnementData
              .filter((row: any) => row.subscription_expiry)
              .sort(
                (a: any, b: any) =>
                  new Date(b.subscription_expiry).getTime() -
                  new Date(a.subscription_expiry).getTime()
              )[0];

            if (latest?.subscription_expiry) {
              const expiry = new Date(latest.subscription_expiry);
              const expired = isBefore(expiry, now);

              setAbonnement(latest.plan || null);
              setRawExpiryDate(expiry);
              setExpiryDate(
                new Intl.DateTimeFormat('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }).format(expiry)
              );
              setIsExpired(expired);
              setLoading(false);
              return;
            } else {
              setAbonnement(null);
              setRawExpiryDate(null);
              setExpiryDate(null);
              setIsExpired(true);
              setLoading(false);
              return;
            }
          } else {
            console.log("No active subscription found for user:", user.id);
            setAbonnement(null);
            setIsExpired(true);
            setLoading(false);
            return;
          }
        }

        // Étape 3 : Récupérer compteur d'emails
        // const { data: userProfile } = await supabase
        //   .from("profiles")
        //   .select("email_counter")
        //   .eq("id", user.id)
        //   .maybeSingle();

        // setResteEmail(userProfile?.email_counter ?? 0);
        setLoading(false);
      } catch (err: any) {
        console.error("Erreur inattendue dans useAbonnementCheck:", err);
        setError("Erreur inattendue: " + (err.message || JSON.stringify(err)));
        setIsExpired(true);
        setLoading(false);
      }
    };


    fetchAll();

    // Rafraîchir à chaud après connexion/màj session pour éviter le reload manuel
    const { data: authSub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        fetchAll();
      }
    });

    return () => {
      authSub?.subscription?.unsubscribe();
    };
  }, []);

  return {
    isExpired,
    loading,
    abonnement,
    expiryDate,
    rawExpiryDate,
    resteEmail,
    error,
  };

}
