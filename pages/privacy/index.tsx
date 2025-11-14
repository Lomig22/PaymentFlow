import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicyPage: React.FC = () => (
  <div className="legal-page-container">
    <Helmet>
      <title>Politique de confidentialité | Payment Flow</title>
      <meta name="description" content="Politique de confidentialité de Payment Flow. Découvrez comment nous protégeons vos données et respectons votre vie privée." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.payment-flow.fr/privacy" />
    </Helmet>
    <h1>Politique de confidentialité</h1>
    <section style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
  <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1d4ed8' }}>📄 Politique de confidentialité – Payment Flow</h2>
  <p style={{ marginBottom: 24 }}><strong>Dernière mise à jour :</strong> 24 juin 2025</p>
  <div style={{ marginBottom: 24 }}>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>1. Qui sommes-nous ?</h3>
    <p>Payment Flow est un service édité par <strong>Lomig GUEGUENIAT</strong>, dont le siège social est situé à <strong>Lieu dit Penn An Neac'h Rozegad, 29470 Plougastel-Daoulas</strong>, immatriculée sous le numéro <strong>94498959900013</strong>.</p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>2. Quelles données collectons-nous ?</h3>
    <ul style={{ marginLeft: 20, marginBottom: 0 }}>
      <li><strong>Identité :</strong> nom, prénom, entreprise</li>
      <li><strong>Contact :</strong> email, téléphone</li>
      <li><strong>Facturation :</strong> coordonnées bancaires, adresse de facturation</li>
      <li><strong>Données d’usage :</strong> nombre de relances, taux d’impayés, DSO</li>
    </ul>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>3. Comment utilisons-nous vos données ?</h3>
    <ul style={{ marginLeft: 20, marginBottom: 0 }}>
      <li>Fournir l’accès à l’application Payment Flow</li>
      <li>Gérer les comptes utilisateurs et abonnements</li>
      <li>Réaliser des statistiques anonymes</li>
      <li>Vous contacter pour le support ou l’amélioration du service</li>
    </ul>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>4. Où sont stockées vos données ?</h3>
    <p>Les données sont hébergées en Europe sur les serveurs de Supabase et Stripe pour les paiements.</p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>5. Partage des données</h3>
    <p>Nous ne vendons ni ne louons vos données. Elles sont uniquement partagées avec nos sous-traitants techniques (hébergement, facturation) sous accord contractuel strict.</p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>6. Vos droits</h3>
    <ul style={{ marginLeft: 20, marginBottom: 0 }}>
      <li>Accès</li>
      <li>Rectification</li>
      <li>Suppression</li>
      <li>Portabilité</li>
      <li>Opposition</li>
    </ul>
    <p>Pour exercer ces droits : <a href="mailto:dpo@payment-flow.fr" style={{ color: '#1d4ed8' }}>dpo@payment-flow.fr</a></p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>7. Cookies</h3>
    <p>Des cookies techniques sont utilisés pour le bon fonctionnement de l’app. D'autres peuvent être utilisés à des fins statistiques ou marketing (avec votre consentement).</p>
    <h3 style={{ color: '#2563eb', marginTop: 24 }}>8. Contact</h3>
    <p>Pour toute question : <a href="mailto:legal@payment-flow.fr" style={{ color: '#1d4ed8' }}>legal@payment-flow.fr</a></p>
  </div>
</section>

  </div>
);

export default PrivacyPolicyPage;
