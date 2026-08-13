import express from 'express';
import { createApiApp } from '../src/server/app';

const app = createApiApp();

const serverlessHandler: express.Express = express();

serverlessHandler.use((req, res, next) => {
  const matchedPath = (req.headers['x-matched-path'] as string) || (req.headers['x-vercel-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string) || '';
  
  if (matchedPath && matchedPath.startsWith('/api')) {
    const queryIndex = req.url.indexOf('?');
    const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
    const cleanMatched = matchedPath.split('?')[0];
    req.url = cleanMatched + queryString;
  } else if (req.query && (req.query.slug || (req as any).params?.slug)) {
    const rawSlug = req.query.slug || (req as any).params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug.join('/') : String(rawSlug);
    const queryIndex = req.url.indexOf('?');
    const queryString = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
    req.url = `/api/${slug}` + queryString;
  } else if (req.url) {
    let cleanUrl = req.url.replace(/^\/api\/index(\.ts|\.js)?/, '/api');
    if (!cleanUrl.startsWith('/api') && !cleanUrl.startsWith('/robots.txt') && !cleanUrl.startsWith('/sitemap.xml')) {
      cleanUrl = '/api' + (cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
    }
    req.url = cleanUrl;
  }

  return (app as any)(req, res, next);
});

export default serverlessHandler;


