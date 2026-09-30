// Uşak Yarış Pisti - Garaj Kirası ve Dönem Hesaplama Motoru
// Tarih günleri yerine doğrudan DÖNEM (Ay / Yıl) bazlı kira ve aidat yönetimi.

import { saveRentSettingsToDb } from '../services/dbService';

export const STORAGE_KEY_RENT_SETTINGS = "usak_pist_garage_rent_settings_v3";

export const DEFAULT_RENT_SETTINGS = {
  defaultMonthlyRent: 8000, // Geçerli varsayılan aylık kira (TL)
  priceHistory: [
    { effectiveFrom: '2026-01-01', amount: 8000 }
  ],
  bankName: "Ziraat Bankası",
  iban: "TR12 0001 0000 1234 5678 9001",
  accountHolder: "Uşak Yarış Pisti Paddock İşletmesi",
  reminderDays: 5
};

export const TURKISH_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

/**
 * Ay ve yılı sayısal index'e çevirir (Karşılaştırma ve fark hesabı için)
 */
export function periodToIndex(year, month) {
  return Number(year) * 12 + (Number(month) - 1);
}

/**
 * Sayısal index'i { year, month } objesine çevirir
 */
export function indexToPeriod(index) {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return { year, month };
}

/**
 * Dönem ismini Türkçe formatlar (Örn: "Ekim 2026")
 */
export function formatPeriod(year, month) {
  const mIndex = Number(month) - 1;
  const mName = TURKISH_MONTHS[mIndex] || '';
  return `${mName} ${year}`;
}

/**
 * Herhangi bir string ('2026-10-05', '2026-10') veya Date objesini { year, month } dönemine çevirir
 */
export function parsePeriod(val) {
  if (!val) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  if (val instanceof Date) {
    return { year: val.getFullYear(), month: val.getMonth() + 1 };
  }
  const str = String(val).trim();

  // 1. Türkçe ay ismi kontrolü (örn: "Kasım 2026", "Ekim 2026 Kirası")
  for (let i = 0; i < TURKISH_MONTHS.length; i++) {
    const monthName = TURKISH_MONTHS[i];
    if (new RegExp(monthName, 'i').test(str)) {
      const yearMatch = str.match(/\b(20\d\d)\b/);
      if (yearMatch) {
        return { year: parseInt(yearMatch[1], 10), month: i + 1 };
      }
    }
  }

  // 2. YYYY-MM veya YYYY-MM-DD / DD.MM.YYYY formatı
  const parts = str.split(/[-/.]/);
  if (parts.length >= 2) {
    if (parts[0].length === 4) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
        return { year: y, month: m };
      }
    } else if (parts[2] && parts[2].length === 4) {
      const y = parseInt(parts[2], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
        return { year: y, month: m };
      }
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }
  return { year: 2026, month: 1 };
}

export function loadRentSettings() {
  try {
    const keys = [
      STORAGE_KEY_RENT_SETTINGS,
      "usak_pist_garage_rent_settings_v2",
      "usak_pist_garage_rent_settings",
      "usak_pist_garage_rent_settings_v1"
    ];

    for (const key of keys) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.defaultMonthlyRent || parsed.priceHistory || parsed.bankName)) {
            return {
              ...DEFAULT_RENT_SETTINGS,
              ...parsed,
              priceHistory: Array.isArray(parsed.priceHistory) && parsed.priceHistory.length > 0
                ? parsed.priceHistory
                : [{ effectiveFrom: '2026-01-01', amount: parsed.defaultMonthlyRent || 8000 }]
            };
          }
        } catch {}
      }
    }
  } catch (e) {
    console.error("Rent settings load error", e);
  }
  return DEFAULT_RENT_SETTINGS;
}

