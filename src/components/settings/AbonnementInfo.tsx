import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { format, isBefore, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import PricingPage from "../../pages/PricingPage";

function AbonnementInfo() {
  const [abonnement, setAbonnement] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [rawExpiryDate, setRawExpiryDate] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  // ⚠️ Correction ici
  const [resteEmail, setResteEmail] = useState<number>(0);

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
        setIsExpired(true);
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
        setIsExpired(true);
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

          const expiry = new Date(latest.subscription_expiry);
          setRawExpiryDate(expiry);

          const expired = isBefore(expiry, new Date());
          setIsExpired(expired);

          const formatted = format(expiry, "d MMMM yyyy", { locale: fr });
          setExpiryDate(formatted);
        } else {
          setAbonnement(null);
          setExpiryDate(null);
          setIsExpired(true);
        }
      } else {
        setAbonnement(null);
        setExpiryDate(null);
        setIsExpired(true);
      }

      setLoading(false);
    };

    const getResteEmailEnvoie = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("email_counter")
        .eq("id", user.id)
        .single();

      setResteEmail(userProfile?.email_counter ?? 0);
    };

    fetchAbonnement();
    getResteEmailEnvoie();
  }, []);

  const getColorClass = () => {
    if (!rawExpiryDate) return "text-gray-700";
    const daysLeft = differenceInDays(rawExpiryDate, new Date());

    if (isExpired || daysLeft <= 0) return "text-red-600 font-semibold";
    if (daysLeft <= 5) return "text-orange-500 font-medium";
    return "text-black";
  };

  if (loading) {
    return (
      <p className="text-sm text-gray-500 animate-pulse">
        Chargement de l’abonnement…
      </p>
    );
  }

  return (
    <div className="flex items-center flex-wrap gap-4 mt-2">
      {/* Avertissement email faible */}
      <AnimatePresence>
        {resteEmail <= 5 && !isExpired && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-yellow-100 border border-yellow-400 text-yellow-800 text-xs font-medium px-4 py-2 rounded shadow"
          >
            ⚠️ Il ne vous reste que <strong>{resteEmail}</strong> email
            {resteEmail > 1 ? "s" : ""} restants.{" "}
            <a href="/abonnement" className="underline">
              Mettre à jour votre plan
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statut d'abonnement */}
      {isExpired ? (
        <p className="text-red-600 font-semibold text-sm text-center">
          Abonnement expiré
        </p>
      ) : (
        <div className="text-sm text-center">
          {abonnement && expiryDate ? (
            <p className={getColorClass()}>
              Abonnement <strong>{abonnement}</strong> – expire le{" "}
              <strong>{expiryDate}</strong>
            </p>
          ) : (
            <p className="text-red-500">Aucun abonnement actif</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AbonnementInfo;

{
  /* {isExpired && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 w-full max-w-5xl max-h-[80vh] overflow-y-auto text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Abonnement expiré
            </h2>
            <p className="mb-6 text-gray-700">
              Votre abonnement est expiré. Veuillez renouveler votre abonnement
              pour continuer à utiliser l’application.
            </p>
            <PricingPage />
          </div>
        </div>
      )} */
}
