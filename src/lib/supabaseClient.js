import { createClient } from '@supabase/supabase-js';

// Uşak Yarış Pisti - Doğrudan Entegre Canlı Supabase Bağlantısı
const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uubgqqktvpnundcbiuvg.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_sDTF42qdPxI5NR3UwJY0Ug_wbfKlgpE';

export const supabaseUrl = SUPABASE_PROJECT_URL.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const supabaseAnonKey = SUPABASE_ANON_KEY.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
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
  if (!supabase) {
    return { ok: false, message: 'Supabase istemcisi başlatılamadı' };
  }

  try {
    const { data, error } = await supabase.from('garages').select('id').limit(1);
    if (error) throw error;
    return { ok: true, data };
  } catch (err) {
    console.warn('[Supabase Connection Warning]', err.message);
    return { ok: false, message: err.message };
  }
}
