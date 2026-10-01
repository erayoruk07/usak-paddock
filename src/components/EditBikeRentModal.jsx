import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Banknote, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { MonthYearPicker } from './CustomDateSelectors';

export default function EditBikeRentModal({ 
  bike, 
  rentInfo, 
  settings, 
  onClose, 
  onSave 
}) {
  if (!bike) return null;

  const defaultFee = settings?.defaultMonthlyRent || 8000;
  const [customRent, setCustomRent] = useState(
    bike.customMonthlyRent !== undefined && bike.customMonthlyRent !== null
      ? String(bike.customMonthlyRent) 
      : String(defaultFee)
  );
  const [startPeriodStr, setStartPeriodStr] = useState(
    bike.garageStartPeriod || bike.garageJoinDate || (bike.createdAt ? bike.createdAt.split('T')[0] : '2026-01-01')
  );
  const [useDefault, setUseDefault] = useState(!bike.customMonthlyRent && bike.customMonthlyRent !== 0);

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomRent(val ? String(parseInt(val, 10)) : '0');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedBike = {
      ...bike,
      customMonthlyRent: useDefault ? null : parseInt(customRent, 10),
      garageStartPeriod: startPeriodStr,
      garageJoinDate: startPeriodStr.length === 7 ? `${startPeriodStr}-01` : startPeriodStr
    };

    onSave(updatedBike);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#141822] border-2 border-purple-500/70 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[88dvh] sm:max-h-[90vh] flex flex-col">
        
        {/* Üst Başlık (Sabit) */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-xl italic flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/30">
              #{bike.raceNumber}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white truncate">
                Özel Kira & Dönem Ayarı
              </h3>
              <p className="text-[11px] text-gray-400 truncate">
                {bike.owner?.fullName} • {bike.garageNo}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form Gövdesi (Mobilde Rahat Kayan Alan) */}
        <form id="edit-bike-rent-form" onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs">
          
          {/* Kira Başlangıç Dönemi (Ay ve Yıl) */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-2">
            <MonthYearPicker
              label="Kira Başlangıç Dönemi (Ay / Yıl)"
              value={startPeriodStr}
              onChange={(val) => setStartPeriodStr(val)}
              color="purple"
              showPresets={true}
            />
            <p className="text-[11px] text-gray-400 leading-snug">
              Motosikletin kira hesaplaması seçilen aydan itibaren dönemlik olarak sayılmaya başlar.
            </p>
          </div>

          {/* Aylık Kira Ücreti */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-black/60 border border-gray-800 space-y-2.5">
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
                <span>Genel Tarifeyi Kullan ({defaultFee.toLocaleString('tr-TR')} ₺)</span>
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

        </form>

        {/* Sabit Alt Bar (Mobilde Asla Kaybolmaz) */}
        <div className="p-3 sm:p-4 bg-gray-950/95 border-t border-gray-800 flex items-center justify-end space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
          >
            İptal
          </button>
          <button
            type="submit"
            form="edit-bike-rent-form"
            className="px-5 sm:px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Kaydet</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
