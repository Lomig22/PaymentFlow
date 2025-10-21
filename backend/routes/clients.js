const express = require('express');
const { syncFromSage, getState } = require('../services/syncService');

const router = express.Router();

// Trigger a manual sync from Sage
router.get('/sync', async (_req, res) => {
  try {
    await syncFromSage();
    res.json({ message: 'Synchronisation réussie avec Sage' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Optional: inspect current in-memory state
router.get('/state', (_req, res) => {
  res.json(getState());
});

module.exports = router;
