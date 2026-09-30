import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Banknote, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  addMonthsToDate, 
  formatDateTR, 
  formatMonthYearTR, 
  getPriceForDate 
} from '../utils/garageRentHelper';

export default function RentPaymentModal({ 
  bike, 
  rentInfo, 
  settings, 
  onClose, 
  onSavePayment 
}) {
  if (!bike || !rentInfo) return null;

  // Başlangıç tarihi: son ödenen dönemin bitiş tarihi (validUntilDate)
  const baseStartDate = rentInfo.validUntilDate ? new Date(rentInfo.validUntilDate) : new Date();

  // Kaç aylık peşin/dönem seçildi? (Varsayılan 1 ay)
  const [monthsCount, setMonthsCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Nakit'); // 'Nakit', 'Kredi Kartı', 'Havale / EFT'
  const [customAmountStr, setCustomAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seçilen ay sayısına göre dönemleri ve hesaplanan tutarı bul
  const selectedPeriods = [];
  let calculatedTotal = 0;
  let runningStart = new Date(baseStartDate);

  for (let i = 0; i < monthsCount; i++) {
    const periodStart = new Date(runningStart);
    const periodEnd = addMonthsToDate(periodStart, 1);
    const periodPrice = getPriceForDate(periodStart, settings, bike);

    selectedPeriods.push({
      index: i + 1,
      start: periodStart,
      end: periodEnd,
      startStr: formatDateTR(periodStart),
      endStr: formatDateTR(periodEnd),
      monthName: formatMonthYearTR(periodStart),
      price: periodPrice
    });

    calculatedTotal += periodPrice;
    runningStart = periodEnd;
  }

  // İlk açılışta veya ay sayısı değiştiğinde tutarı güncelle
  useEffect(() => {
    setCustomAmountStr(String(calculatedTotal));
  }, [monthsCount, calculatedTotal]);

  const finalCoverageStartStr = formatDateTR(baseStartDate);
  const finalCoverageEnd = addMonthsToDate(baseStartDate, monthsCount);
  const finalCoverageEndStr = formatDateTR(finalCoverageEnd);

  // Tutar değişimi (baştaki sıfır takılmasını engeller)
  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val === '') {
      setCustomAmountStr('0');
      return;
    }
    const num = parseInt(val, 10);
    setCustomAmountStr(String(num));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const finalAmount = parseInt(customAmountStr, 10) || 0;
    setIsSubmitting(true);

    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const periodLabel = monthsCount === 1 
      ? selectedPeriods[0]?.monthName 
      : `${selectedPeriods[0]?.monthName} - ${selectedPeriods[selectedPeriods.length - 1]?.monthName} (${monthsCount} Ay)`;

    const newPaymentRecord = {
      id: 'rent_' + Date.now(),
      type: 'RENT_PAYMENT',
      date: dateStr,
      amount: finalAmount,
      method: paymentMethod,
      period: periodLabel,
      periodCount: monthsCount,
      coverageStart: finalCoverageStartStr,
      coverageEnd: finalCoverageEndStr,
      note: note.trim() || `${periodLabel} Garaj Kirası Tahsil Edildi (${finalCoverageStartStr} - ${finalCoverageEndStr})`
    };

    onSavePayment(bike, newPaymentRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#141822] border-2 border-purple-500/70 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Üst Başlık */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-600 text-white font-black text-xl italic flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
              #{bike.raceNumber}
            </div>
            <div>
              <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase">
                {bike.garageNo} • GARAJ KİRASI TAHSİLATI
              </span>
              <h3 className="text-base sm:text-lg font-black text-white truncate">
                {bike.owner?.fullName}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {bike.brand} {bike.model} • Garaj Üyesi: {rentInfo.joinDateFormatted}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form İçeriği */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          
          {/* 1. Dönem Seçici (İleri ve Geri Tarihli Seçim) */}
          <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                Tahsil Edilecek Dönem & Süre
              </label>
              <span className="text-[11px] font-bold text-emerald-400">
                {monthsCount} Ay Seçili
              </span>
            </div>

            {/* Hızlı Ay Seçim Butonları */}
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { count: 1, label: '1 Ay' },
                { count: 2, label: '2 Ay' },
                { count: 3, label: '3 Ay' },
                { count: 6, label: '6 Ay' },
                { count: 12, label: '1 Yıl' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.count}
                  onClick={() => setMonthsCount(opt.count)}
                  className={`py-2 px-1 rounded-xl text-xs font-black transition text-center ${
                    monthsCount === opt.count
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 scale-[1.02]'
                      : 'bg-black/60 border border-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Kapsanan Tarih Bilgisi */}
            <div className="p-2.5 rounded-xl bg-black/50 border border-purple-500/30 flex items-center justify-between text-xs">
              <span className="text-gray-400">Ödeme Kapsamı:</span>
              <span className="font-bold text-white flex items-center">
                <span className="text-purple-300">{finalCoverageStartStr}</span>
                <ChevronRight className="w-3.5 h-3.5 mx-1 text-purple-400" />
                <span className="text-emerald-400">{finalCoverageEndStr}</span>
              </span>
            </div>

            {/* Seçilen Dönemler ve Fiyat Dökümü */}
            {selectedPeriods.length > 1 && (
              <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] pt-1">
                {selectedPeriods.map(p => (
                  <div key={p.index} className="flex items-center justify-between text-gray-400 px-1">
                    <span>{p.index}. Ay: {p.monthName} ({p.startStr} - {p.endStr})</span>
                    <span className="font-mono font-bold text-gray-300">{p.price.toLocaleString('tr-TR')} ₺</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Tahsil Edilecek Tutar */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Tahsil Edilecek Tutar (₺)
              </span>
              <span className="text-[10px] text-gray-400">
                (İndirim, pazarlık veya 0 ₺ girilebilir)
              </span>
            </label>

            <div className="relative">
              <input 
                type="text"
                inputMode="numeric"
                value={customAmountStr}
                onChange={handleAmountChange}
                className="w-full bg-black border-2 border-emerald-500 focus:border-emerald-400 rounded-xl pl-3.5 pr-12 py-3 text-xl font-black text-emerald-400 font-mono outline-none"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">
                TL
              </span>
            </div>

            {/* Hızlı Tutar Aksiyonları */}
            <div className="flex items-center space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setCustomAmountStr(String(calculatedTotal))}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-gray-300"
              >
                Hesaplanan ({calculatedTotal.toLocaleString('tr-TR')} ₺)
              </button>
              <button
                type="button"
                onClick={() => setCustomAmountStr('0')}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-amber-400"
              >
                0 TL (Muafiyet / Ücretsiz)
              </button>
            </div>
          </div>

          {/* 3. Ödeme Yöntemi */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center">
              <CreditCard className="w-3.5 h-3.5 mr-1 text-cyan-400" />
              Ödeme Yöntemi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Nakit', 'Kredi Kartı', 'Havale / EFT'].map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl border text-xs font-black transition flex items-center justify-center space-x-1 ${
                    paymentMethod === method
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                      : 'bg-black border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  <span>{method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. İşlem Notu */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Açıklama / Makbuz Notu (Opsiyonel)
            </label>
            <input 
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="örn: Makbuz No: 2045, elden peşin alındı..."
              className="w-full bg-black border-2 border-gray-700 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white font-medium outline-none transition"
            />
          </div>

          {/* Alt Butonlar */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tahsilatı Onayla ({parseInt(customAmountStr, 10).toLocaleString('tr-TR')} ₺)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
