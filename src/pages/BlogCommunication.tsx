import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaStar } from 'react-icons/fa';

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

const BlogCommunication: React.FC<BlogSectorProps> = () => (
  <div className="blog-page-container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
    <Helmet>
      <title>Blog Communication | Payment Flow</title>
      <meta name="description" content="Découvrez comment les agences de communication modernisent leur gestion clients avec Payment Flow. Témoignages, chiffres et cas pratiques." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.payment-flow.fr/blog-communication" />
    </Helmet>
    <h1 className="text-3xl font-bold mb-6">Blog Communication – Cas client</h1>
    <div className="mb-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-2">{blogPost.title}</h2>
      <div className="mb-2 text-sm text-gray-500">Entreprise : {blogPost.company}</div>
      <Stars count={blogPost.stars} />
      <section className="mb-4">{blogPost.context}</section>
      <section className="mb-4">{blogPost.problem}</section>
      <section className="mb-4">{blogPost.solution}</section>
      <section className="mb-4">{blogPost.results}</section>
      <blockquote className="italic text-blue-700">{blogPost.quote}</blockquote>
    </div>
  </div>
);

export default BlogCommunication;
