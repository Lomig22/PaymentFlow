import React from "react";
import { Clock, Mail, Smartphone, Smile, Puzzle, FileText } from "lucide-react";

const icons = [
  { icon: <Clock className="h-7 w-7 text-blue-600" />, label: "Délais de relance" },
  { icon: <Mail className="h-7 w-7 text-green-600" />, label: "Canal (email / SMS)" },
  { icon: <Smile className="h-7 w-7 text-yellow-600" />, label: "Ton du message" },
  { icon: <Puzzle className="h-7 w-7 text-purple-600" />, label: "Profils clients" },
  { icon: <FileText className="h-7 w-7 text-pink-600" />, label: "Contenu personnalisable" },
];

export default function PersonnalisationIconsRow() {
  return (
    <div className="flex flex-wrap justify-center gap-8 my-8 w-full max-w-3xl mx-auto">
      {icons.map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          {item.icon}
          <span className="mt-2 text-sm font-medium text-gray-700 text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
