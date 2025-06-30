import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FaStar } from 'react-icons/fa';

interface BlogSectorProps {
  setShowContact?: () => void;
  setDefaultSubject?: () => void;
}

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
      </ul>
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

const BlogGarage: React.FC<BlogSectorProps> = () => (
  <div className="blog-page-container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
    <Helmet>
      <title>Blog Garage | Payment Flow</title>
      <meta name="description" content="Découvrez comment les garages digitalisent la relance client et optimisent leur trésorerie avec Payment Flow. Témoignages de garages fictifs, avis et chiffres clés." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.payment-flow.fr/blog-garage" />
    </Helmet>
    <h1 className="text-3xl font-bold mb-6">Blog Garage – Cas client</h1>
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

export default BlogGarage;
