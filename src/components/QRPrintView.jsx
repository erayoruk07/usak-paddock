import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Printer, 
  ArrowLeft, 
  Warehouse, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  Sparkles, 
  Bike,
  Heart,
  QrCode
} from 'lucide-react';

export default function QRPrintView({ bikes, selectedBike, onBack }) {
  // Seçili motor ID'leri
  const [selectedIds, setSelectedIds] = useState(
    selectedBike ? [selectedBike.id] : bikes.map(b => b.id)
  );

  // Aktif Garaj Filtresi: 'ALL' veya 'box-1', 'box-2' ...
  const [activeGarageFilter, setActiveGarageFilter] = useState('ALL');

  // Garajları ve içindeki motorları grupla
  const garageGroups = [];
  for (let i = 1; i <= 10; i++) {
    const boxId = `box-${i}`;
    const boxName = `Paddock Box ${i}`;
    const boxBikes = bikes.filter(b => b.garageId === boxId || b.garageNo?.includes(String(i)));
    garageGroups.push({
      id: boxId,
      boxNumber: i,
      name: boxName,
      bikes: boxBikes
    });
  }

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => setSelectedIds(bikes.map(b => b.id));
  const deselectAll = () => setSelectedIds([]);

  // Belirli bir garajın tüm motorlarını seç
  const selectGarageBikes = (garageBikes) => {
    const newIds = new Set([...selectedIds, ...garageBikes.map(b => b.id)]);
    setSelectedIds(Array.from(newIds));
  };

  // Belirli bir garajın tüm motorlarını seçimden çıkar
  const deselectGarageBikes = (garageBikes) => {
    const garageBikeIds = garageBikes.map(b => b.id);
    setSelectedIds(selectedIds.filter(id => !garageBikeIds.includes(id)));
  };

  const handlePrint = () => {
    window.print();
  };

  // Yazdırılacak motorlar
  const bikesToPrint = bikes.filter(b => selectedIds.includes(b.id));

  // Görüntülenecek garajlar
  const displayedGarages = activeGarageFilter === 'ALL'
    ? garageGroups
    : garageGroups.filter(g => g.id === activeGarageFilter);

  return (
    <div className="space-y-6">
      
      {/* 1. ÜST KONTROL PANELİ (YAZDIRMA SIRASINDA GİZLENİR) */}
      <div className="no-print p-4 sm:p-6 rounded-3xl bg-[#141822] border-2 border-gray-700 shadow-xl space-y-5">
        
        {/* Başlık ve Butonlar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-200 transition border border-gray-700"
              title="Geri Dön"
            >
              <ArrowLeft className="w-5 h-5 text-red-500" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Printer className="w-6 h-6 text-emerald-400" />
                <span>Paddock Sticker Karekod Basma</span>
              </h2>
              <p className="text-xs text-gray-400">
                Motorların üzerine yapıştırılacak A4 yapışkanlı etiketleri garaja göre seçip yazdırın.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={selectAll}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition"
            >
              Tümünü Seç ({bikes.length})
            </button>
            <button
              onClick={deselectAll}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-bold transition"
            >
              Temizle
            </button>
            <button
              onClick={handlePrint}
              disabled={bikesToPrint.length === 0}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 disabled:opacity-50 text-white font-black text-sm flex items-center space-x-2 shadow-lg shadow-emerald-900/40 transition transform active:scale-95"
            >
              <Printer className="w-5 h-5" />
              <span>Yazdır ({bikesToPrint.length} Etiket)</span>
            </button>
          </div>
        </div>

        {/* Karekod Tekilliği & Bilgilendirme Rozeti */}
        <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800 text-cyan-300 text-xs font-bold flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Karekod Tekilliği Aktif: Her motorun şasi ve ID'sine özel benzersiz QR üretilir. Yıpranan sticker'ları dilediğiniz zaman tek tek yeniden basabilirsiniz.</span>
          </div>
          <span className="text-[11px] font-mono bg-cyan-900/60 px-2 py-0.5 rounded-md border border-cyan-700 text-white">
            Seçili: {bikesToPrint.length} / {bikes.length} Motor
          </span>
        </div>

        {/* 2. GARAJ SINIFLANDIRMA VE FİLTRE BUTONLARI */}
        <div className="space-y-2 pt-2 border-t border-gray-800">
          <div className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center">
            <Warehouse className="w-4 h-4 mr-1.5 text-orange-400" />
            Garaja Göre Sınıflandır:
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveGarageFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                activeGarageFilter === 'ALL'
                  ? 'bg-red-600 text-white border-red-500 shadow'
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
              }`}
            >
              Tüm Garajlar ({bikes.length})
            </button>

            {garageGroups.map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGarageFilter(g.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition border flex items-center space-x-1.5 ${
                  activeGarageFilter === g.id
                    ? 'bg-red-600 text-white border-red-500 shadow'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                <span>Box {g.boxNumber}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/50 text-[10px]">
                  {g.bikes.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. GARAJ VE MOTOR SEÇİM ALANI */}
        <div className="space-y-4 pt-2 border-t border-gray-800">
          <div className="text-xs text-gray-400 font-bold">Yazdırılacak Motorları Garajlarına Göre İşaretleyin:</div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {displayedGarages.map(garage => {
              const garageBikeIds = garage.bikes.map(b => b.id);
              const selectedCount = garageBikeIds.filter(id => selectedIds.includes(id)).length;
              const allSelected = garage.bikes.length > 0 && selectedCount === garage.bikes.length;

              return (
                <div 
                  key={garage.id}
                  className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-2.5"
                >
                  {/* Garaj Başlığı ve Toplu Seçim Butonları */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Warehouse className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-black text-white">{garage.name}</span>
                      <span className="text-xs text-gray-400">({garage.bikes.length} Motor)</span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        • {selectedCount} seçili
                      </span>
                    </div>

                    {garage.bikes.length > 0 && (
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => selectGarageBikes(garage.bikes)}
                          className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-cyan-300 transition"
                        >
                          + Tümünü Seç
                        </button>
                        <button
                          type="button"
                          onClick={() => deselectGarageBikes(garage.bikes)}
                          className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-gray-400 transition"
                        >
                          Temizle
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Garajdaki Motorlar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {garage.bikes.map(bike => {
                      const isSelected = selectedIds.includes(bike.id);
                      return (
                        <div
                          key={bike.id}
                          onClick={() => toggleSelect(bike.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-red-950/50 border-red-600 text-white shadow-sm'
                              : 'bg-black/60 border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-red-500 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-600 shrink-0" />
                            )}
                            <div className="truncate">
                              <div className="text-xs font-black text-white flex items-center space-x-1.5 truncate">
                                <span className="text-red-400 font-mono">#{bike.raceNumber}</span>
                                <span className="truncate">{bike.brand} {bike.model}</span>
                              </div>
                              <div className="text-[11px] text-gray-400 truncate">
                                Pilot: {bike.owner?.fullName} • 🩸 {bike.owner?.bloodType}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {garage.bikes.length === 0 && (
                      <div className="col-span-full py-2 text-center text-xs text-gray-500">
                        Bu garajda şu an motor bulunmuyor.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. YAZDIRILABİLİR STICKER ETİKETLERİ (A4 ÇIKTISINDA GÖRÜNÜR) */}
      <div className="qr-sticker-sheet grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
        {bikesToPrint.map((bike) => (
          <div 
            key={bike.id}
            className="qr-sticker relative bg-white text-black p-4 rounded-2xl border-2 border-dashed border-black shadow-lg flex flex-col justify-between overflow-hidden"
            style={{ minHeight: '300px' }}
          >
            {/* Kesim Çizgisi Başlığı */}
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-gray-500 pb-1.5 border-b border-dashed border-gray-300">
              <span className="flex items-center space-x-1">
                <span>✂️</span>
                <span>KESİM ÇİZGİSİ</span>
              </span>
              <span className="tracking-widest uppercase text-red-600 font-black">
                UŞAK PADDOCK
              </span>
            </div>

            {/* Üst Şerit: UŞAK YARIŞ PİSTİ, Garaj ve Yarışçı Numarası */}
            <div className="flex items-center justify-between pt-2 pb-1">
              <div>
                <div className="text-xs font-black tracking-widest text-red-600 uppercase leading-none">
                  UŞAK YARIŞ PİSTİ
                </div>
                <div className="text-base font-black uppercase text-black tracking-tight mt-1">
                  {bike.garageNo}
                </div>
              </div>
              <div className="shrink-0">
                <span className="px-3 py-1 rounded-lg bg-black text-white font-black text-lg italic tracking-wider shadow-sm">
                  #{bike.raceNumber}
                </span>
              </div>
            </div>

            {/* QR Kod (Yüksek Çözünürlük ve Tekil ID) */}
            <div className="py-2 flex flex-col items-center justify-center my-auto">
              <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-sm">
                <QRCodeSVG 
                  value={`USAK_TRACK_BIKE:${bike.id}`}
                  size={155}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <span className="text-xs font-mono font-black text-black mt-2 tracking-widest">
                ID: {bike.id}
              </span>
            </div>

            {/* Alt Kısım: Paddock Kartı */}
            <div className="border-t-2 border-black pt-2 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-gray-600 uppercase tracking-wider">
                BOX ETİKETİ
              </span>
              <span className="text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                PADDOCK KARTI
              </span>
            </div>
          </div>
        ))}

        {bikesToPrint.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 bg-[#141822] rounded-3xl border border-gray-800 p-8 space-y-3 no-print">
            <QrCode className="w-12 h-12 text-gray-600 mx-auto" />
            <div className="text-base font-bold text-white">Yazdırmak için en az bir motor seçiniz.</div>
            <button
              onClick={selectAll}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              Tüm Motorları Seç
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
