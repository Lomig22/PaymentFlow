import React from "react";

const sectors = [
  {
    emoji: "👷",
    title: "Auto-entrepreneur",
    desc: "Relances automatiques 7 jours après échéance, ton ferme, par SMS",
    color: "border-blue-500",
  },
  {
    emoji: "🛠️",
    title: "TPE",
    desc: "Relance douce par email avec message personnalisé",
    color: "border-green-500",
  },
  {
    emoji: "🏭",
    title: "PME",
    desc: "Relances escaladées avec double canal : email + téléphone",
    color: "border-purple-500",
  },
];

export default function PersonnalisationSectorCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mb-10">
      {sectors.map((sector, i) => (
        <button
          key={sector.title}
          className={`rounded-xl border-2 ${sector.color} bg-white shadow-md p-6 flex flex-col items-center hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400`}
          tabIndex={0}
        >
          <span className="text-4xl mb-2">{sector.emoji}</span>
          <div className="font-bold text-lg mb-1 text-gray-900">{sector.title}</div>
          <div className="text-gray-700 text-sm text-center">{sector.desc}</div>
        </button>
      ))}
    </div>
  );
}
