import React from 'react';
import { motion } from 'framer-motion';
import { Book, FileText, Video, ArrowRight } from 'lucide-react';

const KnowledgeBase: React.FC = () => {
  const resources = [
    {
      title: 'Guide de démarrage',
      description: 'Apprenez les bases de la gestion de trésorerie avec Payment-Flow',
      icon: <Book className="h-6 w-6 text-blue-600" />,
      type: 'Guide',
      time: '10 min de lecture',
    },
    {
      title: 'Configuration des comptes clients',
      description: 'Configurez correctement votre système de suivi des comptes clients',
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      type: 'Tutoriel',
      time: '15 min de lecture',
    },
    {
      title: 'Configuration des rappels automatiques',
      description: 'Apprenez à configurer les rappels automatiques de recouvrement',
      icon: <Video className="h-6 w-6 text-blue-600" />,
      type: 'Tutoriel vidéo',
      time: '8 min de visionnage',
    },
    {
      title: 'Gestion avancée de trésorerie',
      description: 'Maîtrisez les techniques avancées d\'optimisation des flux de trésorerie',
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      type: 'Guide',
      time: '20 min de lecture',
    },
  ];

  return (
    <section className="mb-16" id="knowledge-base">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Base de connaissances</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource, index) => (
          <motion.div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
                {resource.icon}
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {resource.type}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">{resource.time}</span>
                </div>
                <h3 className="mt-1 font-medium text-gray-900">{resource.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
                <a
                  href="#"
                  className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <span>En savoir plus</span>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
          <span>Voir toutes les ressources</span>
          <ArrowRight className="ml-1 h-4 w-4" />
        </a>
      </div>
    </section>
  );
};

export default KnowledgeBase;