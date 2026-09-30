// Uşak Yarış Pisti - Garaj Kirası ve Aylık Aidat Hesaplama Modülü
// Her motor/pilot için aylık garaj kullanım bedelleri, gecikmeler ve tahsilat takibi.

export const STORAGE_KEY_RENT_SETTINGS = "usak_pist_garage_rent_settings_v2";

export const DEFAULT_RENT_SETTINGS = {
  defaultMonthlyRent: 5000, // Varsayılan 5.000 TL / Ay
  dueDayOfMonth: 1,         // Her ayın 1'i
  bankName: "Ziraat Bankası",
  iban: "TR12 0001 0000 1234 5678 9001",
  accountHolder: "Uşak Yarış Pisti Paddock İşletmesi",
  reminderDays: 5           // Vadeye 5 gün kala sarı uyarı
};

export function loadRentSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RENT_SETTINGS);
    if (saved) return { ...DEFAULT_RENT_SETTINGS, ...JSON.parse(saved) };
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

/**
 * Türkçe Ay İsimleri
 */
export const TURKISH_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

export function getCurrentPeriodName(date = new Date()) {
  const monthName = TURKISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${monthName} ${year}`;
}

/**
 * Bir motosikletin garaj kira durumunu, gecikmesini ve ödeme geçmişini hesaplar
 */
export function getBikeRentInfo(bike, settings = DEFAULT_RENT_SETTINGS) {
  if (!bike) return null;

  const monthlyRent = Number(bike.customMonthlyRent || bike.monthlyRent || settings.defaultMonthlyRent || 5000);
  const garageJoinDate = bike.garageJoinDate || (bike.createdAt ? bike.createdAt.split('T')[0] : '2026-01-01');

  // Geçmişteki tüm kira tahsilatlarını filtrele
  const allHistory = Array.isArray(bike.entryHistory) ? bike.entryHistory : [];
  const rentPayments = allHistory.filter(h => 
    h.type === 'RENT_PAYMENT' || 
    h.type === 'GARAGE_RENT' ||
    (h.note && (h.note.toLowerCase().includes('garaj kirası') || h.note.toLowerCase().includes('kira')))
  );

  // En son yapılan kira ödemesi
  const lastPayment = rentPayments.length > 0 ? rentPayments[0] : null;

  const now = new Date();
  const currentPeriod = getCurrentPeriodName(now);

  // Bu ay (içinde bulunulan ay/yıl) için ödeme yapılmış mı?
  const hasPaidCurrentMonth = rentPayments.some(p => {
    if (p.period && p.period.toLowerCase().includes(currentPeriod.toLowerCase())) return true;
    if (p.date) {
      // Tarih formatı örn: "30.09.2026 12:30" veya ISO
      const isThisMonth = p.date.includes(`.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`);
      if (isThisMonth) return true;
    }
    return false;
  });

  // Vade tarihi: Bu ayın belirlenen günü (örn: 1 Ekim 2026)
  const dueDay = settings.dueDayOfMonth || 1;
  const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);

  let status = 'PENDING'; // 'PAID' | 'PENDING' | 'OVERDUE'
  let overdueDays = 0;
  let daysUntilDue = 0;

  if (hasPaidCurrentMonth || bike.rentStatus === 'PAID') {
    status = 'PAID';
  } else {
    const diffTime = now.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      status = 'OVERDUE';
      overdueDays = diffDays;
    } else {
      status = 'PENDING';
      daysUntilDue = Math.abs(diffDays);
    }
  }

  // Toplam ödenen kira tutarı
  const totalRentPaid = rentPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  return {
    monthlyRent,
    garageJoinDate,
    currentPeriod,
    status, // 'PAID', 'PENDING', 'OVERDUE'
    hasPaidCurrentMonth: status === 'PAID',
    isOverdue: status === 'OVERDUE',
    overdueDays,
    daysUntilDue,
    dueDate,
    lastPayment,
    rentPayments,
    totalRentPaid,
    isCustomRent: !!(bike.customMonthlyRent && bike.customMonthlyRent !== settings.defaultMonthlyRent)
  };
}
