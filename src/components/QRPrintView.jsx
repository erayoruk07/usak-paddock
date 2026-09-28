import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, HelpCircle } from 'lucide-react';

export default function QRPrintView({ bikes, selectedBike, onBack }) {
  const [selectedIds, setSelectedIds] = useState(
    selectedBike ? [selectedBike.id] : bikes.map(b => b.id)
  );

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => setSelectedIds(bikes.map(b => b.id));
  const deselectAll = () => setSelectedIds([]);

  const handlePrint = () => {
    window.print();
  };

  const bikesToPrint = bikes.filter(b => selectedIds.includes(b.id));

  return (
    <div className="space-y-6">
      
      {/* Kontrol Paneli */}
      <div className="no-print p-4 sm:p-6 rounded-3xl bg-[#141822] border-2 border-gray-700 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-200 transition"
              title="Geri Dön"
            >
              <ArrowLeft className="w-5 h-5 text-red-500" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center">
                <Printer className="w-6 h-6 mr-2 text-emerald-400" />
                Motosiklet Karekod (QR) Etiketi Basma
              </h2>
              <p className="text-xs text-gray-400">
                Paddock Box etiketlerini A4 yapışkanlı kağıda bastırıp motorun üzerine yapıştırabilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={selectAll}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold"
            >
              Tümünü Seç
            </button>
            <button
              onClick={deselectAll}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-bold"
            >
              Temizle
            </button>
            <button
              onClick={handlePrint}
              disabled={bikesToPrint.length === 0}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-sm flex items-center space-x-2 shadow-lg"
            >
              <Printer className="w-5 h-5" />
              <span>Yazdır ({bikesToPrint.length} Etiket)</span>
            </button>
          </div>
        </div>

        {/* Hızlı Seçim */}
        <div className="pt-2 border-t border-gray-800">
          <div className="text-xs text-gray-400 font-bold mb-2">Yazdırılacak Motorları İşaretleyin:</div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
            {bikes.map(bike => {
              const isSelected = selectedIds.includes(bike.id);
              return (
                <button
                  key={bike.id}
                  onClick={() => toggleSelect(bike.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                    isSelected
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
                  }`}
                >
                  <span>#{bike.raceNumber}</span>
                  <span className="truncate max-w-[120px]">{bike.brand} {bike.model}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Yazdırılabilir Etiketler Grid */}
      <div className="qr-sticker-sheet grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
        {bikesToPrint.map((bike) => (
          <div 
            key={bike.id}
            className="qr-sticker relative bg-white text-black p-5 rounded-3xl border-3 border-dashed border-black shadow-xl flex flex-col justify-between overflow-hidden"
            style={{ minHeight: '340px' }}
          >
            {/* Üst Şerit */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
              <div>
                <div className="text-xs font-black tracking-widest text-red-600 uppercase">
                  UŞAK YARIŞ PİSTİ
                </div>
                <div className="text-sm font-black uppercase text-black">
                  {bike.garageNo}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="px-2.5 py-1 rounded bg-black text-white font-black text-base italic">
                  #{bike.raceNumber}
                </span>
              </div>
            </div>

            {/* QR Kod */}
            <div className="py-2 flex flex-col items-center justify-center my-auto">
              <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-sm">
                <QRCodeSVG 
                  value={`USAK_TRACK_BIKE:${bike.id}`}
                  size={150}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-black mt-1">
                ID: {bike.id}
              </span>
            </div>

            {/* Alt Bilgiler: Pilot, Kan Grubu, Telefon */}
            <div className="border-t-2 border-black pt-2 space-y-1">
              <div className="flex items-center justify-between text-base font-black uppercase text-black">
                <span>{bike.brand} {bike.model}</span>
                <span className="text-xs font-bold text-red-600 font-mono">
                  🩸 {bike.owner?.bloodType || "Kan Grubu"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span>Pilot: {bike.owner?.fullName}</span>
                <span className="font-mono">{bike.owner?.phone}</span>
              </div>

              {bike.chassisNumber && (
                <div className="text-[10px] text-gray-600 font-mono">
                  Şasi: {bike.chassisNumber}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-300">
                <span>Telefon kamerasıyla okutunuz</span>
                <span className="font-black text-red-600 uppercase">Paddock Kartı</span>
              </div>
            </div>

            <div className="absolute top-1 right-1 text-[9px] text-gray-400 no-print">
              ✂️ kesim çizgisi
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
