import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from "../components/Footer";
import ContactModal from "./ContactModal";
import { useState } from "react";

const sectorBlogs = [
  {
    title: "Garage AutoPro+",
    description: "Découvrez comment Garage AutoPro+ à Nantes a transformé sa gestion des relances clients et optimisé sa trésorerie grâce à Payment Flow. Retour d'expérience, résultats concrets et avis du dirigeant.",
    link: "/blog-garage",
    featured: "Étude de cas : Garage AutoPro+"
  },
  {
    title: "Ouestelio (Impression numérique)",
    description: "Ouestelio, entreprise d'impression numérique à Rennes, a digitalisé ses relances et sécurisé sa trésorerie avec Payment Flow. Découvrez leur histoire, les solutions mises en place et les résultats obtenus.",
    link: "/blog-manufacture",
    featured: "Étude de cas : Ouestelio"
  },
  {
    title: "Image de Marque (Communication)",
    description: "Image de Marque, agence de communication à Brest, a modernisé la gestion de ses relances et de sa trésorerie avec Payment Flow. Découvrez leur parcours et les bénéfices concrets observés.",
    link: "/blog-communication",
    featured: "Étude de cas : Image de Marque"
  },
  {
    title: "FiduPro (Cabinet comptable)",
    description: "FiduPro, cabinet comptable à Lille, a automatisé la relance client et amélioré la satisfaction de ses clients PME grâce à Payment Flow. Lisez leur retour d'expérience détaillé.",
    link: "/blog-comptable-banque",
    featured: "Étude de cas : FiduPro"
  }
];

const SuccessStoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <>
      <div className="success-stories-page-container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xl font-medium text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <Helmet>
          <title>Témoignages | Payment Flow</title>
          <meta name="description" content="Découvrez les témoignages clients et success stories sectorielles : garages, manufacture, impression numérique, communication, comptables et banques." />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href="https://www.payment-flow.fr/temoignages" />
        </Helmet>
      <h1 className="text-3xl font-bold mb-8">Témoignages & Success Stories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sectorBlogs.map((sector, idx) => (
          <div key={idx} className="p-6 bg-white rounded-xl shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">{sector.title}</h2>
              <div className="mb-2 text-gray-600">{sector.description}</div>
              <div className="mb-4 text-sm text-blue-700 font-medium">Entreprises à l'honneur : {sector.featured}</div>
            </div>
            <a href={sector.link} className="mt-4 inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold text-center">Voir les cas clients</a>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 48, color: '#888' }}>
        <p>
          <strong>Vous souhaitez diviser par 4 le temps de relance, réduire votre DSO et améliorer votre cash flow&nbsp;?</strong><br />
          <span
            onClick={() => setShowContactModal(true)}
            style={{ color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            role="button"
            tabIndex={0}
            onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') setShowContactModal(true); }}
          >
            Contactez-nous pour un audit personnalisé&nbsp;!
          </span>
        </p>
      </div>
    </div>
    <Footer />
    {showContactModal && (
      <ContactModal onClose={() => setShowContactModal(false)} defaultSubject="audit" />
    )}
  </>);
};
export default SuccessStoriesPage;
