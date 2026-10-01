import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Banknote, Calendar, CreditCard, CheckCircle2, History, AlertCircle, Trash2 } from 'lucide-react';
import { MonthYearPicker } from './CustomDateSelectors';
import { formatPeriod, parsePeriod } from '../utils/garageRentHelper';

export default function RentSettingsModal({ 
  currentSettings, 
  onClose, 
  onSaveSettings 
}) {
  const [defaultRent, setDefaultRent] = useState(String(currentSettings?.defaultMonthlyRent || 8000));
  const [effectivePeriodStr, setEffectivePeriodStr] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [bankName, setBankName] = useState(currentSettings?.bankName || 'Ziraat Bankası');
  const [iban, setIban] = useState(currentSettings?.iban || 'TR12 0001 0000 1234 5678 9001');
  const [accountHolder, setAccountHolder] = useState(currentSettings?.accountHolder || 'Uşak Yarış Pisti Paddock İşletmesi');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [priceHistory, setPriceHistory] = useState(() => {
    if (Array.isArray(currentSettings?.priceHistory) && currentSettings.priceHistory.length > 0) {
      return [...currentSettings.priceHistory];
    }
    return [
      { effectiveFrom: '2026-01-01', amount: currentSettings?.defaultMonthlyRent || 8000 }
    ];
  });

  const handleRentChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setDefaultRent(val ? String(parseInt(val, 10)) : '0');
  };

  const handleDeleteHistoryEntry = (indexToDelete) => {
    if (priceHistory.length <= 1) {
      alert("En az bir geçerli kira tarifesi bulunmalıdır.");
      return;
    }
    const filtered = priceHistory.filter((_, idx) => idx !== indexToDelete);
    setPriceHistory(filtered);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRent = parseInt(defaultRent, 10) || 8000;
    const effectiveIso = effectivePeriodStr.length === 7 ? `${effectivePeriodStr}-01` : effectivePeriodStr;

    // Önceki geçerli kira bedelini tespit et
    const previousRent = parseInt(currentSettings?.defaultMonthlyRent, 10) || 8000;

    let updatedHistory = [...priceHistory];

    // Eğer yeni yürürlük dönemi 2026-01-01'den sonraysa ve listede daha eski bir baz kayıt yoksa ekle
    const hasBaseEntry = updatedHistory.some(p => p.effectiveFrom < effectiveIso);
    if (!hasBaseEntry && effectiveIso > '2026-01-01') {
      updatedHistory.push({ effectiveFrom: '2026-01-01', amount: previousRent });
    }

    // Yeni yürürlük dönemini ekle veya güncelle (YYYY-MM bazında kontrol)
    const targetPeriodKey = effectiveIso.substring(0, 7);
    const existingIndex = updatedHistory.findIndex(p => p.effectiveFrom.substring(0, 7) === targetPeriodKey);

    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = { effectiveFrom: effectiveIso, amount: newRent };
    } else {
      updatedHistory.push({ effectiveFrom: effectiveIso, amount: newRent });
    }

    // Tarihe göre azalan sırala (en güncel en üstte)
    updatedHistory.sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

    const updated = {
      ...currentSettings,
      defaultMonthlyRent: newRent,
      priceHistory: updatedHistory,
      bankName: bankName.trim(),
      iban: iban.trim(),
      accountHolder: accountHolder.trim()
    };

    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#141822] border-2 border-purple-500/70 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[88dvh] sm:max-h-[90vh] flex flex-col">
        
        {/* Üst Başlık (Sabit) */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Garaj Kira ve Fiyat Ayarları
              </h3>
              <p className="text-[11px] text-gray-400">Genel kira tarifesi ve yürürlük dönemi</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form İçeriği (Mobilde Rahat Kayan Alan) */}
        <form id="rent-settings-form" onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-3.5 overflow-y-auto flex-1 min-h-0 text-xs">
          
          {/* Kira Artışı & Yürürlük Dönemi */}
          <div className="p-3 sm:p-4 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center">
                <Banknote className="w-4 h-4 mr-1.5 text-emerald-400" />
                Aylık Garaj Kira Bedeli
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-700">
                Genel Tarife
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">Standart Aylık Kira Tutarı (TL)</label>
              <div className="relative">
                <input 
                  type="text"
                  inputMode="numeric"
                  value={defaultRent}
                  onChange={handleRentChange}
                  className="w-full bg-black border-2 border-purple-500/60 focus:border-purple-400 rounded-xl pl-3 pr-10 py-2 sm:py-2.5 text-base sm:text-lg font-black text-white font-mono outline-none"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  TL / Ay
                </span>
              </div>
            </div>

            {/* Yürürlük Dönemi (Ay ve Yıl Seçici) */}
            <div className="pt-2 border-t border-purple-500/20">
              <MonthYearPicker
                label="Yeni Fiyatın Yürürlük Başlangıç Dönemi"
                value={effectivePeriodStr}
                onChange={(val) => setEffectivePeriodStr(val)}
                color="purple"
                showPresets={true}
              />
            </div>

            {/* Bilgilendirme Notu */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span className="leading-snug">
                <strong>Adil Fiyatlama Kuralı:</strong> Yeni kira bedeli yalnızca seçilen yürürlük döneminden sonraki aylara uygulanır. Eski gecikmiş dönemler o dönemin fiyatından hesaplanmaya devam eder.
              </span>
            </div>
          </div>

          {/* Fiyat Değişiklik Geçmişi */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <History className="w-3.5 h-3.5 mr-1 text-cyan-400" />
              Tarife Geçmişi
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {priceHistory.map((item, idx) => {
                const p = parsePeriod(item.effectiveFrom);
                const periodLabel = formatPeriod(p.year, p.month);
                return (
                  <div 
                    key={idx}
                    className="p-2 rounded-xl bg-black/60 border border-gray-800 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 font-bold">
                        {periodLabel}'dan İtibaren:
                      </span>
                      <span className="text-emerald-400 font-black font-mono">
                        {Number(item.amount).toLocaleString('tr-TR')} ₺ / Ay
                      </span>
                    </div>

                    {priceHistory.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteHistoryEntry(idx)}
                        className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 transition"
                        title="Bu tarifeyi sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Banka & Havale / EFT Bilgileri */}
          <div className="p-3 sm:p-4 rounded-2xl bg-black/50 border border-gray-800 space-y-2.5">
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center">
              <CreditCard className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              WhatsApp & Tahsilat Banka Bilgileri
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">Banka Adı</label>
                <input 
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-black border border-gray-700 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 mb-0.5">Hesap Sahibi</label>
                <input 
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full bg-black border border-gray-700 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-0.5">IBAN Numarası</label>
              <input 
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full bg-black border border-gray-700 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono font-bold outline-none"
                required
              />
            </div>
          </div>

          {/* Başarı Bildirimi */}
          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Yeni kira tarifesi ve yürürlük dönemi başarıyla kaydedildi!</span>
            </div>
          )}

        </form>

        {/* Sabit Alt Bar (Mobilde Asla Kaybolmaz) */}
        <div className="p-3 sm:p-4 bg-gray-950/95 border-t border-gray-800 flex items-center justify-end space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
          >
            Kapat
          </button>
          <button
            type="submit"
            form="rent-settings-form"
            className="px-5 sm:px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tarifeyi Kaydet</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
