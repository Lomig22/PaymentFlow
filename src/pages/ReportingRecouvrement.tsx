import { BarChart3, PieChart, TrendingUp, FileSpreadsheet } from 'lucide-react';

const ReportingRecouvrement = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Reporting de Recouvrement
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Optimisez votre gestion de recouvrement grâce à des tableaux de bord détaillés et des analyses approfondies
            </p>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <script async src="https://js.storylane.io/js/v2/storylane.js"></script>
            <div className="sl-embed" style={{position: 'relative', paddingBottom: 'calc(43.71% + 25px)', width: '100%', height: 0, transform: 'scale(1)'}}>
              <iframe 
                loading="lazy" 
                className="sl-demo" 
                src="https://app.storylane.io/demo/v5yqrknolcgj?embed=inline" 
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
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tableaux de Bord Personnalisables
              </h3>
              <p className="text-gray-600">
                Créez des tableaux de bord sur mesure pour suivre vos KPIs de recouvrement et visualiser vos performances en temps réel.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analyse des Tendances
              </h3>
              <p className="text-gray-600">
                Identifiez les tendances de paiement et anticipez les comportements clients grâce à nos outils d'analyse avancés.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Segmentation des Créances
              </h3>
              <p className="text-gray-600">
                Analysez votre portefeuille de créances par âge, montant, secteur et bien d'autres critères pour optimiser vos actions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Export de Rapports
              </h3>
              <p className="text-gray-600">
                Générez et exportez des rapports détaillés au format Excel ou PDF pour partager facilement vos analyses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à optimiser votre recouvrement ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Découvrez comment PaymentFlow peut vous aider à améliorer votre performance de recouvrement.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Commencer maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportingRecouvrement;
