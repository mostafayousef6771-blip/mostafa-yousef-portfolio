import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const serviceClient = createClient(url, serviceKey);

async function testWithUserSession() {
  console.log('--- STARTING AUTHENTICATED USER DELETE TEST ---');

  // Get admin user dynamically
  const { data: usersData } = await serviceClient.auth.admin.listUsers();
  const adminUser = usersData?.users?.[0];
  if (!adminUser || !adminUser.email) {
    console.error('No admin user found in Supabase Auth');
    return;
  }

  // Generate magic link / OTP for admin email
  const { data: linkData, error: linkErr } = await serviceClient.auth.admin.generateLink({
    type: 'magiclink',
    email: adminUser.email,
  });

  if (linkErr || !linkData?.properties?.email_otp) {
    console.error('Magic link error:', linkErr);
    return;
  }

  const userClient = createClient(url, anonKey);
  const { data: sessionData, error: otpErr } = await userClient.auth.verifyOtp({
    email: adminUser.email,
    token: linkData.properties.email_otp,
    type: 'magiclink',
  });

  if (otpErr || !sessionData?.user) {
    console.error('Verify OTP error:', otpErr);
    return;
  }

  console.log('--- ADMIN SESSION ACTIVE FOR:', sessionData.user.email, '---');

  // Verify is_admin
  const { data: isAdmin, error: rpcErr } = await userClient.rpc('is_admin');
  console.log('is_admin RPC result:', isAdmin, 'error:', rpcErr);

  const tables = [
    'skills',
    'projects',
    'certificates',
    'experience',
    'education',
    'reviews',
    'social_links',
    'messages',
    'media',
  ];

  for (const table of tables) {
    console.log(`\n=== TESTING TABLE: ${table} ===`);
    const testId = crypto.randomUUID();

    let payload: any = { id: testId };
    if (table === 'skills') {
      payload = { ...payload, name: 'DELETE TEST SKILL', category: 'Testing', level: 90, icon: 'Code', display_order: 99 };
    } else if (table === 'projects') {
      payload = { ...payload, title: 'DELETE TEST PROJECT', slug: 'delete-test-' + Date.now(), summary: 'test', content: 'test', category: 'Web', published: true, display_order: 99 };
    } else if (table === 'certificates') {
      payload = { ...payload, title: 'DELETE TEST CERT', issuer: 'Issuer', issue_date: '2026-01-01', display_order: 99 };
    } else if (table === 'experience') {
      payload = { ...payload, title: 'DELETE TEST EXP', company: 'Company', location: 'Remote', start_date: '2025-01-01', display_order: 99 };
    } else if (table === 'education') {
      payload = { ...payload, degree: 'DELETE TEST EDU', institution: 'University', field_of_study: 'CS', start_date: '2020-01-01', display_order: 99 };
    } else if (table === 'reviews') {
      payload = { ...payload, author_name: 'TEST REVIEWER', author_role: 'CEO', content: 'Great work', rating: 5, is_published: true, display_order: 99 };
    } else if (table === 'social_links') {
      payload = { ...payload, platform: 'TEST SOCIAL', url: 'https://example.com', icon: 'Link', is_enabled: true, display_order: 99 };
    } else if (table === 'messages') {
      payload = { ...payload, sender_name: 'TEST SENDER', sender_email: 'test@example.com', subject: 'Test', message: 'Hello' };
    } else if (table === 'media') {
      payload = { ...payload, name: 'test.jpg', file_path: 'test.jpg', file_url: 'https://example.com/test.jpg', size: 100, file_type: 'image/jpeg', storage_bucket: 'media' };
    }

    // 1. INSERT
    const { data: insData, error: insErr } = await userClient.from(table).insert(payload).select().single();
    if (insErr) {
      console.error(`[${table}] INSERT FAILED:`, insErr.message, insErr.code);
      continue;
    }
    console.log(`[${table}] INSERT SUCCESS id=${insData.id}`);

    // 2. DELETE
    const { data: delData, error: delErr } = await userClient.from(table).delete().eq('id', insData.id).select();
    if (delErr) {
      console.error(`[${table}] DELETE FAILED:`, delErr.message, delErr.code);
    } else {
      console.log(`[${table}] DELETE SUCCESS deleted count=${delData?.length || 0}`);
    }

    // 3. VERIFY ABSENCE
    const { data: checkData, error: checkErr } = await userClient.from(table).select('*').eq('id', insData.id);
    if (checkErr) {
      console.error(`[${table}] VERIFY CHECK ERROR:`, checkErr.message);
    } else {
      console.log(`[${table}] VERIFY POST-DELETE count=${checkData?.length} (0 expected)`);
    }
  }
}

testWithUserSession().catch(console.error);
