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
  CTA,
  VideoEmbed
} from '../components/blog/BlogEnrichmentBlocks';
import { ArrowLeft } from 'lucide-react';

interface BlogSectorProps {
  setShowContact?: () => void;
  setDefaultSubject?: () => void;
}

const blogPost = {
  title: "Ouestelio : la relance client digitalisée et automatisée",
  company: "Ouestelio",
  stars: 5,
  context: (
    <>
      <p><strong>Contexte :</strong> Ouestelio, entreprise d’impression numérique à Brest, gérait manuellement ses relances clients, ce qui entraînait des oublis et des retards de paiement fréquents. La direction voulait fiabiliser la trésorerie et réduire le temps passé à l’administratif.</p>
    </>
  ),
  problem: (
    <>
      <p><strong>Problématique :</strong> Malgré la croissance de l’activité, les délais de paiement s’allongeaient et le DSO dépassait 60 jours. L’équipe voulait réduire les impayés et éviter les tensions de trésorerie.</p>
    </>
  ),
  solution: (
    <>
      <p><strong>Solution :</strong> En 2024, Ouestelio a déployé Payment Flow pour :</p>
      <ul>
        <li><h4 className="text-base font-semibold inline">Automatiser toutes les relances</h4> (emails, SMS, rappels personnalisés)</li>
        <li><h4 className="text-base font-semibold inline">Centraliser le suivi des règlements</h4> via un tableau de bord</li>
        <li><h4 className="text-base font-semibold inline">Connecter Payment Flow à Sage 100</h4> pour une synchronisation en temps réel</li>
        <li><h4 className="text-base font-semibold inline">Analyser les comportements de paiement</h4> via le scoring intégré</li>
      </ul>
    </>
  ),
  results: (
    <>
      <p><strong>Résultats :</strong></p>
      <ul>
        <li><h4 className="text-base font-semibold inline">DSO réduit de 35%</h4> en 6 mois</li>
        <li><h4 className="text-base font-semibold inline">Taux d’impayés passé sous 1%</h4></li>
        <li><h4 className="text-base font-semibold inline">Temps de gestion divisé par 3</h4></li>
        <li><h4 className="text-base font-semibold inline">Visibilité temps réel sur les flux de trésorerie</h4></li>
      </ul>
    </>
  ),
  quote: (
    <em>« Avec Payment Flow, nous avons digitalisé la relance client et retrouvé une trésorerie saine. Les équipes sont plus sereines et nos clients paient plus vite. »</em>
  )
};

const Stars = ({ count }: { count: number }) => (
  <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
    {[...Array(count)].map((_, i) => (
      <FaStar key={i} color="#FFD700" size={18} />
    ))}
  </div>
);

interface BlogSectorProps {
  setShowContact?: () => void;
  setDefaultSubject?: () => void;
}

