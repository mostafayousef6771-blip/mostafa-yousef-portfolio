import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

export async function verifyAdminToken(req: express.Request): Promise<{ authenticated: boolean; isAdmin: boolean; error?: string; userId?: string }> {
  const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string) || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { authenticated: false, isAdmin: false, error: 'Unauthorized: Admin authentication token is required.' };
  }

  if (!supabaseAdmin) {
    return { authenticated: false, isAdmin: false, error: 'Server configuration error: Supabase Admin client is not initialized.' };
  }

  const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !userData?.user) {
    return {
      authenticated: false,
      isAdmin: false,
      error: `Unauthorized: Invalid or expired admin session (${authError?.message || 'User not found'}). Please log in again.`,
    };
  }

  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const { data: isAdminRes, error: rpcErr } = await userClient.rpc('is_admin');
  if (rpcErr) {
    console.warn('[verifyAdminToken] is_admin RPC error:', rpcErr.message);
  }

  if (isAdminRes !== true) {
    return {
      authenticated: true,
      isAdmin: false,
      userId: userData.user.id,
      error: 'Forbidden: You do not have administrator permissions.',
    };
  }

  return { authenticated: true, isAdmin: true, userId: userData.user.id };
}

export function createApiApp(): express.Express {
  const app = express();

  app.use(express.json());

  // STRICT API ROUTER
  const apiRouter = express.Router();

  // CORS & PREFLIGHT MIDDLEWARE FOR API
  apiRouter.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // API HEALTH CHECK
  apiRouter.get('/health', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const isConfigured = Boolean(supabaseUrl) && !supabaseUrl.includes('your-supabase-project');
    return res.status(200).json({
      success: true,
      service: 'api',
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabaseConfigured: isConfigured,
    });
  });

  // DB AUDIT ENDPOINT (Admin Only)
  apiRouter.get('/audit', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const auth = await verifyAdminToken(req);
    if (!auth.authenticated || !auth.isAdmin) {
      return res.status(403).json({ success: false, error: auth.error || 'Forbidden: Admin authorization required.' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, error: 'supabaseAdmin not initialized on server' });
    }
    const tables = [
      'skills', 'projects', 'certificates', 'experience', 'education',
      'reviews', 'social_links', 'resume', 'messages', 'profile',
      'about', 'site_settings', 'media'
    ];
    const auditResults: Record<string, any> = {};

    for (const tbl of tables) {
      try {
        const { count, error, data } = await supabaseAdmin
          .from(tbl)
          .select('*', { count: 'exact' });
        auditResults[tbl] = {
          count: count ?? (data ? data.length : 0),
          error: error ? error.message : null,
          sample: data ? data.slice(0, 3) : [],
        };
      } catch (err: any) {
        auditResults[tbl] = { count: 0, error: err.message };
      }
    }

    return res.status(200).json({
      success: true,
      supabaseUrl,
      auditResults,
    });
  });

  // RUNTIME CONFIG ENDPOINT FOR SUPABASE CLIENT
  apiRouter.get('/config', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      supabaseUrl: process.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
    });
  });

  // DATA FETCH ENDPOINT (Public & Admin fallback)
  apiRouter.get('/data/:table', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const table = (req.params.table || '').toLowerCase().trim();
    const allowedTables = [
      'skills', 'projects', 'certificates', 'experience', 'education',
      'reviews', 'social_links', 'resume', 'messages', 'profile',
      'about', 'site_settings', 'media'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ success: false, error: `Invalid table name "${table}".` });
    }

    if (table === 'messages') {
      const auth = await verifyAdminToken(req);
      if (!auth.authenticated || !auth.isAdmin) {
        return res.status(403).json({ success: false, error: 'Forbidden: Admin authorization required to access messages.' });
      }
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, error: 'Supabase admin client not initialized on server.' });
    }

    try {
      let query = supabaseAdmin.from(table).select('*');
      if (['skills', 'projects', 'certificates', 'experience', 'education', 'reviews', 'social_links'].includes(table)) {
        query = query.order('display_order', { ascending: true });
      } else if (['media', 'messages'].includes(table)) {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.error(`[Data Fetch Error] Table: ${table}`, error);
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data: data || [] });
    } catch (err: any) {
      console.error(`[Data Fetch Exception] Table: ${table}`, err);
      return res.status(500).json({ success: false, error: err.message || 'Error fetching data.' });
    }
  });

  // SECURE ADMIN SAVE (CREATE / UPDATE) ROUTE
  apiRouter.post('/admin/save', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const auth = await verifyAdminToken(req);
      if (!auth.authenticated) {
        return res.status(401).json({ success: false, error: auth.error || 'Unauthorized request.' });
      }
      if (!auth.isAdmin) {
        return res.status(403).json({ success: false, error: auth.error || 'Forbidden: Administrator privileges required.' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ success: false, error: 'Supabase admin client is not initialized on server.' });
      }

      const { table, item } = req.body || {};
      if (!table || !item) {
        return res.status(400).json({ success: false, error: 'Table and item parameters are required.' });
      }

      const allowedTables = [
        'skills', 'projects', 'certificates', 'experience', 'education',
        'reviews', 'social_links', 'resume', 'messages', 'profile',
        'about', 'site_settings', 'media'
      ];
      if (!allowedTables.includes(table.toLowerCase())) {
        return res.status(400).json({ success: false, error: `Invalid table name "${table}".` });
      }

      const { data, error } = await supabaseAdmin
        .from(table.toLowerCase())
        .upsert(item)
        .select()
        .single();

      if (error) {
        console.error(`[Admin Save Error] Table: ${table}`, error);
        return res.status(400).json({ success: false, error: `Save failed: ${error.message}` });
      }

      console.log(`[Admin Save Success] Table: ${table}, Item ID: ${data?.id}`);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      console.error('[Admin Save Exception]', err);
      return res.status(500).json({ success: false, error: err.message || 'Internal server error during save.' });
    }
  });

  // SECURE ADMIN DELETE ROUTE
  apiRouter.post('/admin/delete', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const auth = await verifyAdminToken(req);
      if (!auth.authenticated) {
        return res.status(401).json({ success: false, error: auth.error || 'Unauthorized request.' });
      }
      if (!auth.isAdmin) {
        return res.status(403).json({ success: false, error: auth.error || 'Forbidden: Administrator privileges required.' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ success: false, error: 'Supabase admin client is not initialized on server.' });
      }

      const { table, id } = req.body || {};
      if (!table || !id) {
        return res.status(400).json({ success: false, error: 'Table and id parameters are required.' });
      }

      const allowedTables = [
        'skills', 'projects', 'certificates', 'experience', 'education',
        'reviews', 'social_links', 'resume', 'messages', 'profile',
        'about', 'site_settings', 'media'
      ];
      if (!allowedTables.includes(table.toLowerCase())) {
        return res.status(400).json({ success: false, error: `Invalid table name "${table}".` });
      }

      const { error } = await supabaseAdmin
        .from(table.toLowerCase())
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`[Admin Delete Error] Table: ${table}, ID: ${id}`, error);
        return res.status(400).json({ success: false, error: `Delete failed: ${error.message}` });
      }

      console.log(`[Admin Delete Success] Table: ${table}, ID: ${id}`);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('[Admin Delete Exception]', err);
      return res.status(500).json({ success: false, error: err.message || 'Internal server error during delete.' });
    }
  });

  // SECURE FILE UPLOAD ROUTE
  const handleUpload = (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');

    upload.single('file')(req, res, async (multerErr: any) => {
      if (multerErr) {
        console.error('[Multer Processing Error]', multerErr);
        if (multerErr instanceof multer.MulterError) {
          if (multerErr.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'File size exceeds limit of 15MB.' });
          }
          return res.status(400).json({ success: false, error: `Upload request error: ${multerErr.message}` });
        }
        return res.status(400).json({ success: false, error: multerErr.message || 'Error processing uploaded file.' });
      }

      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ success: false, error: 'No file provided in request.' });
        }

        const auth = await verifyAdminToken(req);
        if (!auth.authenticated) {
          return res.status(401).json({ success: false, error: auth.error || 'Unauthorized request.' });
        }
        if (!auth.isAdmin) {
          return res.status(403).json({ success: false, error: auth.error || 'Forbidden: Administrator privileges required.' });
        }

        if (!supabaseAdmin) {
          return res.status(500).json({ success: false, error: 'Supabase storage service is not configured on the server.' });
        }

        const bucket = (req.body?.bucket || 'media').trim().toLowerCase();
        const allowedBuckets = ['profile', 'projects', 'certificates', 'resume', 'media'];
        if (!allowedBuckets.includes(bucket)) {
          return res.status(400).json({ success: false, error: `Invalid storage bucket "${bucket}". Allowed buckets: ${allowedBuckets.join(', ')}` });
        }

        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${Date.now()}_${sanitizedName}`;

        try {
          await supabaseAdmin.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 15728640,
          });
        } catch {
          // Bucket creation fails if already existing, safely ignore
        }

        const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage.from(bucket).upload(filePath, file.buffer, {
          contentType: file.mimetype || 'application/octet-stream',
          cacheControl: '3600',
          upsert: true,
        });

        if (uploadErr) {
          console.error(`[Storage Upload Error] Bucket: ${bucket}, File: ${filePath}`, uploadErr);
          return res.status(400).json({ success: false, error: `Storage upload failed: ${uploadErr.message || 'Unknown storage error'}` });
        }

        const uploadedStoragePath = uploadData?.path || filePath;
        const publicUrlResult = supabaseAdmin.storage.from(bucket).getPublicUrl(uploadedStoragePath);
        const rawPublicData: any = publicUrlResult?.data ?? publicUrlResult;
        let publicUrl = '';

        if (typeof rawPublicData === 'string') {
          publicUrl = rawPublicData;
        } else if (typeof rawPublicData?.publicUrl === 'string') {
          publicUrl = rawPublicData.publicUrl;
        } else if (typeof rawPublicData?.publicURL === 'string') {
          publicUrl = rawPublicData.publicURL;
        } else if (typeof publicUrlResult === 'string') {
          publicUrl = publicUrlResult;
        }

        if (!publicUrl || publicUrl === '[object Object]') {
          return res.status(500).json({ success: false, error: 'Failed to generate public URL for uploaded file.' });
        }

        console.log(`[Storage Upload Success] Bucket: ${bucket}, Path: ${uploadedStoragePath}, URL: ${publicUrl}`);

        return res.status(200).json({
          success: true,
          url: publicUrl,
          publicUrl: publicUrl,
          path: uploadedStoragePath,
          bucket,
          name: file.originalname,
          size: file.size,
          type: file.mimetype,
        });
      } catch (err: any) {
        console.error('[Upload Endpoint Exception]', err);
        return res.status(500).json({ success: false, error: err.message || 'Internal server error during upload.' });
      }
    });
  };

  apiRouter.post('/upload', handleUpload);
  apiRouter.post('/upload/', handleUpload);

  // STORAGE DELETE ROUTE
  apiRouter.post('/storage/delete', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { bucket, path: filePath } = req.body || {};
      if (!bucket || !filePath) {
        return res.status(400).json({ success: false, error: 'Bucket and path parameters are required.' });
      }

      const auth = await verifyAdminToken(req);
      if (!auth.authenticated) {
        return res.status(401).json({ success: false, error: auth.error || 'Unauthorized request.' });
      }
      if (!auth.isAdmin) {
        return res.status(403).json({ success: false, error: auth.error || 'Forbidden: Administrator privileges required.' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ success: false, error: 'Supabase storage is not configured on the server.' });
      }

      const { data, error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);
      if (error) {
        return res.status(400).json({ success: false, error: `Delete failed: ${error.message}` });
      }

      return res.status(200).json({ success: true, deleted: data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Internal server error during delete.' });
    }
  });

  // CONTACT MESSAGE SUBMISSION ROUTE
  apiRouter.post('/contact', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { sender_name, sender_email, subject, message } = req.body || {};
    if (!sender_name || !sender_email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }
    console.log(`[Contact Form Received] From: ${sender_name} <${sender_email}> Subject: ${subject}`);

    if (supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin.from('messages').insert([{
          sender_name,
          sender_email,
          subject: subject || 'Portfolio Contact Form Submission',
          message,
          is_read: false,
          is_archived: false,
        }]);
        if (error) {
          console.warn('[Contact Form Supabase Insert Error]', error.message);
        }
      } catch (err: any) {
        console.warn('[Contact Form Supabase Insert Exception]', err.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Message received successfully.' });
  });

  // API ERROR HANDLING MIDDLEWARE
  apiRouter.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[API Router Error Middleware]', err);
    if (res.headersSent) {
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    let statusCode = err.status || err.statusCode || 500;
    let errorMessage = err.message || 'Internal server error';

    if (err instanceof multer.MulterError || err?.name === 'MulterError') {
      statusCode = 400;
      if (err.code === 'LIMIT_FILE_SIZE') {
        errorMessage = 'File size exceeds limit of 15MB.';
      } else {
        errorMessage = `Upload payload error: ${err.message}`;
      }
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  });

  // CATCH-ALL FOR UNMATCHED /api/* ROUTES - GUARANTEES NO HTML CAN EVER BE RETURNED FOR /api
  apiRouter.use('*', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.originalUrl || req.path}`,
    });
  });

  // MOUNT API ROUTER Strictly at /api
  app.use('/api', apiRouter);

  // SEO ROBOTS.TXT
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin/
Sitemap: ${process.env.APP_URL || 'http://localhost:3000'}/sitemap.xml
`);
  });

  // SEO SITEMAP.XML
  app.get('/sitemap.xml', (_req, res) => {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const routes = [
      '',
      '/about',
      '/skills',
      '/projects',
      '/certificates',
      '/experience',
      '/education',
      '/resume',
      '/reviews',
      '/contact',
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${r === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.type('application/xml');
    res.send(xml);
  });

  return app;
}
