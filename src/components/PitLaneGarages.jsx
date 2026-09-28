import React, { useState } from 'react';
import { Warehouse, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function PitLaneGarages({ garages, bikes, onOpenGarage }) {
  const [openingBoxId, setOpeningBoxId] = useState(null);

  // Kibar, yumuşak telefon "tık" sesi (Soft Click)
  const playSoftClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine'; // Yumuşak ve temiz sinüs dalgası
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  };

  const handleOpen = (garage) => {
    playSoftClickSound();
    setOpeningBoxId(garage.id);
    setTimeout(() => {
      onOpenGarage(garage);
      setOpeningBoxId(null);
    }, 450);
  };

  return (
    <div className="space-y-6">
      
      {/* Sade ve Net Başlık */}
      <div className="text-center py-2 sm:py-4">
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
          🏁 UŞAK PİSTİ PADDOCK BOX GARAJ KORİDORU
        </h1>
        <p className="text-sm sm:text-base text-gray-300 mt-1 font-semibold">
          Giriş yapmak istediğiniz Paddock Box garaj kapısına dokunun
        </p>
      </div>

      {/* 10 ADET PADDOCK BOX KAPISI */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {garages.map((garage) => {
          const garageBikes = bikes.filter(b => b.garageId === garage.id);
          const bikeCount = garageBikes.length;
          
          // Giriş hakkı biten motor var mı?
          const hasExpiredEntries = garageBikes.some(b => (b.remainingEntries ?? 0) <= 0);
          const isOpening = openingBoxId === garage.id;

          return (
            <div
              key={garage.id}
              onClick={() => !isOpening && handleOpen(garage)}
              className={`cursor-pointer group relative bg-[#151922] rounded-3xl border-2 sm:border-3 overflow-hidden shadow-2xl transition-all duration-300 transform active:scale-95 hover:border-red-500 hover:shadow-red-600/20 ${
                hasExpiredEntries 
                  ? 'border-red-600 bg-red-950/20' 
                  : 'border-gray-700'
              }`}
            >
              
              {/* Garaj Kapısı Üst Tabela: Sadece Garaj İsmi ve Sağda Sade Adet */}
              <div className="py-2.5 px-3 bg-black/90 border-b-2 border-gray-700 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">
                  PADDOCK BOX {garage.boxNumber}
                </span>

                {/* Sadece Adet Yazısı */}
                <span className="px-2 py-0.5 rounded-lg bg-gray-800 text-cyan-400 font-black text-xs shrink-0 border border-gray-700">
                  {bikeCount} Adet
                </span>
              </div>

              {/* KEPENK KAPISI ALANI */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gray-950 flex flex-col justify-between">
                
                {/* Kepenk Açılınca Gözüken Arka Kısım - Üst üste binen yazı kaldırıldı, sadece temiz simge var */}
                <div className="absolute inset-0 bg-[#0d121c] flex items-center justify-center">
                  <Warehouse className="w-12 h-12 text-red-500 animate-pulse opacity-40" />
                </div>

                {/* METALİK KEPENK */}
                <div 
                  className={`absolute inset-0 bg-[#171c26] flex flex-col items-center justify-between p-3 transition-transform duration-400 ease-in-out border-b-8 border-gray-600 ${
                    isOpening ? '-translate-y-full' : 'translate-y-0'
                  }`}
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 3px, transparent 3px, transparent 18px)'
                  }}
                >
                  {/* Kocaman Dev Numara */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-black/80 border-2 border-gray-600 flex items-center justify-center shadow-inner my-auto">
                    <span className="text-4xl sm:text-5xl font-black text-red-500 tracking-tight">
                      {garage.boxNumber}
                    </span>
                  </div>

                  {/* Durum Rozeti */}
                  <div className="mt-auto mb-1">
                    {hasExpiredEntries ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs shadow-lg animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        Giriş Hakkı Bitti!
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-600/90 text-white font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Giriş Hakları Var
                      </span>
                    )}
                  </div>

                </div>

              </div>

              {/* BÜYÜK DOKUNMA BUTONU: "GARAJA GİR" */}
              <div className="p-3 bg-gray-900 border-t-2 border-gray-700 text-center">
                <div className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 group-hover:from-red-500 group-hover:to-orange-500 text-white font-black text-sm flex items-center justify-center space-x-1.5 shadow-md">
                  <span>GARAJA GİR</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
