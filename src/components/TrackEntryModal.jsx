import React, { useState } from 'react';
import { 
  X, 
  Flag, 
  CheckCircle2, 
  AlertTriangle, 
  Minus, 
  Plus, 
  Flame, 
  Clock, 
  FileText,
  Bike
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TrackEntryModal({ bike, onClose, onConfirm }) {
  if (!bike) return null;

  const remaining = bike.remainingEntries ?? 0;
  const isOutOfEntries = remaining <= 0;

  // Düşülecek seans/hak adedi (Varsayılan 1)
  const [deductCount, setDeductCount] = useState(1);
  // Seans notu varsayılan "Serbest Antrenman" seçili gelir
  const [sessionNote, setSessionNote] = useState('Serbest Antrenman');

  const maxDeduct = Math.max(1, remaining);
  const newRemaining = Math.max(0, remaining - deductCount);

  const quickNotes = [
    'Serbest Antrenman',
    'Yarış Seansı',
    'Sıralama Turları',
    'Öğleden Sonra Seansı'
  ];

  const handleIncrement = () => {
    if (deductCount < remaining) {
      setDeductCount(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (deductCount > 1) {
      setDeductCount(prev => prev - 1);
    }
  };

  const handleQuickSelect = (count) => {
    if (count <= remaining) {
      setDeductCount(count);
    } else {
      setDeductCount(remaining);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isOutOfEntries) {
      alert('Sürücünün giriş hakkı kalmamıştır! Lütfen önce yeni paket tanımlayınız.');
      return;
    }

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    onConfirm(deductCount, sessionNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#111622] border-2 border-red-600/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* PİST TASARIMLI ÜST BANNER */}
        <div className="relative p-3.5 sm:p-5 bg-gradient-to-r from-red-950 via-gray-900 to-black border-b-2 border-red-600/50 shrink-0 overflow-hidden">
          {/* Arka plan yarış çizgileri ve pist deseni */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="trackGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#trackGrid)" />
              {/* Pist viraj eğrisi */}
              <path d="M-20,80 Q150,0 300,70 T600,40" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="16,8" />
            </svg>
          </div>

          {/* Damalı bayrak şeridi */}
          <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#fff_10px,#fff_20px)] opacity-60"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-red-600/40 border border-white/20 shrink-0">
                <Flag className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] text-red-400 font-black tracking-widest uppercase block">
                  UŞAK YARIŞ PİSTİ • PİT ÇIKIŞ
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight uppercase flex items-center space-x-2">
                  <span>Piste Giriş Onayı</span>
                </h3>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full bg-black/60 text-gray-300 hover:text-white hover:bg-black transition border border-white/10"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* MOTOR VE PİLOT KÜNYESİ */}
        <div className="p-3 sm:p-4 bg-black/60 border-b border-gray-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 truncate">
            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-red-600 text-white font-black text-base sm:text-lg italic shadow shrink-0">
              #{bike.raceNumber}
            </div>
            <div className="truncate">
              <div className="text-sm sm:text-base font-black text-white truncate">
                {bike.owner?.fullName}
              </div>
              <div className="text-[11px] sm:text-xs text-gray-400 font-semibold truncate flex items-center space-x-1.5">
                <span>{bike.garageNo}</span>
                <span>•</span>
                <span>{bike.brand} {bike.model}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase">Mevcut Bakiye</div>
            <div className={`text-base sm:text-lg font-black ${isOutOfEntries ? 'text-red-500' : 'text-emerald-400'}`}>
              {remaining} Hak
            </div>
          </div>
        </div>

        {/* FORM VE KAYDIRILABİLİR İÇERİK */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
            {isOutOfEntries ? (
              <div className="p-4 rounded-2xl bg-red-950/70 border-2 border-red-600 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto animate-bounce" />
                <div className="text-sm font-black text-white">Bu Motorun Pist Giriş Hakkı Kalmamıştır!</div>
                <p className="text-xs text-red-300">
                  Piste çıkış yapabilmesi için önce yeni seans paketi tanımlanması gerekmektedir.
                </p>
              </div>
            ) : (
              <>
                {/* 1. DÜŞÜLECEK HAK/SEANS SAYACI */}
                <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-gray-900/90 border-2 border-gray-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-gray-300 uppercase tracking-wider flex items-center text-[11px] sm:text-xs">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                      Düşülecek Seans Sayısı:
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-gray-400">
                      Maksimum: <strong className="text-white">{remaining}</strong>
                    </span>
                  </div>

                  {/* Büyük Sayı ve + / - Kontrolleri */}
                  <div className="flex items-center justify-center space-x-4 py-1 sm:py-2">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={deductCount <= 1}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition border border-gray-700 active:scale-95"
                    >
                      <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <div className="text-center min-w-[100px] sm:min-w-[120px]">
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                        {deductCount}
                      </span>
                      <span className="block text-[10px] sm:text-xs font-bold text-red-400 uppercase mt-0.5">
                        Seans Düşülecek
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={deductCount >= remaining}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition border border-gray-700 active:scale-95"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Hızlı Seçim Butonları */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-0.5">
                    {[1, 2, 3, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        disabled={num > remaining}
                        onClick={() => handleQuickSelect(num)}
                        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition border ${
                          deductCount === num
                            ? 'bg-red-600 text-white border-red-500 shadow-md'
                            : 'bg-black/50 text-gray-400 border-gray-800 hover:text-white disabled:opacity-20'
                        }`}
                      >
                        {num} Seans
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. CANLI BAKİYE ÖNİZLEME (ÖNCE VE SONRA) */}
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-black/60 border border-gray-800 flex items-center justify-between text-xs">
                  <div className="text-center flex-1">
                    <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold block uppercase">Şu Anki Hak</span>
                    <span className="text-sm sm:text-base font-black text-white">{remaining}</span>
                  </div>
                  <div className="text-red-500 font-black text-sm sm:text-base px-1 sm:px-2">➔</div>
                  <div className="text-center flex-1">
                    <span className="text-[9px] sm:text-[10px] text-red-400 font-bold block uppercase">Düşülecek</span>
                    <span className="text-sm sm:text-base font-black text-red-500">-{deductCount}</span>
                  </div>
                  <div className="text-red-500 font-black text-sm sm:text-base px-1 sm:px-2">➔</div>
                  <div className="text-center flex-1">
                    <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold block uppercase">Kalan Hak</span>
                    <span className="text-sm sm:text-base font-black text-emerald-400">{newRemaining}</span>
                  </div>
                </div>

                {/* 3. SEANS NOTU / AÇIKLAMA */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                    <span className="flex items-center text-[11px] sm:text-xs">
                      <FileText className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                      Seans Notu / Açıklama:
                    </span>
                  </label>

                  {/* Hızlı Çipler (Default Serbest Antrenman seçili) */}
                  <div className="flex flex-wrap gap-1.5">
                    {quickNotes.map((qn, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSessionNote(qn)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition border ${
                          sessionNote === qn
                            ? 'bg-red-950/80 text-red-300 border-red-600 shadow-sm font-bold'
                            : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                        }`}
                      >
                        {qn}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    placeholder="örn: Serbest Antrenman..."
                    className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* ONAY VE İPTAL BUTONLARI (Alt bar sabit) */}
          <div className="p-3 sm:p-4 border-t border-gray-800 bg-[#0d111a] shrink-0 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs sm:text-sm transition"
            >
              Vazgeç
            </button>

            {!isOutOfEntries && (
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/30 transition transform active:scale-95 flex items-center justify-center space-x-1.5 sm:space-x-2"
              >
                <Flame className="w-4 h-4 fill-white shrink-0" />
                <span>PİSTE GİRİŞİ ONAYLA (-{deductCount} HAK)</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
