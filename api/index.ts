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
  try {
    // 1. Get raw request URL
    const originalUrl = req.url || '';
    const queryIndex = originalUrl.indexOf('?');
    const queryString = queryIndex !== -1 ? originalUrl.substring(queryIndex) : '';
    const pathname = queryIndex !== -1 ? originalUrl.substring(0, queryIndex) : originalUrl;

    // 2. Safe normalization: strip /api/index if present
    let cleanPath = pathname.replace(/^\/api\/index(\.ts|\.js)?/, '/api');

    // 3. Check x-forwarded-uri or x-original-uri only if clean
    const forwardedUri = (req.headers['x-forwarded-uri'] || req.headers['x-original-uri']) as string | undefined;
    if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri.startsWith('/api') && !forwardedUri.includes('(')) {
      cleanPath = forwardedUri.split('?')[0];
    }

    // 4. Ensure path starts with /api for API endpoints
    if (!cleanPath.startsWith('/api') && !cleanPath.startsWith('/robots.txt') && !cleanPath.startsWith('/sitemap.xml')) {
      cleanPath = '/api' + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);
    }

    req.url = cleanPath + queryString;

    // Execute Express app
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Handler Exception]', err);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({
        success: false,
        error: `Server handler exception: ${err?.message || 'Internal server error'}`,
        code: err?.code,
        details: err?.details,
      });
    }
  }
}




