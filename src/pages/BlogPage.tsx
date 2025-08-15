import React, { useState } from "react";
import ContactModal from "./ContactModal";
import { Helmet } from 'react-helmet-async';
// Assurez-vous d'avoir installé react-icons : npm install react-icons
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BlogPageProps {
  setShowContact: React.Dispatch<React.SetStateAction<boolean>>;
  setDefaultSubject: React.Dispatch<React.SetStateAction<string>>;
}

import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const BlogPage: React.FC<BlogPageProps> = ({ setShowContact, setDefaultSubject }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <div className="blog-page-container" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2 pt-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xl font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
        <Helmet>
        <title>Blog | Payment Flow</title>
        <meta name="description" content="Découvrez les success stories sectorielles : garages, manufacture, impression numérique, communication, comptables et banques. Chaque secteur a son blog dédié avec témoignages et chiffres clés." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.payment-flow.fr/blog" />
      </Helmet>
      <h1 className="text-3xl font-bold mb-8">Blog sectoriel – Success Stories</h1>

      {/* Article long format : Optimisation des relances */}
      <div className="mb-10 p-6 bg-blue-900 rounded-xl shadow-md flex flex-col md:flex-row items-center gap-6 text-white">
        <img
  src="/images/blog-optimisation-relance.png"
  alt="Optimisation des relances - illustration"
  className="rounded-lg shadow-md border-2 border-blue-700 bg-white p-2"
  style={{ width: '120px', height: 'auto', maxWidth: '100%' }}
/>

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">Les 5 erreurs à éviter quand on relance ses clients</h2>
          <div className="text-orange-300 font-medium mb-2">Optimisation des relances clients pour PME & TPE</div>
          <p className="mb-3 text-blue-100">Découvrez les erreurs les plus fréquentes et les solutions concrètes pour accélérer vos paiements, préserver la relation client et automatiser vos relances. Conseils concrets, visuels, et bonnes pratiques adaptées aux petites entreprises.</p>
          <Link to="/blog-optimisation-relance" className="inline-block px-5 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow transition-colors">Lire l'article</Link>
        </div>
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
    {showContactModal && (
      <ContactModal onClose={() => setShowContactModal(false)} defaultSubject="audit" />
    )}
    <Footer />
  </>
);
};
export default BlogPage;
