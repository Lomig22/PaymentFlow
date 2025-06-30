// Générateur de sitemap dynamique pour Vite/React
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.payment-flow.fr';
const ROUTES = [
  '/',
  '/simulateur-dso',
  '/pricing',
  '/signup',
  '/login',
  '/privacy',
  '/terms',
  // Ajoute ici toutes les routes publiques importantes
];

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(route => `  <url>\n    <loc>${BASE_URL}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${route === '/' ? '1.0' : '0.7'}</priority>\n  </url>`).join('\n')}
</urlset>\n`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
console.log('Sitemap généré avec succès !');
