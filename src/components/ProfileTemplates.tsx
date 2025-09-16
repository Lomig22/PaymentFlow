import React, { useState } from "react";

const PROFILE_TEMPLATES = [
  {
    name: "Standard",
    delays: [7, 14, 21],
    reminders: 3,
    channels: ["email"],
    content: "Bonjour, ceci est un rappel concernant votre facture en attente. Merci de régulariser votre situation.",
  },
  {
    name: "Relances douces",
    delays: [10, 20, 30],
    reminders: 3,
    channels: ["email"],
    content: "Bonjour, nous vous rappelons gentiment qu'une facture est en attente de paiement. N'hésitez pas à nous contacter pour toute question.",
  },
  {
    name: "Relances fermes",
    delays: [5, 10, 15, 20],
    reminders: 4,
    channels: ["email", "SMS"],
    content: "Attention, votre facture est impayée. Merci de procéder au règlement sans délai. Ce message tient lieu de mise en demeure.",
  },
  {
    name: "Relances progressives",
    delays: [10, 20, 35, 50],
    reminders: 4,
    channels: ["email", "SMS"],
    content: "Bonjour, ceci est un rappel progressif concernant votre facture en attente. Merci de régulariser dans les meilleurs délais.",
  },
];

export type ProfileTemplate = typeof PROFILE_TEMPLATES[number];

interface ProfileTemplatesProps {
  onSelect: (profile: ProfileTemplate) => void;
}

const ProfileTemplates: React.FC<ProfileTemplatesProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {PROFILE_TEMPLATES.map((profile) => (
        <div
          key={profile.name}
          className={`w-72 bg-white rounded-xl shadow-lg border transition cursor-pointer hover:shadow-xl hover:border-blue-500 p-6 flex flex-col gap-2 ${selected === profile.name ? "border-2 border-blue-600 ring-2 ring-blue-200" : ""}`}
          onClick={() => {
            setSelected(profile.name);
            onSelect(profile);
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-blue-700">{profile.name}</span>
            {selected === profile.name && (
              <span className="ml-auto text-blue-700 font-bold">✓</span>
            )}
          </div>
          <div className="flex flex-col gap-1 text-sm text-gray-700">
            <div><span className="font-semibold">Délais :</span> {profile.delays.join(" j, ")} j</div>
            <div><span className="font-semibold">Nombre de relances :</span> {profile.reminders}</div>
            <div><span className="font-semibold">Canaux :</span> {profile.channels.join(", ")}</div>
            <div><span className="font-semibold">Contenu-type :</span> <span className="italic text-gray-500">{profile.content}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileTemplates;
