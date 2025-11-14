import React, { useState } from "react";
import { Smile, AlertCircle, Landmark } from "lucide-react";

const profiles = [
  {
    icon: <Smile className="h-8 w-8 text-green-500" />,
    title: "Client fidèle",
    desc: "Message amical + délais larges",
    bg: "bg-green-50",
  },
  {
    icon: <AlertCircle className="h-8 w-8 text-red-500" />,
    title: "Client à risque",
    desc: "Relance rapide + ton plus ferme",
    bg: "bg-red-50",
  },
  {
    icon: <Landmark className="h-8 w-8 text-blue-500" />,
    title: "Collectivités publiques",
    desc: "Relances espacées + formalisme administratif",
    bg: "bg-blue-50",
  },
];

export default function RelanceProfileSlider() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % profiles.length);
  const prev = () => setCurrent((c) => (c - 1 + profiles.length) % profiles.length);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      <div className={`rounded-xl shadow-lg p-6 w-full text-center transition-all duration-300 ${profiles[current].bg}`}> 
        <div className="flex justify-center mb-2">{profiles[current].icon}</div>
        <div className="font-bold text-xl mb-1">{profiles[current].title}</div>
        <div className="text-gray-700 mb-2">{profiles[current].desc}</div>
      </div>
      <div className="flex justify-between w-full mt-4">
        <button onClick={prev} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Précédent</button>
        <button onClick={next} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Suivant</button>
      </div>
    </div>
  );
}
