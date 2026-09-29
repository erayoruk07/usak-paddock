import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bike, 
  PlusCircle, 
  Phone, 
  QrCode, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRightLeft, 
  ChevronRight, 
  Heart
} from 'lucide-react';

export default function GarageInsideView({ 
  garage, 
  bikes, 
  allGarages,
  currentUser,
  onBack, 
  onSelectBike, 
  onShowQR, 
  onQuickWhatsApp, 
  onAddNewBikeToThisGarage,
  onMoveBike,
  onUpdateBike,
  onOpenTrackEntry,
  onOpenAddEntries
}) {
  const isViewer = currentUser?.role === 'VIEWER';
  const [transferringBike, setTransferringBike] = useState(null);
  const [targetGarageId, setTargetGarageId] = useState('');

  // Garaj içi açıldığında sayfayı en tepeye sıfırla
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [garage?.id]);

  // Bu garajdaki motorlar
  const garageBikes = bikes.filter(b => b.garageId === garage.id);

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!targetGarageId || !transferringBike) return;
    onMoveBike(transferringBike.id, targetGarageId);
    setTransferringBike(null);
  };
  return (
    <div className="space-y-6">
      
      {/* ÜST ÇUBUK: GERİ DÖN VE PADDOCK BOX BAŞLIĞI */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 bg-[#151922] border-2 border-gray-700 rounded-3xl shadow-xl">
        
        {/* Sol: Geri Dön Butonu */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white font-black text-sm sm:text-base border border-gray-600 transition shadow"
        >
          <ArrowLeft className="w-5 h-5 text-red-500" />
          <span>Garajdan Çık</span>
        </button>

        {/* Orta: Paddock Box Numarası */}
        <div className="text-center sm:text-left">
          <div className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center justify-center sm:justify-start space-x-2">
            <span className="text-red-500">PADDOCK BOX {garage.boxNumber}</span>
            <span className="text-gray-400 text-lg">({garageBikes.length} Motor)</span>
          </div>
        </div>

        {/* Sağ: Yeni Motor Ekle - Sadece Yönetici */}
        {!isViewer && (
          <button
            onClick={() => onAddNewBikeToThisGarage(garage)}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-sm sm:text-base shadow-lg transition"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Bu Garaja Motor Ekle</span>
          </button>
        )}

      </div>

      {/* BU GARAJDAKİ MOTORLAR LİSTESİ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {garageBikes.map((bike) => {
          const remaining = bike.remainingEntries ?? 0;
          const isExpired = remaining <= 0;

          return (
            <div 
              key={bike.id}
              className={`bg-[#141822] rounded-3xl border-2 overflow-hidden shadow-xl flex flex-col justify-between ${
                isExpired ? 'border-red-600' : 'border-gray-700'
              }`}
            >
              {/* Motor Fotoğrafı */}
              <div className="relative h-52 w-full bg-gray-900 cursor-pointer" onClick={() => onSelectBike(bike)}>
                <img 
                  src={bike.photoUrl} 
                  alt={bike.model}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                
                {/* Yarış Numarası (#46) */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-lg italic shadow-lg">
                  #{bike.raceNumber}
                </div>

                {/* Kalan Giriş Hakkı Rozeti */}
                <div className="absolute top-3 right-3">
                  {isExpired ? (
                    <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs shadow-lg animate-pulse flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" /> Giriş Hakkı Bitti! (0)
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> {remaining} Giriş Hakkı Var
                    </span>
                  )}
                </div>

                {/* Marka & Model & Şasi No */}
                <div className="absolute bottom-3 left-4 right-4 bg-black/80 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                  <div className="text-base sm:text-lg font-black text-white truncate">
                    {bike.brand} {bike.model}
                  </div>
                  {bike.chassisNumber && (
                    <div className="text-[10px] text-gray-400 font-mono">
                      Şasi: {bike.chassisNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Bilgiler ve Aksiyonlar */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                
                {/* Sahibi ve Kan Grubu Bilgisi */}
                <div 
                  onClick={() => onSelectBike(bike)}
                  className="p-3 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-1 cursor-pointer hover:border-gray-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-bold uppercase">Sürücü / Pilot</span>
                    {/* Kan Grubu Rozeti */}
                    <span className="px-2 py-0.5 rounded-lg bg-red-950 border border-red-700 text-red-400 font-black text-xs flex items-center">
                      <Heart className="w-3 h-3 mr-1 fill-red-500 text-red-500" />
                      {bike.owner?.bloodType || "Kan Grubu Belirtilmedi"}
                    </span>
                  </div>

                  <div className="text-base font-black text-white">{bike.owner?.fullName}</div>
                  <div className="text-sm text-emerald-400 font-bold flex items-center font-mono">
                    <Phone className="w-3.5 h-3.5 mr-1" />
                    {bike.owner?.phone}
                  </div>

                  {bike.owner?.emergencyPhone && (
                    <div className="text-[11px] text-red-300 font-semibold pt-1 border-t border-gray-800/80 flex items-center justify-between">
                      <span>Acil ({bike.owner?.emergencyRelation || 'Yakını'}): {bike.owner?.emergencyName}</span>
                      <span className="font-mono text-red-400">{bike.owner?.emergencyPhone}</span>
                    </div>
                  )}
                </div>

                {/* Alt Butonlar */}
                <div className="pt-1 flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowQR(bike);
                    }}
                    className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-gray-700 transition shrink-0"
                    title="Karekodu Bastır"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>

                  {!isViewer && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTransferringBike(bike);
                      }}
                      className="px-3.5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 transition shrink-0"
                      title="Başka Garaja Taşı"
                    >
                      <ArrowRightLeft className="w-4 h-4 inline mr-1" />
                      Taşı
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBike(bike);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 text-white font-black text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-red-600/20 transition"
                  >
                    <span>Motor Detayı</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          );
        })}

        {garageBikes.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-3xl bg-[#141822] border-2 border-gray-700 p-8 space-y-4">
            <Bike className="w-16 h-16 text-gray-600 mx-auto" />
            <div className="text-xl font-black text-white">Bu Garaj Şu An Boş</div>
            <p className="text-sm text-gray-400">
              {garage.name} için henüz motor atanmadı.
            </p>
            {!isViewer && (
              <button
                onClick={() => onAddNewBikeToThisGarage(garage)}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-base shadow-lg"
              >
                + Bu Garaja Motor Ekle
              </button>
            )}
          </div>
        )}
      </div>

      {/* MOTORU BAŞKA GARAJA TAŞIMA PENCERESİ */}
      {transferringBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#151922] border-2 border-gray-700 rounded-3xl shadow-2xl p-6 space-y-4">
            <h4 className="text-base font-black text-white uppercase">
              Motoru Hangi Paddock Box'a Taşımak İstiyorsunuz?
            </h4>
            <div className="text-sm font-bold text-red-400">
              #{transferringBike.raceNumber} - {transferringBike.brand} {transferringBike.model}
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <select
                value={targetGarageId}
                onChange={(e) => setTargetGarageId(e.target.value)}
                className="w-full bg-black border-2 border-gray-700 rounded-2xl p-3 text-white font-bold text-base"
                required
              >
                <option value="">-- Yeni Garajı Seçin --</option>
                {allGarages.map((g) => (
                  <option key={g.id} value={g.id} disabled={g.id === garage.id}>
                    {g.name} {g.id === garage.id ? '(Şu Anki Garaj)' : ''}
                  </option>
                ))}
              </select>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferringBike(null)}
                  className="px-5 py-3 rounded-xl bg-gray-800 text-white font-bold text-sm"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!targetGarageId}
                  className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black text-sm shadow"
                >
                  Taşı
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
