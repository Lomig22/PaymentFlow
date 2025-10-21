const express = require('express');
const { createPayment } = require('../services/sageService');
const { getPendingInvoices, getRelances } = require('../services/syncService');

const router = express.Router();

// List pending (unpaid) invoices from last sync
router.get('/pending', (_req, res) => {
  try {
    const data = getPendingInvoices();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List invoices requiring reminders per internal rule (7+ days overdue)
router.get('/relances', (_req, res) => {
  try {
    const data = getRelances();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Initiate a payment in Sage for a given invoice
router.post('/create', async (req, res) => {
  try {
    const { invoiceId, amount, currency } = req.body || {};
    if (!invoiceId || amount == null) {
      return res.status(400).json({ error: 'invoiceId and amount are required' });
    }
    const result = await createPayment(invoiceId, amount, currency || 'EUR');
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
