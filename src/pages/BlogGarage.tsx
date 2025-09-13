import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import {
  TestimonialBox,
  CaseStudyBlock,
  InfographicBlock,
  ChecklistDownload,
  ShareButtons,
  FAQAccordion,
  DSOEmbed,
  CTA,
  AnimatedGif,
  VideoEmbed
} from '../components/blog/BlogEnrichmentBlocks';
import { ArrowLeft } from 'lucide-react';
import ContactModal from "./ContactModal";

interface BlogSectorProps {
  setShowContact?: () => void;
  setDefaultSubject?: () => void;
}

const BlogGarage: React.FC = () => {
  const [showContact, setShowContact] = React.useState(false);
  const [defaultSubject, setDefaultSubject] = React.useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const pageUrl = "https://www.payment-flow.fr/blog-garage";
  const pageTitle = "Garage : Optimisez vos relances clients et réduisez votre DSO | Payment Flow";
  const [progress, setProgress] = React.useState(0);

  const blogPost = {
    title: "Garage AutoPro+ : 50% de temps gagné sur la relance client",
    company: "Garage AutoPro+",
    stars: 5,
    context: (
      <>
        <p><strong>Contexte :</strong> Garage AutoPro+, spécialiste de la réparation automobile à Nantes, faisait face à des retards de paiement récurrents et à une gestion chronophage des relances clients. L’équipe administrative passait plus de 8 heures par semaine à relancer les clients, avec un taux d’impayés de 5%.</p>
      </>
    ),
    problem: (
      <>
        <p><strong>Problématique :</strong> Malgré une bonne satisfaction client, le garage voyait sa trésorerie fragilisée par les retards de paiement et l’absence d’automatisation des relances. L’équipe voulait moderniser son suivi et se concentrer sur le service client plutôt que sur l’administratif.</p>
      </>
    ),
    solution: (
      <>
        <p><strong>Solution :</strong> En 2024, Garage AutoPro+ a choisi Payment Flow pour digitaliser l’ensemble du processus de relance :</p>
        <ul>
          <li>Relances automatiques par email et SMS personnalisés</li>
          <li>Encaissement en ligne via Stripe</li>
          <li>Tableau de bord interactif pour suivre les règlements en temps réel</li>
          <li>Scoring automatique des clients selon leur comportement de paiement</li>
          <li><span
    className="text-blue-700 font-bold text-2xl cursor-pointer hover:underline"
    onClick={() => {
      setShowContact(true);
      setDefaultSubject('audit');
    }}
  >
    Contactez-nous pour un audit personnalisé !
  </span></li>
        </ul>
        {/* Modale de contact */}
        {showContact && (
          <ContactModal onClose={() => setShowContact(false)} defaultSubject={defaultSubject} />
        )}
      </>
    ),
  results: (
    <>
      <p><strong>Résultats :</strong></p>
      <ul>
        <li><strong>Temps de relance divisé par 2</strong> : 4h/semaine seulement</li>
        <li><strong>DSO réduit de 35%</strong></li>
        <li><strong>Taux d’impayés passé de 5% à 0,5%</strong></li>
        <li>Clients plus satisfaits grâce à la clarté des relances</li>
      </ul>
    </>
  ),
  quote: (
    <em>« Grâce à Payment Flow, la gestion des relances est devenue un vrai atout business. Nous avons retrouvé du temps pour nos clients et sécurisé notre trésorerie. »</em>
  )
};

const Stars = ({ count }: { count: number }) => (
  <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
    {[...Array(count)].map((_, i) => (
      <FaStar key={i} color="#FFD700" size={18} />
    ))}
  </div>
);

const BlogGarage: React.FC<BlogSectorProps> = (props) => {
  // Progression de lecture (0-100)
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const handleScroll = () => {
      const main = document.querySelector('.blog-page-container');
      if (!main) return setProgress(0);
      const rect = main.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const total = main.scrollHeight - windowHeight;
      const scrolled = window.scrollY - rect.top + window.scrollY;
      let percent = total > 0 ? (scrolled / total) * 100 : 0;
      percent = Math.max(0, Math.min(100, percent));
      setProgress(percent);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div>
      <h1>{blogPost.title}</h1>
      <h2>{blogPost.company}</h2>
      <div>{blogPost.context}</div>
      <div>{blogPost.problem}</div>
      <div>{blogPost.solution}</div>
      <div>{blogPost.results}</div>
    </div>
  );
}

  // ... le reste du composant sans redéclaration de navigate/pageUrl/pageTitle

  // SEO keywords for natural insertion
  const keywords = [
    "relance client", "impayés", "DSO", "délai de paiement", "solution SaaS relance", "facilité de paiement", "trésorerie TPE", "logiciel de recouvrement", "automatisation relances", "encaissements", "BTP impayés", "artisan gestion client", "garage paiement différé", "facturation simplifiée", "suivi des créances", "cash-flow entreprise"
  ];

  // FAQ example
  const faqItems = [
    {
      question: "Comment réduire le DSO dans un garage ?",
      answer: "L’automatisation des relances clients, la facturation simplifiée et le suivi régulier des encaissements sont les clés pour réduire le DSO et améliorer la trésorerie d’un garage."
    },
    {
      question: "Quels sont les avantages d’un logiciel de recouvrement pour un garage ?",
      answer: "Un logiciel de recouvrement comme Payment Flow permet de gagner du temps, d’automatiser les relances, de réduire les impayés et d’optimiser le cash-flow entreprise."
    },
    {
      question: "Comment éviter les retards de paiement ?",
      answer: "Envoyez des rappels réguliers, proposez des facilités de paiement et mettez à disposition un simulateur DSO pour sensibiliser vos clients."
    }
  ];

  return (
    <div className="blog-page-container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
       {/* Main Pricing Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2 pt-4">
  <button
    onClick={() => navigate('/temoignages')}
    className="flex items-center gap-2 text-xl font-medium text-blue-600 hover:text-blue-800 transition-colors"
  >
    <ArrowLeft className="w-4 h-4" />
    Retour
  </button>
</div>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="Découvrez comment les garages digitalisent la relance client, réduisent les impayés et optimisent leur trésorerie avec Payment Flow. Témoignages, cas d’usage, infographies, checklist et simulateur DSO inclus." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
      </Helmet>
      {/* Barre de progression sticky lecture */}
      <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 1000, background: 'white'}}>
        <div style={{width: '100%', height: 6, background: '#e5e7eb'}}>
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

       {/* Barre de progression sticky lecture */}
       <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 1000, background: 'white'}}>
         <div style={{width: '100%', height: 6, background: '#e5e7eb'}}>
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

      {/* Boutons de partage en haut */}
      <ShareButtons url={pageUrl} title={pageTitle} />

      <div className="flex justify-center w-full">
        <div className="mt-4 mb-12 max-w-3xl w-full px-4">
          <h1 className="text-3xl font-bold mb-6">Garage : Comment diviser par deux vos retards de paiement ?</h1>


          {/* Bloc structuré Contexte/Problématique/Solution/Résultats/Citation */}
          <div className="mb-10 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-2">Garage AutoPro+ : 50% de temps gagné sur la relance client</h2>
            <div className="mb-2 text-sm text-gray-500">Entreprise : Garage AutoPro+</div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">★</span>
              ))}
            </div>
            <p className="mb-2"><strong>Contexte :</strong> Garage AutoPro+, spécialiste de la réparation automobile à Nantes, faisait face à des retards de paiement récurrents et à une gestion chronophage des relances clients. L’équipe administrative passait plus de 8 heures par semaine à relancer les clients, avec un taux d’impayés de 5%.</p>
            <p className="mb-2"><strong>Problématique :</strong> Malgré une bonne satisfaction client, le garage voyait sa trésorerie fragilisée par les retards de paiement et l’absence d’automatisation des relances. L’équipe voulait moderniser son suivi et se concentrer sur le service client plutôt que sur l’administratif.</p>
            <p className="mb-2"><strong>Solution :</strong> En 2024, Garage AutoPro+ a choisi Payment Flow pour digitaliser l’ensemble du processus de relance :</p>
            <ul className="list-disc pl-5 mb-2">
              <li>Relances automatiques par email et SMS personnalisés</li>
              <li>Encaissement en ligne via Stripe</li>
              <li>Tableau de bord interactif pour suivre les règlements en temps réel</li>
              <li>Scoring automatique des clients selon leur comportement de paiement</li>
              <li>
                <span
                  className="text-blue-700 font-bold text-2xl cursor-pointer hover:underline"
                  onClick={() => {
                    if (typeof setShowContact === 'function') setShowContact(true);
                    if (typeof setDefaultSubject === 'function') setDefaultSubject('audit');
                  }}
                >
                  Contactez-nous pour un audit personnalisé !
                </span>
              </li>
            </ul>
            <div className="mb-2 font-semibold">Résultats :</div>
            <ul className="list-disc pl-5 mb-2">
              <li><strong>Temps de relance divisé par 2</strong> : 4h/semaine seulement</li>
              <li><strong>DSO réduit de 35%</strong></li>
              <li><strong>Taux d’impayés passé de 5% à 0,5%</strong></li>
              <li>Clients plus satisfaits grâce à la clarté des relances</li>
            </ul>
            <blockquote className="italic text-blue-700 mt-4">« Grâce à Payment Flow, la gestion des relances est devenue un vrai atout business. Nous avons retrouvé du temps pour nos clients et sécurisé notre trésorerie. »</blockquote>
          </div>

      {/* Témoignage client */}
      <TestimonialBox
        quote="Grâce à Payment Flow, la gestion des relances est devenue un vrai atout business. Nous avons retrouvé du temps pour nos clients et sécurisé notre trésorerie."
        author="Garage AutoPro+ (Nantes)"
        gain="–35% de DSO en 3 mois"
      />

      {/* Mini-cas d’usage / étude de cas */}
      <CaseStudyBlock title="Cas d’usage concret : passage à l’automatisation">
        Avant Payment Flow : 8h/semaine consacrées aux relances, taux d’impayés à 5%.<br />
        Après : <strong>4h/semaine</strong> seulement, <strong>taux d’impayés divisé par 10</strong>, trésorerie stabilisée.<br />
        <ul className="list-disc pl-5 mt-2">
          <li>Relances automatiques par email/SMS</li>
          <li>Encaissement en ligne (Stripe)</li>
          <li>Tableau de bord temps réel</li>
          <li>Scoring client</li>
        </ul>
      </CaseStudyBlock>

      {/* Encart infographie */}
      <div className="max-w-xs md:max-w-md mx-auto">
        <InfographicBlock
          src="/images/dso_garage_moyen.png"
          alt="Infographie DSO moyen garages"
          caption="DSO moyen dans les garages en France : 41 jours (source : étude 2024)"
        />
      </div>

      {/* Checklist téléchargeable */}
      <ChecklistDownload url="/docs/checklist-retard-paiement-garage.pdf" label="Télécharger la checklist : Comment éviter les retards de paiement" />

      {/* Bloc FAQ / accordéon */}
      <FAQAccordion items={faqItems} />

      {/* Simulateur embarqué */}
      <div className="flex justify-center my-6">
  <CTA label="Calculez votre DSO gratuitement" href="/simulateur-dso" />
