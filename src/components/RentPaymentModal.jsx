import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CreditCard, 
  Banknote, 
  Calendar, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight,
  Clock, 
  AlertTriangle,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  formatPeriod,
  getPriceForPeriod
} from '../utils/garageRentHelper';
import { TURKISH_MONTHS, AVAILABLE_YEARS } from './CustomDateSelectors';

export default function RentPaymentModal({ 
  bike, 
  rentInfo, 
  settings, 
  onClose, 
  onSavePayment 
}) {
  if (!bike || !rentInfo) return null;

  // Varsayılan ödenecek dönem: İlk ödenmemiş dönem (veya sıradaki vadesi gelen dönem)
  const defaultPeriod = useMemo(() => {
    if (rentInfo.unpaidPeriods && rentInfo.unpaidPeriods.length > 0) {
      return {
        month: rentInfo.unpaidPeriods[0].month,
        year: rentInfo.unpaidPeriods[0].year
      };
    }
    if (rentInfo.nextDuePeriod) {
      return {
        month: rentInfo.nextDuePeriod.month,
        year: rentInfo.nextDuePeriod.year
      };
    }
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  }, [rentInfo]);

  const [selectedYear, setSelectedYear] = useState(defaultPeriod.year);
  const [selectedMonth, setSelectedMonth] = useState(defaultPeriod.month);
  const [paymentMethod, setPaymentMethod] = useState('Nakit'); // 'Nakit', 'Havale / EFT', 'Kredi Kartı'
  const [customAmountStr, setCustomAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Güncel cari dönem endeksi
  const now = new Date();
  const currentIndex = now.getFullYear() * 12 + now.getMonth();

  // Seçilen dönem bilgileri
  const selectedPeriodCode = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const selectedIndex = selectedYear * 12 + (selectedMonth - 1);
  const selectedPeriodLabel = formatPeriod(selectedYear, selectedMonth);

  // MÜKERRER ÖDEME KONTROLÜ
  // Eğer bu dönem daha önce ödendiyse kesinlikle tekrar ödeme alınamaz
  const isAlreadyPaid = useMemo(() => {
    if (Array.isArray(rentInfo.paidPeriodCodes) && rentInfo.paidPeriodCodes.includes(selectedPeriodCode)) {
      return true;
    }
    return false;
  }, [selectedPeriodCode, rentInfo]);

  // Seçilen dönemin fiyatı
  const periodPrice = useMemo(() => {
    return getPriceForPeriod(selectedYear, selectedMonth, settings, bike);
  }, [selectedYear, selectedMonth, settings, bike]);

  // Dönem veya yıl değiştiğinde tutarı otomatik güncelle
  useEffect(() => {
    if (!isAlreadyPaid) {
      setCustomAmountStr(String(periodPrice));
    }
  }, [periodPrice, isAlreadyPaid]);

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
    if (isSubmitting || isAlreadyPaid) return;

    const finalAmount = parseInt(customAmountStr, 10) || 0;
    setIsSubmitting(true);

    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

    const nowDate = new Date();
    const dateStr = nowDate.toLocaleDateString('tr-TR') + ' ' + nowDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const newPaymentRecord = {
      id: 'rent_' + Date.now(),
      type: 'RENT_PAYMENT',
      date: dateStr,
      amount: finalAmount,
      method: paymentMethod,
      period: selectedPeriodLabel,
      periodCount: 1,
      periodCode: selectedPeriodCode,
      coverageStart: selectedPeriodLabel,
      coverageEnd: selectedPeriodLabel,
      note: note.trim() || `${selectedPeriodLabel} Garaj Kirası Tahsil Edildi (${paymentMethod})`
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
                {bike.brand} {bike.model} • Garaj Kayıt: {rentInfo.joinDateFormatted || rentInfo.garageJoinDate}
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
          
            {/* 1. ÖDENECEK KİRA DÖNEMİ: YIL SEÇİCİ & 12 AY TAKVİMİ */}
            <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-3">
              
              {/* Yıl Seçim Çubuğu */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                  Ödenen Dönem
                </span>

                {/* Yıl Değiştirme Butonları (Hızlı Yıl Seçimi) */}
                <div className="flex items-center space-x-1 bg-black/80 p-1 rounded-xl border border-purple-500/30">
                  <button
                    type="button"
                    onClick={() => setSelectedYear(prev => prev - 1)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                    title="Önceki Yıl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Son 3-4 Yıl Hızlı Butonları */}
                  {[2025, 2026, 2027, 2028].map(y => (
                    <button
                      type="button"
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                        selectedYear === y
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                      }`}
                    >
                      {y}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSelectedYear(prev => prev + 1)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                    title="Sonraki Yıl"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 12 AY KARTLARI (3x4 Grid - İlgili Sene İçin Tüm Aylar) */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {TURKISH_MONTHS.map(m => {
                  const mIdx = selectedYear * 12 + (m.value - 1);
                  const mCode = `${selectedYear}-${String(m.value).padStart(2, '0')}`;
                  
                  // Bu ay ödendi mi? (Dönem bazlı bağımsız kontrol)
                  const isPaid = (rentInfo.paidPeriodCodes || []).includes(mCode);
                  
                  // Seçili mi?
                  const isSelected = selectedMonth === m.value;
                  
                  // Ödeme durumu
                  const isOverdue = !isPaid && mIdx < currentIndex;
                  const isCurrent = !isPaid && mIdx === currentIndex;
                  const isUpcoming = !isPaid && mIdx > currentIndex;

                  return (
                    <button
                      type="button"
                      key={m.value}
                      onClick={() => setSelectedMonth(m.value)}
                      className={`p-2 rounded-xl text-left border transition flex flex-col justify-between min-h-[58px] ${
                        isSelected
                          ? isPaid
                            ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/50 scale-[1.02]'
                            : 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/40 scale-[1.02]'
                          : isPaid
                          ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400 hover:border-emerald-600'
                          : isOverdue
                          ? 'bg-red-950/30 border-red-800/60 text-red-200 hover:border-red-500'
                          : isCurrent
                          ? 'bg-amber-950/30 border-amber-600/60 text-amber-200 hover:border-amber-500'
                          : 'bg-black/60 border-gray-800 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-black text-xs ${isSelected && !isPaid ? 'text-white' : ''}`}>
                          {m.name}
                        </span>
                        {isPaid ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isSelected ? (
                          <Check className="w-3.5 h-3.5 text-white shrink-0" />
                        ) : null}
                      </div>

                      {/* Durum Rozeti */}
                      <span className={`text-[9px] font-bold mt-1 block truncate ${
                        isSelected && !isPaid
                          ? 'text-purple-200'
                          : isPaid
                          ? 'text-emerald-400'
                          : isOverdue
                          ? 'text-red-400'
                          : isCurrent
                          ? 'text-amber-400'
                          : 'text-gray-500'
                      }`}>
                        {isPaid 
                          ? '✓ Ödendi' 
                          : isOverdue 
                          ? 'Gecikmede' 
                          : isCurrent 
                          ? 'Bu Ay' 
                          : 'Gelecek'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* MÜKERRER ÖDEME UYARISI VEYA SEÇİLEN DÖNEM ÖZETİ */}
              {isAlreadyPaid ? (
                <div className="p-3 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-300 text-xs font-bold flex items-center space-x-2 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <span className="font-black text-red-200 block">Bu Dönem Zaten Ödendi!</span>
                    <span className="text-[11px] text-red-300">
                      {selectedPeriodLabel} kirası daha önce tahsil edilmiştir. Mükerrer ödeme alınamaz.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-black/60 border border-purple-500/30 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Tahsil Edilen Dönem:</span>
                  <span className="font-black text-purple-300">
                    {selectedPeriodLabel} Kirası
                  </span>
                </div>
              )}
            </div>

            {/* 2. TAHSİL EDİLECEK TUTAR */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center">
                  <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Tahsil Edilecek Tutar (₺)
                </span>
                <span className="text-[10px] text-gray-400">
                  ({selectedPeriodLabel} Dönemi)
                </span>
              </label>

              <div className="relative">
                <input 
                  type="text"
                  inputMode="numeric"
                  value={customAmountStr}
                  onChange={handleAmountChange}
                  disabled={isAlreadyPaid}
                  className="w-full bg-black border-2 border-emerald-500 focus:border-emerald-400 rounded-xl pl-3.5 pr-12 py-3 text-xl font-black text-emerald-400 font-mono outline-none disabled:opacity-40 disabled:border-gray-700"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">
                  TL
                </span>
              </div>

              {/* Hızlı Tutar Aksiyonları */}
              {!isAlreadyPaid && (
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setCustomAmountStr(String(periodPrice))}
                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-gray-300"
                  >
                    Standart Tutar ({periodPrice.toLocaleString('tr-TR')} ₺)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomAmountStr('0')}
                    className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-gray-300"
                  >
                    0 ₺ (Ücretsiz/Muaf)
                  </button>
                </div>
              )}
            </div>

            {/* 3. ÖDEME YÖNTEMİ */}
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
                    disabled={isAlreadyPaid}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                      paymentMethod === method
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-black/40 border-gray-700 text-gray-400 hover:border-gray-600'
                    } disabled:opacity-40`}
                  >
                    <span>{method}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. İŞLEM NOTU & HIZLI ŞABLONLAR */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Açıklama / Makbuz Notu (Opsiyonel)
              </label>
              <input 
                type="text"
                value={note}
                disabled={isAlreadyPaid}
                onChange={(e) => setNote(e.target.value)}
                placeholder="örn: Makbuz No: 2045, elden peşin alındı..."
                className="w-full bg-black border-2 border-gray-700 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white font-medium outline-none transition disabled:opacity-40"
              />
              {/* Hızlı Not Şablonları */}
              {!isAlreadyPaid && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    'Elden nakit teslim alındı',
                    'Banka havalesi ile ödendi',
                    'POS / Kredi kartı çekildi'
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
              )}
            </div>

          </div>

          {/* ALT SABİT AKSİYON BARI */}
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
              disabled={isSubmitting || isAlreadyPaid}
              className={`px-5 sm:px-6 py-2.5 rounded-xl font-black text-xs flex items-center space-x-1.5 shadow-lg transition transform ${
                isAlreadyPaid
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 active:scale-95'
              }`}
            >
              {isAlreadyPaid ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Bu Dönem Zaten Ödendi</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tahsilatı Onayla ({parseInt(customAmountStr || 0, 10).toLocaleString('tr-TR')} ₺)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
