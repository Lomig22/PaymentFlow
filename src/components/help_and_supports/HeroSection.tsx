import React from "react";
import { Search, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => {
  return (
    <section className=" py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Comment pouvons-nous vous aider aujourd'hui ?
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Trouvez des réponses, des tutoriels et du support pour la gestion
              de trésorerie et des créances de Payment-Flow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des réponses..."
                className="w-full bg-white text-gray-800 pl-14 pr-4 py-3.5 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg"
                autoFocus
              />
              <button className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300">
                Rechercher
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white"
          >
            <span className="flex items-center text-black">
              <HelpCircle className="h-4 w-4 mr-1" />
              Recherches populaires :
            </span>
            <a
              href="#"
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full transition-colors"
            >
              Gestion de trésorerie
            </a>
            <a
              href="#"
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full transition-colors"
            >
              Comptes clients
            </a>
            <a
              href="#"
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full transition-colors"
            >
              Recouvrement
            </a>
            <a
              href="#"
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full transition-colors"
            >
              Configuration automatique
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
