const express = require('express');
const { setSageConfig, getSageConfig } = require('../services/configService');
const { getClients } = require('../services/sageService');

const router = express.Router();

// Lire la configuration courante (ne jamais exposer le token)
router.get('/sage/config', (_req, res) => {
  const cfg = getSageConfig() || {};
  const safe = {
    baseUrl: cfg.baseUrl || null,
    tokenConfigured: !!cfg.apiToken,
  };
  res.json(safe);
});

// Définir la configuration Sage à chaud (baseUrl + apiToken)
router.post('/sage/config', (req, res) => {
  const { baseUrl, apiToken } = req.body || {};
  if (!baseUrl || !apiToken) {
    return res.status(400).json({ error: 'baseUrl et apiToken sont requis' });
  }
  setSageConfig({ baseUrl, apiToken });
  res.json({ ok: true });
});

// Tester la connexion à Sage (récupération d’un token + ping clients)
router.get('/sage/test', async (_req, res) => {
  try {
    const clients = await getClients();
    res.json({ ok: true, clientsCount: Array.isArray(clients) ? clients.length : 0 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.response?.data || e.message || String(e) });
  }
});

module.exports = router;
