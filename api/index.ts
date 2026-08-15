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
    let cleanPath = '';

    // 1. Check x-now-route-matches from Vercel regex rewrite capture groups (e.g. 1=admin%2Fsave)
    const routeMatches = req.headers['x-now-route-matches'] || req.headers['x-vercel-route-matches'];
    if (routeMatches && typeof routeMatches === 'string') {
      try {
        const params = new URLSearchParams(routeMatches);
        const subPath = params.get('1') || params.get('path') || params.get('slug');
        if (subPath) {
          cleanPath = '/api/' + subPath.replace(/^\//, '');
        }
      } catch {}
    }

    // 2. Check forwarded URI headers if clean and not containing regex patterns
    if (!cleanPath) {
      const forwardedUri =
        (req.headers['x-forwarded-uri'] as string) ||
        (req.headers['x-original-uri'] as string) ||
        (req.headers['x-original-url'] as string) ||
        (req.headers['x-forwarded-path'] as string) ||
        '';
      if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri.startsWith('/api') && !forwardedUri.includes('(')) {
        cleanPath = forwardedUri.split('?')[0];
      }
    }

    // 3. Fallback to raw request URL
    const originalUrl = req.url || '';
    const queryIndex = originalUrl.indexOf('?');
    const queryString = queryIndex !== -1 ? originalUrl.substring(queryIndex) : '';
    const pathname = queryIndex !== -1 ? originalUrl.substring(0, queryIndex) : originalUrl;

    if (!cleanPath) {
      cleanPath = pathname.replace(/^\/api\/index(\.ts|\.js)?/, '/api');
    }

    // 4. Ensure path starts with /api for API endpoints
    if (!cleanPath.startsWith('/api') && !cleanPath.startsWith('/robots.txt') && !cleanPath.startsWith('/sitemap.xml')) {
      cleanPath = '/api' + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);
    }

    req.url = cleanPath + queryString;

    // Execute Express app
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Handler Exception]', {
      message: err?.message,
      code: err?.code,
      details: err?.details,
    });
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




