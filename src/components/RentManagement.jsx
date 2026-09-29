import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  Play, 
  Plus, 
  Heart,
  Search,
  X,
  User,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PaymentSummaryModal from './PaymentSummaryModal';
import { openWhatsAppMessage, getZeroEntriesWhatsAppMessage } from '../utils/whatsappHelper';

export default function RentManagement({ 
  bikes, 
  currentUser, 
  onUpdateBike, 
  onSelectBike,
  onOpenTrackEntry,
  onOpenAddEntries
}) {
  const isViewer = currentUser?.role === 'VIEWER';
  
  // Filtre: 'ALL' (Tümü - Varsayılan), 'EXPIRED' (Hakkı Bitenler), 'ACTIVE' (Hakkı Olanlar)
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBikeForPayment, setSelectedBikeForPayment] = useState(null);

  const expiredBikes = bikes.filter(b => (b.remainingEntries ?? 0) <= 0);
  const activeBikes = bikes.filter(b => (b.remainingEntries ?? 0) > 0);

  // WhatsApp'tan Hak Bitti Uyarısı Gönder (Güvenli & Türkiye Formatı Destekli)
  const sendWhatsAppReminder = (bike) => {
    const text = getZeroEntriesWhatsAppMessage(bike);
    openWhatsAppMessage(bike.owner?.phone, text);
  };

  // Piste Giriş Yap (-1 Hak Düş) Fallback
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
    }, {
      actionType: 'TRACK_ENTRY',
      note: `Piste giriş yapıldı (-1 Hak). Kalan Giriş: ${remaining - 1}`
    });

    alert(`🏎️ #${bike.raceNumber} (${bike.owner?.fullName}) için 1 Hak düşüldü. Kalan Giriş: ${remaining - 1}`);
  };

  // Yeni Paket / Hak Yükle (+5 Giriş Hakkı) Fallback
  const handleAddEntries = (bike, e) => {
    e.stopPropagation();
    const count = prompt(`${bike.owner?.fullName} için kaç giriş hakkı tanımlansın?`, '5');
    if (!count || isNaN(count)) return;

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });

    const added = parseInt(count, 10);
    const updated = {
      ...bike,
      remainingEntries: (bike.remainingEntries ?? 0) + added,
      totalEntriesGranted: (bike.totalEntriesGranted ?? 0) + added
    };

    onUpdateBike(updated, {
      actionType: 'ENTRIES_GRANTED',
      note: `${added} seanslık yeni hak paketi tanımlandı. Kalan Giriş: ${updated.remainingEntries}`
    });
  };

  // Filtreleme mantığı: Hem durum filtresi hem de isim/metin araması
  let baseBikes = bikes;
  if (filter === 'EXPIRED') baseBikes = expiredBikes;
  else if (filter === 'ACTIVE') baseBikes = activeBikes;

  const displayedBikes = baseBikes.filter(bike => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (bike.owner?.fullName && bike.owner.fullName.toLowerCase().includes(q)) ||
      (bike.raceNumber && bike.raceNumber.toLowerCase().includes(q)) ||
      (bike.garageNo && bike.garageNo.toLowerCase().includes(q)) ||
      (bike.brand && bike.brand.toLowerCase().includes(q)) ||
      (bike.model && bike.model.toLowerCase().includes(q)) ||
      (bike.chassisNumber && bike.chassisNumber.toLowerCase().includes(q)) ||
      (bike.owner?.phone && bike.owner.phone.includes(q)) ||
      (bike.owner?.bloodType && bike.owner.bloodType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* 2 BÜYÜK VE NET ÖZET KUTUSU - Sadece PC ve Tablette Göster, Mobilde Gizle */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-4">
        
        {/* Kırmızı: Giriş Hakkı Bitenler */}
        <div 
          onClick={() => setFilter('EXPIRED')}
          className={`cursor-pointer p-6 rounded-3xl border-2 transition shadow-xl ${
            filter === 'EXPIRED'
              ? 'bg-red-950/70 border-red-500 shadow-red-950/50 scale-[1.01]'
              : 'bg-[#151922] border-gray-800 hover:border-gray-700'
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
            Filtrelemek için tıklayın (Yeni paket bekleniyor)
          </div>
        </div>

        {/* Yeşil: Giriş Hakkı Olanlar */}
        <div 
          onClick={() => setFilter('ACTIVE')}
          className={`cursor-pointer p-6 rounded-3xl border-2 transition shadow-xl ${
            filter === 'ACTIVE'
              ? 'bg-emerald-950/70 border-emerald-500 shadow-emerald-950/50 scale-[1.01]'
              : 'bg-[#151922] border-gray-800 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 font-black text-sm uppercase mb-1">
            <span className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-1.5" />
              Giriş Hakkı Olan Motorlar (Aktif)
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
              {activeBikes.length} Motor
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-2">
            {activeBikes.length} Aktif Sürücü
          </div>
          <div className="text-xs text-emerald-300 font-semibold mt-1">
            Filtrelemek için tıklayın (Piste giriş hakkı var)
          </div>
        </div>

      </div>

      {/* ARAMA VE FİLTRE ÇUBUĞU */}
      <div className="p-4 rounded-3xl bg-[#141822] border-2 border-gray-700 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* İsim & Metin Arama Kutusu */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pilot adı (örn: Murat, Tolga), yarış no (#46), garaj adı, telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border-2 border-gray-700 rounded-2xl pl-11 pr-10 py-2.5 text-sm text-white placeholder-gray-500 font-bold focus:outline-none focus:border-red-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                title="Aramayı Temizle"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 3 Durum Filtre Butonu */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setFilter('EXPIRED')}
              className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1 ${
                filter === 'EXPIRED'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-800 text-red-400 hover:bg-gray-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              <span>Hakkı Bitenler ({expiredBikes.length})</span>
            </button>

            <button
              onClick={() => setFilter('ACTIVE')}
              className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1 ${
                filter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-800 text-emerald-400 hover:bg-gray-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Hakkı Olanlar ({activeBikes.length})</span>
            </button>

            <button
              onClick={() => setFilter('ALL')}
              className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1 ${
                filter === 'ALL'
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>Tümü ({bikes.length})</span>
            </button>
          </div>

        </div>

        {/* Sonuç Özeti Bilgisi */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-1 pt-1 border-t border-gray-800/80">
          <span>
            {filter === 'EXPIRED' ? '⚠️ Giriş hakkı bitenler listeleniyor' : filter === 'ACTIVE' ? '✅ Giriş hakkı olan aktif motorlar listeleniyor' : '📋 Tüm kayıtlar listeleniyor'}
            {searchTerm && ` • "${searchTerm}" araması için ${displayedBikes.length} sonuç bulundu`}
          </span>
          <span className="font-bold text-gray-300">Toplam: {displayedBikes.length} Sürücü</span>
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
              onClick={() => setSelectedBikeForPayment(bike)}
              className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-lg cursor-pointer group hover:border-cyan-500/80 hover:shadow-cyan-950/40 ${
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
                    <span className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition">
                      {bike.owner?.fullName}
                    </span>
                    {/* Kan Grubu Rozeti */}
                    <span className="px-2 py-0.5 rounded-lg bg-red-950 border border-red-700 text-red-400 font-black text-xs flex items-center">
                      <Heart className="w-3 h-3 mr-1 fill-red-500 text-red-500" />
                      {bike.owner?.bloodType || "Kan Grubu Yok"}
                    </span>
                    <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800/80">
                      <Receipt className="w-3 h-3 mr-1" />
                      Ödeme Özeti
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
                {!isViewer ? (
                  <>
                    {/* Piste Giriş Yap Butonu -> TrackEntryModal */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenTrackEntry) onOpenTrackEntry(bike);
                        else handleUseEntry(bike, e);
                      }}
                      disabled={isExpired}
                      className={`px-4 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow transition ${
                        isExpired
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white active:scale-95 shadow-md shadow-red-600/30'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Piste Gir</span>
                    </button>

                    {/* Hak Yükle Butonu -> AddEntriesModal */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenAddEntries) onOpenAddEntries(bike);
                        else handleAddEntries(bike, e);
                      }}
                      className="px-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-1 shadow"
                      title="Yeni Hak / Ödeme Yükle"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Hak Yükle</span>
                    </button>
                  </>
                ) : (
                  <div className="px-3.5 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-400 flex items-center space-x-1.5">
                    <span>👁️</span>
                    <span>Sadece Görüntüleme</span>
                  </div>
                )}

                {/* WhatsApp */}
                {isExpired && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sendWhatsAppReminder(bike);
                    }}
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

      {/* ÖDEME VE GİRİŞ HAKLARI DETAY MODALI */}
      {selectedBikeForPayment && (
        <PaymentSummaryModal
          bike={selectedBikeForPayment}
          currentUser={currentUser}
          onClose={() => setSelectedBikeForPayment(null)}
          onOpenAddEntries={(b) => {
            setSelectedBikeForPayment(null);
            if (onOpenAddEntries) onOpenAddEntries(b);
          }}
          onOpenTrackEntry={(b) => {
            setSelectedBikeForPayment(null);
            if (onOpenTrackEntry) onOpenTrackEntry(b);
          }}
        />
      )}

    </div>
  );
}
