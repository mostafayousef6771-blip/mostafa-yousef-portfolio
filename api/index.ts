import { createApiApp } from '../src/server/app';

const app = createApiApp();

// Vercel Serverless Function Configuration
// bodyParser: false is CRITICAL for Multer multipart/form-data upload stream processing
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: any, res: any) {
  // Normalize incoming request path from Vercel's rewrite headers
  const matchedPath =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-vercel-matched-path'] as string) ||
    (req.headers['x-forwarded-uri'] as string) ||
    (req.headers['x-original-uri'] as string) ||
    '';

  const queryIndex = (req.url || '').indexOf('?');
  const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : '';

  if (matchedPath && matchedPath.startsWith('/api')) {
    req.url = matchedPath.split('?')[0] + queryString;
  } else if (req.url) {
    let cleanUrl = req.url.replace(/^\/api\/index(\.ts|\.js)?/, '/api');
    if (!cleanUrl.startsWith('/api') && !cleanUrl.startsWith('/robots.txt') && !cleanUrl.startsWith('/sitemap.xml')) {
      cleanUrl = '/api' + (cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    }
    req.url = cleanUrl;
  }

  return app(req, res);
}



