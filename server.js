import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL =
  process.env.BACKEND_URL ||
  'https://lemea-flagrance-back-production.up.railway.app';
const DIST_DIR = path.join(__dirname, 'dist');

// The one official address of the site (matches the Google Search Console property
// and the canonical tags). www.lemeaflagrance.shop is permanently redirected here.
const SITE_URL = 'https://lemeaflagrance.shop';
const REDIRECT_HOSTS = new Set(['www.lemeaflagrance.shop']);

// Social-media link-preview crawlers only. Search engines (Googlebot, Bingbot) are
// deliberately NOT here: they render the real React page, which has full content,
// titles, canonical tags and Product structured data.
const BOT_USER_AGENTS =
  /facebookexternalhit|facebot|viber|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot/i;

// Regex matching product route patterns e.g. /produktet/:id
const PRODUCT_ROUTE_REGEX = /^\/produktet\/([^/?#]+)\/?$/i;

// Healthcheck endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 0. Permanently redirect www -> main domain (one address = no duplicate pages in Google)
app.use((req, res, next) => {
  const host = String(req.headers.host || '').toLowerCase().split(':')[0];
  if (REDIRECT_HOSTS.has(host)) {
    return res.redirect(301, `${SITE_URL}${req.originalUrl}`);
  }
  next();
});

// 0b. Dynamic sitemap: static pages + every product from the database (cached 1 hour)
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/produktet', priority: '0.9', changefreq: 'daily' },
  { path: '/rreth-nesh', priority: '0.6', changefreq: 'monthly' },
  { path: '/kontakti', priority: '0.6', changefreq: 'monthly' },
  { path: '/vleresim', priority: '0.4', changefreq: 'monthly' },
  { path: '/termsofservice', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacypolicy', priority: '0.3', changefreq: 'yearly' },
];
const SITEMAP_TTL_MS = 60 * 60 * 1000;
let sitemapCache = { xml: null, builtAt: 0 };

const xmlEscape = (v) =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

async function buildSitemap() {
  let products = [];
  try {
    const r = await fetch(`${BACKEND_URL}/products`, { signal: AbortSignal.timeout(8000) });
    if (r.ok) products = await r.json();
  } catch (error) {
    console.error('[Sitemap] Could not load products:', error?.message || error);
  }

  const urls = STATIC_PAGES.map(
    (p) =>
      `  <url><loc>${SITE_URL}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
  );
  for (const p of Array.isArray(products) ? products : []) {
    if (!p?.id) continue;
    const lastmod = p.updatedAt ? `<lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>` : '';
    urls.push(
      `  <url><loc>${SITE_URL}/produktet/${xmlEscape(encodeURIComponent(p.id))}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    );
  }
  return {
    xml: [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
      '',
    ].join('\n'),
    hasProducts: urls.length > STATIC_PAGES.length,
  };
}

app.get('/sitemap.xml', async (req, res) => {
  const fresh = sitemapCache.xml && Date.now() - sitemapCache.builtAt < SITEMAP_TTL_MS;
  if (!fresh) {
    const { xml, hasProducts } = await buildSitemap();
    // Only cache a full sitemap; if the backend was down, retry on the next request
    // (and keep serving the last good one if we have it).
    if (hasProducts) sitemapCache = { xml, builtAt: Date.now() };
    else if (!sitemapCache.xml) {
      res.type('application/xml');
      return res.send(xml);
    }
  }
  res.type('application/xml');
  res.send(sitemapCache.xml);
});

// 1. Crawler interception middleware for product pages (/produktet/:id)
app.get(PRODUCT_ROUTE_REGEX, async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';

  // If not a social media or search engine crawler, pass through to React SPA
  if (!BOT_USER_AGENTS.test(userAgent)) {
    return next();
  }

  const productId = req.params[0];
  const backendTarget = `${BACKEND_URL}/produktet/${encodeURIComponent(productId)}`;

  console.log(`[BotProxy] Intercepted bot "${userAgent}" requesting /produktet/${productId}. Proxying to: ${backendTarget}`);

  try {
    // Forward request to the NestJS backend to retrieve dynamically generated OpenGraph HTML
    const backendResponse = await fetch(backendTarget, {
      method: 'GET',
      headers: {
        'user-agent': userAgent,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'x-forwarded-host': req.headers['host'] || 'lemeaflagrance.shop',
        'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'https',
      },
    });

    if (backendResponse.ok) {
      const html = await backendResponse.text();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    console.warn(
      `[BotProxy] Backend responded with status ${backendResponse.status} for ${backendTarget}. Falling back to SPA index.html.`,
    );
    return next();
  } catch (error) {
    console.error(`[BotProxy] Error proxying to backend:`, error);
    // If backend is temporarily unreachable, fallback to serving standard SPA index.html
    return next();
  }
});

// 2. Serve static assets from the Vite build output (dist/)
app.use(express.static(DIST_DIR));

// 3. Fallback to index.html for all SPA routes (React Router navigation)
app.use((req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// Start the production server on 0.0.0.0 for Railway container compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Frontend] Server running at http://0.0.0.0:${PORT}`);
  console.log(`[Frontend] Serving static files from: ${DIST_DIR}`);
  console.log(`[Frontend] Backend proxy destination: ${BACKEND_URL}`);
});
