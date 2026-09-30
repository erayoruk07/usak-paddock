import React, { useState } from 'react';
import { X, Calendar, Banknote, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';

export default function EditBikeRentModal({ 
  bike, 
  rentInfo, 
  settings, 
  onClose, 
  onSave 
}) {
  if (!bike) return null;

  const defaultFee = settings?.defaultMonthlyRent || 5000;
  const [customRent, setCustomRent] = useState(
    bike.customMonthlyRent !== undefined ? String(bike.customMonthlyRent) : String(defaultFee)
  );
  const [joinDate, setJoinDate] = useState(
    bike.garageJoinDate || (bike.createdAt ? bike.createdAt.split('T')[0] : '2026-01-15')
  );
  const [useDefault, setUseDefault] = useState(!bike.customMonthlyRent);

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomRent(val ? String(parseInt(val, 10)) : '0');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedBike = {
      ...bike,
      customMonthlyRent: useDefault ? null : parseInt(customRent, 10),
      garageJoinDate: joinDate
    };

    onSave(updatedBike);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#141822] border-2 border-purple-500/70 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Üst Başlık */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-xl italic flex items-center justify-center shrink-0">
              #{bike.raceNumber}
            </div>
            <div>
              <h3 className="text-base font-black text-white truncate">
                Özel Kira & Üyelik Ayarları
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {bike.owner?.fullName} • {bike.garageNo}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          
          {/* Garaj Üyelik / Giriş Tarihi */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-purple-400" />
              Garaj Üyelik / Başlangıç Tarihi
            </label>
            <input 
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="w-full bg-black border-2 border-gray-700 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Pilotun motosikletini garaja ilk getirdiği üyelik tarihidir.
            </p>
          </div>

          {/* Aylık Kira Ücreti */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center">
                <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Bu Motosiklet İçin Aylık Kira
              </span>
            </label>

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={useDefault}
                  onChange={(e) => {
                    setUseDefault(e.target.checked);
                    if (e.target.checked) setCustomRent(String(defaultFee));
                  }}
                  className="rounded border-gray-700 text-purple-600 focus:ring-purple-500"
                />
                <span>Genel Varsayılan Ücreti Kullan ({defaultFee.toLocaleString('tr-TR')} ₺)</span>
              </label>
            </div>

            {!useDefault && (
              <div className="relative pt-1 animate-fade-in">
                <input 
                  type="text"
                  inputMode="numeric"
                  value={customRent}
                  onChange={handleAmountChange}
                  placeholder="Özel kira bedeli girin"
                  className="w-full bg-black border-2 border-emerald-500/80 rounded-xl pl-3.5 pr-12 py-2.5 text-base font-black text-emerald-400 font-mono outline-none"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs pt-1">
                  TL / Ay
                </span>
              </div>
            )}
          </div>

          {/* Butonlar */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center space-x-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kaydet</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
