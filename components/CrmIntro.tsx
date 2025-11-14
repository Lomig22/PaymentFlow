import { useRef, useState, useEffect } from "react";
import { ArrowDownCircle, CheckCircle, XCircle, Building2, Hammer, Car, Stethoscope, Truck, User, Briefcase, Rocket } from "lucide-react";

const sectors = [
  { icon: <Building2 className="w-7 h-7" />, label: "BTP" },
  { icon: <Hammer className="w-7 h-7" />, label: "Artisans" },
  { icon: <Car className="w-7 h-7" />, label: "Garages" },
  { icon: <Stethoscope className="w-7 h-7" />, label: "Métiers du soin" },
  { icon: <Truck className="w-7 h-7" />, label: "Transporteurs" },
  { icon: <User className="w-7 h-7" />, label: "Freelances" },
  { icon: <Briefcase className="w-7 h-7" />, label: "TPE/PME" },
  { icon: <Rocket className="w-7 h-7" />, label: "Startups" },
];

const sectorPhrases = [
  "Dans le BTP, 1 facture sur 3 est payée en retard. Avec Payment Flow, stop aux impayés.",
  "Artisan ? Concentrez-vous sur vos chantiers, on s’occupe des relances.",
  "Garagiste ? Accélérez vos encaissements et réduisez les oublis clients.",
  "Dans le soin, gardez l’esprit tranquille, Payment Flow veille sur vos paiements.",
  "Transporteur ? Automatisez vos relances et gagnez du temps administratif.",
  "Freelance ? Plus de stress, vos relances partent toutes seules.",
  "TPE/PME : DSO en baisse, trésorerie en hausse.",
  "Startup ? Concentrez-vous sur la croissance, nous gérons les relances."
];

export default function CrmIntro({ onScrollToDemo }: { onScrollToDemo: () => void }) {
  const [sectorIdx, setSectorIdx] = useState(0);

  // Animation: cycle phrases every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setSectorIdx((i) => (i + 1) % sectorPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gradient-to-b from-blue-50 via-white to-white w-full py-12 md:py-20 border-b border-blue-100">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center text-center gap-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-blue-700 mb-2">
          Votre CRM ne relance pas vos clients.<br />
          <span className="text-blue-600">Payment Flow, si.</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-4 max-w-2xl mx-auto">
          Automatisez le suivi client, les relances et la facturation avec un CRM de recouvrement 100% orienté encaissements.
        </p>
        {/* Animated Dashboard SVG Placeholder */}
        <div className="my-6">
          {/* Replace below with Lottie/SVG animation if available */}
          <svg width="320" height="80" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto animate-pulse">
            <rect x="10" y="10" width="300" height="60" rx="12" fill="#e0e7ff" />
            <rect x="30" y="30" width="60" height="15" rx="4" fill="#6366f1" />
            <rect x="110" y="30" width="80" height="15" rx="4" fill="#a5b4fc" />
            <rect x="210" y="30" width="80" height="15" rx="4" fill="#818cf8" />
            <circle cx="290" cy="20" r="6" fill="#22c55e" />
            <rect x="30" y="55" width="50" height="8" rx="4" fill="#fbbf24" />
            <rect x="110" y="55" width="60" height="8" rx="4" fill="#f87171" />
          </svg>
        </div>
        <button
          className="mt-2 px-7 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          onClick={onScrollToDemo}
        >
          Voir comment ça fonctionne <ArrowDownCircle className="inline w-5 h-5 ml-2" />
        </button>
      </div>

      {/* Comparaison Section */}
      <div className="max-w-3xl mx-auto my-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3 bg-white rounded-lg shadow p-6 border">
            <div className="flex items-center gap-2 text-red-500 font-semibold"><XCircle className="w-5 h-5" /> CRM classique</div>
            <ul className="text-left text-gray-700 ml-6 list-disc">
              <li>Pas de relances → <span className="text-green-600 font-bold">Relances automatiques par profil</span></li>
              <li>Suivi manuel → <span className="text-green-600 font-bold">Suivi automatisé</span></li>
              <li>Pas de lien avec facturation → <span className="text-green-600 font-bold">Synchronisation post-facture</span></li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 bg-white rounded-lg shadow p-6 border">
            <div className="flex items-center gap-2 text-blue-600 font-semibold"><CheckCircle className="w-5 h-5" /> Payment Flow</div>
            <ul className="text-left text-gray-700 ml-6 list-disc">
              <li>Relances automatiques par profil</li>
              <li>Suivi automatisé</li>
              <li>Synchronisation post-facture</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logos & Secteurs */}
      <div className="max-w-5xl mx-auto flex flex-wrap gap-8 items-center justify-center opacity-60 grayscale mb-8">
        {sectors.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="bg-gray-200 rounded-full p-3">{s.icon}</div>
            <span className="text-xs font-medium mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Mini personnalisation secteur */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-base shadow-sm animate-fade-in">
          <span>{sectorPhrases[sectorIdx]}</span>
        </div>
      </div>

      {/* Témoignage client */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <img src="/images/clara-m.jpeg" alt="Sophie M." className="w-10 h-10 rounded-full object-cover border-2 border-blue-200" />
            <span className="font-semibold text-gray-700">Clara M., gérante d’une PME du bâtiment</span>
          </div>
          <blockquote className="italic text-gray-600 text-center">
            “Grâce à Payment Flow, on a réduit notre DSO de 12 jours en 3 mois. Et on ne fait plus aucune relance à la main.”
          </blockquote>
        </div>
      </div>

      {/* Dernier CTA */}
      <div className="text-center">
        <div className="text-lg font-medium mb-3">🎥 Et si vous voyiez comment ça marche ?</div>
        <button
          className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          onClick={onScrollToDemo}
        >
          Lancer la démonstration interactive
        </button>
      </div>
    </section>
  );
}
