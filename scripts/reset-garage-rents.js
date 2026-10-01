// Uşak Yarış Pisti - Garaj Kirası Test Kayıtlarını Sıfırlama Scripti
// Çalıştırma: node scripts/reset-garage-rents.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uubgqqktvpnundcbiuvg.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_sDTF42qdPxI5NR3UwJY0Ug_wbfKlgpE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function resetGarageRents() {
  console.log('🔄 Uşak Yarış Pisti: Garaj kira test verileri sıfırlanıyor...');
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);

  try {
    // 1. Tüm motorları çek
    const { data: bikes, error } = await supabase.from('bikes').select('*');
    if (error) {
      console.error('❌ Motorlar çekilemedi:', error.message);
      process.exit(1);
    }

    console.log(`🏍️ Toplam ${bikes.length} motor bulundu. Kira geçmişleri taranıyor...`);
    let cleanedBikesCount = 0;
    let deletedPaymentsCount = 0;

    for (const bike of bikes) {
      const history = Array.isArray(bike.entry_history) ? bike.entry_history : [];
      const initialLen = history.length;

      // RENT_PAYMENT ve GARAGE_RENT tiplerini veya kira notlarını filtrele
      const cleaned = history.filter(h => {
        const type = h?.type || '';
        const note = (h?.note || '').toLowerCase();
        if (type === 'RENT_PAYMENT' || type === 'GARAGE_RENT') return false;
        if (note.includes('garaj kirası') || note.includes('kira tahsilat') || note.includes('kira ödendi')) return false;
        return true;
      });

      const diff = initialLen - cleaned.length;
      if (diff > 0) {
        deletedPaymentsCount += diff;
        cleanedBikesCount++;

        const { error: updateErr } = await supabase
          .from('bikes')
          .update({ entry_history: cleaned })
          .eq('id', bike.id);

        if (updateErr) {
          console.error(`⚠️ #${bike.race_number} ${bike.brand} güncellenirken hata:`, updateErr.message);
        } else {
          console.log(`✅ #${bike.race_number} (${bike.owner_name}): ${diff} adet kira tahsilat kaydı temizlendi.`);
        }
      }
    }

    // 2. entry_logs tablosundaki kira loglarını da temizle
    try {
      const { error: logErr } = await supabase
        .from('entry_logs')
        .delete()
        .or('action_type.eq.RENT_PAYMENT,action_type.eq.GARAGE_RENT,note.ilike.%kira%');

      if (!logErr) {
        console.log('✅ entry_logs tablosundaki kira işlem logları da temizlendi.');
      }
    } catch (e) {
      console.warn('Log temizleme uyarısı:', e.message);
    }

    console.log('\n======================================================');
    console.log(`🎉 BAŞARILI: Toplam ${cleanedBikesCount} motordan ${deletedPaymentsCount} adet test kira tahsilatı silindi.`);
    console.log('ℹ️ Motosiklet bilgileri, şasiler ve pist giriş hakları aynen korundu.');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Beklenmeyen hata oluştu:', err);
    process.exit(1);
  }
}

resetGarageRents();
