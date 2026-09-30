import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CreditCard, 
  Banknote, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Layers, 
  Sparkles,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  addMonthsToDate, 
  formatDateTR, 
  formatMonthYearTR, 
  getPriceForDate 
} from '../utils/garageRentHelper';
import { DateSelectPicker, TURKISH_MONTHS, AVAILABLE_YEARS } from './CustomDateSelectors';

export default function RentPaymentModal({ 
  bike, 
  rentInfo, 
  settings, 
  onClose, 
  onSavePayment 
}) {
  if (!bike || !rentInfo) return null;

  // Başlangıç tarihi: son ödenen dönemin bitiş tarihi (validUntilDate) veya bugün
  const initialBaseDate = useMemo(() => {
    return rentInfo.validUntilDate ? new Date(rentInfo.validUntilDate) : new Date();
  }, [rentInfo.validUntilDate]);

  // Seçim Modu: 'PERIOD' (Dönem formatında: Ay / Yıl) veya 'EXACT_DATE' (Tam Tarih: Gün / Ay / Yıl)
  const [selectMode, setSelectMode] = useState('PERIOD');

  // Dönem Modu State'leri
  const [selectedMonth, setSelectedMonth] = useState(initialBaseDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(initialBaseDate.getFullYear());

  // Tam Tarih Modu State'i (YYYY-MM-DD)
  const [exactStartDateStr, setExactStartDateStr] = useState(() => {
    const y = initialBaseDate.getFullYear();
    const m = String(initialBaseDate.getMonth() + 1).padStart(2, '0');
    const d = String(initialBaseDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // Kaç aylık peşin/dönem seçildi? (Varsayılan 1 ay)
  const [monthsCount, setMonthsCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Nakit'); // 'Nakit', 'Kredi Kartı', 'Havale / EFT'
  const [customAmountStr, setCustomAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Aktif başlangıç tarihini hesapla
  const activeStartDate = useMemo(() => {
    if (selectMode === 'EXACT_DATE') {
      const parts = exactStartDateStr.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }
    // PERIOD modu: Garaj kayıt gününü baz al (örn: her ayın 15'i ise 15'i)
    const joinDay = rentInfo.validUntilDate ? new Date(rentInfo.validUntilDate).getDate() : 1;
    return new Date(selectedYear, selectedMonth - 1, joinDay);
  }, [selectMode, exactStartDateStr, selectedMonth, selectedYear, rentInfo.validUntilDate]);

  // Önerilen Dönemler Listesi (Geciken aylar + cari ay + sonraki aylar)
  const recommendedPeriods = useMemo(() => {
    const list = [];
    const now = new Date();
    
    // Varsa gecikmedeki dönemler
    if (rentInfo.unpaidPeriods && rentInfo.unpaidPeriods.length > 0) {
      rentInfo.unpaidPeriods.forEach(p => {
        const d = new Date(p.startDate);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        list.push({
          month: m,
          year: y,
          label: `${TURKISH_MONTHS.find(tm => tm.value === m)?.name} ${y}`,
          subLabel: `Gecikmede (${p.amount.toLocaleString('tr-TR')} ₺)`,
          isOverdue: true,
          date: d
        });
      });
    }

    // Cari ve ileriye dönük sonraki 6 ay
    let runner = new Date(initialBaseDate);
    for (let i = 0; i < 6; i++) {
      const m = runner.getMonth() + 1;
      const y = runner.getFullYear();
      if (!list.some(item => item.month === m && item.year === y)) {
        list.push({
          month: m,
          year: y,
          label: `${TURKISH_MONTHS.find(tm => tm.value === m)?.name} ${y}`,
          subLabel: i === 0 ? 'Vadesi Gelen Dönem' : 'Gelecek Dönem',
          isOverdue: false,
          date: new Date(runner)
        });
      }
      runner = addMonthsToDate(runner, 1);
    }

    return list;
  }, [rentInfo, initialBaseDate]);

  // Seçilen ay sayısına göre dönemleri ve hesaplanan tutarı bul
  const selectedPeriods = useMemo(() => {
    const periods = [];
    let runningStart = new Date(activeStartDate);

    for (let i = 0; i < monthsCount; i++) {
      const periodStart = new Date(runningStart);
      const periodEnd = addMonthsToDate(periodStart, 1);
      const periodPrice = getPriceForDate(periodStart, settings, bike);

      periods.push({
        index: i + 1,
        start: periodStart,
        end: periodEnd,
        startStr: formatDateTR(periodStart),
        endStr: formatDateTR(periodEnd),
        monthName: formatMonthYearTR(periodStart),
        price: periodPrice
      });

      runningStart = periodEnd;
    }
    return periods;
  }, [activeStartDate, monthsCount, settings, bike]);

  const calculatedTotal = useMemo(() => {
    return selectedPeriods.reduce((acc, p) => acc + p.price, 0);
  }, [selectedPeriods]);

  // Tutar değişimi veya dönem seçimi değiştiğinde tutarı güncelle
  useEffect(() => {
    setCustomAmountStr(String(calculatedTotal));
  }, [calculatedTotal]);

  const finalCoverageStartStr = formatDateTR(activeStartDate);
  const finalCoverageEnd = addMonthsToDate(activeStartDate, monthsCount);
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

  const handleSelectPeriod = (m, y) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    const joinDay = rentInfo.validUntilDate ? new Date(rentInfo.validUntilDate).getDate() : 1;
    const yStr = String(y);
    const mStr = String(m).padStart(2, '0');
    const dStr = String(joinDay).padStart(2, '0');
    setExactStartDateStr(`${yStr}-${mStr}-${dStr}`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#141822] border-2 border-purple-500/70 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Üst Başlık */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between shrink-0">
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
                {bike.brand} {bike.model} • Garaj Üyesi: {rentInfo.joinDateFormatted || rentInfo.garageJoinDate}
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
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
          
          {/* 1. SEÇİM MODU GEÇİŞİ: DÖNEM FORMATI vs TARİH FORMATI */}
          <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                Tahsil Edilecek Dönem & Tarih
              </span>

              {/* Format Değiştirme Butonları */}
              <div className="flex items-center p-0.5 rounded-xl bg-black border border-purple-500/30 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setSelectMode('PERIOD')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectMode === 'PERIOD'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Dönem Formatı (Ay/Yıl)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectMode('EXACT_DATE')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectMode === 'EXACT_DATE'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Tarih Formatı (Gün/Ay/Yıl)
                </button>
              </div>
            </div>

            {/* SEÇENEK A: DÖNEM FORMATI (Önerilen Hızlı Dönemler + Ay/Yıl Dropdown) */}
            {selectMode === 'PERIOD' ? (
              <div className="space-y-2.5">
                {/* Hızlı Dönem Butonları */}
                <div>
                  <span className="text-[11px] text-gray-400 font-bold block mb-1.5">
                    Hangi Dönemden Başlayacak?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {recommendedPeriods.map((p, idx) => {
                      const isSelected = p.month === selectedMonth && p.year === selectedYear;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleSelectPeriod(p.month, p.year)}
                          className={`p-2 rounded-xl text-left border transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-purple-600 border-purple-400 text-white shadow-md scale-[1.01]'
                              : p.isOverdue
                                ? 'bg-red-950/40 border-red-800/60 text-red-200 hover:border-red-500'
                                : 'bg-black/60 border-gray-800 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-black text-xs">{p.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className={`text-[10px] ${isSelected ? 'text-purple-200 font-bold' : (p.isOverdue ? 'text-red-400 font-bold' : 'text-gray-500')}`}>
                            {p.subLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ay ve Yıl Seçicisi (Dropdown) */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-500/20">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Başlangıç Ayı</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => handleSelectPeriod(parseInt(e.target.value, 10), selectedYear)}
                      className="w-full bg-black border-2 border-purple-500/60 rounded-xl px-3 py-2 text-white font-bold text-xs outline-none cursor-pointer"
                    >
                      {TURKISH_MONTHS.map(m => (
                        <option key={m.value} value={m.value}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Başlangıç Yılı</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => handleSelectPeriod(selectedMonth, parseInt(e.target.value, 10))}
                      className="w-full bg-black border-2 border-purple-500/60 rounded-xl px-3 py-2 text-white font-bold text-xs outline-none cursor-pointer"
                    >
                      {AVAILABLE_YEARS.map(y => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* SEÇENEK B: TAM TARİH FORMATI (Gün / Ay / Yıl Dropdown) */
              <div>
                <DateSelectPicker
                  label="Başlangıç Tarihi (Gün / Ay / Yıl)"
                  value={exactStartDateStr}
                  onChange={(val) => setExactStartDateStr(val)}
                  color="purple"
                  showPresets={true}
                />
              </div>
            )}

            {/* Kaç Aylık Tahsilat Yapılacak? */}
            <div className="pt-2 border-t border-purple-500/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300">Tahsilat Süresi (Ay Sayısı):</span>
                <span className="text-[11px] font-black text-emerald-400">{monthsCount} Ay Seçili</span>
              </div>

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
            </div>

            {/* Kapsanan Tarih & Vade Bilgisi */}
            <div className="p-2.5 rounded-xl bg-black/50 border border-purple-500/30 flex items-center justify-between text-xs">
              <span className="text-gray-400">Kapsanan Dönem:</span>
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
                (İndirimli veya farklı tutar girilebilir)
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
                Tam Tutar ({calculatedTotal.toLocaleString('tr-TR')} ₺)
              </button>
              <button
                type="button"
                onClick={() => setCustomAmountStr('0')}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-gray-300"
              >
                0 ₺ (Ücretsiz/Muaf)
              </button>
            </div>
          </div>

          {/* 3. Ödeme Yöntemi */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center">
              <CreditCard className="w-3.5 h-3.5 mr-1 text-purple-400" />
              Ödeme Yöntemi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Nakit', 'Havale / EFT', 'Kredi Kartı'].map(method => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    paymentMethod === method
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span>{method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. İşlem Notu & Hızlı Şablonlar */}
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
            {/* Hızlı Not Şablonları */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {[
                'Elden nakit teslim alındı',
                'Banka havalesi ile ödendi',
                'POS / Kredi kartı çekildi',
                'Peşin ödendi'
              ].map((template, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setNote(template)}
                  className="px-2 py-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-400 hover:text-white border border-gray-700 transition"
                >
                  + {template}
                </button>
              ))}
            </div>
          </div>

          </div>

          {/* Alt Butonlar */}
          <div className="p-3 sm:p-4 bg-gray-950/95 border-t border-gray-800 flex items-center justify-end space-x-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition transform active:scale-95 disabled:opacity-50"
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
