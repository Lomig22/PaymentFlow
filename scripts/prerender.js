// scripts/prerender.js
// Script Node.js pour utiliser prerender-spa-plugin en post-build sur Vite

const PrerenderSPAPlugin = require('prerender-spa-plugin');
const path = require('path');
const fs = require('fs');
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;

const distPath = path.resolve(__dirname, '../dist');
const outputPath = distPath;

// Génère un fichier de config temporaire pour webpack (utilisé uniquement pour le prerender)
const webpackConfig = {
  mode: 'production',
  output: {
    path: outputPath,
    filename: '[name].js',
  },
  plugins: [
    new PrerenderSPAPlugin({
      staticDir: distPath,
      routes: ['/'],
      renderer: new Renderer({
        renderAfterDocumentEvent: 'render-event',
        headless: true,
        maxConcurrentRoutes: 1,
      }),
    }),
  ],
};

// Lance le build de prerender
const webpack = require('webpack');
webpack(webpackConfig, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err || stats.compilation.errors);
    process.exit(1);
  }
  console.log('Prerendering terminé.');
});
