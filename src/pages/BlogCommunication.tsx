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
  title: "Image de Marque : la communication au service du cash-flow",
  company: "Image de Marque",
  stars: 5,
  context: (
    <>
      <p><strong>Contexte :</strong> Image de Marque, agence de communication à Brest, gérait ses relances clients via des tableurs et des emails manuels. Les délais de paiement s’allongeaient, impactant la trésorerie et la croissance de l’agence.</p>
    </>
  ),
  problem: (
    <>
      <p><strong>Problématique :</strong> L’équipe voulait se concentrer sur la créativité et la relation client, mais passait trop de temps à relancer et à suivre les paiements. Les relances manuelles étaient source de stress et d’oubli.</p>
    </>
  ),
  solution: (
    <>
      <p><strong>Solution :</strong> En 2024, Image de Marque a adopté Payment Flow pour :</p>
      <ul>
        <li>Automatiser les relances (email, SMS, rappels personnalisés)</li>
        <li>Intégrer QuickBooks pour la synchronisation des factures</li>
        <li>Disposer d’un tableau de bord analytique pour suivre la performance</li>
        <li>Scorer les clients selon leur comportement de paiement</li>
      </ul>
    </>
  ),
  results: (
    <>
      <p><strong>Résultats :</strong></p>
      <ul>
        <li><strong>DSO réduit de 30%</strong></li>
        <li>Taux d’impayés inférieur à 1%</li>
        <li>Temps de gestion administratif divisé par 3</li>
        <li>Clients plus satisfaits et moins de litiges</li>
      </ul>
    </>
  ),
  quote: (
    <em>« Grâce à Payment Flow, notre gestion financière est fluide et moderne. On peut enfin se concentrer sur la relation client et la créativité. »</em>
  )
};

function Stars({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
      {[...Array(count)].map((_, i) => (
        <FaStar key={i} color="#FFD700" size={18} />
      ))}
    </div>
  );
}

interface BlogSectorProps {
  setShowContact?: () => void;
  setDefaultSubject?: () => void;
}

const BlogCommunication: React.FC<BlogSectorProps> = ({ setShowContact, setDefaultSubject }) => {
  const navigate = useNavigate();
  const pageUrl = "https://www.payment-flow.fr/blog-communication";
  const pageTitle = "Image de Marque : la communication au service du cash-flow | Payment Flow";

  // FAQ example
  const faqItems = [
    {
      question: "Comment une agence peut-elle réduire son DSO ?",
      answer: "En automatisant les relances, en intégrant la facturation et en suivant les paiements via un tableau de bord analytique."
    },
    {
      question: "Quels bénéfices pour la relation client ?",
      answer: "Moins de relances manuelles, moins de litiges, plus de temps pour la créativité et la satisfaction client."
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
        <title>Blog Communication | Payment Flow</title>
        <meta name="description" content="Découvrez comment Image de Marque a modernisé la gestion clients avec Payment Flow. Témoignages, chiffres et cas pratiques." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.payment-flow.fr/blog-communication" />
      </Helmet>
      {/* Share Buttons */}
      <ShareButtons url={pageUrl} title={pageTitle} />
      <h1 className="text-3xl font-bold mb-6">Image de Marque : la communication au service du cash-flow</h1>
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
          <ul>
            <li><h4 className="text-base font-semibold inline">Automatiser les relances</h4> (email, SMS, rappels personnalisés)</li>
            <li><h4 className="text-base font-semibold inline">Intégrer QuickBooks</h4> pour la synchronisation des factures</li>
            <li><h4 className="text-base font-semibold inline">Tableau de bord analytique</h4> pour suivre la performance</li>
            <li><h4 className="text-base font-semibold inline">Scorer les clients</h4> selon leur comportement de paiement</li>
          </ul>
        </section>
        <section className="mb-4">
          <h3 className="text-lg font-bold mb-2">Résultats</h3>
          <ul>
            <li><h4 className="text-base font-semibold inline">DSO réduit de 30%</h4></li>
            <li><h4 className="text-base font-semibold inline">Taux d’impayés inférieur à 1%</h4></li>
            <li><h4 className="text-base font-semibold inline">Temps de gestion administratif divisé par 3</h4></li>
            <li><h4 className="text-base font-semibold inline">Clients plus satisfaits et moins de litiges</h4></li>
          </ul>
        </section>
        <blockquote className="italic text-blue-700">{blogPost.quote}</blockquote>
      </div>
      {/* Testimonial block */}
      <TestimonialBox
        quote="Grâce à Payment Flow, notre gestion financière est fluide et moderne. On peut enfin se concentrer sur la relation client et la créativité."
        author="Image de Marque (Brest)"
        gain="DSO réduit de 30% en 6 mois"
      />
      {/* Mini-cas d’usage / étude de cas */}
      <CaseStudyBlock title="Cas d’usage concret : passage à l’automatisation">
        Avant Payment Flow : relances manuelles, oublis, retards de paiement.<br />
        Après : <strong>relances automatiques</strong>, <strong>DSO réduit de 30%</strong>, <strong>taux d’impayés sous 1%</strong>.<br />
        <ul className="list-disc pl-5 mt-2">
          <li>Relances email/SMS automatisées</li>
          <li>Suivi analytique des encaissements</li>
          <li>Connexion QuickBooks</li>
          <li>Scoring clients</li>
        </ul>
      </CaseStudyBlock>
      {/* Infographie */}
      <div className="max-w-xs md:max-w-md mx-auto">
        <InfographicBlock
          src="/images/dso_agence_comm.png"
          alt="Infographie DSO moyen agence communication"
          caption="DSO moyen dans la communication : 56 jours (source : étude 2024)"
        />
      </div>
      {/* Checklist téléchargeable */}
      <ChecklistDownload url="/docs/checklist-retard-paiement-communication.pdf" label="Télécharger la checklist : Comment éviter les retards de paiement" />
      {/* FAQ */}
      <FAQAccordion items={faqItems} />
      {/* Simulateur DSO CTA */}
      <div className="flex justify-center my-6">
        <CTA label="Calculez votre DSO gratuitement" href="/simulateur-dso" />
      </div>
      {/* Vidéo */}
      <VideoEmbed src="/videos/demo-communication.mp4" title="1 min pour comprendre la relance automatisée" />
      {/* Visuels métiers / navigation cas suivants */}
      <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => navigate('/blog-comptable-banque')}
          >
            Voir le cas suivant : Comptable / Banque
          </button>
        </div>
        <div className="flex flex-col items-center">
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => navigate('/blog-manufacture')}
          >
            Voir le cas précédent : Ouestelio
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

export default BlogCommunication;
