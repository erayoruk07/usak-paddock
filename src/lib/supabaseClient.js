import { createClient } from '@supabase/supabase-js';

// Varsayılan / Kalıcı Canlı Supabase Bağlantısı (Uşak Yarış Pisti)
const DEFAULT_SUPABASE_URL = 'https://uubgqqktvpnundcbiuvg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_sDTF42qdPxI5NR3UwJY0Ug_wbfKlgpE';

// URL Temizleyici (rest/v1 veya sondaki slash'leri temizler)
export function sanitizeSupabaseUrl(url) {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

// Ortam değişkenleri, yerel depolama veya kalıcı varsayılan bağlantı
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('usak_pist_supabase_url') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('usak_pist_supabase_key') : null;

export const supabaseUrl = sanitizeSupabaseUrl(localUrl || envUrl || DEFAULT_SUPABASE_URL);
export const supabaseAnonKey = (localKey || envKey || DEFAULT_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

// Bağlantı durumunu kontrol etme fonksiyonu
export async function testSupabaseConnection(customUrl = null, customKey = null) {
  const targetUrl = customUrl ? sanitizeSupabaseUrl(customUrl) : supabaseUrl;
  const targetKey = customKey ? customKey.trim() : supabaseAnonKey;

  const client = (customUrl && customKey)
    ? createClient(targetUrl, targetKey)
    : supabase;

  if (!client) {
    return { ok: false, message: 'Supabase URL veya Anon Key ayarlanmamış' };
  }

  try {
    const { data, error } = await client.from('garages').select('id').limit(1);
    if (error) throw error;
    return { ok: true, data };
  } catch (err) {
    console.warn('[Supabase Connection Warning]', err.message);
    return { ok: false, message: err.message };
  }
}

// Kullanıcının UI üzerinden Supabase bağlantısını kaydetmesi
export function configureSupabase(url, key) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('usak_pist_supabase_url', sanitizeSupabaseUrl(url));
      localStorage.setItem('usak_pist_supabase_key', key.trim());
    } else {
      localStorage.removeItem('usak_pist_supabase_url');
      localStorage.removeItem('usak_pist_supabase_key');
    }
    window.location.reload();
  }
}

export function getSupabaseConfig() {
  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
    isConfigured: isSupabaseConfigured
  };
}
