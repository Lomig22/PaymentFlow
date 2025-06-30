import React from 'react';
import { Helmet } from 'react-helmet-async';

const LegalNoticePage: React.FC = () => (
  <div className="legal-page-container">
    <Helmet>
      <title>Mentions légales | Payment Flow</title>
      <meta name="description" content="Mentions légales de Payment Flow. Informations sur l'éditeur, l'hébergement, et les droits liés au site." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.payment-flow.fr/mentions-legales" />
    </Helmet>
    <h1>Mentions légales</h1>
    <section style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
  <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1d4ed8' }}>MENTIONS LÉGALES</h2>
  <p style={{ marginBottom: 24 }}>
    Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, il est précisé aux utilisateurs du site Payment Flow l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
  </p>
  <h3 style={{ color: '#2563eb', marginTop: 24 }}>Edition du site</h3>
  <p>Le présent site, accessible à l’URL <strong>www.payment-flow.fr</strong> (le « Site »), est édité par :</p>
  <p style={{ marginLeft: 20 }}><strong>Lomig GUEGUENIAT</strong>, résidant Penn an Neac'h Rozegad, 29470 Plougastel Daoulas, de nationalité Française (France), né(e) le 16/04/2002,</p>
  <h3 style={{ color: '#2563eb', marginTop: 24 }}>Hébergement</h3>
  <p>Le Site est hébergé par la société Infomaniak, situé Rue Eugène-Marziano 25, 1227 Genève, Suisse, (contact téléphonique ou email : (+41) 22 820 35 44).</p>
  <h3 style={{ color: '#2563eb', marginTop: 24 }}>Directeur de publication</h3>
  <p>Le Directeur de la publication du Site est <strong>Lomig GUEGUENIAT</strong>.</p>
  <h3 style={{ color: '#2563eb', marginTop: 24 }}>Nous contacter</h3>
  <ul style={{ marginLeft: 20 }}>
    <li>Par téléphone : +33637018517</li>
    <li>Par email : <a href="mailto:no-reply@payment-flow.fr" style={{ color: '#1d4ed8' }}>no-reply@payment-flow.fr</a></li>
    <li>Par courrier : Penn an Neac'h Rozegad, 29470 Plougastel Daoulas</li>
  </ul>
  <p style={{ marginTop: 16 }}>
    Génération des mentions légales par Legalstart.
  </p>
</section>

  </div>
);

export default LegalNoticePage;
