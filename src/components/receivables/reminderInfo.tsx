import { useState } from "react";

interface ReminderInfoProps {
  client: {
    reminder_profile?: any;
    reminder_delay_1?: { j?: number; h?: number; m?: number };
    reminder_delay_2?: { j?: number; h?: number; m?: number };
    reminder_delay_3?: { j?: number; h?: number; m?: number };
    reminder_delay_final?: { j?: number; h?: number; m?: number };
    // ajoute d'autres propriétés si besoin
  };
  reminderProfileName: string;
}

const ReminderInfo = ({ client, reminderProfileName }: ReminderInfoProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    client.reminder_profile && (
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-blue-800 font-medium mb-2">
          Profil de relance utilisé : <strong>{reminderProfileName}</strong>
          <br />
        </p>
        <p className="text-blue-700 text-sm">
          Les autres dates de relance s'adaptent automatiquement au date de la
          première relance!
        </p>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:underline focus:outline-none"
        >
          {showDetails ? "Masquer les détails" : "Voir les détails"}
        </button>

        {showDetails && (
          <div className="mt-2 text-blue-700 text-sm">
            <p>
              – <strong>Premier délai</strong> :{" "}
              {client.reminder_delay_1?.j || 0} jours,{" "}
              {client.reminder_delay_1?.h || 0} heures,{" "}
              {client.reminder_delay_1?.m || 0} minutes
            </p>
            <p>
              – <strong>Deuxième délai</strong> :{" "}
              {client.reminder_delay_2?.j || 0} jours,{" "}
              {client.reminder_delay_2?.h || 0} heures,{" "}
              {client.reminder_delay_2?.m || 0} minutes
            </p>
            <p>
              – <strong>Troisième délai</strong> :{" "}
              {client.reminder_delay_3?.j || 0} jours,{" "}
              {client.reminder_delay_3?.h || 0} heures,{" "}
              {client.reminder_delay_3?.m || 0} minutes
            </p>
            <p>
              – <strong>Délai final</strong> :{" "}
              {client.reminder_delay_final?.j || 0} jours,{" "}
              {client.reminder_delay_final?.h || 0} heures,{" "}
              {client.reminder_delay_final?.m || 0} minutes
            </p>
          </div>
        )}
      </div>
    )
  );
};

export default ReminderInfo;
