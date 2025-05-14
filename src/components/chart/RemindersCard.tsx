import React from "react";

const RemindersCard = () => {
  return (
    <div className="bg-blue-50 rounded-xl p-4 shadow-sm w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-800 font-medium">Relances</h3>
        <span className="text-gray-500 text-xl font-light">›</span>
      </div>
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="text-gray-500 text-xs">À effectuer</div>
          <div className="text-lg font-bold text-gray-800">25</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs">Montant à relancer</div>
          <div className="text-lg font-bold text-gray-800">1,105 M €</div>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Aucune relance effectuée et aucun paiement encaissé la semaine dernière.
      </div>
    </div>
  );
};

export default RemindersCard;