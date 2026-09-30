import React, { useState } from 'react';
import { X, Settings, Banknote, Calendar, CreditCard, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { formatDateTR } from '../utils/garageRentHelper';

export default function RentSettingsModal({ 
  currentSettings, 
  onClose, 
  onSaveSettings 
}) {
  const [defaultRent, setDefaultRent] = useState(String(currentSettings?.defaultMonthlyRent || 5000));
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankName, setBankName] = useState(currentSettings?.bankName || 'Ziraat Bankası');
  const [iban, setIban] = useState(currentSettings?.iban || 'TR12 0001 0000 1234 5678 9001');
  const [accountHolder, setAccountHolder] = useState(currentSettings?.accountHolder || 'Uşak Yarış Pisti Paddock İşletmesi');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const priceHistory = currentSettings?.priceHistory || [
    { effectiveFrom: '2026-01-01', amount: 5000 }
  ];

  const handleRentChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setDefaultRent(val ? String(parseInt(val, 10)) : '0');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRent = parseInt(defaultRent, 10) || 5000;

    // Fiyat geçmişine yeni yürürlük tarihi ekle veya güncelle
    let updatedHistory = [...priceHistory];
    const existingIndex = updatedHistory.findIndex(p => p.effectiveFrom === effectiveDate);

    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = { effectiveFrom: effectiveDate, amount: newRent };
    } else {
      updatedHistory.push({ effectiveFrom: effectiveDate, amount: newRent });
    }

    // Tarihe göre azalan sırala
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#141822] border-2 border-purple-500/70 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Üst Başlık */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                Garaj Kira ve Fiyat Ayarları
              </h3>
              <p className="text-xs text-gray-400">Genel kira tarifesi ve yürürlük tarihi</p>
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
          
          {/* Kira Artışı & Yürürlük Tarihi */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center">
                <Banknote className="w-4 h-4 mr-1.5 text-emerald-400" />
                Aylık Garaj Kira Bedeli
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-700">
                Genel Tarife
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">Yeni Kira Tutarı (TL)</label>
                <div className="relative">
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={defaultRent}
                    onChange={handleRentChange}
                    className="w-full bg-black border-2 border-purple-500/60 focus:border-purple-400 rounded-xl pl-3 pr-10 py-2.5 text-lg font-black text-white font-mono outline-none"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    TL
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-purple-400" />
                  Yürürlük Tarihi
                </label>
                <input 
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full bg-black border-2 border-gray-700 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none"
                  required
                />
              </div>
            </div>

            {/* Bilgilendirme Notu */}
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>Adil Fiyatlama Kuralı:</strong> Yeni kira bedeli yalnızca seçilen yürürlük tarihinden sonra başlayan yeni dönemlere uygulanır. Bu tarihten önceki ödenmemiş veya gecikmiş dönemler o günün eski fiyatından hesaplanmaya devam eder.
              </span>
            </div>
          </div>

          {/* Fiyat Değişiklik Geçmişi */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <History className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Tarife Geçmişi
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {priceHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between text-xs"
                >
                  <span className="text-gray-300">
                    📅 <strong>{formatDateTR(item.effectiveFrom)}</strong> tarihinden itibaren:
                  </span>
                  <span className="font-mono font-black text-emerald-400">
                    {Number(item.amount).toLocaleString('tr-TR')} ₺ / Ay
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Banka & IBAN Bilgileri (WhatsApp Tahsilat İçin) */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center">
              <CreditCard className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              WhatsApp Tahsilat İçin Banka / IBAN Bilgisi
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Banka Adı</label>
                <input 
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="örn: Ziraat Bankası"
                  className="w-full bg-black border border-gray-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">Hesap Sahibi / Alıcı</label>
                <input 
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="örn: Uşak Yarış Pisti A.Ş."
                  className="w-full bg-black border border-gray-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">IBAN Numarası</label>
              <input 
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="TR12 0001 0000 1234 5678 9001"
                className="w-full bg-black border border-gray-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono font-bold outline-none"
                required
              />
            </div>
          </div>

          {/* Başarı Bildirimi */}
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Yeni kira tarifesi ve yürürlük tarihi kaydedildi!</span>
            </div>
          )}

          {/* Butonlar */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
            >
              Kapat
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tarifeyi Kaydet</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
