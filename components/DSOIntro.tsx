import { BarChart2, AlertTriangle, CheckCircle, Wrench, Building2, Car, Rocket, Factory } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

const sectors = [
  { icon: <Building2 className="w-7 h-7" />, label: "BTP" },
  { icon: <Wrench className="w-7 h-7" />, label: "Artisanat" },
  { icon: <Car className="w-7 h-7" />, label: "Garages & auto" },
  { icon: <Rocket className="w-7 h-7" />, label: "Startups" },
  { icon: <Factory className="w-7 h-7" />, label: "Industrie" },
  { icon: <CheckCircle className="w-7 h-7" />, label: "PME & TPE" },
];

export default function DSOIntro({ onScrollToSimulator }: { onScrollToSimulator: () => void }) {
  return (
    <section className="bg-gradient-to-b from-blue-50 via-white to-white w-full py-12 md:py-20 border-b border-blue-100">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center gap-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-0">
          Logiciel de recouvrement créances
        </h1>
        <h2 className="text-3xl md:text-5xl font-extrabold text-blue-700 mb-2">
          Mesurez l’impact réel de vos impayés
        </h2>
        <p className="text-lg md:text-2xl text-gray-700 mb-4 max-w-2xl mx-auto">
          Découvrez votre DSO en quelques clics et reprenez le contrôle de vos encaissements.
        </p>
        {/* Animated SVG Placeholder */}
        <div className="my-6">
          <svg width="280" height="80" viewBox="0 0 280 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto animate-pulse">
            <rect x="10" y="30" width="240" height="25" rx="12" fill="#e0e7ff" />
            <rect x="30" y="40" width="80" height="7" rx="4" fill="#6366f1" />
            <rect x="120" y="40" width="60" height="7" rx="4" fill="#a5b4fc" />
            <rect x="190" y="40" width="40" height="7" rx="4" fill="#818cf8" />
            <text x="40" y="25" fill="#60a5fa" fontSize="13">Cash</text>
            <text x="120" y="25" fill="#fbbf24" fontSize="13">Retards</text>
            <text x="200" y="25" fill="#f87171" fontSize="13">Relances</text>
            <polyline points="30,70 60,60 100,55 150,50 190,60 230,75" fill="none" stroke="#f87171" strokeWidth="3" />
          </svg>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="mt-2 px-7 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          onClick={onScrollToSimulator}
        >
          Lancer le simulateur DSO
        </motion.button>
      </div>

      {/* Bloc pédagogique DSO */}
      <div className="max-w-2xl mx-auto my-12 bg-blue-50 rounded-lg p-6 flex flex-col items-center shadow">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-6 h-6 text-blue-600" />
          <span className="font-semibold text-blue-700">C’est quoi le DSO&nbsp;?</span>
        </div>
        <div className="text-gray-700 text-base text-center mb-2">
          Le DSO (Days Sales Outstanding) mesure le délai moyen de paiement de vos clients. Un indicateur clé pour votre trésorerie.
        </div>
        <div className="flex gap-8 items-center mt-2">
          <div className="flex flex-col items-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
            <span className="text-xs mt-1 text-red-600 font-semibold">DSO élevé</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle className="w-7 h-7 text-green-500" />
            <span className="text-xs mt-1 text-green-700 font-semibold">DSO maîtrisé</span>
          </div>
        </div>
      </div>

      {/* Secteurs touchés */}
      <div className="max-w-5xl mx-auto mb-12">
        <h3 className="text-center text-lg font-medium mb-4 text-blue-700">Certaines activités sont plus exposées aux retards de paiement. Et vous&nbsp;?</h3>
        <div className="flex flex-wrap gap-8 items-center justify-center opacity-70 grayscale">
          {sectors.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="bg-gray-200 rounded-full p-3">{s.icon}</div>
              <h4 className="text-xs font-medium mt-1">{s.label}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Bloc bénéfices */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
            <span className="text-gray-700">Repérez les points de blocage dans votre cycle de paiement</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
            <span className="text-gray-700">Montrez à vos partenaires financiers que vous pilotez</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
            <span className="text-gray-700">Adaptez votre stratégie de relance clients</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
            <span className="text-gray-700">Suivez l’évolution de votre performance dans le temps</span>
          </div>
        </div>
      </div>

      {/* Témoignage client */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <img src="/images/jerome.jpeg" alt="Jérôme, gérant PME" className="w-10 h-10 rounded-full object-cover border-2 border-blue-200" />
            <span className="font-semibold text-gray-700">Jérôme, gérant d’une PME du bâtiment</span>
          </div>
          <blockquote className="italic text-gray-600 text-center">
            “On pensait avoir un bon suivi des paiements… mais le simulateur nous a prouvé le contraire. Merci Payment Flow !”
          </blockquote>
        </div>
      </div>

      {/* Dernier CTA */}
      <div className="text-center">
        <div className="text-lg font-medium mb-3">📊 Et si vous faisiez le test maintenant ?</div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
          onClick={onScrollToSimulator}
        >
          Lancer le simulateur DSO
        </motion.button>
      </div>
    </section>
  );
}
