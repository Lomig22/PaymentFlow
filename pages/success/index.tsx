import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Success() {
  const [message, setMessage] = useState<string>("En cours...");
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return; // Wait until query params are available

    const { status, setupIntent, error } = router.query;

    if (error) {
      setMessage(`Une erreur est survenue : ${error}`);
    } else if (status === "succeeded" && setupIntent) {
      setMessage("Le paiement a été effectué avec succès !");
      // Call your backend here if needed
    } else {
      setMessage("Le paiement n’a pas pu être confirmé.");
    }
  }, [router.isReady, router.query]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">{message}</h1>
      {/* Ajoute d'autres informations ou un bouton pour revenir à l'accueil */}
      <a href="/" className="text-blue-500 hover:text-blue-700">Retour à l'accueil</a>
    </div>
  );
}
