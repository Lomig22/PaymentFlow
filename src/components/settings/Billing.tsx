import React, { useState } from 'react';

// Composant 1 : Informations de facturation
export function BillingInfoSettings() {
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [siret, setSiret] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ company, address, siret });
    // TODO: Envoi vers le backend
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-lg font-semibold">Informations de facturation</h2>
      <div>
        <label className="block font-medium">Entreprise</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-medium">Adresse</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-medium">SIRET</label>
        <input
          type="text"
          value={siret}
          onChange={(e) => setSiret(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Enregistrer
      </button>
    </form>
  );
}

// Composant 2 : Choix de l’abonnement
export function SubscriptionSettings() {
  const [plan, setPlan] = useState('starter');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlan(e.target.value);
    console.log('Abonnement choisi :', e.target.value);
    // TODO: Enregistrer dans le backend
  };

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-lg font-semibold">Choix de l’abonnement</h2>
      {['starter', 'intermediaire', 'entreprise'].map((p) => (
        <div key={p} className="flex items-center space-x-2">
          <input
            type="radio"
            id={p}
            name="plan"
            value={p}
            checked={plan === p}
            onChange={handleChange}
          />
          <label htmlFor={p} className="capitalize">
            {p === 'starter' ? 'Starter' : p === 'intermediaire' ? 'Intermédiaire' : 'Entreprise'}
          </label>
        </div>
      ))}
    </div>
  );
}

// Composant 3 : Moyen de paiement
export function PaymentMethodSettings() {
  const [method, setMethod] = useState('cb');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMethod(e.target.value);
    console.log('Méthode de paiement :', e.target.value);
    // TODO: Envoyer au backend
  };

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-lg font-semibold">Moyen de paiement</h2>
      {['cb', 'sepa'].map((m) => (
        <div key={m} className="flex items-center space-x-2">
          <input
            type="radio"
            id={m}
            name="payment"
            value={m}
            checked={method === m}
            onChange={handleChange}
          />
          <label htmlFor={m} className="uppercase">{m}</label>
        </div>
      ))}
    </div>
  );
}
