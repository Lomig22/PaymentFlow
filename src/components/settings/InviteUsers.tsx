import { useState } from 'react';

function InviteUserForm() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setMessage('');

    const response = await fetch('/api/invite-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(`Invitation envoyée à ${email}`);
    } else {
      setMessage(`Erreur : ${data.error}`);
    }

    setSending(false);
    setEmail('');
  };

  return (
    <form onSubmit={handleInvite} className="space-y-4 max-w-md">
      <input
        type="email"
        placeholder="Email de l'utilisateur à inviter"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border px-3 py-2 w-full"
      />
      <button
        type="submit"
        disabled={sending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {sending ? 'Envoi en cours...' : 'Inviter'}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </form>
  );
}

export default InviteUserForm;
