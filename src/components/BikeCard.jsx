import React from 'react';
import { 
  Phone, 
  Wrench, 
  QrCode, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  MessageCircle,
  Heart,
  Play
} from 'lucide-react';

export default function BikeCard({ bike, onSelect, onShowQR, onQuickWhatsApp, onQuickEntry }) {
  const remaining = bike.remainingEntries ?? 0;
  const isExpired = remaining <= 0;

  return (
    <div 
      className={`group relative flex flex-col bg-[#141822] rounded-3xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl ${
        isExpired 
          ? 'border-red-600/70 shadow-lg shadow-red-950/30' 
          : 'border-gray-700/90 hover:border-gray-600 shadow-xl'
      }`}
    >
      {/* Üst Görsel */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-900 cursor-pointer" onClick={() => onSelect(bike)}>
        <img 
          src={bike.photoUrl} 
          alt={`${bike.brand} ${bike.model}`}
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-[#141822]/40 to-transparent"></div>

        {/* Yarış Numarası (#46) ve Paddock Box */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <div className="px-2.5 py-1 bg-red-600 text-white font-black text-xs tracking-wider rounded-lg shadow-lg flex items-center italic">
            <span>#{bike.raceNumber}</span>
          </div>
          <span className="px-2 py-0.5 bg-black/80 text-gray-200 text-[10px] font-bold rounded-md border border-white/10">
            {bike.garageNo}
          </span>
        </div>

        {/* Kalan Giriş Hakkı Rozeti */}
        <div className="absolute top-3 right-3">
          {isExpired ? (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-red-600 text-white shadow-lg animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 mr-0.5" />
              <span>Hak Bitti! (0)</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow">
              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
              <span>{remaining} Giriş Hakkı</span>
            </span>
          )}
        </div>

        {/* Marka & Model Başlığı */}
        <div className="absolute bottom-2 left-4 right-4">
          <h3 className="text-base font-black text-white truncate tracking-tight">
            {bike.brand} {bike.model}
          </h3>
        </div>
      </div>

      {/* Kart İçerik */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Sürücü ve Kan Grubu */}
        <div className="p-2.5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-black text-white text-xs truncate">{bike.owner?.fullName}</span>
            {/* Kan Grubu Rozeti */}
            <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-700 text-red-400 font-black text-[10px] flex items-center shrink-0">
              <Heart className="w-2.5 h-2.5 mr-1 fill-red-500 text-red-500" />
              {bike.owner?.bloodType || "Kan Yok"}
            </span>
          </div>

          <div className="text-[11px] text-emerald-400 font-mono font-bold flex items-center">
            <Phone className="w-2.5 h-2.5 mr-1" />
            {bike.owner?.phone}
          </div>
        </div>

        {/* Takılı Parçalar Özeti */}
        <div className="space-y-1">
          <div className="text-[10px] text-gray-400 font-bold flex items-center">
            <Wrench className="w-3 h-3 mr-1 text-cyan-400" />
            Takılı Parçalar ({bike.equippedParts?.length || 0}):
          </div>
          <div className="flex flex-wrap gap-1">
            {(bike.equippedParts || []).slice(0, 2).map((p, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-semibold">
                {p.name}
              </span>
            ))}
            {(bike.equippedParts?.length || 0) > 2 && (
              <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px]">
                +{(bike.equippedParts?.length || 0) - 2}
              </span>
            )}
          </div>
        </div>

        {/* Alt Aksiyon Butonları */}
        <div className="pt-1 flex items-center space-x-2">
          {/* Karekod */}
          <button
            onClick={() => onShowQR(bike)}
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-gray-700 transition"
            title="Karekod Yazdır"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Hakkı Bitenler İçin WhatsApp */}
          {isExpired && (
            <button
              onClick={() => onQuickWhatsApp(bike)}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow"
              title="Hak bitti mesajı at"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          )}

          {/* İncele & Detay */}
          <button
            onClick={() => onSelectBike(bike)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 text-white font-black text-xs flex items-center justify-center space-x-1 shadow"
          >
            <span>İncele & Parçalar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
