import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function AbonnementInfo() {
  const [abonnement, setAbonnement] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbonnement = async () => {
      setLoading(true);
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user || sessionError) {
        console.error("Session invalide ou erreur :", sessionError?.message);
        setAbonnement(null);
        setExpiryDate(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profileStripe")
        .select("abonnement, subscription_expiry")
        .eq("email", user.email);

      if (error) {
        console.error("Erreur récupération abonnement :", error.message);
        setAbonnement(null);
        setExpiryDate(null);
      } else if (data && data.length > 0) {
        const latest = data
          .filter((row) => row.subscription_expiry)
          .sort(
            (a, b) =>
              new Date(b.subscription_expiry).getTime() -
              new Date(a.subscription_expiry).getTime()
          )[0];
        if (latest) {
          setAbonnement(latest.abonnement || null);

          try {
            const formatted = format(
              new Date(latest.subscription_expiry),
              "d MMMM yyyy",
              { locale: fr }
            );
            setExpiryDate(formatted);
          } catch (e) {
            console.error("Erreur de format de date :", e);
            setExpiryDate(null);
          }
        } else {
          setAbonnement(null);
          setExpiryDate(null);
        }
      } else {
        setAbonnement(null);
        setExpiryDate(null);
      }

      setLoading(false);
    };

    fetchAbonnement();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-gray-500 animate-pulse">
        Chargement de l’abonnement...
      </p>
    );
  }

  return (
    <div className="text-sm text-gray-700 ml-20 md:ml-0">
      {abonnement && expiryDate ? (
        <p>
          Abonnement <strong>{abonnement}</strong> – expire le{" "}
          <strong>{expiryDate}</strong>
        </p>
      ) : (
        <p className="text-red-500">Aucun abonnement actif</p>
      )}
    </div>
  );
}
export default AbonnementInfo;
