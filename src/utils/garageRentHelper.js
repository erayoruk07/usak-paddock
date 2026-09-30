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
  const parts = str.split(/[-/.]/);
  if (parts.length >= 2) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      return { year: y, month: m };
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
  const paidPeriodsCount = rentPayments.reduce((acc, p) => acc + (Number(p.periodCount) || 1), 0);

  // 5. Ödenen Son Dönem ve Sıradaki Dönem
  const lastPaidIndex = startIndex + paidPeriodsCount - 1;
  const nextDueIndex = paidPeriodsCount > 0 ? (lastPaidIndex + 1) : startIndex;
  const nextDuePeriod = indexToPeriod(nextDueIndex);
  nextDuePeriod.label = formatPeriod(nextDuePeriod.year, nextDuePeriod.month);
  nextDuePeriod.price = getPriceForPeriod(nextDuePeriod.year, nextDuePeriod.month, settings, bike);

  let paidUntilPeriodLabel = "Henüz Ödeme Yok";
  if (paidPeriodsCount > 0) {
    const p = indexToPeriod(lastPaidIndex);
    paidUntilPeriodLabel = formatPeriod(p.year, p.month);
  }

  // 6. DURUM BELİRLEME (PERIOD LOGIC)
  let status = 'PAID'; // 'PAID', 'PENDING', 'OVERDUE', 'UPCOMING'
  let statusLabel = '';
  let isOverdue = false;
  let isUpcoming = false;
  let isPending = false;
  let isPaid = false;
  const unpaidPeriods = [];

  // DURUM A: Başlangıç dönemi henüz gelmedi (Gelecek dönem, örn: Bugün Eylül, başlangıç Ekim)
  if (startIndex > currentIndex) {
    status = 'UPCOMING';
    isUpcoming = true;
    statusLabel = `${startPeriodLabel}'da Başlayacak`;
  } 
  // DURUM B: Cari döneme kadar (veya ileriye doğru) ödemesi tamam
  else if (lastPaidIndex >= currentIndex) {
    status = 'PAID';
    isPaid = true;
    if (lastPaidIndex > currentIndex) {
      statusLabel = `${paidUntilPeriodLabel}'ya Kadar Peşin Ödendi`;
    } else {
      statusLabel = `${paidUntilPeriodLabel} Ödendi (Güncel)`;
    }
  } 
  // DURUM C: Ödenmemiş dönemler var (nextDueIndex <= currentIndex)
  else {
    // nextDueIndex'ten cari döneme (currentIndex) kadar olan tüm dönemleri listele
    for (let idx = nextDueIndex; idx <= currentIndex; idx++) {
      const p = indexToPeriod(idx);
      const price = getPriceForPeriod(p.year, p.month, settings, bike);
      const isPastMonth = idx < currentIndex;
      
      unpaidPeriods.push({
        month: p.month,
        year: p.year,
        periodCode: `${p.year}-${String(p.month).padStart(2, '0')}`,
        label: formatPeriod(p.year, p.month),
        periodName: `${formatPeriod(p.year, p.month)} Kirası`,
        amount: price,
        isOverdue: isPastMonth
      });
    }

    // Eğer cari aydan önceki geçmiş aylar ödenmemişse GECİKMEDEDİR
    if (nextDueIndex < currentIndex) {
      status = 'OVERDUE';
      isOverdue = true;
      const overdueMonths = currentIndex - nextDueIndex;
      statusLabel = `${overdueMonths} Ay Gecikmede`;
    } 
    // Yalnızca cari ayın kirası ödenmemişse BU AY BEKLİYOR
    else {
      status = 'PENDING';
      isPending = true;
      statusLabel = `${formatPeriod(currentPeriod.year, currentPeriod.month)} Kirası Bekliyor`;
    }
  }

  const totalOverdueDebt = (status === 'OVERDUE' || status === 'PENDING')
    ? unpaidPeriods.reduce((acc, p) => acc + p.amount, 0)
    : 0;

  return {
    startPeriod,
    startPeriodLabel,
    currentPeriod,
    currentPeriodLabel: formatPeriod(currentPeriod.year, currentPeriod.month),
    paidPeriodsCount,
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
