const axios = require('axios');

const SAGE_API_BASE = process.env.SAGE_API_BASE;
const SAGE_CLIENT_ID = process.env.SAGE_CLIENT_ID;
const SAGE_CLIENT_SECRET = process.env.SAGE_CLIENT_SECRET;

let sageToken = null;
let sageTokenExpiry = null;

async function getSageToken() {
  if (sageToken && sageTokenExpiry && Date.now() < sageTokenExpiry) return sageToken;

  // NOTE: Replace this with the real Sage OAuth/token endpoint and payload
  const { data } = await axios.post(`${SAGE_API_BASE}/authService`, {
    clientId: SAGE_CLIENT_ID,
    clientSecret: SAGE_CLIENT_SECRET,
  });

  sageToken = data.access_token;
  sageTokenExpiry = Date.now() + (data.expires_in * 1000) - 60_000; // refresh 1 min earlier
  return sageToken;
}

async function authHeaders() {
  const token = await getSageToken();
  return { Authorization: `Bearer ${token}` };
}

async function getClients() {
  const headers = await authHeaders();
  // NOTE: Replace with real Sage API endpoint/path and mapping
  const { data } = await axios.get(`${SAGE_API_BASE}/v1/clients`, { headers });
  return data.clients || [];
}

async function getInvoices() {
  const headers = await authHeaders();
  // NOTE: Replace with real Sage API endpoint/path and mapping
  const { data } = await axios.get(`${SAGE_API_BASE}/v1/invoices`, { headers });
  return data.invoices || [];
}

async function getPayments() {
  const headers = await authHeaders();
  // Optional: pull payments list if available from Sage API
  try {
    const { data } = await axios.get(`${SAGE_API_BASE}/v1/payments`, { headers });
    return data.payments || [];
  } catch (e) {
    return [];
  }
}

async function createPayment(invoiceId, amount, currency) {
  const headers = await authHeaders();
  // NOTE: Replace with real Sage payment endpoint
  const { data } = await axios.post(
    `${SAGE_API_BASE}/provider/v1/payments`,
    { invoiceId, amount, currency },
    { headers: { ...headers, 'Content-Type': 'application/json' } }
  );
  return data;
}

module.exports = { getClients, getInvoices, getPayments, createPayment };
