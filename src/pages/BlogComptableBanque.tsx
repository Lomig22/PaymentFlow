import React from 'react';
import { Helmet } from 'react-helmet-async';
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

const BlogComptableBanque: React.FC<BlogSectorProps> = () => (
  <div className="blog-page-container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
    <Helmet>
      <title>Blog Comptables & Banque | Payment Flow</title>
      <meta name="description" content="Découvrez comment les cabinets comptables et banques digitalisent la relance client avec Payment Flow. Témoignages, chiffres et cas pratiques." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.payment-flow.fr/blog-comptable-banque" />
    </Helmet>
    <h1 className="text-3xl font-bold mb-6">Blog Comptables & Banque – Cas client</h1>
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

export default BlogComptableBanque;
