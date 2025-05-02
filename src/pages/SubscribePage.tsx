import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
        return;
      }
      setEmail(session.user.email);
    };

    getUserEmail();
  }, []);

  const handleSubscribe = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    const { error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      created_at: new Date().toISOString(),
      status: "active",
      plan: "free",
    });

    if (error) {
      console.error("Erreur création abonnement", error);
      return;
    }

    navigate("/dashboard");
  };

  const handleCancel = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">Créer votre abonnement gratuit</h2>
      <p className="mb-4">
        <strong>{email}</strong> n'est pas encore souscrit à aucun abonnement.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={handleSubscribe}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Valider mon abonnement gratuit
        </button>
        <button
          onClick={handleCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
