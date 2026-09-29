import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bike, 
  PlusCircle, 
  Phone, 
  MessageCircle, 
  Wrench, 
  QrCode, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRightLeft, 
  ChevronRight, 
  Heart, 
  ShieldAlert, 
  Play, 
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

  // Bu garajdaki motorlar
  const garageBikes = bikes.filter(b => b.garageId === garage.id);

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!targetGarageId || !transferringBike) return;
    onMoveBike(transferringBike.id, targetGarageId);
    setTransferringBike(null);
  };

  // Piste Giriş Yap (-1 Hak Düş)
  const handleUseEntry = (bike, e) => {
    e.stopPropagation();
    if ((bike.remainingEntries ?? 0) <= 0) {
      alert(`Sayın ${bike.owner?.fullName} için pist giriş hakkı kalmamıştır! Lütfen önce paket/ödeme yükleyiniz.`);
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const newHistory = [
      { date: dateStr, note: "Piste giriş yapıldı" },
      ...(bike.entryHistory || [])
    ];

    const updated = {
      ...bike,
      remainingEntries: bike.remainingEntries - 1,
      entryHistory: newHistory
    };

    onUpdateBike(updated, {
      actionType: 'TRACK_ENTRY',
      note: `Piste giriş yapıldı (-1 Hak). Kalan Hak: ${updated.remainingEntries}`
    });
    alert(`🏎️ #${bike.raceNumber} (${bike.owner?.fullName}) için 1 Pist Giriş Hakkı düşüldü. Kalan Hak: ${updated.remainingEntries}`);
  };

  // Yeni 5 Hak / Ödeme Yükle (+5 Giriş Hakkı Ekle)
  const handleAddEntries = (bike, e) => {
    e.stopPropagation();
    const count = prompt(`${bike.owner?.fullName} için kaç giriş hakkı eklemek istiyorsunuz?`, '5');
    if (!count || isNaN(count)) return;

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });

    const added = parseInt(count, 10);
    const updated = {
      ...bike,
      remainingEntries: (bike.remainingEntries ?? 0) + added,
      totalEntriesGranted: (bike.totalEntriesGranted ?? 0) + added
    };

    onUpdateBike(updated, {
      actionType: 'ENTRIES_GRANTED',
      note: `${added} seanslık yeni hak paketi yüklendi. Kalan Hak: ${updated.remainingEntries}`
    });
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

              {/* Bilgiler ve Parçalar */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                
                {/* Sahibi ve Kan Grubu Bilgisi */}
                <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-bold uppercase">Sürücü / Pilot</span>
                    {/* Kan Grubu Rozeti (Kırmızı ve Belirgin) */}
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

                {/* PİST GİRİŞ HAKKI VE HIZLI DÜŞME AKSİYONU */}
                <div className="p-3 rounded-2xl bg-black/50 border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold">Piste Giriş Bakiyesi:</span>
                    <span className={`font-black text-sm ${isExpired ? 'text-red-500' : 'text-emerald-400'}`}>
                      {remaining} / {bike.totalEntriesGranted || 5} Giriş
                    </span>
                  </div>

                  {!isViewer ? (
                    <div className="flex gap-2">
                      {/* Piste Giriş Yap Butonu -> TrackEntryModal Açar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenTrackEntry) onOpenTrackEntry(bike);
                          else handleUseEntry(bike, e);
                        }}
                        disabled={isExpired}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 shadow transition ${
                          isExpired 
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white active:scale-95 shadow-md shadow-red-600/30'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Piste Giriş Yap</span>
                      </button>

                      {/* Hak Yükle Butonu -> AddEntriesModal Açar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenAddEntries) onOpenAddEntries(bike);
                          else handleAddEntries(bike, e);
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center space-x-1 shadow"
                        title="Yeni Hak / Ödeme Yükle"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Hak Yükle</span>
                      </button>
                    </div>
                  ) : (
                    <div className="py-2 px-3 rounded-xl bg-gray-900 border border-gray-800 text-center text-xs font-bold text-gray-400 flex items-center justify-center space-x-1.5">
                      <span>👁️</span>
                      <span>Gözlemci Modu • Sadece Görüntüleme</span>
                    </div>
                  )}
                </div>

                {/* Takılı Parçalar Listesi */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-gray-400 flex items-center">
                    <Wrench className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                    Takılı Parçalar ({bike.equippedParts?.length || 0}):
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(bike.equippedParts || []).map((part, i) => (
                      <span 
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs font-semibold"
                      >
                        {part.name}
                      </span>
                    ))}
                    {(!bike.equippedParts || bike.equippedParts.length === 0) && (
                      <span className="text-xs text-gray-500">Parça girilmemiş</span>
                    )}
                  </div>
                </div>

                {/* Alt Butonlar */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => onShowQR(bike)}
                    className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-gray-700 transition"
                    title="Karekodu Bastır"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>

                  {!isViewer && (
                    <button
                      onClick={() => setTransferringBike(bike)}
                      className="px-3 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs border border-gray-700 transition"
                      title="Başka Garaja Taşı"
                    >
                      <ArrowRightLeft className="w-4 h-4 inline mr-1" />
                      Taşı
                    </button>
                  )}

                  <button
                    onClick={() => onSelectBike(bike)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 text-white font-black text-sm flex items-center justify-center space-x-1 shadow transition"
                  >
                    <span>İncele & Parçalar</span>
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
