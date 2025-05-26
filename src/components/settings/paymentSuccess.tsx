import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Success() {
  const [message, setMessage] = useState<string>('En cours...');
  const location = useLocation();

  useEffect(() => {
    // Récupérer les paramètres d'URL (ex : `setupIntent` ou `error` depuis le backend)
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const setupIntent = params.get('setupIntent');
    const error = params.get('error');

    if (error) {
      setMessage(`Une erreur est survenue : ${error}`);
    } else if (status === 'succeeded' && setupIntent) {
      setMessage('Le paiement a été effectué avec succès !');
      // Tu peux ici appeler ton backend pour vérifier l'état du setupIntent ou effectuer des actions supplémentaires.
    } else {
      setMessage('Le paiement n’a pas pu être confirmé.');
    }
  }, [location]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">{message}</h1>
      {/* Ajoute d'autres informations ou un bouton pour revenir à l'accueil */}
      <a href="/" className="text-blue-500 hover:text-blue-700">Retour à l'accueil</a>
    </div>
  );
}
