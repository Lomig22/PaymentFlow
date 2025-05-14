import React, { useState } from 'react';

export default function SenderSettings() {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ senderName, senderEmail, logoUrl });
    // TODO: Envoyer vers backend avec fetch ou axios
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block font-medium">Nom de l’expéditeur</label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Ex : Service Client"
        />
      </div>

      <div>
        <label className="block font-medium">Adresse email</label>
        <input
          type="email"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="expediteur@example.com"
        />
      </div>

      <div>
        <label className="block font-medium">Logo (URL)</label>
        <input
          type="text"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Enregistrer
      </button>
    </form>
  );
}
