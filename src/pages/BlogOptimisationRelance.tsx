import React from "react";
import { Helmet } from "react-helmet-async";
import { FaUserCog, FaPhoneAlt, FaClock, FaShareAlt, FaHandshake, FaCheckCircle, FaChevronDown, FaBullseye, FaEnvelopeOpenText, FaChartLine } from "react-icons/fa";
import { Link } from "react-router-dom";

const accentColor = "#ff7043"; // orange accent
const navy = "#0a1833"; // dark blue

const sections = [
  {
    id: "erreur1",
    emoji: "❌",
    icon: <FaUserCog color={accentColor} className="inline mr-2" />,
    title: "Erreur n°1 : Appliquer le même scénario de relance à tous vos clients",
    description: (
      <>
        Vous avez décidé de mettre en place une procédure de relance ? Bonne initiative. Mais attention : <strong>tous vos clients ne réagissent pas de la même façon</strong>. Une seule procédure générique, c’est l’assurance de passer à côté de l’efficacité.<br /><br />
        <ul className="list-disc pl-6">
          <li>Certains clients ne lisent pas leurs mails : il faudra privilégier <strong>le téléphone</strong> ou même un courrier.</li>
          <li>Les mauvais payeurs doivent être relancés plus <strong>tôt, plus souvent, et avec plus de fermeté</strong>.</li>
          <li>À l’inverse, un grand compte nécessite <strong>subtilité et tact</strong>, pour préserver la relation commerciale.</li>
        </ul>
        <span className="block mt-2 text-blue-900 font-semibold">🔑 La clé : adapter votre ton, votre fréquence et votre canal à chaque typologie de client.</span>
        <span className="block mt-2">Avec Payment Flow, vous pouvez facilement créer des <strong>profils de relance personnalisés</strong> : grands comptes, TPE, clients export, clients à risque... Chaque profil a son propre scénario (canal, délai, discours).</span>
      </>
    ),
  },
  {
    id: "erreur2",
    emoji: "⏰",
    icon: <FaClock color={accentColor} className="inline mr-2" />,
    title: "Erreur n°2 : Attendre l’échéance pour relancer",
    description: (
      <>
        Beaucoup d’entreprises commencent à relancer une fois la facture arrivée à échéance. Problème : <strong>le client n’est pas toujours prêt à payer le jour même</strong>, surtout s’il découvre la facture en retard.<br /><br />
        <span className="block">La bonne pratique : <strong>intégrer une relance de prévenance.</strong></span>
        <span className="block mt-2">📩 Un simple message cordial <strong>5 à 8 jours avant l’échéance</strong> permet de :</span>
        <ul className="list-disc pl-6">
          <li>Rendre service au client (qui n’a pas toujours de rappel interne).</li>
          <li>Lui laisser le temps de s’organiser pour payer à temps.</li>
          <li>Détecter d’éventuelles difficultés et ajuster (ex. : proposer un échéancier).</li>
        </ul>
        <span className="block mt-2">Avec Payment Flow, vous pouvez <strong>automatiser cette étape</strong> pour ne jamais l’oublier — et améliorer vos délais de règlement sans effort.</span>
      </>
    ),
  },
  {
    id: "erreur3",
    emoji: "🎯",
    icon: <FaBullseye color={accentColor} className="inline mr-2" />,
    title: "Erreur n°3 : Ne relancer qu’une petite partie de ses clients",
    description: (
      <>
        Par manque de temps, <strong>seulement 20 % des débiteurs sont souvent relancés</strong>. Résultat : de nombreuses factures passent entre les mailles du filet, et votre trésorerie en souffre.<br /><br />
        <span className="block">💡 La solution : <strong>automatiser les relances à faible valeur ajoutée</strong>.</span>
        <span className="block mt-2">Grâce à Payment Flow, vous pouvez :</span>
        <ul className="list-disc pl-6">
          <li><strong>Relancer 100 % de vos clients</strong> en quelques clics.</li>
          <li>Personnaliser les messages tout en gardant un cadre automatique.</li>
          <li>Libérer votre équipe des tâches répétitives pour se concentrer sur les cas complexes.</li>
        </ul>
        <span className="block mt-2">👉 Vous réduisez votre <strong>DSO (Days Sales Outstanding)</strong> et récupérez du cash sans effort humain supplémentaire.</span>
      </>
    ),
  },
  {
    id: "erreur4",
    emoji: "🛑",
    icon: <FaShareAlt color={accentColor} className="inline mr-2" />,
    title: "Erreur n°4 : Garder les infos de paiement pour soi",
    description: (
      <>
        Dans certaines entreprises, <strong>la gestion des paiements reste confinée à la comptabilité</strong>, voire au dirigeant. Résultat : <strong>aucune synergie avec les autres services</strong>, alors que chacun pourrait jouer un rôle.<br /><br />
        <span className="block">Par exemple :</span>
        <ul className="list-disc pl-6">
          <li>Le <strong>commercial</strong>, souvent en contact direct avec le client, peut relancer avec plus d’impact.</li>
          <li>Le <strong>service client</strong> peut faire le lien en cas de litige.</li>
        </ul>
        <span className="block mt-2">Avec Payment Flow, vous activez le <strong>partage intelligent des informations</strong> :</span>
        <span className="block mt-2">📊 Des reportings automatiques, envoyés aux équipes concernées, permettent une <strong>collaboration fluide et efficace</strong>, sans surcharge de travail.</span>
      </>
    ),
  },
  {
    id: "erreur5",
    emoji: "💬",
    icon: <FaEnvelopeOpenText color={accentColor} className="inline mr-2" />,
    title: "Erreur n°5 : Ne plus communiquer après le paiement",
    description: (
      <>
        Une fois la facture payée, beaucoup d’entreprises ferment le dossier. Dommage : c’est une <strong>opportunité ratée pour fidéliser</strong>.<br /><br />
        🤝 Remercier votre client après encaissement, c’est :
        <ul className="list-disc pl-6">
          <li>Renforcer la relation.</li>
          <li>Montrer que vous avez une vision professionnelle et humaine.</li>
          <li>Créer un <strong>réflexe de paiement rapide</strong> à l’avenir.</li>
        </ul>
        <span className="block mt-2">💌 Un message simple, automatique mais personnalisé, peut faire toute la différence. Et bien sûr, <strong>Payment Flow vous permet de l’intégrer à votre cycle de relance</strong>.</span>
      </>
    ),
  },
];

