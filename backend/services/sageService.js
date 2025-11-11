const axios = require('axios');
const { getSageConfig } = require('./configService');

function readConfig() {
  const cfg = getSageConfig() || {};
  const baseUrl = cfg.baseUrl || process.env.SAGE_API_BASE || '';
  const apiToken = cfg.apiToken || process.env.SAGE_API_TOKEN || '';
  const clientId = process.env.SAGE_CLIENT_ID || '';
  const clientSecret = process.env.SAGE_CLIENT_SECRET || '';
  return { baseUrl, apiToken, clientId, clientSecret };
}

let sageToken = null;
let sageTokenExpiry = null;

async function getSageToken() {
  if (sageToken && sageTokenExpiry && Date.now() < sageTokenExpiry) return sageToken;

  // NOTE: Replace this with the real Sage OAuth/token endpoint and payload
  const { baseUrl, clientId, clientSecret } = readConfig();
  const { data } = await axios.post(`${baseUrl}/authService`, {
    clientId,
    clientSecret,
  });

  sageToken = data.access_token;
  sageTokenExpiry = Date.now() + (data.expires_in * 1000) - 60_000; // refresh 1 min earlier
  return sageToken;
}

async function authHeaders() {
  const { apiToken } = readConfig();
  if (apiToken) {
    return { Authorization: `Bearer ${apiToken}` };
  }
  const token = await getSageToken();
  return { Authorization: `Bearer ${token}` };
}

async function getClients() {
  const headers = await authHeaders();
  // NOTE: Replace with real Sage API endpoint/path and mapping
  const { baseUrl } = readConfig();
  const { data } = await axios.get(`${baseUrl}/v1/clients`, { headers });
  return data.clients || [];
}

async function getInvoices() {
  const headers = await authHeaders();
  // NOTE: Replace with real Sage API endpoint/path and mapping
  const { baseUrl } = readConfig();
  const { data } = await axios.get(`${baseUrl}/v1/invoices`, { headers });
  return data.invoices || [];
}

async function getPayments() {
  const headers = await authHeaders();
  const { baseUrl } = readConfig();
  // Optional: pull payments list if available from Sage API
  try {
    const { data } = await axios.get(`${baseUrl}/v1/payments`, { headers });
    return data.payments || [];
  } catch (e) {
    return [];
  }
}

async function createPayment(invoiceId, amount, currency) {
  const headers = await authHeaders();
  const { baseUrl } = readConfig();
  // NOTE: Replace with real Sage payment endpoint
  const { data } = await axios.post(
    `${baseUrl}/provider/v1/payments`,
    { invoiceId, amount, currency },
    { headers: { ...headers, 'Content-Type': 'application/json' } }
  );
  return data;
}

module.exports = { getClients, getInvoices, getPayments, createPayment };
