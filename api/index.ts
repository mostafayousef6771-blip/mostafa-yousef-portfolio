import { createApiApp } from '../src/server/app';

const app = createApiApp();

// Vercel Serverless Function Configuration
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: any, res: any) {
  try {
    let cleanPath = '';
    const originalUrl = req.url || '';
    const queryIndex = originalUrl.indexOf('?');
    const queryString = queryIndex !== -1 ? originalUrl.substring(queryIndex) : '';
    const rawPathname = queryIndex !== -1 ? originalUrl.substring(0, queryIndex) : originalUrl;

    // 1. Check direct query parameters or query string for rewrite capture groups (e.g. ?1=admin%2Fsave)
    let cleanQueryString = queryString;
    try {
      const searchParams = new URLSearchParams(queryString.startsWith('?') ? queryString.substring(1) : queryString);
      const captureSubpath = searchParams.get('1') || searchParams.get('path') || searchParams.get('slug') || (req.query && (req.query['1'] || req.query['path'] || req.query['slug']));
      if (captureSubpath && typeof captureSubpath === 'string') {
        const sub = captureSubpath.replace(/^\/+/, '');
        if (sub) {
          cleanPath = '/api/' + sub;
          searchParams.delete('1');
          searchParams.delete('path');
          searchParams.delete('slug');
          const remainingQuery = searchParams.toString();
          cleanQueryString = remainingQuery ? `?${remainingQuery}` : '';
        }
      }
    } catch {}

    // 2. Check x-now-route-matches or x-vercel-route-matches headers (e.g. 1=admin%2Fsave)
    if (!cleanPath) {
      const routeMatches = req.headers['x-now-route-matches'] || req.headers['x-vercel-route-matches'];
      if (routeMatches && typeof routeMatches === 'string') {
        try {
          const params = new URLSearchParams(routeMatches);
          const subPath = params.get('1') || params.get('path') || params.get('slug');
          if (subPath) {
            cleanPath = '/api/' + subPath.replace(/^\/+/, '');
          }
        } catch {}
      }
    }

    // 3. Check Vercel matched path / forwarded URI headers
    if (!cleanPath) {
      const candidateHeaders = [
        req.headers['x-matched-path'],
        req.headers['x-vercel-matched-path'],
        req.headers['x-forwarded-uri'],
        req.headers['x-original-uri'],
        req.headers['x-original-url'],
        req.headers['x-forwarded-path'],
        req.headers['x-real-origin-url'],
      ];

      for (const header of candidateHeaders) {
        if (header && typeof header === 'string' && header.startsWith('/api') && !header.includes('(')) {
          cleanPath = header.split('?')[0];
          break;
        }
      }
    }

    // 4. Fallback to raw request URL pathname
    if (!cleanPath) {
      cleanPath = rawPathname.replace(/^\/api\/index(\.ts|\.js)?/, '/api');
    }

    // 5. Ensure path starts with /api for API endpoints
    if (!cleanPath.startsWith('/api') && !cleanPath.startsWith('/robots.txt') && !cleanPath.startsWith('/sitemap.xml')) {
      cleanPath = '/api' + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);
    }

    // Clean any trailing index.ts or duplicated /api/api
    cleanPath = cleanPath.replace(/^\/api\/api\//, '/api/').replace(/\/index(\.ts|\.js)?$/, '');
    if (cleanPath === '' || cleanPath === '/') {
      cleanPath = '/api';
    }

    req.url = cleanPath + cleanQueryString;
    req.originalUrl = req.url;

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
        code: err?.code || 'HANDLER_EXCEPTION',
        details: err?.details,
      });
    }
  }
}





