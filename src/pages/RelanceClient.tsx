import React from 'react';
import { Helmet } from "react-helmet";
import { motion } from 'framer-motion';

export default function RelanceClient() {
  /* SEO Helmet */
  const helmetBlock = (
    <Helmet>
      <title>Relance Client | Payment Flow</title>
      <meta name="description" content="Automatisez vos relances clients, réduisez les impayés et améliorez votre trésorerie avec Payment Flow." />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.payment-flow.fr/relance-client" />
    </Helmet>
  );
  return (
    <>
      {helmetBlock}
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Relances Clients Automatisées
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Optimisez votre processus de relance client avec notre solution intelligente
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature cards */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Automatisation Intelligente</h3>
            <p className="text-gray-600">
              Configurez des séquences de relance personnalisées qui s'adaptent au comportement de vos clients
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Suivi en Temps Réel</h3>
            <p className="text-gray-600">
              Visualisez l'état de vos relances et l'engagement de vos clients en temps réel
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Analyses Détaillées</h3>
            <p className="text-gray-600">
              Accédez à des rapports détaillés sur l'efficacité de vos campagnes de relance
            </p>
          </div>
        </div>

        {/* Integration de Storylane */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Découvrez notre solution en action</h2>
          <div className="max-w-5xl mx-auto">
            <script async src="https://js.storylane.io/js/v2/storylane.js"></script>
            <div 
              className="sl-embed" 
              style={{
                position: 'relative',
                paddingBottom: 'calc(50.42% + 25px)',
                width: '100%',
                height: 0,
                transform: 'scale(1)'
              }}
            >
              <iframe
                loading="lazy"
                className="sl-demo"
                src="https://app.storylane.io/demo/otrw27xywyf3?embed=inline"
                name="sl-embed"
                allow="fullscreen"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: '1px solid rgba(63,95,172,0.35)',
                  boxShadow: '0px 0px 18px rgba(26, 19, 72, 0.15)',
                  borderRadius: '10px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
