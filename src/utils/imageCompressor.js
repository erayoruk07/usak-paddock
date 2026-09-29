// Uşak Yarış Pisti - İstemci Taraflı Ultra Hızlı Fotoğraf Sıkıştırıcı
// 10-15 MB yüksek çözünürlüklü mobil fotoğrafları anında 60-120 KB boyutuna düşürür.
// Böylece Supabase DB yükleme ve indirme süresi saniyelerden 100 milisaniyeye (anlık) iner.

export async function compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.75) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Geçerli bir görsel dosyası seçilmedi');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // En-Boy oranını koruyarak yeniden boyutlandır
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target.result); // Fallback
          return;
        }

        // Yumuşatma ve kaliteli çizim
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG 0.75 kalitede sıkıştır (8-15 MB -> 60-100 KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => reject(err);
      img.src = readerEvent.target.result;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
