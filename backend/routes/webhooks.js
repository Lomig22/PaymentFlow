const express = require('express');
const { updateInvoiceStatus } = require('../services/syncService');

const router = express.Router();

// Generic webhook receiver for Sage
router.post('/sage', (req, res) => {
  const event = req.body;
  console.log('📬 Webhook Sage reçu :', event);

  try {
    if (event?.type === 'payment.completed') {
      updateInvoiceStatus(event.data?.invoiceId, 'paid');
    }
    if (event?.type === 'invoice.updated') {
      const status = event.data?.status;
      if (event.data?.invoiceId && status) {
        updateInvoiceStatus(event.data.invoiceId, status);
      }
    }
  } catch (e) {
    console.error('Webhook handling error:', e.message);
  }

  res.status(200).send('OK');
});

module.exports = router;
