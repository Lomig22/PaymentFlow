import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
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
import { FaStar } from 'react-icons/fa';

const blogPost = {
  title: "FiduPro : la digitalisation du poste client pour les cabinets comptables",
  company: "FiduPro",
  stars: 5,
  context: (
    <>
      <p><strong>Contexte :</strong> FiduPro, cabinet comptable fictif à Lille, gérait les relances pour ses clients PME de façon artisanale. Les équipes perdaient du temps et la satisfaction client baissait à cause des retards de paiement.</p>
    </>
  ),
  problem: (
    <>
      <p><strong>Problématique :</strong> Le cabinet souhaitait offrir un service premium à ses clients tout en réduisant le temps passé sur les tâches administratives et en sécurisant la trésorerie de ses clients PME.</p>
    </>
  ),
  solution: (
    <>
      <p><strong>Solution :</strong> En 2024, FiduPro a déployé Payment Flow pour :</p>
      <ul>
        <li>Automatiser toutes les relances clients</li>
        <li>Intégrer ExactOnline et OCR pour le suivi des factures</li>
        <li>Centraliser les encaissements et la gestion des litiges</li>
        <li>Offrir un portail client en ligne</li>
      </ul>
    </>
  ),
  results: (
    <>
      <p><strong>Résultats :</strong></p>
      <ul>
        <li><strong>Temps de gestion divisé par 3</strong></li>
        <li><strong>DSO réduit de 25%</strong> chez les clients PME</li>
        <li>Taux d’impayés inférieur à 1%</li>
        <li>Clients fidélisés et plus satisfaits</li>
      </ul>
    </>
  ),
  quote: (
    <em>« Avec Payment Flow, nous avons automatisé la relance pour nos clients PME et gagné en efficacité. Nos clients sont ravis de la rapidité des règlements et de la simplicité du portail. »</em>
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

const BlogComptableBanque: React.FC<BlogSectorProps> = ({ setShowContact, setDefaultSubject }) => {
  const navigate = useNavigate();
  const pageUrl = "https://www.payment-flow.fr/blog-comptable-banque";
  const pageTitle = "FiduPro : la digitalisation du poste client pour les cabinets comptables | Payment Flow";

  // FAQ spécifique FiduPro
  const faqItems = [
    {
      question: "Quels logiciels sont compatibles avec Payment Flow pour les cabinets comptables ?",
      answer: "Payment Flow s'intègre avec ExactOnline, Sage, et d'autres outils comptables via API pour automatiser la relance et le suivi client."
    },
    {
      question: "Peut-on personnaliser les relances pour chaque client PME ?",
      answer: "Oui, chaque relance peut être personnalisée selon le profil du client, le montant dû, et l'historique de paiement."
    },
    {
      question: "Quels résultats concrets pour les cabinets ?",
      answer: "Nos clients constatent un DSO réduit de 25% et des gains de temps significatifs sur la gestion administrative."
    }
  ];

  return (
    <div className="blog-page-container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Boutons de partage en haut */}
      <ShareButtons url={pageUrl} title={pageTitle} />
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
        <title>Blog Comptables & Banque | Payment Flow</title>
        <meta name="description" content="Découvrez comment FiduPro digitalise la relance client pour les cabinets comptables et PME avec Payment Flow. Témoignages, chiffres et cas pratiques." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.payment-flow.fr/blog-comptable-banque" />
      </Helmet>
      <h1 className="text-3xl font-bold mb-6">FiduPro – Cas client Cabinet Comptable</h1>
      <div className="mb-10 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-2">{blogPost.title}</h2>
        <div className="mb-2 text-sm text-gray-500">Entreprise : {blogPost.company}</div>
        <Stars count={blogPost.stars} />
        <section className="mb-4">
          <h3 className="text-lg font-bold mb-1">Contexte</h3>
          {blogPost.context}
        </section>
        <section className="mb-4">
          <h3 className="text-lg font-bold mb-1">Problématique</h3>
          {blogPost.problem}
        </section>
        <section className="mb-4">
          <h3 className="text-lg font-bold mb-1">Solution</h3>
          <ul className="list-disc pl-6">
            <li><h4 className="text-base font-semibold inline">Automatiser toutes les relances clients</h4></li>
            <li><h4 className="text-base font-semibold inline">Intégrer ExactOnline et OCR pour le suivi des factures</h4></li>
            <li><h4 className="text-base font-semibold inline">Centraliser les encaissements et la gestion des litiges</h4></li>
            <li><h4 className="text-base font-semibold inline">Offrir un portail client en ligne</h4></li>
          </ul>
        </section>
        <section className="mb-4">
          <h3 className="text-lg font-bold mb-1">Résultats</h3>
          <ul className="list-disc pl-6">
            <li><h4 className="text-base font-semibold inline">Temps de gestion divisé par 3</h4></li>
            <li><h4 className="text-base font-semibold inline">DSO réduit de 25% chez les clients PME</h4></li>
            <li><h4 className="text-base font-semibold inline">Taux d’impayés inférieur à 1%</h4></li>
            <li><h4 className="text-base font-semibold inline">Clients fidélisés et plus satisfaits</h4></li>
          </ul>
        </section>
        <blockquote className="italic text-blue-700 my-4">{blogPost.quote}</blockquote>
        {/* Bloc testimonial visuel */}
        <TestimonialBox quote="Avec Payment Flow, nous avons automatisé la relance pour nos clients PME et gagné en efficacité. Nos clients sont ravis de la rapidité des règlements et de la simplicité du portail." author="Directrice FiduPro" gain="DSO -25%" />
        {/* Bloc cas d'usage */}
        <CaseStudyBlock title="Cas d'usage : Cabinet FiduPro" result="DSO réduit de 25% en 6 mois">
          Automatisation des relances, portail client personnalisé, intégration avec ExactOnline.
        </CaseStudyBlock>
        {/* Bloc infographie */}
        <InfographicBlock src="/images/infographie-fidupro.png" alt="Infographie FiduPro" caption="Digitalisation du poste client pour les cabinets comptables" />
        {/* Bloc checklist téléchargeable */}
        <ChecklistDownload url="/checklists/checklist-relance-comptable.pdf" label="Télécharger la checklist relance pour cabinets comptables" />
        {/* Bloc FAQ */}
        <FAQAccordion items={faqItems} />
        {/* Bloc vidéo */}
        <VideoEmbed src="/videos/demo-fidupro.mp4" title="1 min pour comprendre la digitalisation du poste client" />
        {/* Navigation cas suivants/précédents */}
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
              Voir le cas précédent : Image de Marque
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
  );
}

export default BlogComptableBanque;
