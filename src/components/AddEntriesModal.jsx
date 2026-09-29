import React, { useState } from 'react';
import { 
  X, 
  Ticket, 
  CheckCircle2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft,
  Sparkles,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AddEntriesModal({ bike, onClose, onConfirm }) {
  if (!bike) return null;

  const currentRemaining = bike.remainingEntries ?? 0;
  const currentTotalGranted = bike.totalEntriesGranted ?? 5;

  // Yüklenecek hak sayısı (Varsayılan 5)
  const [entryCount, setEntryCount] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState('Nakit');
  const [amount, setAmount] = useState(7000);
  const [paymentNote, setPaymentNote] = useState('7.000 TL ödendi (Nakit)');

  const packages = [
    { count: 5, label: '+5 Seans Standart Paket', price: '7.000 TL', rawPrice: 7000, badge: 'Standart / En Çok Tercih Edilen' },
    { count: 10, label: '+10 Seans Çift Paket', price: '14.000 TL', rawPrice: 14000, badge: '2x Paket' },
    { count: 1, label: '+1 Seans Ek Giriş', price: '1.500 TL', rawPrice: 1500, badge: 'Tek Seans' }
  ];

  const handleSelectPackage = (pkg) => {
    setEntryCount(pkg.count);
    setAmount(pkg.rawPrice);
    setPaymentNote(`${pkg.price} ödendi (${paymentMethod})`);
  };

  const handleCountChange = (newCount) => {
    const validCount = Math.max(1, newCount);
    setEntryCount(validCount);
    const calculated = validCount === 5 ? 7000 : validCount === 10 ? 14000 : validCount === 1 ? 1500 : validCount * 1400;
    setAmount(calculated);
    setPaymentNote(`${calculated.toLocaleString('tr-TR')} TL ödendi (${paymentMethod})`);
  };

  const newRemaining = currentRemaining + entryCount;
  const newTotalGranted = currentTotalGranted + entryCount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entryCount <= 0) return;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const finalAmount = Number(amount) || (entryCount === 5 ? 7000 : entryCount === 10 ? 14000 : entryCount * 1400);
    onConfirm(entryCount, paymentMethod, paymentNote, finalAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#111622] border-2 border-amber-500/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* ÜST BANNER */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-950 via-gray-900 to-black border-b-2 border-amber-500/50 overflow-hidden">
          
          {/* Arka plan deseni */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 border border-white/20">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase block">
                  UŞAK PİSTİ • BAKİYE & PAKET YÖNETİMİ
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  Yeni Hak / Paket Yükle
                </h3>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 text-gray-300 hover:text-white hover:bg-black transition border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MOTOR VE PİLOT KÜNYESİ */}
        <div className="p-4 sm:p-5 bg-black/60 border-b border-gray-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 truncate">
            <div className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-black text-lg italic shadow shrink-0">
              #{bike.raceNumber}
            </div>
            <div className="truncate">
              <div className="text-base font-black text-white truncate">
                {bike.owner?.fullName}
              </div>
              <div className="text-xs text-gray-400 font-semibold truncate flex items-center space-x-1.5">
                <span>{bike.garageNo}</span>
                <span>•</span>
                <span>{bike.brand} {bike.model}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] text-gray-400 font-bold uppercase">Mevcut Bakiye</div>
            <div className="text-lg font-black text-emerald-400">
              {currentRemaining} Hak
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          
          {/* 1. HAZIR PAKET SEÇENEKLERİ */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
              Paket Seçin veya Özel Miktar Belirleyin:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {packages.map((pkg) => {
                const isSelected = entryCount === pkg.count;
                return (
                  <button
                    key={pkg.count}
                    type="button"
                    onClick={() => handleSelectPackage(pkg)}
                    className={`p-3 rounded-2xl border-2 text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-950/50'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-white">{pkg.label.split(' ')[0]}</span>
                        <span className="text-xs font-bold text-amber-400">{pkg.price}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold block mt-1">
                        {pkg.badge}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="mt-2 text-right">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 inline" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SERBEST SAYAÇ (ÖZEL HAK GİRİŞİ) */}
          <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">
              Yüklenecek Seans Adedi:
            </span>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleCountChange(entryCount - 1)}
                className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition border border-gray-700"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-2xl font-black text-white min-w-[40px] text-center font-mono">
                {entryCount}
              </span>

              <button
                type="button"
                onClick={() => handleCountChange(entryCount + 1)}
                className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center transition border border-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tahsil Edilecek Tutar */}
          <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">
              Tahsil Edilecek Tutar:
            </span>
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  setAmount(val);
                  setPaymentNote(`${val.toLocaleString('tr-TR')} TL ödendi (${paymentMethod})`);
                }}
                className="w-28 bg-black border border-gray-700 rounded-xl px-2.5 py-1.5 text-amber-400 font-mono font-black text-base text-right focus:border-amber-500 focus:outline-none"
              />
              <span className="text-sm font-bold text-gray-400">TL</span>
            </div>
          </div>

          {/* 3. ÖDEME YÖNTEMİ & NOT */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300">Ödeme Yöntemi:</label>
            <div className="grid grid-cols-3 gap-2">
              {['Nakit', 'Havale / EFT', 'Kredi Kartı'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method);
                    setPaymentNote(prev => prev.replace(/\(.*?\)/, `(${method})`));
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    paymentMethod === method
                      ? 'bg-amber-600 text-white border-amber-500 shadow'
                      : 'bg-black/50 text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Ödeme Notu / Makbuz Açıklaması:</label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="örn: 7.000 TL ödendi - Havale"
                className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 4. BAKİYE ÖNİZLEME */}
          <div className="p-3.5 rounded-2xl bg-black/60 border border-gray-800 flex items-center justify-between text-xs">
            <div className="text-center flex-1">
              <span className="text-[10px] text-gray-500 font-bold block uppercase">Mevcut Bakiye</span>
              <span className="text-base font-black text-white">{currentRemaining} Hak</span>
            </div>
            <div className="text-amber-500 font-black text-base px-2">+</div>
            <div className="text-center flex-1">
              <span className="text-[10px] text-amber-400 font-bold block uppercase">Yüklenecek</span>
              <span className="text-base font-black text-amber-400">+{entryCount} Hak</span>
            </div>
            <div className="text-amber-500 font-black text-base px-2">=</div>
            <div className="text-center flex-1">
              <span className="text-[10px] text-emerald-400 font-bold block uppercase">Yeni Bakiye</span>
              <span className="text-base font-black text-emerald-400">{newRemaining} Hak</span>
            </div>
          </div>

          {/* ONAY BUTONLARI */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs sm:text-sm transition"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-amber-600/30 transition transform active:scale-95 flex items-center justify-center space-x-2"
            >
              <Ticket className="w-4 h-4" />
              <span>PAKETİ TANIMLA (+{entryCount} HAK YÜKLE)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
