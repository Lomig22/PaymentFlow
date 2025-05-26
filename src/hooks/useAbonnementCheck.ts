// hooks/useAbonnementCheck.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { isBefore, format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

export default function useAbonnementCheck() {
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [abonnement, setAbonnement] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [rawExpiryDate, setRawExpiryDate] = useState<Date | null>(null);
  const [resteEmail, setResteEmail] = useState<number>(0);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
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
        const { data: abonnementData } = await supabase
          .from("subscriptions")
          .select("plan, subscription_expiry")
          .eq("user_id", user.id);        

        if (abonnementData && abonnementData.length > 0) {
          const latest = abonnementData
            .filter((row) => row.subscription_expiry)
            .sort(
              (a, b) =>
                new Date(b.subscription_expiry).getTime() -
                new Date(a.subscription_expiry).getTime()
            )[0];

          const expiry = new Date(latest.subscription_expiry);
          const expired = isBefore(expiry, now);

          setAbonnement(latest.plan || null);
          setRawExpiryDate(expiry);
          setExpiryDate(format(expiry, "d MMMM yyyy", { locale: fr }));
          setIsExpired(expired);
          setLoading(false);
        } else {
          setIsExpired(true);
          setLoading(false);
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
    };

    fetchAll();
  }, []);

  return {
    isExpired,
    loading,
    abonnement,
    expiryDate,
    rawExpiryDate,
    resteEmail,
  };
}
