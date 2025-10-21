const { getClients, getInvoices, getPayments } = require('./sageService');

// In-memory stores (can be replaced by DB/Supabase later)
let localClients = [];
let localInvoices = [];
let lastSyncAt = null;

function mapInvoice(inv) {
  // Normalize invoice structure; adjust mapping to real Sage shape
  return {
    id: inv.id,
    customer_id: inv.customer_id,
    customer_name: inv.customer_name || inv.client_name || 'Client',
    amount: Number(inv.amount || inv.total || 0),
    currency: inv.currency || 'EUR',
    due_date: inv.due_date || inv.dueDate || inv.due || null,
    status: inv.status || 'pending',
  };
}

async function syncFromSage() {
  const [clients, invoices] = await Promise.all([
    getClients(),
    getInvoices(),
  ]);

  localClients = Array.isArray(clients) ? clients : [];
  localInvoices = (Array.isArray(invoices) ? invoices : []).map(mapInvoice);

  lastSyncAt = new Date().toISOString();
  console.log('🔄 Synchronisation Sage → PaymentFlow terminée. Invoices:', localInvoices.length, 'Clients:', localClients.length);
}

function getPendingInvoices() {
  return localInvoices.filter((i) => (i.status || 'pending') !== 'paid');
}

function getRelances() {
  const now = new Date();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return localInvoices.filter((i) => {
    const st = i.status || 'pending';
    if (st === 'paid') return false;
    const due = i.due_date ? new Date(i.due_date) : null;
    if (!due) return false;
    return now - due > sevenDaysMs; // overdue by 7+ days
  });
}

function updateInvoiceStatus(id, status) {
  const idx = localInvoices.findIndex((i) => i.id === id);
  if (idx >= 0) {
    localInvoices[idx].status = status;
  }
}

function getState() {
  return { lastSyncAt, invoices: localInvoices, clients: localClients };
}

module.exports = {
  syncFromSage,
  getPendingInvoices,
  getRelances,
  updateInvoiceStatus,
  getState,
};
