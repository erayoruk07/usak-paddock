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
