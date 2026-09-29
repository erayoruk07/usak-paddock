import { createClient } from '@supabase/supabase-js';

// Ortam değişkenleri veya yerel saklanan bağlantı
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('usak_pist_supabase_url') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('usak_pist_supabase_key') : null;

const supabaseUrl = envUrl || localUrl;
const supabaseAnonKey = envKey || localKey;

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
export async function testSupabaseConnection() {
  if (!supabase) return { ok: false, message: 'Supabase URL veya Anon Key ayarlanmamış' };
  try {
    const { data, error } = await supabase.from('garages').select('id').limit(1);
    if (error) throw error;
    return { ok: true, data };
  } catch (err) {
    console.warn('[Supabase Connection Warning]', err.message);
    return { ok: false, message: err.message };
  }
}
