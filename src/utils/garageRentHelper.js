// Uşak Yarış Pisti - Garaj Kirası ve Vade Hesaplama Motoru
// Başlangıç tarihi bazlı kira periyotları, fiyat artışı yürürlük tarihi takibi ve ileri tarihli tahsilat.

export const STORAGE_KEY_RENT_SETTINGS = "usak_pist_garage_rent_settings_v3";

export const DEFAULT_RENT_SETTINGS = {
  defaultMonthlyRent: 5000, // Geçerli varsayılan kira (TL)
  priceHistory: [
    { effectiveFrom: '2026-01-01', amount: 5000 }
  ],
  bankName: "Ziraat Bankası",
  iban: "TR12 0001 0000 1234 5678 9001",
  accountHolder: "Uşak Yarış Pisti Paddock İşletmesi",
  reminderDays: 5
};

export function loadRentSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RENT_SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_RENT_SETTINGS,
        ...parsed,
        priceHistory: Array.isArray(parsed.priceHistory) && parsed.priceHistory.length > 0
          ? parsed.priceHistory
          : [{ effectiveFrom: '2026-01-01', amount: parsed.defaultMonthlyRent || 5000 }]
      };
    }
  } catch (e) {
    console.error("Rent settings load error", e);
  }
  return DEFAULT_RENT_SETTINGS;
}

export function saveRentSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY_RENT_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Rent settings save error", e);
  }
}

export const TURKISH_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

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

/**
 * Belirli bir tarihe X ay ekler (Gün taşmalarını güvenli hesaplar)
 */
export function addMonthsToDate(date, months) {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  return d;
}

/**
 * Belirli bir tarihte geçerli olan aylık kira bedelini hesaplar.
 * Yeni bir fiyat artışı yapıldıysa, sadece yürürlük tarihinden (effectiveFrom) sonraki dönemlere uygulanır.
 * Eski dönemler geçmişteki fiyat üzerinden hesaplanır.
 */
export function getPriceForDate(targetDate, settings, bike = null) {
  // Eğer motora özel indirimli/özel fiyat tanımlıysa öncelik ondadır
  if (bike && bike.customMonthlyRent !== undefined && bike.customMonthlyRent !== null && bike.customMonthlyRent !== '') {
    return Number(bike.customMonthlyRent);
  }

  const history = settings?.priceHistory || DEFAULT_RENT_SETTINGS.priceHistory;
  const d = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const targetIso = d.toISOString().split('T')[0];

  // Yürürlük tarihine göre azalan sırada sırala
  const sorted = [...history].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

  for (const entry of sorted) {
    if (entry.effectiveFrom <= targetIso) {
      return Number(entry.amount);
    }
  }

  return Number(settings?.defaultMonthlyRent || 5000);
}

/**
 * Motosikletin tüm kira durumunu, başlangıç tarihini, vadesini ve borçlarını hesaplar
 */
export function getBikeRentInfo(bike, settings = DEFAULT_RENT_SETTINGS, referenceDate = new Date()) {
  if (!bike) return null;

  // Garaja ilk kayıt tarihi (varsayılan: 2026-01-15 veya oluşturulma tarihi)
  const joinDateStr = bike.garageJoinDate || (bike.createdAt ? bike.createdAt.split('T')[0] : '2026-01-15');
  const joinDate = new Date(joinDateStr);

  // Güncel aktif kira bedeli
  const currentMonthlyRent = getPriceForDate(referenceDate, settings, bike);

  // Yapılan tüm geçmiş kira ödemeleri
  const allHistory = Array.isArray(bike.entryHistory) ? bike.entryHistory : [];
  const rentPayments = allHistory.filter(h => 
    h.type === 'RENT_PAYMENT' || 
    h.type === 'GARAGE_RENT' ||
    (h.note && (h.note.toLowerCase().includes('garaj kirası') || h.note.toLowerCase().includes('kira')))
  );

  // Toplam ödenen kira
  const totalRentPaid = rentPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  // Kaç dönem ödendi?
  // Her ödeme kaydının 'periodCount' değeri varsa onu alır, yoksa 1 sayar
  const paidPeriodsCount = rentPayments.reduce((acc, p) => acc + (Number(p.periodCount) || 1), 0);

  // Vade bitiş tarihi: Başlangıç tarihinden itibaren ödenen dönem sayısı kadar ay eklenir
  const validUntilDate = addMonthsToDate(joinDate, paidPeriodsCount);
  const validUntilStr = formatDateTR(validUntilDate);

  // Durum hesaplaması
  const now = referenceDate;
  const isOverdue = validUntilDate < now;
  const overdueDays = isOverdue 
    ? Math.max(1, Math.floor((now.getTime() - validUntilDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const daysUntilDue = !isOverdue 
    ? Math.max(0, Math.floor((validUntilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const status = isOverdue ? 'OVERDUE' : (daysUntilDue <= (settings.reminderDays || 5) ? 'PENDING' : 'PAID');

  // Bir sonraki ödenmesi gereken dönemin fiyatı ve tarih aralığı
  const nextPeriodStart = validUntilDate;
  const nextPeriodEnd = addMonthsToDate(nextPeriodStart, 1);
  const nextPeriodPrice = getPriceForDate(nextPeriodStart, settings, bike);
  const nextPeriodName = `${formatDateTR(nextPeriodStart)} - ${formatDateTR(nextPeriodEnd)}`;

  // Bekleyen / Gecikmedeki tüm dönemlerin listesi (her biri kendi dönemindeki fiyattan hesaplanır)
  const unpaidPeriods = [];
  let tempStart = new Date(validUntilDate);
  while (tempStart < now) {
    const tempEnd = addMonthsToDate(tempStart, 1);
    const periodPrice = getPriceForDate(tempStart, settings, bike);
    const diffDays = Math.floor((now.getTime() - tempEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    unpaidPeriods.push({
      startDate: new Date(tempStart),
      endDate: new Date(tempEnd),
      startStr: formatDateTR(tempStart),
      endStr: formatDateTR(tempEnd),
      periodName: `${formatMonthYearTR(tempStart)} Kirası`,
      label: `${formatDateTR(tempStart)} - ${formatDateTR(tempEnd)}`,
      amount: periodPrice,
      isOverdue: true,
      overdueDays: Math.max(1, diffDays)
    });

    tempStart = tempEnd;
  }

  // Toplam gecikmiş borç tutarı (fiyat artışı eski dönemlere yansıtılmadan hesaplanır)
  const totalOverdueDebt = unpaidPeriods.reduce((acc, p) => acc + p.amount, 0);

  return {
    garageJoinDate: joinDateStr,
    joinDateFormatted: formatDateTR(joinDate),
    monthlyRent: currentMonthlyRent,
    paidPeriodsCount,
    validUntilDate,
    validUntilStr,
    status, // 'PAID', 'PENDING', 'OVERDUE'
    isOverdue,
    overdueDays,
    daysUntilDue,
    nextPeriodStart,
    nextPeriodEnd,
    nextPeriodPrice,
    nextPeriodName,
    currentPeriod: formatMonthYearTR(validUntilDate),
    unpaidPeriods,
    totalOverdueDebt: totalOverdueDebt > 0 ? totalOverdueDebt : nextPeriodPrice,
    totalRentPaid,
    rentPayments,
    isCustomRent: !!(bike.customMonthlyRent !== undefined && bike.customMonthlyRent !== null && bike.customMonthlyRent !== '')
  };
}
