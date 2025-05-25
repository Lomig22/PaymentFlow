import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const RemindersCard = () => {  
  const [receivables, setReceivables] = useState([]);
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
  return (
    <div className="bg-blue-50 rounded-xl p-4 shadow-sm w-full h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-800">Relances</h2>
        {/* <span className="text-gray-500 text-xl font-light">›</span> */}
      </div>
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="text-gray-500 text-xs">À effectuer</div>
          <div className="text-lg font-bold text-gray-800">
            {loading ? "..." : receivables.length}
          </div>
        </div>
        <div>
          <div className="text-gray-500 text-xs">Montant à relancer</div>
          <div className="text-lg font-bold text-gray-800">
            {loading ? "..." : (totalAmount / 1_000_000).toFixed(2)} M €
          </div>
        </div>
      </div>
      {/* <div className="text-xs text-gray-500">
        Aucune relance effectuée et aucun paiement encaissé la semaine dernière.
      </div> */}
    </div>
  );
};

export default RemindersCard;