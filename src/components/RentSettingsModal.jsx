import React, { useState } from 'react';
import { X, Settings, Banknote, Building2, CreditCard, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function RentSettingsModal({ 
  currentSettings, 
  onClose, 
  onSaveSettings 
}) {
  const [defaultRent, setDefaultRent] = useState(String(currentSettings?.defaultMonthlyRent || 5000));
  const [dueDay, setDueDay] = useState(String(currentSettings?.dueDayOfMonth || 1));
  const [bankName, setBankName] = useState(currentSettings?.bankName || 'Ziraat Bankası');
  const [iban, setIban] = useState(currentSettings?.iban || 'TR12 0001 0000 1234 5678 9001');
  const [accountHolder, setAccountHolder] = useState(currentSettings?.accountHolder || 'Uşak Yarış Pisti Paddock İşletmesi');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRentChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setDefaultRent(val ? String(parseInt(val, 10)) : '0');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...currentSettings,
      defaultMonthlyRent: parseInt(defaultRent, 10) || 5000,
      dueDayOfMonth: parseInt(dueDay, 10) || 1,
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
      <div className="relative w-full max-w-lg bg-[#141822] border-2 border-purple-500/70 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Üst Başlık */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                Garaj Kira Ayarları
              </h3>
              <p className="text-xs text-gray-400">Genel kira bedeli ve banka tahsilat bilgileri</p>
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
          
          {/* Varsayılan Kira Tutarı */}
          <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <label className="block text-xs font-black text-purple-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center">
                <Banknote className="w-4 h-4 mr-1.5 text-emerald-400" />
                Varsayılan Aylık Garaj Box Kirası
              </span>
              <span className="text-[10px] text-gray-400 font-normal">
                (Tüm motorlar için baz alınır)
              </span>
            </label>
            <div className="relative">
              <input 
                type="text"
                inputMode="numeric"
                value={defaultRent}
                onChange={handleRentChange}
                className="w-full bg-black border-2 border-purple-500/50 focus:border-purple-400 rounded-xl pl-4 pr-12 py-3 text-xl font-black text-white font-mono outline-none"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">
                TL / Ay
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Yönetici olarak burada belirlediğiniz kira ücreti, özel ücret tanımlanmamış tüm garaj motorlarına otomatik yansıtılır.
            </p>
          </div>

          {/* Vade Günü Seçimi */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Ödeme Vade Günü (Her Ayın Kaçında?)
            </label>
            <select
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              className="w-full bg-black border-2 border-gray-700 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none"
            >
              <option value="1">Her Ayın 1'i (Varsayılan)</option>
              <option value="5">Her Ayın 5'i</option>
              <option value="10">Her Ayın 10'u</option>
              <option value="15">Her Ayın 15'i</option>
              <option value="20">Her Ayın 20'si</option>
            </select>
          </div>

          {/* Banka & IBAN Bilgileri (WhatsApp Mesajına Otomatik Gider) */}
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
              <span>Kira ayarları başarıyla kaydedildi! Tüm hesaplamalar güncellendi.</span>
            </div>
          )}

          {/* Butonlar */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-gray-800">
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
              <span>Ayarları Kaydet</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
