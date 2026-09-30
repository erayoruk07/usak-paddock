// Uşak Yarış Pisti - Güvenli ve Kesintisiz WhatsApp Yönlendirici
// Türkiye ve uluslararası numara formatlarını (05xx -> 905xx) otomatik düzeltir.
// Popup blocker engellerine takılmadan WhatsApp uygulamasını açar.

export function formatWhatsAppPhone(rawPhone) {
  if (!rawPhone) return '';
  const cleaned = String(rawPhone).replace(/[^0-9]/g, '');

  if (cleaned.startsWith('0') && cleaned.length === 11) {
    // 05321234567 -> 905321234567
    return '90' + cleaned.substring(1);
  }
  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    // 5321234567 -> 905321234567
    return '90' + cleaned;
  }
  if (cleaned.startsWith('90') && cleaned.length >= 12) {
    return cleaned;
  }
  return cleaned;
}

/**
 * 0 Hak / Bakiye Tükendi Bildirimi İçin WhatsApp Şablonu
 * Telefon ekranlarında ferah, paragraflara ayrılmış, emojili ve motorsport kurumsal kimliğine uygun
 */
export function getZeroEntriesWhatsAppMessage(bike) {
  if (!bike) return '';

  const driverName = bike.owner?.fullName?.trim() || 'Değerli Yarışçımız';
  const bikeModel = `${bike.brand || ''} ${bike.model || ''}`.trim() || 'Motosiklet';
  const raceNum = bike.raceNumber ? `#${bike.raceNumber}` : '';
  const garageNo = bike.garageNo || 'Paddock Box';

  return `🏁 *UŞAK YARIŞ PİSTİ* • *PADDOCK BOX*
━━━━━━━━━━━━━━━━━━━━

Sayın *${driverName}*,

Paddock garajımızda bulunan yarış aracınızın piste giriş seans hakkı tükenmiştir:

🏍️ *Motosiklet:* ${bikeModel} ${raceNum ? `(${raceNum})` : ''}
📍 *Paddock Garajı:* ${garageNo}
⏱️ *Kalan Seans Hakkı:* *0 Hak (Bitti)*

────────────────────
Pist çıkışlarınızda herhangi bir bekleme veya aksaklık yaşamamak adına, yeni seans paketi yüklemek için lütfen pist yönetimi ile iletişime geçiniz.

Keyifli ve bol dereceli sürüşler dileriz! 🏎️💨

*Uşak Yarış Pisti & Paddock Yönetimi*`;
}

export function openWhatsAppMessage(rawPhone, text) {
  const phone = formatWhatsAppPhone(rawPhone);
  if (!phone) {
    alert('Sürücüye ait geçerli bir telefon numarası bulunamadı!');
    return;
  }

  const encodedText = encodeURIComponent(text);
  const waUrl = `https://wa.me/${phone}?text=${encodedText}`;

  // Mobilde ve masaüstünde popup blocker'a takılmadan en sorunsuz açılış
  const link = document.createElement('a');
  link.href = waUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Garaj Kirası Hatırlatma & Ödeme Bildirimi İçin WhatsApp Şablonu
 */
export function getGarageRentWhatsAppMessage(bike, rentInfo, settings = {}) {
  if (!bike) return '';

  const driverName = bike.owner?.fullName?.trim() || 'Değerli Yarışçımız';
  const bikeModel = `${bike.brand || ''} ${bike.model || ''}`.trim() || 'Motosiklet';
  const raceNum = bike.raceNumber ? `#${bike.raceNumber}` : '';
  const garageNo = bike.garageNo || 'Paddock Box';
  const amount = (rentInfo?.monthlyRent || 5000).toLocaleString('tr-TR');
  const period = rentInfo?.currentPeriod || 'Aylık Garaj Kirası';
  
  const statusNote = rentInfo?.isOverdue 
    ? `⚠️ *Ödeme Durumu:* *${rentInfo.overdueDays} Gün Gecikmede*`
    : `📅 *Ödeme Durumu:* *Vadesi Geldi / Beklemede*`;

  const iban = settings?.iban || 'TR12 0001 0000 1234 5678 9001';
  const bankName = settings?.bankName || 'Ziraat Bankası';
  const accountHolder = settings?.accountHolder || 'Uşak Yarış Pisti İşletmesi';

  return `🏁 *UŞAK YARIŞ PİSTİ* • *PADDOCK BOX*
🏢 *AYLIK GARAJ KİRASI BİLGİLENDİRMESİ*
━━━━━━━━━━━━━━━━━━━━

Sayın *${driverName}*,

Paddock garajımızda barınan yarış aracınızın aylık garaj kullanım kira ödemesi vadesi gelmiştir:

🏍️ *Motosiklet:* ${bikeModel} ${raceNum ? `(${raceNum})` : ''}
📍 *Bulunduğu Alan:* ${garageNo}
📅 *Dönem:* ${period}
💰 *Aylık Kira Bedeli:* *${amount} ₺*
${statusNote}

────────────────────
🏦 *Banka Hesap Bilgilerimiz:*
• *Banka:* ${bankName}
• *IBAN:* \`${iban}\`
• *Alıcı:* ${accountHolder}
• *Açıklama:* ${raceNum} ${driverName} Garaj Kirası

Ödemenizi gerçekleştirdikten sonra dekontunuzu bu hat üzerinden iletmenizi rica ederiz.

Keyifli ve güvenli sürüşler dileriz! 🏎️💨

*Uşak Yarış Pisti & Paddock Yönetimi*`;
}
