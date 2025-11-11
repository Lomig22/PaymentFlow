import React, { useEffect, useState } from 'react';

// Base d'API: si VITE_SAGE_BACKEND_URL est défini (prod ou préprod), on l'utilise.
// Sinon, on utilise un chemin relatif "/api" pour passer via le proxy Vite (dev) ou un reverse proxy (prod).
const API_BASE = (import.meta.env.VITE_SAGE_BACKEND_URL as string | undefined)?.replace(/\/$/, '') || '';

type ApiState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

export default function SageSettings() {
  const DEFAULT_SAGE_API_URL = ((import.meta.env.VITE_SAGE_API_URL as string | undefined) || 'https://sandbox-api.sage.com').replace(/\/$/, '');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_SAGE_API_URL);
  const [apiToken, setApiToken] = useState('');
  const [tokenConfigured, setTokenConfigured] = useState<boolean>(false);
  const backendUnset = typeof window !== 'undefined' && window.location?.protocol === 'https:' && !API_BASE;
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [state, setState] = useState<ApiState>({ loading: false, error: null, success: null });
  const [stats, setStats] = useState<{ pending: number | null; relances: number | null }>({ pending: null, relances: null });

  const withState = async (fn: () => Promise<void>) => {
    setState({ loading: true, error: null, success: null });
    try {
      await fn();
    } catch (e: any) {
      const msg = e?.message || 'Erreur inattendue';
      setState({ loading: false, error: msg, success: null });
      return;
    }
    setState((s) => ({ ...s, loading: false }));
  };

  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      if (text?.trim().startsWith('<')) {
        throw new Error("Réponse HTML reçue. Vérifiez le reverse proxy /api ou définissez VITE_SAGE_BACKEND_URL vers l'URL HTTPS du backend.");
      }
      throw new Error(`Réponse non‑JSON: ${text?.slice(0, 120) || 'vide'}`);
    }
  };

  const loadConfig = async () => {
    await withState(async () => {
      const res = await fetch(`${API_BASE}/api/integrations/sage/config`);
      if (!res.ok) throw new Error(`Impossible de charger la configuration (${res.status})`);
      const data = await safeJson(res);
      setBaseUrl(data.baseUrl || DEFAULT_SAGE_API_URL);
      setTokenConfigured(!!data.tokenConfigured);
      setState({ loading: false, error: null, success: null });
    });
  };

  const saveConfig = async () => {
    await withState(async () => {
      const res = await fetch(`${API_BASE}/api/integrations/sage/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, apiToken }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error((data as any)?.error || 'Échec de l’enregistrement');
      setTokenConfigured(true);
      setState({ loading: false, error: null, success: 'Configuration enregistrée' });
    });
  };

  const testConnection = async () => {
    await withState(async () => {
      const res = await fetch(`${API_BASE}/api/integrations/sage/test`);
      const data = await safeJson(res);
      if (!res.ok || (data as any)?.ok !== true) throw new Error((data as any)?.error || 'Test de connexion échoué');
      setState({ loading: false, error: null, success: `Connexion OK (clients: ${(data as any).clientsCount})` });
    });
  };

  const syncNow = async () => {
    await withState(async () => {
      const res = await fetch(`${API_BASE}/api/clients/sync`);
      const data = await safeJson(res);
      if (!res.ok) throw new Error((data as any)?.error || 'Synchronisation échouée');
      setState({ loading: false, error: null, success: (data as any)?.message || 'Synchronisation réussie' });
      await refreshStats();
    });
  };

  const refreshStats = async () => {
    try {
      const pRes = await fetch(`${API_BASE}/api/payments/pending`);
      const pData = await safeJson(pRes);
      const rRes = await fetch(`${API_BASE}/api/payments/relances`);
      const rData = await safeJson(rRes);
      setStats({ pending: Array.isArray(pData as any) ? (pData as any).length : 0, relances: Array.isArray(rData as any) ? (rData as any).length : 0 });
    } catch {}
  };

  useEffect(() => {
    void loadConfig();
    void refreshStats();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sage</h2>

      {backendUnset && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
          Backend non configuré pour HTTPS: définissez <code className="px-1 bg-yellow-100 rounded">VITE_SAGE_BACKEND_URL</code> vers votre URL backend (ex: <code className="px-1 bg-yellow-100 rounded">https://api.votre-backend.tld</code>) puis rebuild/redeploy le front.
        </div>
      )}

      {state.error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{state.error}</div>
      )}
      {state.success && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded">{state.success}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Token API Sage</label>
          <input
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder={tokenConfigured ? '••••••••••••••••' : ''}
          />
          <p className="text-xs text-gray-500 mt-1">Nous n’affichons jamais le token existant. Collez un nouveau token pour le remplacer.</p>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={() => setShowAdvanced((v) => !v)} className="text-sm text-blue-600 hover:text-blue-800 underline">
            {showAdvanced ? 'Masquer les options avancées' : 'Options avancées'}
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">URL API Sage (HTTPS)</label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.sage.example"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-xs text-gray-500 mt-1">Ex: {DEFAULT_SAGE_API_URL} (ajustez selon votre édition). L’URL doit être en HTTPS.</p>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => void saveConfig()}
          disabled={state.loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enregistrer
        </button>
        <button
          onClick={() => void testConnection()}
          disabled={state.loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Tester la connexion
        </button>
        <button
          onClick={() => void syncNow()}
          disabled={state.loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Synchroniser maintenant
        </button>
        <button
          onClick={() => void refreshStats()}
          disabled={state.loading}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Rafraîchir les stats
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Statistiques</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded shadow border">
            <div className="text-sm text-gray-500">Factures non payées (dernière synchro)</div>
            <div className="text-2xl font-bold">{stats.pending ?? '-'}</div>
          </div>
          <div className="p-4 bg-white rounded shadow border">
            <div className="text-sm text-gray-500">À relancer (7+ jours de retard)</div>
            <div className="text-2xl font-bold">{stats.relances ?? '-'}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-700 space-y-2">
        <p className="font-semibold">Comment récupérer votre token Sage ?</p>
        <ol className="list-decimal ml-5 space-y-1 text-gray-600">
          <li>Ouvrez votre espace Sage (édition Cloud de votre instance).</li>
          <li>Allez dans Paramètres → Intégrations/API → Tokens (ou Clés d’API).</li>
          <li>Créez un nouveau token avec les droits nécessaires (Clients, Factures, Paiements).</li>
          <li>Copiez le token et collez‑le ci‑dessus (Token API Sage).</li>
        </ol>
        <p className="text-xs text-gray-500">Les libellés peuvent varier selon l’édition Sage. En cas de doute, contactez le support.</p>
        <p className="text-xs text-gray-500">Backend utilisé: {API_BASE || '(relatif /api via reverse proxy)'} — En production, définissez VITE_SAGE_BACKEND_URL vers l’URL HTTPS du backend si nécessaire.</p>
      </div>
    </div>
  );
}