export default function BlogOptimisationRelance() {
  return (
    <div style={{ background: navy, minHeight: "100vh", color: "#fff", fontFamily: 'Inter, Arial, sans-serif' }}>
      <Helmet>
        <title>Les 5 erreurs à éviter quand on relance ses clients | Blog Payment Flow</title>
        <meta name="description" content="Optimisez la relance de facture impayée (1ère et 2ème relance), découvrez les bonnes pratiques pour le recouvrement des créances client, la rédaction de lettre de relance, l’email recouvrement, le suivi des encours client et l’utilisation d’un logiciel recouvrement performant. Conseils pratiques pour PME et TPE pour réduire le risque d’impayé et accélérer les paiements." />
        <link rel="canonical" href="https://www.payment-flow.fr/blog/optimisation-relance" />
      </Helmet>
      {/* Sticky menu */}
      <header className="sticky top-0 z-50 bg-white shadow" style={{ borderBottom: `2px solid ${accentColor}` }}>
        <nav className="flex items-center justify-between px-4 py-2" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="flex items-center gap-2">
            <FaChartLine color={accentColor} size={28} />
            <span className="font-bold text-lg text-blue-900 tracking-tight" style={{ letterSpacing: 0.5 }}>Payment Flow</span>
          </div>
          <div className="flex gap-4 items-center">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="text-blue-900 font-medium hover:underline hover:text-orange-500 transition-colors text-sm hidden md:inline" style={{ letterSpacing: 0.1 }}>{s.emoji} {s.title.split(':')[0]}</a>
            ))}
            <a href="/contact" className="ml-4 px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow transition-colors text-sm">Demander une démo</a>
          </div>
        </nav>
      </header>
      {/* Header image & intro */}
      <section className="w-full flex flex-col items-center justify-center" style={{ background: '#fff', color: navy, padding: '2.5rem 1rem 1.5rem', borderBottom: `1px solid #eee` }}>
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" alt="Facture B2B paiement digital" className="rounded-lg shadow mb-6" style={{ maxWidth: 680, width: '100%', height: 220, objectFit: 'cover', border: `2px solid ${accentColor}` }} />
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center" style={{ color: navy }}>Les 5 erreurs à éviter quand on relance ses clients</h1>
        <div className="flex gap-4 text-gray-500 text-sm mb-3 items-center justify-center">
          <span>Payment Flow</span>
          <span>📅 Juillet 23, 2025</span>
          <span>⏱ Lecture : 5 min</span>
          <span>🔗 Partager</span>
        </div>
        <div className="text-lg text-center max-w-2xl mx-auto mb-2" style={{ color: navy }}>
          <span role="img" aria-label="objectif">🎯</span> <strong>L’objectif : être payé plus vite, sans perdre de temps ni altérer la relation commerciale.</strong> Voici les <strong>5 erreurs les plus fréquentes à éviter</strong> pour améliorer votre recouvrement.
        </div>
      </section>
      {/* Sections */}
      <main className="max-w-3xl mx-auto px-2 md:px-0 py-6">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="mb-12 bg-white rounded-xl shadow p-6 md:p-8 text-blue-900" style={{ borderLeft: `6px solid ${accentColor}` }}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{s.emoji}</span>
              {s.icon}
              <h2 className="text-xl md:text-2xl font-bold inline-block align-middle" style={{ color: navy }}>{s.title}</h2>
            </div>
            <div className="text-base md:text-lg leading-relaxed">
              {s.description}
            </div>
          </section>
        ))}
        {/* Bloc final Payment Flow */}
        <section className="mb-8 bg-blue-900 rounded-xl shadow p-6 md:p-8 text-white text-center" style={{ borderLeft: `6px solid ${accentColor}` }}>
          <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2"><FaCheckCircle color="#fff" /> Payment Flow, votre allié pour relancer intelligemment</h2>
          <ul className="list-disc pl-6 text-left mb-4">
            <li>✅ <strong>Classer vos clients</strong> et appliquer des scénarios de relance adaptés</li>
            <li>✅ <strong>Automatiser les relances</strong> à chaque étape (prévenance, relance simple, mise en demeure…)</li>
            <li>✅ <strong>Partager les informations clés</strong> avec vos équipes (compta, commerce, service client)</li>
            <li>✅ <strong>Suivre les résultats en temps réel</strong> depuis un tableau de bord clair</li>
          </ul>
          <div className="text-xl font-semibold mb-2">💬 Vous voulez arrêter de courir après vos paiements ?</div>
          <a href="https://www.paymentflow.fr/signup" className="inline-block px-6 py-3 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold shadow transition-colors text-lg">Testez Payment Flow dès maintenant</a>
        </section>
      </main>
    </div>
  );
}
