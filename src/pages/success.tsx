import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SuccessPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (hasRun) return;
    setHasRun(true);
    const registerUser = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      let userId: string | null = null;
      let email: string | null = null;

      if (userData?.user) {
        userId = userData.user.id;
        email = userData.user.email;
      } else {
        userId = localStorage.getItem("pendingUserId");
        email = localStorage.getItem("pendingEmail");
      }

      const plan = localStorage.getItem("selectedPlan");
      const interval = localStorage.getItem("selectedInterval");

      if (!userId || !email || !plan || !interval) {
        setError("Données manquantes après paiement.");
        return;
      }

      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + (interval === "yearly" ? 12 : 1));

      const { data: existing, error: fetchError } = await supabase
        .from("profileStripe")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (fetchError) {
        setError("Erreur de vérification du profil.");
        return;
      }

      if (!existing) {
        const { error: insertError } = await supabase
          .from("profileStripe")
          .insert([
            {
              id: userId,
              email: email,
              abonnement: plan,
              subscription_expiry: expiry.toISOString(),
            },
          ]);
        if (insertError) {
          setError("Erreur lors de l'enregistrement : " + insertError.message);
          return;
        }
      }

      localStorage.removeItem("pendingUserId");
      localStorage.removeItem("pendingEmail");
      localStorage.removeItem("selectedPlan");
      localStorage.removeItem("selectedInterval");

      setTimeout(() => navigate("/login"), 2000);
    };

    registerUser();
  }, []);

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Paiement confirmé</h1>
      <p>Nous préparons votre compte, un instant…</p>
    </div>
  );
}