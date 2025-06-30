import React from 'react';
import { Helmet } from 'react-helmet-async';

const TermsOfUsePage: React.FC = () => (
  <div className="legal-page-container">
    <Helmet>
      <title>Conditions d'utilisation | Payment Flow</title>
      <meta name="description" content="Conditions générales d'utilisation de Payment Flow. Consultez les règles d'utilisation du service." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.payment-flow.fr/conditions-utilisation" />
    </Helmet>
    <h1>Conditions générales d'utilisation</h1>
    <section style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
  <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1d4ed8' }}>📑 Conditions générales d'utilisation (CGU) – Payment Flow</h2>
  <p style={{ marginBottom: 24 }}><strong>Dernière mise à jour :</strong> 24 juin 2025</p>
  <div style={{ marginBottom: 24 }}>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>1. Objet</h3>
    <p>Les présentes conditions régissent l’utilisation de la plateforme Payment Flow par tout utilisateur ou client professionnel.</p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>2. Accès au service</h3>
    <p>Payment Flow est accessible 24h/24, 7j/7 sauf maintenance. L’accès nécessite la création d’un compte utilisateur.</p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>3. Abonnement et facturation</h3>
    <p>L’accès complet est conditionné à un abonnement mensuel ou annuel. Le client peut à tout moment résilier via son espace personnel. Aucun remboursement n’est prévu en cas de résiliation en cours de période.</p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>4. Obligations de l’utilisateur</h3>
    <ul style={{ marginLeft: 20, marginBottom: 0 }}>
      <li>Utiliser le service dans un cadre professionnel légal</li>
      <li>Ne pas tenter d’extraire ou reproduire le code</li>
      <li>Protéger ses identifiants de connexion</li>
    </ul>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>5. Propriété intellectuelle</h3>
    <p>Payment Flow est une marque déposée. Tous les contenus, textes, codes, visuels sont la propriété exclusive de l’éditeur.</p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>6. Responsabilité</h3>
    <p>Nous mettons tout en œuvre pour garantir la disponibilité et la sécurité du service, mais ne pouvons être tenus responsables des pertes indirectes (perte de chiffre d'affaires, d’image, etc.).</p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>7. Résiliation</h3>
    <p>L’utilisateur peut supprimer son compte à tout moment. En cas de non-respect des présentes CGU, nous nous réservons le droit de suspendre ou résilier l’accès au service.</p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>8. Loi applicable</h3>
    <p>Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux compétents sont ceux du ressort de Plougastel-Daoulas</p>
  </div>
</section>

  </div>
);

export default TermsOfUsePage;
