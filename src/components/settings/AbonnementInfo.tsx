import { differenceInDays } from "date-fns";
import useAbonnementCheck from "../../hooks/useAbonnementCheck";

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
        <p className="text-red-600 font-semibold text-sm text-center">
          Abonnement expiré
        </p>
      ) : (
        <div className="text-sm text-center">
          {abonnement && expiryDate ? (
            <p className={getColorClass()}>
                {(abonnement!=="Essai gratuit")?"Abonnement":""} <strong>{abonnement}</strong> – expire { abonnement === "Essai gratuit" ? "dans":"le"}{" "}
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
