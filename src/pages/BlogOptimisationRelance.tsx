import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FaUserCog, FaPhoneAlt, FaClock, FaShareAlt, FaHandshake, FaCheckCircle, FaChevronDown, FaBullseye, FaEnvelopeOpenText, FaChartLine } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ShareButtons } from '../components/blog/BlogEnrichmentBlocks';
import Footer from '../components/Footer';

const accentColor = "#2563eb"; // bleu Payment Flow
const navy = "#1e293b"; // bleu foncé Payment Flow (ex: text-blue-900)

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
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  // Progression de lecture (0-100)
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleProgress = () => {
      // Trouver la zone de scroll principale (après le header)
      const main = document.querySelector('main');
      if (!main) return setProgress(0);
      const mainRect = main.getBoundingClientRect();
      const mainTop = mainRect.top + window.scrollY;
      const mainHeight = main.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollBottom = window.scrollY + windowHeight;
      const mainBottom = mainTop + mainHeight;
      let percent = ((scrollBottom - mainTop) / (mainHeight));
      percent = Math.max(0, Math.min(1, percent));
      setProgress(percent * 100);
    };
    window.addEventListener('scroll', handleProgress, { passive: true });
    handleProgress();
    return () => window.removeEventListener('scroll', handleProgress);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const windowCenter = window.innerHeight / 2;
      const sectionCenters = sectionRefs.current.map(ref => {
        if (!ref) return Infinity;
        const rect = ref.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
      // Cherche la section dont le centre est le plus proche du centre de la fenêtre
      let minDist = Infinity;
      let activeIdx = 0;
      sectionCenters.forEach((center, idx) => {
        const dist = Math.abs(center - windowCenter);
        if (dist < minDist) {
          minDist = dist;
          activeIdx = idx;
        }
      });
      setActiveSection(sections[activeIdx].id);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useNavigate();
  return (
    <div style={{ background: '#fff', minHeight: "100vh", color: navy, fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2 pt-4">
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-xl font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      </div>
      <Helmet>
        <title>Les 5 erreurs à éviter quand on relance ses clients | Blog Payment Flow</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="Optimisez la relance de facture impayée (1ère et 2ème relance), découvrez les bonnes pratiques pour le recouvrement des créances client, la rédaction de lettre de relance, l’email recouvrement, le suivi des encours client et l’utilisation d’un logiciel recouvrement performant. Conseils pratiques pour PME et TPE pour réduire le risque d’impayé et accélérer les paiements." />
        <link rel="canonical" href="https://www.payment-flow.fr/blog/optimisation-relance" />
      </Helmet>

      {/* Header image & intro */}
      <section className="w-full flex flex-col items-center justify-center" style={{ background: '#fff', color: navy, padding: '2.5rem 1rem 1.5rem' }}>
        <img src="/images/blog-optimisation-relances-2.png" alt="Optimisation des relances - illustration PME" className="rounded-lg shadow mb-6" style={{ maxWidth: 680, width: '100%', height: 240, objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
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

      {/* Barre de progression sticky lecture */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 1000, background: 'white' }}>
        <div style={{ width: '100%', height: 6, background: '#e5e7eb' }}>
          <div
            style={{
              width: `${progress}%`,
              height: 6,
              background: '#2563eb',
              transition: 'width 0.2s',
              borderRadius: 3
            }}
          />
        </div>
      </div>

      {/* Barre latérale de progression (desktop) */}
      <div className="relative flex w-full max-w-7xl mx-auto">
        <aside className="hidden md:flex flex-col items-center mr-8 mt-12 sticky top-28 h-fit" style={{ minWidth: 70 }}>
          {sections.map((s, idx) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`flex flex-col items-center group mb-6 transition-all duration-300 ${activeSection === s.id ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
              style={{ color: activeSection === s.id ? accentColor : navy }}
            >
              <span className={`text-3xl mb-1 transition-all duration-300 ${activeSection === s.id ? 'drop-shadow-lg' : ''}`}>{s.emoji}</span>
              <span className="text-xs font-semibold text-center w-16 leading-tight group-hover:underline">
                {s.title.split(':')[0]}
              </span>
              {idx < sections.length - 1 && <span className="w-1 h-6 bg-gray-200 block mx-auto my-1 rounded-full"></span>}
            </a>
          ))}
        </aside>
        {/* Sections avec animation */}
        <main className="flex-1 max-w-3xl px-2 md:px-0 py-6">
          {sections.map((s, i) => (
            <motion.section
              key={s.id}
              id={s.id}
              ref={el => {
                sectionRefs.current[i] = el;
              }}
              className="mb-12 bg-white rounded-xl shadow p-6 md:p-8 text-blue-900"
              style={{ borderLeft: `6px solid ${accentColor}` }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: activeSection === s.id ? 1 : 0.5, y: activeSection === s.id ? 0 : 30 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{s.emoji}</span>
                {s.icon}
                <h2 className="text-xl md:text-2xl font-bold inline-block align-middle" style={{ color: navy }}>{s.title}</h2>
              </div>
              <div className="text-base md:text-lg leading-relaxed">
                {s.description}
              </div>
            </motion.section>
          ))}
          {/* Bloc final Payment Flow */}
          <section className="mb-8 bg-white rounded-xl shadow p-6 md:p-8 text-blue-900 text-center" style={{ borderLeft: `6px solid ${accentColor}` }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2"><FaCheckCircle color={accentColor} /> Payment Flow, votre allié pour relancer intelligemment</h2>
            <ul className="list-disc pl-6 text-left mb-4">
              <li>✅ <strong>Classer vos clients</strong> et appliquer des scénarios de relance adaptés</li>
              <li>✅ <strong>Automatiser les relances</strong> à chaque étape (prévenance, relance simple, mise en demeure…)</li>
              <li>✅ <strong>Partager les informations clés</strong> avec vos équipes (compta, commerce, service client)</li>
              <li>✅ <strong>Suivre les résultats en temps réel</strong> depuis un tableau de bord clair</li>
            </ul>
            {/* Liens de partage réseaux sociaux */}
            <ShareButtons url="https://www.payment-flow.fr/blog-optimisation-relance" title="Les 5 erreurs à éviter quand on relance ses clients | Blog Payment Flow" />
            <div className="text-xl font-semibold mb-2">💬 Vous voulez arrêter de courir après vos paiements ?</div>
            <Link
              to="https://www.payment-flow.fr/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1e293b] text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              style={{ letterSpacing: 0.2 }}
            >
              Testez Payment Flow dès maintenant
            </Link>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
