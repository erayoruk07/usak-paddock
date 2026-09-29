import { createClient } from '@supabase/supabase-js';

// Uşak Yarış Pisti - Canlı Supabase Bağlantısı
const HARDCODED_URL = 'https://uubgqqktvpnundcbiuvg.supabase.co';
const HARDCODED_KEY = 'sb_publishable_sDTF42qdPxI5NR3UwJY0Ug_wbfKlgpE';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Eğer ortam değişkeni https:// ile başlamıyorsa (örn. yanlışlıkla key yapıştırılmışsa), kesin çalışan URL'i kullan
export const supabaseUrl = (rawUrl.startsWith('https://') ? rawUrl : HARDCODED_URL)
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');

// Eğer key secret key ise veya boşsa, front-end için tasarlanmış publishable anon key'i kullan
export const supabaseAnonKey = (rawKey && !rawKey.startsWith('sb_secret') && rawKey.startsWith('sb_publishable_') ? rawKey : HARDCODED_KEY);

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Bağlantı durumunu kontrol etme fonksiyonu
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('garages').select('id').limit(1);
    if (error) throw error;
    return { ok: true, data };
  } catch (err) {
    console.warn('[Supabase Connection Warning]', err.message);
    return { ok: false, message: err.message };
  }
}
