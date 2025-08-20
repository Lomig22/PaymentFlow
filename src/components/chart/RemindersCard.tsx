import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const RemindersCard = () => {
  type Receivable = { amount: number; paid_amount: number };
const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Utilisateur non authentifié");

      const userEmail = user.email;

      // 1. Récupère les IDs des utilisateurs qui ont invité l'utilisateur actuel
      const { data: invitedByData, error: invitedByError } = await supabase
        .from("invited_users")
        .select("invited_by")
        .eq("invited_email", userEmail);

      if (invitedByError) throw invitedByError;

      const invitedByIds = invitedByData.map((entry) => entry.invited_by);

      // 2. Inclure l'utilisateur actuel dans les IDs à filtrer
      const allOwnerIds = [user.id, ...invitedByIds];

      const { data, error } = await supabase
        .from("receivables")
        .select(`amount, paid_amount`)
        .in("owner_id", allOwnerIds);

      if (error) {
        console.error("Erreur de chargement des relances :", error);
        return;
      }

      setReceivables(data || []);
      const total = (data || []).reduce(
        (sum, r) => sum + (r.amount - r.paid_amount),
        0
      );
      setTotalAmount(total);
      setLoading(false);
    };

    fetchData();
  }, []);

  const LoadingDots = () => {
    return (
      <span className="inline-flex">
        <span className="animate-pulse">.</span>
        <span className="animate-pulse delay-200">.</span>
        <span className="animate-pulse delay-400">.</span>
      </span>
    );
  };
  
  return (
    <>
    <div className="bg-blue-50 rounded-xl p-6 shadow-md w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-bold text-black mb-4 mt-4">Relances</h2>
        {/* Optionnel : icône flèche ou bouton */}
        {/* <button className="text-blue-600 hover:text-blue-800 transition">
      &rarr;
    </button> */}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col items-center flex-1">
          <div className="text-gray-500 text-sm uppercase tracking-wide mb-1">
            À effectuer
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {loading ? <LoadingDots /> : receivables.length}
          </div>
        </div>

        <div className="w-px bg-gray-300 mx-6 h-12"></div>

        <div className="flex flex-col items-center flex-1">
          <div className="text-gray-500 text-sm uppercase tracking-wide mb-1">
            Montant à relancer
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {loading ? <LoadingDots /> : `${(totalAmount / 1_000_000).toFixed(2)} M €`}
          </div>
        </div>
      </div>

      {/* Message d'info en bas, léger et discret */}
      {/* 
  <div className="text-xs text-gray-500 italic text-center">
    Aucune relance effectuée et aucun paiement encaissé la semaine dernière.
  </div> 
  */}
    </div>
    <style>
      {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-pulse {
          animation: pulse 1s infinite;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-400 {
          animation-delay: 400ms;
        }
      `}
    </style>
    </>
  );
};

export default RemindersCard;
