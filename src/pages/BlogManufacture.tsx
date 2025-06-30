import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaStar } from 'react-icons/fa';

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
      <p><strong>Contexte :</strong> Ouestelio, entreprise d’impression numérique à Rennes, gérait manuellement ses relances clients, ce qui entraînait des oublis et des retards de paiement fréquents. La direction voulait fiabiliser la trésorerie et réduire le temps passé à l’administratif.</p>
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
        <li>Automatiser toutes les relances (emails, SMS, rappels personnalisés)</li>
        <li>Centraliser le suivi des règlements via un tableau de bord</li>
        <li>Connecter Payment Flow à Sage 100 pour une synchronisation en temps réel</li>
        <li>Analyser les comportements de paiement via le scoring intégré</li>
      </ul>
    </>
  ),
  results: (
    <>
      <p><strong>Résultats :</strong></p>
      <ul>
        <li><strong>DSO réduit de 35%</strong> en 6 mois</li>
        <li><strong>Taux d’impayés passé sous 1%</strong></li>
        <li>Temps de gestion divisé par 3</li>
        <li>Visibilité temps réel sur les flux de trésorerie</li>
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

const BlogManufacture: React.FC<BlogSectorProps> = () => (
  <div className="blog-page-container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
    <Helmet>
      <title>Blog Manufacture | Payment Flow</title>
      <meta name="description" content="Découvrez comment les entreprises de manufacture digitalisent la gestion clients avec Payment Flow. Témoignages, chiffres et cas pratiques." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.payment-flow.fr/blog-manufacture" />
    </Helmet>
    <h1 className="text-3xl font-bold mb-6">Blog Manufacture – Cas client</h1>
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

export default BlogManufacture;
