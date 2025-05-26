import React from "react";
import { Search, HelpCircle, Mail, PhoneCall, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Titre et description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
              Centre d’assistance Payment-Flow
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Trouvez rapidement des réponses, accédez à nos guides ou contactez
              notre support client.
            </p>
          </motion.div>

          {/* Barre de recherche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une question, un guide, un mot-clé…"
                className="w-full bg-white text-gray-800 pl-12 pr-32 py-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
              <button className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-full transition-all duration-300 text-sm">
                Rechercher
              </button>
            </div>
          </motion.div>

          {/* Liens populaires */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-3 text-sm"
          >
            <span className="flex items-center text-gray-700 font-medium mb-2 w-full justify-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Recherches fréquentes :
            </span>
            {[
              "Configurer vos relances",
              "Gérer vos créances",
              "Notifications automatiques",
              "Statistiques de paiement",
              "Gestion des clients",
            ].map((topic, index) => (
              <a
                key={index}
                href="#"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full transition-colors"
              >
                {topic}
              </a>
            ))}
          </motion.div>

          {/* Bloc support client */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 bg-white border border-gray-200 rounded-xl p-6 text-left shadow-md max-w-2xl mx-auto"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Besoin d’aide personnalisée ?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center">
                <PhoneCall className="h-5 w-5 mr-2 text-blue-600" />
                <span>
                  <strong>Assistance téléphonique :</strong> +261 34 12 345 67
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                <span>
                  <strong>Email :</strong> support@payment-flow.com
                </span>
              </li>
              <li className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                <span>
                  <strong>Centre d’aide :</strong> Explorez nos guides,
                  tutoriels et FAQ.
                </span>
              </li>
              <li className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                <span>
                  <strong>Assistance instantanée :</strong> Connectez-vous pour
                  parler à un conseiller.
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
