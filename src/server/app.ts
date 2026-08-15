import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

export function getSupabaseAdmin(): SupabaseClient | null {
  let url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  let serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim();

  // Strip wrapping quotes if any
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  if ((serviceKey.startsWith('"') && serviceKey.endsWith('"')) || (serviceKey.startsWith("'") && serviceKey.endsWith("'"))) {
    serviceKey = serviceKey.slice(1, -1).trim();
  }

  if (url && serviceKey && !url.includes('your-supabase-project')) {
    return createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return null;
}

export async function verifyAdminToken(req: express.Request): Promise<{ authenticated: boolean; isAdmin: boolean; error?: string; userId?: string; client?: any }> {
  const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string) || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { authenticated: false, isAdmin: false, error: 'Unauthorized: Admin authentication token is required.' };
  }

  let targetUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  let targetAnon = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
  let serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if ((targetUrl.startsWith('"') && targetUrl.endsWith('"')) || (targetUrl.startsWith("'") && targetUrl.endsWith("'"))) {
    targetUrl = targetUrl.slice(1, -1).trim();
  }
  if ((targetAnon.startsWith('"') && targetAnon.endsWith('"')) || (targetAnon.startsWith("'") && targetAnon.endsWith("'"))) {
    targetAnon = targetAnon.slice(1, -1).trim();
  }
  if ((serviceKey.startsWith('"') && serviceKey.endsWith('"')) || (serviceKey.startsWith("'") && serviceKey.endsWith("'"))) {
    serviceKey = serviceKey.slice(1, -1).trim();
  }

  const adminClient = getSupabaseAdmin();

  if (!targetUrl) {
    return { authenticated: false, isAdmin: false, error: 'Server configuration error: Supabase URL is not configured.' };
  }

  if (!adminClient && !serviceKey) {
    return { authenticated: false, isAdmin: false, error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing. Please configure SUPABASE_SERVICE_ROLE_KEY in your server environment variables.' };
  }


  // Direct service role key authorization
  if (serviceKey && token === serviceKey) {
    return { authenticated: true, isAdmin: true, userId: 'service_role', client: adminClient };
  }

  // Verify token using adminClient (service role)
  if (adminClient) {
    const { data: userData, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return {
        authenticated: false,
        isAdmin: false,
        error: `Unauthorized: Invalid or expired admin session (${authError?.message || 'User not found'}). Please log in again.`,
      };
    }

    if (targetAnon) {
      try {
        const userClient = createClient(targetUrl, targetAnon, {
          global: {
            headers: { Authorization: `Bearer ${token}` },
          },
        });

        const { data: isAdminRes, error: rpcErr } = await userClient.rpc('is_admin');
        if (rpcErr) {
          console.warn('[verifyAdminToken] is_admin RPC notice:', rpcErr.message);
        } else if (isAdminRes === false) {
          return {
            authenticated: true,
            isAdmin: false,
            userId: userData.user.id,
            error: 'Forbidden: You do not have administrator permissions.',
          };
        }
      } catch (err: any) {
        console.warn('[verifyAdminToken] is_admin check exception:', err?.message);
      }
    }

    return { authenticated: true, isAdmin: true, userId: userData.user.id, client: adminClient };
  }

  return {
    authenticated: false,
    isAdmin: false,
    error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing. Please configure SUPABASE_SERVICE_ROLE_KEY in your server environment variables.',
  };
}

