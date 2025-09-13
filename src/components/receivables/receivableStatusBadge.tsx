import React from "react";

// Fonction pour calculer le vrai statut en fonction des relances activées
type Receivable = {
  status: string;
  client?: {
    reminder_enable_final?: boolean;
    reminder_enable_3?: boolean;
    reminder_enable_2?: boolean;
    reminder_enable_1?: boolean;
    pre_reminder_enable?: boolean;
  };
};

const resolveStatus = (receivable: Receivable) => {
  const { status, client } = receivable;

  const statusLevels = [
    { value: "Relance finale", enabled: client?.reminder_enable_final },
    { value: "Relance 3", enabled: client?.reminder_enable_3 },
    { value: "Relance 2", enabled: client?.reminder_enable_2 },
    { value: "Relance 1", enabled: client?.reminder_enable_1 },
    { value: "reminded", enabled: true },
  ];

  if (status === "Relance préventive" && client?.pre_reminder_enable === false) {
    return "pending";
  }

  const index = statusLevels.findIndex((s) => s.value === status);
  if (index !== -1) {
    for (let i = index; i < statusLevels.length; i++) {
      if (statusLevels[i].enabled) {
        return statusLevels[i].value;
      }
    }
    return "pending";
  }

  return status;
};

// Fonction pour retourner la classe CSS en fonction du statut
const getStatusStyle = (status: string) => {
  if (status === "paid") return "bg-green-100 text-green-800";
  if (status === "late") return "bg-red-100 text-red-800";
  if (["reminded", "Relance 1", "Relance 2", "Relance 3", "Relance finale", "Relance préventive"].includes(status)) {
    return "bg-yellow-100 text-yellow-800";
  }
  if (status === "legal") return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
};

// Fonction pour retourner le label à afficher
const getStatusLabel = (status: string) => {
  const labels = {
    paid: "Payé",
    late: "En retard",
    reminded: "Relancé",
    pending: "En attente",
    legal: "Contentieux",
    "Relance 1": "Relance 1",
    "Relance 2": "Relance 2",
    "Relance 3": "Relance 3",
    "Relance finale": "Relance finale",
    "Relance préventive": "Pré-relancé",
  };
  return Object.prototype.hasOwnProperty.call(labels, status) ? labels[status as keyof typeof labels] : status;
};

// ✅ Composant principal
interface ReceivableStatusBadgeProps {
  receivable: Receivable;
}

const ReceivableStatusBadge = ({ receivable }: ReceivableStatusBadgeProps) => {
  const realStatus = resolveStatus(receivable);
  return (
    <span
      className={`px-4 inline-flex text-xs text-center leading-5 font-semibold rounded-full ${getStatusStyle(realStatus)}`}
    >
      {getStatusLabel(realStatus)}
    </span>
  );
};

export default ReceivableStatusBadge;
