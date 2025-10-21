# Intégration Sage ↔ Payment Flow

Ce dossier contient une intégration complète (backend Node/Express + frontend React/Vite) pour synchroniser les clients et factures depuis Sage, initier des paiements via Sage, lister les factures en attente et les relances, et recevoir des webhooks de paiement.

## Structure
- `backend/` — API Express
  - `server.js` — serveur Express + scheduler de synchronisation
  - `services/sageService.js` — appels à l’API Sage (token, clients, factures, paiements)
  - `services/syncService.js` — logique de synchro + état en mémoire (remplaçable par base de données/Supabase)
  - `routes/clients.js` — `/api/clients/sync` (lance une synchronisation), `/api/clients/state`
  - `routes/payments.js` — `/api/payments/pending`, `/api/payments/relances`, `/api/payments/create`
  - `routes/webhooks.js` — `/api/webhooks/sage` (réception webhook de Sage)
  - `.env.example` — variables d’environnement
- `frontend/` — App React (Vite)
  - `src/components/InvoiceList.jsx` — liste des factures et relances
  - `src/components/PaymentButton.jsx` — bouton pour initier un paiement via Sage
  - `src/App.jsx` — composition de l’interface
  - `vite.config.js` — proxy `/api` → `http://localhost:3001`

## Prérequis
- Node.js 18+
- Avoir des identifiants Sage (client_id/secret) et l’URL d’API (sandbox/prod)

## Installation
1. Backend
   - Copier `backend/.env.example` vers `backend/.env` et compléter les variables.
   - Installer les dépendances puis démarrer:
     ```bash
     npm install
     npm run dev
     ```
     (Depuis le dossier `backend/`)

2. Frontend
   - Installer et lancer Vite (port 5173):
     ```bash
     npm install
     npm run dev
     ```
     (Depuis le dossier `frontend/`)

## Endpoints principaux
- `GET http://localhost:3001/api/clients/sync` — Lance une synchronisation Sage → Payment Flow (in-memory)
- `GET http://localhost:3001/api/payments/pending` — Liste des factures non payées
- `GET http://localhost:3001/api/payments/relances` — Factures à relancer (règle: 7+ jours de retard)
- `POST http://localhost:3001/api/payments/create` — Initie un paiement Sage `{ invoiceId, amount, currency }`
- `POST http://localhost:3001/api/webhooks/sage` — Réception webhook (configurer côté Sage)

## Notes importantes
- Les URLs/mappings Sage sont placeholders — à adapter aux endpoints Sage réels (OAuth/token, ressources `clients`, `invoices`, `payments`).
- L’état (clients/factures) est stocké **en mémoire** pour démonstration. Remplacer par une persistance (ex: Supabase) pour la prod et relier aux tables existantes (`clients`, `receivables`, `receivable_reminder_plan`).
- La logique des relances est simple (retard de 7 jours). Adapter à vos profils et règles internes.
- Le proxy Vite redirige `/api` vers le backend local.

## Intégration avec Payment Flow (Supabase)
- Mapper `getClients/getInvoices` vers des upserts Supabase dans vos tables (`clients`, `receivables`).
- À la réception des webhooks `payment.completed`, mettre à jour `receivables.status = 'paid'`, ajuster `paid_amount`, et recalculer `clients.needs_reminder`.
- Optionnel: conserver les plans de relance par facture dans `receivable_reminder_plan`.

## Sécurité et production
- Protéger `/api/webhooks/sage` (signature secrète ou OAuth) et valider le payload.
- Mettre en place un store persistant (DB) et logs.
- Gérer finement le rafraîchissement du token Sage (OAuth2).
