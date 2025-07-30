import { Users, MessageSquare, Database, BarChart } from 'lucide-react';
import Footer from '../components/Footer';
import CrmIntro from '../components/CrmIntro';
import { Helmet } from 'react-helmet';

import { useNavigate } from 'react-router-dom';

const CrmPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>CRM de recouvrement | Payment Flow</title>
        <meta name="description" content="Centralisez vos interactions clients et optimisez le recouvrement avec le CRM Payment Flow." />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
      {/* CRM Immersive Intro Section */}
      <CrmIntro onScrollToDemo={() => {
        const demo = document.getElementById('crm-demo-section');
        if (demo) {
          demo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }} />
      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              CRM de Recouvrement
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Centralisez vos interactions clients et optimisez votre processus de recouvrement avec notre CRM spécialisé
            </p>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div id="crm-demo-section" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <script async src="https://js.storylane.io/js/v2/storylane.js"></script>
            <div className="sl-embed" style={{position: 'relative', paddingBottom: 'calc(43.71% + 25px)', width: '100%', height: 0, transform: 'scale(1)'}}>
              <iframe 
                loading="lazy" 
                className="sl-demo" 
                src="https://app.storylane.io/demo/gfhhbkzljhts?embed=inline" 
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

      {/* Features Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gestion des Contacts
              </h3>
              <p className="text-gray-600">
                Centralisez toutes les informations de vos clients et suivez l'historique complet de vos interactions pour un recouvrement plus efficace.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Communication Intégrée
              </h3>
              <p className="text-gray-600">
                Gérez tous vos échanges emails et suivez les relances directement depuis l'interface, avec des modèles personnalisables.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Base de Données Centralisée
              </h3>
              <p className="text-gray-600">
                Accédez à toutes vos données clients, factures et historiques de paiement en un seul endroit sécurisé.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Suivi des Performances
              </h3>
              <p className="text-gray-600">
                Mesurez l'efficacité de vos actions de recouvrement avec des indicateurs clés et des tableaux de bord personnalisés.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à améliorer votre relation client ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Découvrez comment notre CRM peut transformer votre processus de recouvrement.
          </p>
          <button
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            onClick={() => navigate('/signup')}
          >
            Commencer maintenant
          </button>
        </div>
      </div>
      <div style={{height: '0.5cm'}} />
      <Footer />
    </div>
    </>
  );
};

export default CrmPage;