export function createApiApp(): express.Express {
  const app = express();

  // Robust Body Parser supporting standalone Express and Vercel Serverless environments
  app.use((req, res, next) => {
    // If body was already parsed by Vercel serverless runtime or upstream middleware
    if (req.body !== undefined && typeof req.body === 'object' && req.body !== null) {
      (req as any)._body = true;
      return next();
    }
    // If body is already a JSON string
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
        (req as any)._body = true;
        return next();
      } catch {}
    }
    // If request is multipart/form-data, skip to let Multer handle streaming
    const contentType = req.headers['content-type'] || '';
    if (typeof contentType === 'string' && contentType.includes('multipart/form-data')) {
      return next();
    }
    // Standard Express JSON body parsing
    express.json({ limit: '10mb' })(req, res, next);
  });

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
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const isConfigured = Boolean(supabaseUrl) && !supabaseUrl.includes('your-supabase-project');
    const hasAdminKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
    return res.status(200).json({
      success: true,
      service: 'api',
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabaseConfigured: isConfigured,
      hasAdminKey,
      ...(!hasAdminKey ? { warning: 'SUPABASE_SERVICE_ROLE_KEY is missing' } : {}),
    });
  });

  // DB AUDIT ENDPOINT (Admin Only)
  apiRouter.get('/audit', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const auth = await verifyAdminToken(req);
    if (!auth.authenticated || !auth.isAdmin) {
      return res.status(403).json({ success: false, error: auth.error || 'Forbidden: Admin authorization required.' });
    }

    const adminClient = getSupabaseAdmin();
    if (!adminClient) {
      return res.status(500).json({ success: false, error: 'supabaseAdmin not initialized on server. Please ensure SUPABASE_SERVICE_ROLE_KEY is configured.' });
    }
    const tables = [
      'skills', 'projects', 'certificates', 'experience', 'education',
      'reviews', 'social_links', 'resume', 'messages', 'profile',
      'about', 'site_settings', 'media'
    ];
    const auditResults: Record<string, any> = {};

    for (const tbl of tables) {
      try {
        const { count, error, data } = await adminClient
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
      supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
      auditResults,
    });
  });

  // RUNTIME CONFIG ENDPOINT FOR SUPABASE CLIENT
  apiRouter.get('/config', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
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

    const adminClient = getSupabaseAdmin();
    const clientToUse = adminClient || (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY ? createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY) : null);
    if (!clientToUse) {
      return res.status(500).json({ success: false, error: 'Supabase client is not configured on server.' });
    }

    try {
      let query = clientToUse.from(table).select('*');
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
    const hasAuthHeader = Boolean(req.headers.authorization);
    const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

    try {
      const auth = await verifyAdminToken(req);
      if (!auth.authenticated) {
        console.warn('[Admin Save Request]', {
          endpoint: '/api/admin/save',
          method: req.method,
          requestPath: req.originalUrl || req.path,
          hasAuthHeader,
          tokenVerificationSucceeded: false,
          hasServiceRoleKey,
          status: 401,
          error: auth.error,
        });
        return res.status(401).json({
          success: false,
          error: auth.error || 'Unauthorized request.',
          code: 'UNAUTHORIZED',
        });
      }
      if (!auth.isAdmin) {
        console.warn('[Admin Save Request]', {
          endpoint: '/api/admin/save',
          method: req.method,
          requestPath: req.originalUrl || req.path,
          hasAuthHeader,
          tokenVerificationSucceeded: true,
          isAdmin: false,
          hasServiceRoleKey,
          status: 403,
          error: auth.error,
        });
        return res.status(403).json({
          success: false,
          error: auth.error || 'Forbidden: Administrator privileges required.',
          code: 'FORBIDDEN',
        });
      }

      const clientToUse = auth.client || getSupabaseAdmin();
      if (!clientToUse) {
        console.error('[Admin Save Request]', {
          endpoint: '/api/admin/save',
          method: req.method,
          requestPath: req.originalUrl || req.path,
          hasAuthHeader,
          tokenVerificationSucceeded: true,
          hasServiceRoleKey: false,
          status: 500,
          error: 'SUPABASE_SERVICE_ROLE_KEY is missing.',
        });
        return res.status(500).json({
          success: false,
          error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing. Please configure SUPABASE_SERVICE_ROLE_KEY in your server environment variables.',
          code: 'MISSING_SERVICE_ROLE_KEY',
        });
      }

      const { table, item } = req.body || {};
      if (!table || !item) {
        return res.status(400).json({
          success: false,
          error: 'Table and item parameters are required.',
          code: 'INVALID_PARAMETERS',
        });
      }

      const allowedTables = [
        'skills', 'projects', 'certificates', 'experience', 'education',
        'reviews', 'social_links', 'resume', 'messages', 'profile',
        'about', 'site_settings', 'media'
      ];
      if (!allowedTables.includes(table.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Invalid table name "${table}".`,
          code: 'INVALID_TABLE',
        });
      }

      // Clean item of undefined values
      const cleanItem: Record<string, any> = {};
      for (const [key, value] of Object.entries(item)) {
        if (value !== undefined) {
          cleanItem[key] = value;
        }
      }

      const { data, error } = await clientToUse
        .from(table.toLowerCase())
        .upsert(cleanItem)
        .select();

      if (error) {
        console.error('[Admin Save Supabase Error]', {
          endpoint: '/api/admin/save',
          method: req.method,
          requestPath: req.originalUrl || req.path,
          status: 400,
          hasAuthHeader,
          tokenVerificationSucceeded: true,
          hasServiceRoleKey,
          operation: `upsert into ${table.toLowerCase()}`,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
        });
        return res.status(400).json({
          success: false,
          error: `Save failed: ${error.message}`,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      const savedResult = Array.isArray(data) ? data[0] : data;
      console.log('[Admin Save Request]', {
        endpoint: '/api/admin/save',
        method: req.method,
        requestPath: req.originalUrl || req.path,
        status: 200,
        hasAuthHeader,
        tokenVerificationSucceeded: true,
        hasServiceRoleKey,
        operation: `upsert into ${table.toLowerCase()}`,
        itemId: savedResult?.id || 'record',
      });
      return res.status(200).json({ success: true, data: savedResult });
    } catch (err: any) {
      console.error('[Admin Save Exception]', {
        endpoint: '/api/admin/save',
        method: req.method,
        requestPath: req.originalUrl || req.path,
        status: 500,
        hasAuthHeader,
        hasServiceRoleKey,
        errorMessage: err?.message,
        errorCode: err?.code,
        errorDetails: err?.details,
      });
      return res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error during save.',
        code: err?.code,
        details: err?.details,
      });
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

      const clientToUse = auth.client || getSupabaseAdmin();
      if (!clientToUse) {
        return res.status(500).json({
          success: false,
          error: 'SUPABASE_SERVICE_ROLE_KEY is missing. Please configure SUPABASE_SERVICE_ROLE_KEY in your server environment variables.',
        });
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

      const { error } = await clientToUse
        .from(table.toLowerCase())
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`[Admin Delete Error] Table: ${table}, ID: ${id}`, {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return res.status(400).json({
          success: false,
          error: `Delete failed: ${error.message}`,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }

      console.log(`[Admin Delete Success] Table: ${table}, ID: ${id}`);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('[Admin Delete Exception]', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
      });
      return res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error during delete.',
        code: err?.code,
        details: err?.details,
      });
    }
  });

  // SECURE FILE UPLOAD ROUTE
  const handleUpload = (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');
    const hasAuthHeader = Boolean(req.headers.authorization);
    const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

    upload.single('file')(req, res, async (multerErr: any) => {
      if (multerErr) {
        console.error('[Upload Request Info]', {
          endpoint: '/api/upload',
          method: req.method,
          requestPath: req.originalUrl || req.path,
          status: 400,
          hasAuthHeader,
          hasServiceRoleKey,
          error: multerErr.message,
        });
        if (multerErr instanceof multer.MulterError) {
          if (multerErr.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'File size exceeds limit of 15MB.', code: 'LIMIT_FILE_SIZE' });
          }
          return res.status(400).json({ success: false, error: `Upload request error: ${multerErr.message}`, code: multerErr.code });
        }
        return res.status(400).json({ success: false, error: multerErr.message || 'Error processing uploaded file.' });
      }

      const safeBucket = (req.body?.bucket || 'portfolio-media').trim().toLowerCase();
      const safeFilename = req.file?.originalname ? req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_') : 'unknown';

      try {
        const file = req.file;
        if (!file) {
          console.warn('[Upload Request Info]', {
            endpoint: '/api/upload',
            method: req.method,
            requestPath: req.originalUrl || req.path,
            hasAuthHeader,
            hasServiceRoleKey,
            bucket: safeBucket,
            filename: 'none',
            status: 400,
            error: 'No file provided in request.',
          });
          return res.status(400).json({ success: false, error: 'No file provided in request.', code: 'NO_FILE' });
        }

        const auth = await verifyAdminToken(req);
        if (!auth.authenticated) {
          console.warn('[Upload Request Info]', {
            endpoint: '/api/upload',
            method: req.method,
            requestPath: req.originalUrl || req.path,
            hasAuthHeader,
            tokenVerificationSucceeded: false,
            hasServiceRoleKey,
            bucket: safeBucket,
            filename: safeFilename,
            status: 401,
            error: auth.error,
          });
          return res.status(401).json({ success: false, error: auth.error || 'Unauthorized request.', code: 'UNAUTHORIZED' });
        }
        if (!auth.isAdmin) {
          console.warn('[Upload Request Info]', {
            endpoint: '/api/upload',
            method: req.method,
            requestPath: req.originalUrl || req.path,
            hasAuthHeader,
            tokenVerificationSucceeded: true,
            isAdmin: false,
            hasServiceRoleKey,
            bucket: safeBucket,
            filename: safeFilename,
            status: 403,
            error: auth.error,
          });
          return res.status(403).json({ success: false, error: auth.error || 'Forbidden: Administrator privileges required.', code: 'FORBIDDEN' });
        }

        const clientToUse = auth.client || getSupabaseAdmin();
        if (!clientToUse) {
          console.error('[Upload Request Info]', {
            endpoint: '/api/upload',
            method: req.method,
            requestPath: req.originalUrl || req.path,
            hasAuthHeader,
            tokenVerificationSucceeded: true,
            hasServiceRoleKey: false,
            status: 500,
            error: 'SUPABASE_SERVICE_ROLE_KEY is missing.',
          });
          return res.status(500).json({
            success: false,
            error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing. Please configure SUPABASE_SERVICE_ROLE_KEY in your server environment variables.',
            code: 'MISSING_SERVICE_ROLE_KEY',
          });
        }

        const bucket = safeBucket;
        const allowedBuckets = ['portfolio-media', 'media', 'profile', 'projects', 'certificates', 'resume', 'resumes', 'avatars'];
        if (!allowedBuckets.includes(bucket)) {
          return res.status(400).json({
            success: false,
            error: `Invalid storage bucket "${bucket}". Allowed buckets: ${allowedBuckets.join(', ')}`,
            code: 'INVALID_BUCKET',
          });
        }

        const filePath = `${Date.now()}_${safeFilename}`;

        try {
          await clientToUse.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 15728640,
          });
        } catch {
          // Bucket creation fails if already existing, safely ignore
        }

        const { data: uploadData, error: uploadErr } = await clientToUse.storage.from(bucket).upload(filePath, file.buffer, {
          contentType: file.mimetype || 'application/octet-stream',
          cacheControl: '3600',
          upsert: true,
        });

        if (uploadErr) {
          console.error('[Storage Upload Error]', {
            endpoint: '/api/upload',
            method: req.method,
            requestPath: req.originalUrl || req.path,
            status: 400,
            hasAuthHeader,
            tokenVerificationSucceeded: true,
            hasServiceRoleKey,
            operation: `storage.upload to ${bucket}`,
            errorCode: (uploadErr as any).statusCode || (uploadErr as any).code,
            errorMessage: uploadErr.message,
            errorDetails: (uploadErr as any).error || uploadErr.message,
            bucket,
            filePath,
          });
          return res.status(400).json({
            success: false,
            error: `Storage upload failed: ${uploadErr.message || 'Unknown storage error'}`,
            code: (uploadErr as any).statusCode || (uploadErr as any).code,
            details: (uploadErr as any).error || uploadErr.message,
          });
        }

        const uploadedStoragePath = uploadData?.path || filePath;
        let publicUrl = '';

        try {
          const publicUrlResult = clientToUse.storage.from(bucket).getPublicUrl(uploadedStoragePath);
          const rawPublicData: any = publicUrlResult?.data ?? publicUrlResult;

          if (typeof rawPublicData === 'string' && rawPublicData.startsWith('http')) {
            publicUrl = rawPublicData;
          } else if (typeof rawPublicData?.publicUrl === 'string' && rawPublicData.publicUrl.startsWith('http')) {
            publicUrl = rawPublicData.publicUrl;
          } else if (typeof rawPublicData?.publicURL === 'string' && rawPublicData.publicURL.startsWith('http')) {
            publicUrl = rawPublicData.publicURL;
          } else if (typeof publicUrlResult === 'string' && publicUrlResult.startsWith('http')) {
            publicUrl = publicUrlResult;
          }
        } catch (getErr) {
          console.warn('[getPublicUrl Exception]', getErr);
        }

        const targetBaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
        const cleanBase = targetBaseUrl.replace(/\/+$/, '');

        if (!publicUrl || publicUrl === '[object Object]' || !publicUrl.startsWith('http')) {
          if (cleanBase) {
            publicUrl = `${cleanBase}/storage/v1/object/public/${bucket}/${uploadedStoragePath}`;
          }
        }

        if (!publicUrl || publicUrl === '[object Object]' || !publicUrl.startsWith('http')) {
          console.error('[Upload Request Info]', {
            endpoint: '/api/upload',
            method: req.method,
            requestPath: req.originalUrl || req.path,
            hasAuthHeader,
            tokenVerificationSucceeded: true,
            hasServiceRoleKey,
            bucket,
            filename: safeFilename,
            uploadSuccess: true,
            publicUrlGenerated: false,
            status: 500,
          });
          return res.status(500).json({
            success: false,
            error: 'Failed to generate public URL for uploaded file.',
            code: 'PUBLIC_URL_GENERATION_FAILED',
          });
        }

        console.log('[Upload Request Info]', {
          endpoint: '/api/upload',
          method: req.method,
          requestPath: req.originalUrl || req.path,
          status: 200,
          hasAuthHeader,
          tokenVerificationSucceeded: true,
          hasServiceRoleKey,
          bucket,
          filename: safeFilename,
          uploadSuccess: true,
          urlGenerated: true,
        });

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
        console.error('[Upload Endpoint Exception]', {
          endpoint: '/api/upload',
          method: req.method,
          requestPath: req.originalUrl || req.path,
          status: 500,
          hasAuthHeader,
          hasServiceRoleKey,
          errorMessage: err?.message,
          errorCode: err?.code,
          errorDetails: err?.details,
        });
        return res.status(500).json({
          success: false,
          error: err?.message || 'Internal server error during upload.',
          code: err?.code,
          details: err?.details,
        });
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

      const clientToUse = auth.client || getSupabaseAdmin();
      if (!clientToUse) {
        return res.status(500).json({
          success: false,
          error: 'SUPABASE_SERVICE_ROLE_KEY is missing. Please configure SUPABASE_SERVICE_ROLE_KEY in your server environment variables.',
        });
      }

      const { data, error } = await clientToUse.storage.from(bucket).remove([filePath]);
      if (error) {
        return res.status(400).json({
          success: false,
          error: `Delete failed: ${error.message}`,
          code: (error as any).statusCode || (error as any).code,
          details: (error as any).error || error.message,
        });
      }

      return res.status(200).json({ success: true, deleted: data });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error during delete.',
        code: err?.code,
        details: err?.details,
      });
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

    const adminClient = getSupabaseAdmin();
    if (adminClient) {
      try {
        const { error } = await adminClient.from('messages').insert([{
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
