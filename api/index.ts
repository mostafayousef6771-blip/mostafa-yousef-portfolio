import express from 'express';
import { createApiApp } from '../src/server/app';

const app = createApiApp();

const serverlessHandler: express.Express = express();

serverlessHandler.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/robots.txt') && !req.url.startsWith('/sitemap.xml')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return (app as any)(req, res, next);
});

export default serverlessHandler;