const BlogManufacture: React.FC<BlogSectorProps> = ({ setShowContact, setDefaultSubject }) => {
  const navigate = useNavigate();

  const pageUrl = "https://www.payment-flow.fr/blog-manufacture";
  const pageTitle = "Ouestelio : la relance client digitalisée et automatisée | Payment Flow";

  // SEO keywords for natural insertion
  const keywords = [
    "relance client", "impayés", "DSO", "délai de paiement", "solution SaaS relance", "automatisation relances", "tableau de bord Sage", "impression numérique", "fiabiliser trésorerie", "PME Bretagne", "paiement Sage 100"
  ];

  // FAQ example
  const faqItems = [
    {
      question: "Comment Ouestelio a-t-elle réduit ses impayés ?",
      answer: "En automatisant toutes les relances clients (email/SMS), en centralisant le suivi sur Payment Flow et en connectant Sage 100 pour une synchronisation en temps réel."
    },
    {
      question: "Quels bénéfices pour la trésorerie ?",
      answer: "DSO réduit de 35%, taux d’impayés sous 1%, temps de gestion divisé par 3, visibilité temps réel sur les flux de trésorerie."
    }
  ];


  return (
    <div className="blog-page-container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
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
        <title>Blog Manufacture | Payment Flow</title>
        <meta name="description" content="Découvrez comment Ouestelio a digitalisé et automatisé la relance client avec Payment Flow. Témoignages, chiffres et cas pratiques." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.payment-flow.fr/blog-manufacture" />
      </Helmet>
      {/* Share Buttons */}
      <ShareButtons url={pageUrl} title={pageTitle} />
      <h1 className="text-3xl font-bold mb-6">Ouestelio : la relance client digitalisée et automatisée</h1>
      {/* Bloc structuré Contexte/Problématique/Solution/Résultats/Citation */}
      <div className="mb-10 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-2">{blogPost.title}</h2>
        <div className="mb-2 text-sm text-gray-500">Entreprise : {blogPost.company}</div>
        <Stars count={blogPost.stars} />
        <section className="mb-4">
          <h3 className="text-lg font-bold mb-2">Contexte</h3>
          {blogPost.context}
        </section>
        <section className="mb-4">
          <h3 className="text-lg font-bold mb-2">Problématique</h3>
          {blogPost.problem}
        </section>
        <section className="mb-4">
          <h3 className="text-lg font-bold mb-2">Solution</h3>
          {blogPost.solution}
        </section>
        <section className="mb-4">
          <h3 className="text-lg font-bold mb-2">Résultats</h3>
          {blogPost.results}
        </section>
        <blockquote className="italic text-blue-700">{blogPost.quote}</blockquote>
      </div>
      {/* Testimonial block */}
      <TestimonialBox
        quote="Grâce à Payment Flow, la relance client est automatisée et notre trésorerie est fiabilisée. Les équipes sont plus sereines, les paiements arrivent plus vite."
        author="Ouestelio (Rennes)"
        gain="–35% de DSO en 6 mois"
      />
      {/* Mini-cas d’usage / étude de cas */}
      <CaseStudyBlock title="Cas d’usage concret : passage à l’automatisation">
        Avant Payment Flow : relances manuelles, oublis fréquents, retards de paiement, DSO à 60 jours.<br />
        Après : <strong>relances automatiques</strong>, <strong>DSO réduit à 39 jours</strong>, <strong>taux d’impayés sous 1%</strong>.<br />
        <ul className="list-disc pl-5 mt-2">
          <li>Relances email/SMS automatisées</li>
          <li>Suivi des règlements en temps réel</li>
          <li>Connexion à Sage 100</li>
          <li>Scoring clients</li>
        </ul>
      </CaseStudyBlock>
      {/* Infographie */}
      <div className="max-w-xs md:max-w-md mx-auto">
        <InfographicBlock
          src="/images/dso_manufacture_moyen.png"
          alt="Infographie DSO moyen manufacture"
          caption="DSO moyen dans l’industrie manufacturière : 54 jours (source : étude 2024)"
        />
      </div>
      {/* Checklist téléchargeable */}
      <ChecklistDownload url="/docs/checklist-retard-paiement-manufacture.pdf" label="Télécharger la checklist : Comment éviter les retards de paiement" />
      {/* FAQ */}
      <FAQAccordion items={faqItems} />
      {/* Simulateur DSO CTA */}
      <div className="flex justify-center my-6">
        <CTA label="Calculez votre DSO gratuitement" href="/simulateur-dso" />
      </div>
      {/* Vidéo */}
      <VideoEmbed src="/videos/demo-manufacture.mp4" title="1 min pour comprendre la relance automatisée" />

      {/* Visuels métiers / navigation cas suivants */}
      <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => navigate('/blog-communication')}
          >
            Voir le cas suivant : Image de marque
          </button>
        </div>
        <div className="flex flex-col items-center">
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => navigate('/blog-garage')}
          >
            Voir le cas précédent : Garage AutoPro+
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
  );
}

export default BlogManufacture;