export function saveRentSettings(settings, performedBy = 'Pist Yöneticisi') {
  try {
    localStorage.setItem(STORAGE_KEY_RENT_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Rent settings save error", e);
  }

  // Canlı Supabase Veritabanına da eş zamanlı kaydet
  try {
    saveRentSettingsToDb(settings, performedBy);
  } catch (err) {
    console.warn("DB rent settings sync warning", err);
  }
}

export function formatDateTR(d) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatMonthYearTR(d) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  return `${TURKISH_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function addMonthsToDate(date, months) {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  return d;
}

/**
 * Belirli bir dönemde (Ay ve Yıl) geçerli olan kira bedelini hesaplar.
 * Yeni bir fiyat artışı olduysa, yalnızca yürürlük tarihinden sonraki dönemlere uygulanır.
 */
export function getPriceForPeriod(year, month, settings, bike = null) {
  if (bike && bike.customMonthlyRent !== undefined && bike.customMonthlyRent !== null && bike.customMonthlyRent !== '') {
    return Number(bike.customMonthlyRent);
  }

  const history = settings?.priceHistory || DEFAULT_RENT_SETTINGS.priceHistory;
  const periodIso = `${year}-${String(month).padStart(2, '0')}-01`;

  // Yürürlük tarihine göre azalan sırala
  const sorted = [...history].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

  for (const entry of sorted) {
    if (entry.effectiveFrom <= periodIso) {
      return Number(entry.amount);
    }
  }

  return Number(settings?.defaultMonthlyRent || 8000);
}

// Eski fonksiyon uyumluluğu
export function getPriceForDate(targetDate, settings, bike = null) {
  const p = parsePeriod(targetDate);
  return getPriceForPeriod(p.year, p.month, settings, bike);
}

/**
 * Motosikletin DÖNEM BAZLI kira durumunu, vadesini ve ödenmemiş aylarını hesaplar.
 * Gün farkı aranmaz; her şey Ay ve Yıl dönemleri üzerinden işler.
 */
export function getBikeRentInfo(bike, settings = DEFAULT_RENT_SETTINGS, referenceDate = new Date()) {
  if (!bike) return null;

  // 1. Cari Dönem (Referans alınan ay ve yıl, örn: Eylül 2026)
  const currentPeriod = {
    month: referenceDate.getMonth() + 1,
    year: referenceDate.getFullYear()
  };
  const currentIndex = periodToIndex(currentPeriod.year, currentPeriod.month);

  // 2. Garaj Başlangıç Dönemi (Kira hangi ay/yıldan saymaya başlayacak?)
  const startPeriod = parsePeriod(bike.garageStartPeriod || bike.garageJoinDate || bike.createdAt || '2026-01-15');
  const startIndex = periodToIndex(startPeriod.year, startPeriod.month);
  const startPeriodLabel = formatPeriod(startPeriod.year, startPeriod.month);

  // 3. Güncel aktif kira bedeli
  const currentMonthlyRent = getPriceForPeriod(currentPeriod.year, currentPeriod.month, settings, bike);

  // 4. Yapılan tüm geçmiş kira tahsilatları
  const allHistory = Array.isArray(bike.entryHistory) ? bike.entryHistory : [];
  const rentPayments = allHistory.filter(h => 
    h.type === 'RENT_PAYMENT' || 
    h.type === 'GARAGE_RENT' ||
    (h.note && (h.note.toLowerCase().includes('garaj kirası') || h.note.toLowerCase().includes('kira')))
  );

  const totalRentPaid = rentPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  // 5. ÖDENMİŞ DÖNEMLERİN KODLARINI SET OLARAK TOPLA
  // Her ödeme kaydı bağımsız bir dönemi temsil eder (Örn: Kasım 2026 ödendiyse yalnızca '2026-11' ödenir)
  const paidPeriodCodesSet = new Set();

  rentPayments.forEach(p => {
    // A) Doğrudan periodCode (örn: '2026-11')
    if (p.periodCode && /^\d{4}-\d{2}$/.test(p.periodCode)) {
      paidPeriodCodesSet.add(p.periodCode);
      return;
    }
    // B) startPeriod (örn: '2026-11')
    if (p.startPeriod && /^\d{4}-\d{2}$/.test(p.startPeriod)) {
      paidPeriodCodesSet.add(p.startPeriod);
      return;
    }
    // C) Metin formatı (örn: 'Kasım 2026', 'Kasım 2026 Kirası', '2026-11-01')
    const candidateStr = p.period || p.coverageStart || p.coverageEnd || p.startPeriod;
    if (candidateStr) {
      const parsed = parsePeriod(candidateStr);
      if (parsed && parsed.year && parsed.month) {
        paidPeriodCodesSet.add(`${parsed.year}-${String(parsed.month).padStart(2, '0')}`);
        return;
      }
    }
  });

  // Eski dönem kaydı olmayan loglar için geri dönük uyumluluk
  let unmappedCount = rentPayments.filter(p => !p.periodCode && !p.period && !p.coverageStart && !p.startPeriod)
    .reduce((acc, p) => acc + (Number(p.periodCount) || 1), 0);
  if (unmappedCount > 0) {
    let curr = startIndex;
    while (unmappedCount > 0) {
      const p = indexToPeriod(curr);
      const code = `${p.year}-${String(p.month).padStart(2, '0')}`;
      if (!paidPeriodCodesSet.has(code)) {
        paidPeriodCodesSet.add(code);
        unmappedCount--;
      }
      curr++;
    }
  }

  const paidPeriodCodes = Array.from(paidPeriodCodesSet).sort();
  const paidPeriodsCount = paidPeriodCodes.length;

  // En son ödenen dönemi bul
  let latestPaidIndex = -1;
  paidPeriodCodesSet.forEach(code => {
    const p = parsePeriod(code);
    const idx = periodToIndex(p.year, p.month);
    if (idx > latestPaidIndex) {
      latestPaidIndex = idx;
    }
  });

  let paidUntilPeriodLabel = "Henüz Ödeme Yok";
  if (latestPaidIndex !== -1) {
    const lp = indexToPeriod(latestPaidIndex);
    paidUntilPeriodLabel = formatPeriod(lp.year, lp.month);
  }

  // 6. ÖDENMEMİŞ DÖNEMLERİ LİSTELE (startIndex'ten currentIndex'e kadar)
  const unpaidPeriods = [];
  if (startIndex <= currentIndex) {
    for (let idx = startIndex; idx <= currentIndex; idx++) {
      const p = indexToPeriod(idx);
      const code = `${p.year}-${String(p.month).padStart(2, '0')}`;
      
      if (!paidPeriodCodesSet.has(code)) {
        const price = getPriceForPeriod(p.year, p.month, settings, bike);
        const isPastMonth = idx < currentIndex;
        
        unpaidPeriods.push({
          month: p.month,
          year: p.year,
          periodCode: code,
          label: formatPeriod(p.year, p.month),
          periodName: `${formatPeriod(p.year, p.month)} Kirası`,
          amount: price,
          isOverdue: isPastMonth
        });
      }
    }
  }

  // 7. SIRADAKİ ÖDENECEK DÖNEM
  let nextDuePeriod = null;
  if (unpaidPeriods.length > 0) {
    // Vadesi gelmiş/gecikmiş en eski ödenmemiş dönem
    nextDuePeriod = {
      month: unpaidPeriods[0].month,
      year: unpaidPeriods[0].year,
      label: unpaidPeriods[0].label,
      price: unpaidPeriods[0].amount
    };
  } else if (startIndex > currentIndex) {
    // Başlangıç tarihi henüz gelmemiş
    nextDuePeriod = {
      month: startPeriod.month,
      year: startPeriod.year,
      label: startPeriodLabel,
      price: getPriceForPeriod(startPeriod.year, startPeriod.month, settings, bike)
    };
  } else {
    // Tüm dönemler ödenmiş, sıradaki dönem
    const nextIdx = Math.max(latestPaidIndex + 1, currentIndex + 1);
    const np = indexToPeriod(nextIdx);
    nextDuePeriod = {
      month: np.month,
      year: np.year,
      label: formatPeriod(np.year, np.month),
      price: getPriceForPeriod(np.year, np.month, settings, bike)
    };
  }

  // 8. DURUM BELİRLEME
  let status = 'PAID'; // 'PAID', 'PENDING', 'OVERDUE', 'UPCOMING'
  let statusLabel = '';
  let isOverdue = false;
  let isUpcoming = false;
  let isPending = false;
  let isPaid = false;

  // DURUM A: Başlangıç dönemi henüz gelmedi ve geçmişe dönük ödenmemiş ay yok
  if (startIndex > currentIndex && unpaidPeriods.length === 0) {
    status = 'UPCOMING';
    isUpcoming = true;
    statusLabel = `${startPeriodLabel}'da Başlayacak`;
  }
  // DURUM B: Ödenmemiş aylar var
  else if (unpaidPeriods.length > 0) {
    const overdueCount = unpaidPeriods.filter(u => u.isOverdue).length;
    if (overdueCount > 0) {
      status = 'OVERDUE';
      isOverdue = true;
      statusLabel = `${overdueCount} Ay Gecikmede`;
    } else {
      status = 'PENDING';
      isPending = true;
      statusLabel = `Bu Ay Ödenmedi (${formatPeriod(currentPeriod.year, currentPeriod.month)})`;
    }
  }
  // DURUM C: Cari aya kadar tüm ödemeler tamam
  else {
    status = 'PAID';
    isPaid = true;
    if (latestPaidIndex > currentIndex) {
      statusLabel = `${paidUntilPeriodLabel}'ya Kadar Peşin Ödendi`;
    } else {
      statusLabel = `${formatPeriod(currentPeriod.year, currentPeriod.month)} Ödendi (Güncel)`;
    }
  }

  const totalOverdueDebt = unpaidPeriods.reduce((acc, p) => acc + p.amount, 0);

  return {
    startPeriod,
    startPeriodLabel,
    currentPeriod,
    currentPeriodLabel: formatPeriod(currentPeriod.year, currentPeriod.month),
    paidPeriodsCount,
    lastPaidIndex: latestPaidIndex,
    paidPeriodCodes,
    totalRentPaid,
    rentPayments,
    monthlyRent: currentMonthlyRent,
    paidUntilPeriodLabel,
    nextDuePeriod,
    nextPeriodPrice: nextDuePeriod.price,
    status, // 'PAID', 'PENDING', 'OVERDUE', 'UPCOMING'
    statusLabel,
    isOverdue,
    isUpcoming,
    isPending,
    isPaid,
    unpaidPeriods,
    totalOverdueDebt,
    isCustomRent: !!(bike.customMonthlyRent !== undefined && bike.customMonthlyRent !== null && bike.customMonthlyRent !== ''),
    
    // Geriye dönük string uyumluluğu
    validUntilStr: paidUntilPeriodLabel,
    joinDateFormatted: startPeriodLabel,
    garageJoinDate: `${startPeriod.year}-${String(startPeriod.month).padStart(2, '0')}-01`
  };
}
