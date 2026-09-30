import React, { useState } from 'react';
import { X, CreditCard, Banknote, Building2, CheckCircle2, ArrowRightLeft, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RentPaymentModal({ 
  bike, 
  rentInfo, 
  settings, 
  onClose, 
  onSavePayment 
}) {
  if (!bike) return null;

  const defaultAmount = rentInfo?.monthlyRent || settings?.defaultMonthlyRent || 5000;
  const [period, setPeriod] = useState(rentInfo?.currentPeriod || 'Ekim 2026');
  const [amountStr, setAmountStr] = useState(String(defaultAmount));
  const [paymentMethod, setPaymentMethod] = useState('Nakit'); // 'Nakit', 'Kredi Kartı', 'Havale / EFT'
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sayı giriş formatı (baştaki sıfır takılmasını engeller)
  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val === '') {
      setAmountStr('0');
      return;
    }
    const num = parseInt(val, 10);
    setAmountStr(String(num));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const finalAmount = parseInt(amountStr, 10) || 0;
    setIsSubmitting(true);

    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const newPaymentRecord = {
      id: 'rent_' + Date.now(),
      type: 'RENT_PAYMENT',
      date: dateStr,
      amount: finalAmount,
      method: paymentMethod,
      period: period.trim(),
      note: note.trim() || `${period.trim()} Garaj Kirası Tahsil Edildi`
    };

    onSavePayment(bike, newPaymentRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#141822] border-2 border-purple-500/60 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Üst Başlık */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-600 text-white font-black text-xl italic flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
              #{bike.raceNumber}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase">
                  {bike.garageNo} • GARAJ KİRASI TAHSİLATI
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white truncate">
                {bike.owner?.fullName}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {bike.brand} {bike.model}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          
          {/* Kira Dönemi */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-purple-400" />
              Kira Dönemi (Ay / Yıl)
            </label>
            <input 
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="örn: Ekim 2026, Kasım 2026..."
              className="w-full bg-black border-2 border-gray-700 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none transition"
              required
            />
          </div>

          {/* Tahsil Edilecek Tutar */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Tahsil Edilecek Tutar (₺)
              </span>
              <span className="text-[10px] text-gray-400">
                (İndirim veya 0 ₺ uygulanabilir)
              </span>
            </label>
            <div className="relative">
              <input 
                type="text"
                inputMode="numeric"
                value={amountStr}
                onChange={handleAmountChange}
                className="w-full bg-black border-2 border-gray-700 focus:border-emerald-500 rounded-xl pl-3.5 pr-12 py-3 text-lg font-black text-emerald-400 font-mono outline-none transition"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">
                TL
              </span>
            </div>

            {/* Hızlı Tutar Butonları */}
            <div className="flex items-center space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setAmountStr(String(defaultAmount))}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-gray-300"
              >
                Varsayılan ({defaultAmount.toLocaleString('tr-TR')} ₺)
              </button>
              <button
                type="button"
                onClick={() => setAmountStr('0')}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-amber-400"
              >
                0 TL (Ücretsiz/Muaf)
              </button>
              <button
                type="button"
                onClick={() => setAmountStr(String(defaultAmount * 2))}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-bold text-gray-300"
              >
                2 Aylık ({ (defaultAmount * 2).toLocaleString('tr-TR') } ₺)
              </button>
            </div>
          </div>

          {/* Ödeme Yöntemi */}
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

          {/* İşlem Notu */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Açıklama / Makbuz Notu (Opsiyonel)
            </label>
            <input 
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="örn: Makbuz No: 1042, elden nakit alındı..."
              className="w-full bg-black border-2 border-gray-700 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white font-medium outline-none transition"
            />
          </div>

          {/* Alt Butonlar */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-gray-800">
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
              <span>Tahsilatı Onayla</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
