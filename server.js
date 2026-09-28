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

// Regex matching social media and search engine crawlers
const BOT_USER_AGENTS =
  /facebookexternalhit|viber|whatsapp|twitterbot|telegrambot|googlebot|bingbot|linkedinbot|slackbot|discordbot/i;

// Regex matching product route patterns e.g. /produktet/:id
const PRODUCT_ROUTE_REGEX = /^\/produktet\/([^/?#]+)\/?$/i;

// Healthcheck endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
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
        'x-forwarded-host': req.headers['host'] || 'www.lemeafragrance.shop',
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