</div>


      {/* Vidéo intégrée */}
      <VideoEmbed src="/videos/demo-garage.mp4" title="1 min pour comprendre la relance automatisée" />

      {/* Visuels métiers */}
      <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center">

  <button
    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    onClick={() => navigate('/blog-manufacture')}
  >
    Voir le cas suivant : Ouestelio
  </button>
</div>
       <div className="flex flex-col items-center">
  
  <button
    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    onClick={() => navigate('/blog-communication')}
  >
    Voir le cas suivant : Image de marque
  </button>
</div>
      </div>

      {/* Liens internes */}
      <div className="my-6 flex flex-wrap gap-4">
        <a href="/simulateur-dso" className="text-blue-700 underline hover:text-blue-900">Simulateur DSO</a>
        <a href="/demo" className="text-blue-700 underline hover:text-blue-900">Demander une démo</a>
        <a href="/temoignages" className="text-blue-700 underline hover:text-blue-900">Voir d’autres témoignages</a>
        <a href="/" className="text-blue-700 underline hover:text-blue-900">Accueil Payment Flow</a>
      </div>

      {/* Liens sortants */}
      <div className="my-6 flex flex-wrap gap-4">
        <a href="https://www.lenbox.io" target="_blank" rel="noopener noreferrer" className="text-green-700 underline hover:text-green-900">Partenaire facilité de paiement : Lenbox</a>
        <a href="https://www.floapay.fr" target="_blank" rel="noopener noreferrer" className="text-green-700 underline hover:text-green-900">Partenaire facilité de paiement : FloaPay</a>
        <a href="https://www.lesechos.fr/finance-marches/banque-assurances/les-retards-de-paiement-fragilisent-les-tpe-1938701" target="_blank" rel="noopener noreferrer" className="text-gray-700 underline hover:text-gray-900">Étude DSO Les Échos</a>
      </div>

      {/* CTA fin d’article */}
      <CTA label="Essayez Payment Flow gratuitement 30 jours" href="/signup" variant="primary" />

      {/* Boutons de partage en bas */}
      <ShareButtons url={pageUrl} title={pageTitle} />
    </div>
    </div>
    </div>
  );
};

export default BlogGarage;
