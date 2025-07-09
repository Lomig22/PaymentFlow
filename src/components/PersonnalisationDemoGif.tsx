import React from "react";

export default function PersonnalisationDemoGif() {
  // Utilise une image placeholder car il n’y a pas de GIF spécifique dans le dossier public
  // Remplacez src par le chemin de votre GIF si besoin
  return (
    <div className="flex flex-col items-center my-8">
      <img
        src="/images/landing-page.png"
        alt="Démo animée de personnalisation"
        className="rounded-xl shadow-lg w-full max-w-md border border-gray-100 animate-pulse"
        style={{ background: 'linear-gradient(90deg, #e0e7ff 0%, #f0f4ff 100%)' }}
      />
      <div className="text-xs text-gray-400 mt-2">Démo animée&nbsp;: sélection d’un profil, délai, ton, canal…</div>
    </div>
  );
}
