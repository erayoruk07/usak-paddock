import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  Play,
  Plus,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RentManagement({ bikes, onUpdateBike, onSelectBike }) {
  const [filter, setFilter] = useState('EXPIRED'); // 'EXPIRED' (Hakkı Bitenler) veya 'ALL'

  const expiredBikes = bikes.filter(b => (b.remainingEntries ?? 0) <= 0);
  const activeBikes = bikes.filter(b => (b.remainingEntries ?? 0) > 0);

  // WhatsApp'tan Hak Bitti Uyarısı Gönder
  const sendWhatsAppReminder = (bike) => {
    const phone = bike.owner?.phone?.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Sayın ${bike.owner?.fullName}, Uşak Yarış Pisti ${bike.garageNo} garajındaki #${bike.raceNumber} yarış numaralı ${bike.brand} ${bike.model} motorunuzun pist giriş hakkı tükenmiştir (0 Hak). Yeni 5 seanslık paket yüklemek için pist ofisimizle iletişime geçebilirsiniz. - Uşak Paddock Yönetimi`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // Piste Giriş Yap (-1 Hak Düş)
  const handleUseEntry = (bike, e) => {
    e.stopPropagation();
    const remaining = bike.remainingEntries ?? 0;
    if (remaining <= 0) {
      alert(`Sayın ${bike.owner?.fullName} için pist giriş hakkı kalmamıştır!`);
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const newHistory = [
      { date: dateStr, note: "Piste giriş yapıldı" },
      ...(bike.entryHistory || [])
    ];

    onUpdateBike({
      ...bike,
      remainingEntries: remaining - 1,
      entryHistory: newHistory
    });

    alert(`🏎️ #${bike.raceNumber} (${bike.owner?.fullName}) için 1 Hak düşüldü. Kalan Giriş: ${remaining - 1}`);
  };

  // Yeni Paket / Hak Yükle (+5 Giriş Hakkı)
  const handleAddEntries = (bike, e) => {
    e.stopPropagation();
    const count = prompt(`${bike.owner?.fullName} için kaç giriş hakkı tanımlansın?`, '5');
    if (!count || isNaN(count)) return;

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });

    const added = parseInt(count, 10);
    onUpdateBike({
      ...bike,
      remainingEntries: (bike.remainingEntries ?? 0) + added,
      totalEntriesGranted: (bike.totalEntriesGranted ?? 0) + added
    });
  };

  const displayedBikes = filter === 'EXPIRED' ? expiredBikes : bikes;

  return (
    <div className="space-y-6">
      
      {/* 2 BÜYÜK VE NET ÖZET KUTUSU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Kırmızı: Giriş Hakkı Bitenler */}
        <div 
          onClick={() => setFilter('EXPIRED')}
          className={`cursor-pointer p-6 rounded-3xl border-2 transition shadow-xl ${
            filter === 'EXPIRED'
              ? 'bg-red-950/60 border-red-500 shadow-red-950/50'
              : 'bg-[#151922] border-gray-800'
          }`}
        >
          <div className="flex items-center justify-between text-red-400 font-black text-sm uppercase mb-1">
            <span className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-1.5 animate-pulse" />
              Giriş Hakkı Biten Motorlar (0 Hak)
            </span>
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black">
              {expiredBikes.length} Motor
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-red-400 mt-2">
            {expiredBikes.length} Sürücü
          </div>
          <div className="text-xs text-red-300 font-semibold mt-1">
            Yeni paket yüklenmesi gerekiyor
          </div>
        </div>

        {/* Yeşil: Giriş Hakkı Olanlar */}
        <div 
          onClick={() => setFilter('ALL')}
          className={`cursor-pointer p-6 rounded-3xl border-2 transition shadow-xl ${
            filter === 'ALL'
              ? 'bg-emerald-950/60 border-emerald-500 shadow-emerald-950/50'
              : 'bg-[#151922] border-gray-800'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 font-black text-sm uppercase mb-1">
            <span className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-1.5" />
              Giriş Hakkı Olan Motorlar
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
              {activeBikes.length} Motor
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-2">
            {activeBikes.length} Aktif Sürücü
          </div>
          <div className="text-xs text-emerald-300 font-semibold mt-1">
            Piste giriş yapabilir durumda
          </div>
        </div>

      </div>

      {/* LİSTE BAŞLIĞI VE FİLTRE BUTONLARI */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-black text-white uppercase">
          {filter === 'EXPIRED' ? '⚠️ Giriş Hakkı Biten Sürücüler' : '📋 Tüm Paddock Motorları'} ({displayedBikes.length})
        </h2>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('EXPIRED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              filter === 'EXPIRED' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Hakkı Bitenler
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              filter === 'ALL' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            Hepsi
          </button>
        </div>
      </div>

      {/* MOTOR VE GİRİŞ HAKKI LİSTESİ */}
      <div className="space-y-3">
        {displayedBikes.map((bike) => {
          const remaining = bike.remainingEntries ?? 0;
          const isExpired = remaining <= 0;

          return (
            <div 
              key={bike.id}
              className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-lg ${
                isExpired 
                  ? 'bg-red-950/20 border-red-600/70' 
                  : 'bg-[#151922] border-gray-800'
              }`}
            >
              {/* Sol: Motor & Pilot Bilgisi */}
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-red-600 text-white font-black text-xl italic flex items-center justify-center shrink-0 shadow">
                  #{bike.raceNumber}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base sm:text-lg font-black text-white">
                      {bike.owner?.fullName}
                    </span>
                    {/* Kan Grubu Rozeti */}
                    <span className="px-2 py-0.5 rounded-lg bg-red-950 border border-red-700 text-red-400 font-black text-xs flex items-center">
                      <Heart className="w-3 h-3 mr-1 fill-red-500 text-red-500" />
                      {bike.owner?.bloodType || "Kan Grubu Yok"}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-400 font-semibold mt-0.5">
                    {bike.garageNo} • {bike.brand} {bike.model}
                  </div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {bike.owner?.phone}
                  </div>
                </div>
              </div>

              {/* Orta: Kalan Giriş Hakkı */}
              <div className="sm:text-right">
                <div className="text-xs text-gray-400 font-bold uppercase">Kalan Giriş Hakkı</div>
                <div className={`text-2xl sm:text-3xl font-black ${isExpired ? 'text-red-500' : 'text-emerald-400'}`}>
                  {remaining} Giriş
                </div>
                <span className="text-xs text-gray-400">
                  Toplam {bike.totalEntriesGranted || 5} seanslık paket
                </span>
              </div>

              {/* Sağ: Aksiyon Butonları */}
              <div className="flex items-center space-x-2 shrink-0">
                {/* Piste Giriş Yap (-1 Düş) */}
                <button
                  onClick={(e) => handleUseEntry(bike, e)}
                  disabled={isExpired}
                  className={`px-4 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow ${
                    isExpired
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Piste Gir (-1)</span>
                </button>

                {/* + Hak Yükle */}
                <button
                  onClick={(e) => handleAddEntries(bike, e)}
                  className="px-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-1 shadow"
                  title="5 Seanslık Paket Yükle"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hak Yükle</span>
                </button>

                {/* WhatsApp */}
                {isExpired && (
                  <button
                    onClick={() => sendWhatsAppReminder(bike)}
                    className="p-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-emerald-400 border border-gray-700 transition"
                    title="WhatsApp'tan Hak Bitti Mesajı At"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {displayedBikes.length === 0 && (
          <div className="py-12 text-center text-gray-400 bg-[#151922] rounded-3xl border border-gray-800">
            Kayıt bulunamadı.
          </div>
        )}
      </div>

    </div>
  );
}
