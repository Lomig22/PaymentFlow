import { differenceInDays } from "date-fns";
import useAbonnementCheck from "../../hooks/useAbonnementCheck";
import { AlertCircle } from "lucide-react";

function AbonnementInfo() {
  const { isExpired, loading, abonnement, expiryDate, rawExpiryDate } =
    useAbonnementCheck();

  const getColorClass = () => {
    if (!rawExpiryDate) return "text-black";
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
    <div className="flex items-center flex-wrap gap-4">
      {isExpired ? (
        abonnement === "Essai gratuit" ? (
          <p className="text-red-600 font-semibold text-sm text-center">
            Nombre de jours d’essai terminé
          </p>
        ) : abonnement ? (
          <p className="flex items-center gap-2 text-red-600 font-semibold text-sm text-center">
            <AlertCircle className="w-4 h-4" />
            Abonnement expiré
          </p>
        ) : (
          <p className="text-red-500 font-semibold text-sm text-center">
            Aucun abonnement actif
          </p>
        )
      ) : (
        <div className="text-sm text-center">
          {abonnement && expiryDate ? (
            <p className={getColorClass()}>
              {abonnement !== "Essai gratuit" ? "Abonnement" : ""}{" "}
              <strong>{abonnement}</strong> – expire{" "}
              {abonnement === "Essai gratuit" ? "dans" : "le"}{" "}
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
