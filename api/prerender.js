// Vercel Serverless Function to proxy Prerender.io for bots
// and serve SPA index.html for normal users.

const BOT_REGEX = /bot|crawl|spider|slurp|bing|googlebot|yandex|baidu|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/i;

export default async function handler(req, res) {
  try {
    const ua = String(req.headers['user-agent'] || '');
    const isBot = BOT_REGEX.test(ua);

    // Build origin information
    const proto = String(req.headers['x-forwarded-proto'] || 'https');
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
    const origin = `${proto}://${host}`;

    // path provided by vercel rewrite: /api/prerender?path=<route>
    const url = new URL(req.url, origin);
    const pathParam = url.searchParams.get('path') || '';
    const originalUrl = `${origin}/${pathParam}${url.search ? (url.search.includes('path=') ? '' : url.search) : ''}`;

    if (isBot) {
      // Forward to Prerender service
      const prerenderUrl = `https://service.prerender.io/${origin}/${pathParam}`;
      const r = await fetch(prerenderUrl, {
        headers: {
          'X-Prerender-Token': 'yH0CMJLpUjilISQSDTxJ',
          'X-Original-URL': originalUrl,
          'User-Agent': ua,
        },
        redirect: 'follow',
      });

      const body = await r.arrayBuffer();
      // Proxy status and headers
      res.status(r.status);
      r.headers.forEach((v, k) => {
        // Avoid setting hop-by-hop headers
        if (!['transfer-encoding'].includes(k.toLowerCase())) {
          res.setHeader(k, v);
        }
      });
      res.send(Buffer.from(body));
      return;
    }

    // Non-bot traffic: serve SPA index.html directly to avoid recursion
    const indexUrl = `${origin}/index.html`;
    const normal = await fetch(indexUrl, {
      headers: { 'User-Agent': ua },
      redirect: 'follow',
    });
    const body = await normal.arrayBuffer();
    res.status(normal.status);
    normal.headers.forEach((v, k) => {
      if (!['transfer-encoding'].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });
    res.send(Buffer.from(body));
  } catch (e) {
    console.error('Prerender proxy error:', e);
    res.status(500).send('Prerender proxy error');
  }
}
