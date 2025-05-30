import React from 'react';
import { MessageCircle, PhoneCall, Mail, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const SupportOptions: React.FC = () => {
  const options = [
    {
      title: 'Chat en direct',
      description: 'Discutez en temps réel avec notre équipe support',
      icon: <MessageCircle className="h-8 w-8 text-blue-500" />,
      action: 'Démarrer le chat',
      available: true,
      time: 'Disponible 24/7',
    },
    {
      title: 'Support téléphonique',
      description: 'Parlez directement avec un spécialiste',
      icon: <PhoneCall className="h-8 w-8 text-blue-500" />,
      action: '+33637018517',
      available: true,
      time: 'Lun-Ven, 9h-18h',
    },
    {
      title: 'Support par email',
      description: 'Envoyez-nous vos questions à tout moment',
      icon: <Mail className="h-8 w-8 text-blue-500" />,
      action: 'Envoyer un email',
      available: true,
      time: 'Réponse sous 24h',
    },
  ];

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-6 py-5 border-b border-gray-100 bg-blue-50">
        <h3 className="font-semibold text-xl text-gray-800">Options de support</h3>
        <p className="text-gray-600 text-sm mt-1">Choisissez comment nous contacter</p>
      </div>

      <div className="px-6 py-4 divide-y divide-gray-100">
        {options.map((option, index) => (
          <div key={index} className="py-4 first:pt-2 last:pb-2">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">{option.icon}</div>
              <div className="ml-4 flex-grow">
                <h4 className="font-medium text-gray-800">{option.title}</h4>
                <p className="text-gray-600 text-sm">{option.description}</p>
                <div className="mt-2 flex justify-between items-center">
                <button
  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors focus:outline-none"
  onClick={() => {
    if (option.title === "Chat en direct") {
      if (window.Chatling && typeof window.Chatling.open === "function") {
        window.Chatling.open();
      } else {
        console.warn("Chatling n’est pas encore chargé.");
      }
    } else if (option.title === "Support par email") {
      window.location.href = "mailto:contact@payment-flow.fr";
    } else if (option.title === "Support téléphonique") {
      window.location.href = `tel:${option.action}`;
    }
  }}
>
  {option.action}
</button>

                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {option.time}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-gray-50">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="ml-2 text-sm text-gray-600">
            Notre temps de réponse moyen est de <span className="font-medium">moins de 10 minutes</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SupportOptions;