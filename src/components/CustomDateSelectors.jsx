import React, { useMemo } from 'react';
import { Calendar, ChevronDown, Clock, Check } from 'lucide-react';

export const TURKISH_MONTHS = [
  { value: 1, name: 'Ocak' },
  { value: 2, name: 'Şubat' },
  { value: 3, name: 'Mart' },
  { value: 4, name: 'Nisan' },
  { value: 5, name: 'Mayıs' },
  { value: 6, name: 'Haziran' },
  { value: 7, name: 'Temmuz' },
  { value: 8, name: 'Ağustos' },
  { value: 9, name: 'Eylül' },
  { value: 10, name: 'Ekim' },
  { value: 11, name: 'Kasım' },
  { value: 12, name: 'Aralık' }
];

export const AVAILABLE_YEARS = [2024, 2025, 2026, 2027, 2028];

/**
 * Belirli bir ay ve yılda kaç gün olduğunu hesaplar
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * 1. TAM TARİH SEÇİCİ (GÜN / AY / YIL DROPDOWN)
 * Asla elle metin yazdırmaz, tıklayarak gün, ay ve yıl seçimi sağlar.
 */
export function DateSelectPicker({ 
  value, 
  onChange, 
  label = "Tarih Seçimi", 
  color = "purple",
  showPresets = true 
}) {
  // value: 'YYYY-MM-DD'
  const dateObj = useMemo(() => {
    if (!value) {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
      };
    }
    const parts = String(value).split('-');
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10) || 2026,
        month: parseInt(parts[1], 10) || 1,
        day: parseInt(parts[2], 10) || 1
      };
    }
    return { year: 2026, month: 1, day: 1 };
  }, [value]);

  const daysInCurrentMonth = useMemo(() => {
    return getDaysInMonth(dateObj.year, dateObj.month);
  }, [dateObj.year, dateObj.month]);

  const handleUpdate = (newYear, newMonth, newDay) => {
    const maxDay = getDaysInMonth(newYear, newMonth);
    const validDay = Math.min(newDay, maxDay);
    const formatted = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
    onChange(formatted);
  };

  const handleSetToday = () => {
    const now = new Date();
    handleUpdate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  };

  const handleSetDayOne = () => {
    handleUpdate(dateObj.year, dateObj.month, 1);
  };

  const handleSetDayFifteen = () => {
    handleUpdate(dateObj.year, dateObj.month, 15);
  };

  const monthName = TURKISH_MONTHS.find(m => m.value === dateObj.month)?.name || '';

  const colorStyles = {
    purple: {
      border: 'border-purple-500/60 focus:border-purple-400',
      badge: 'bg-purple-950/60 text-purple-300 border-purple-800',
      accent: 'text-purple-400',
      btn: 'hover:bg-purple-900/50'
    },
    amber: {
      border: 'border-amber-500/60 focus:border-amber-400',
      badge: 'bg-amber-950/60 text-amber-300 border-amber-800',
      accent: 'text-amber-400',
      btn: 'hover:bg-amber-900/50'
    },
    cyan: {
      border: 'border-cyan-500/60 focus:border-cyan-400',
      badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-800',
      accent: 'text-cyan-400',
      btn: 'hover:bg-cyan-900/50'
    }
  }[color] || {
    border: 'border-purple-500/60 focus:border-purple-400',
    badge: 'bg-purple-950/60 text-purple-300 border-purple-800',
    accent: 'text-purple-400',
    btn: 'hover:bg-purple-900/50'
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300 flex items-center">
            <Calendar className={`w-3.5 h-3.5 mr-1.5 ${colorStyles.accent}`} />
            {label}
          </label>
          <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${colorStyles.badge}`}>
            {dateObj.day} {monthName} {dateObj.year}
          </span>
        </div>
      )}

      {/* 3'lü Seçim Grubu: Gün, Ay, Yıl */}
      <div className="grid grid-cols-3 gap-2">
        {/* 1. Gün Seçimi */}
        <div className="relative">
          <select
            value={dateObj.day}
            onChange={(e) => handleUpdate(dateObj.year, dateObj.month, parseInt(e.target.value, 10))}
            className={`w-full appearance-none bg-black border-2 ${colorStyles.border} rounded-xl px-3 py-2 text-white font-bold text-xs outline-none cursor-pointer pr-7`}
          >
            {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map(d => (
              <option key={d} value={d} className="bg-gray-900 text-white">
                {d} Gün
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 2. Ay Seçimi */}
        <div className="relative">
          <select
            value={dateObj.month}
            onChange={(e) => handleUpdate(dateObj.year, parseInt(e.target.value, 10), dateObj.day)}
            className={`w-full appearance-none bg-black border-2 ${colorStyles.border} rounded-xl px-3 py-2 text-white font-bold text-xs outline-none cursor-pointer pr-7`}
          >
            {TURKISH_MONTHS.map(m => (
              <option key={m.value} value={m.value} className="bg-gray-900 text-white">
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 3. Yıl Seçimi */}
        <div className="relative">
          <select
            value={dateObj.year}
            onChange={(e) => handleUpdate(parseInt(e.target.value, 10), dateObj.month, dateObj.day)}
            className={`w-full appearance-none bg-black border-2 ${colorStyles.border} rounded-xl px-3 py-2 text-white font-bold text-xs outline-none cursor-pointer pr-7`}
          >
            {AVAILABLE_YEARS.map(y => (
              <option key={y} value={y} className="bg-gray-900 text-white">
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Hızlı Kısayol Butonları */}
      {showPresets && (
        <div className="flex items-center space-x-1.5 pt-0.5">
          <span className="text-[10px] text-gray-500 font-bold">Hızlı:</span>
          <button
            type="button"
            onClick={handleSetToday}
            className="px-2 py-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-300 font-bold border border-gray-700 transition"
          >
            Bugün
          </button>
          <button
            type="button"
            onClick={handleSetDayOne}
            className="px-2 py-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-300 font-bold border border-gray-700 transition"
          >
            Ayın 1'i
          </button>
          <button
            type="button"
            onClick={handleSetDayFifteen}
            className="px-2 py-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-300 font-bold border border-gray-700 transition"
          >
            Ayın 15'i
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 2. DÖNEM SEÇİCİ (AY / YIL VE DÖNEM LİSTESİ)
 * Kira tahsilatında doğrudan "Ekim 2026", "Kasım 2026" gibi dönem formatında seçim yaptırır.
 */
export function PeriodSelectPicker({
  selectedMonth,
  selectedYear,
  onChange,
  label = "Kira Dönemi (Ay / Yıl)",
  periodsList = []
}) {
  const monthName = TURKISH_MONTHS.find(m => m.value === selectedMonth)?.name || '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
          {label}
        </label>
        <span className="text-xs font-black text-emerald-400">
          {monthName} {selectedYear}
        </span>
      </div>

      {/* Eğer önerilen dönemler listesi varsa (Örn: Geciken aylar, cari ay, sonraki aylar) hızlı butonlar sun */}
      {periodsList.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400 font-bold block">Önerilen Kira Dönemleri:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto">
            {periodsList.map((p, idx) => {
              const isSelected = p.month === selectedMonth && p.year === selectedYear;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => onChange(p.month, p.year)}
                  className={`p-2 rounded-xl text-left border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                      : p.isOverdue
                        ? 'bg-red-950/40 border-red-800/60 text-red-200 hover:border-red-500'
                        : 'bg-black/60 border-gray-800 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-black text-xs">{p.label || `${p.monthName} ${p.year}`}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  {p.subLabel && (
                    <span className={`text-[10px] ${isSelected ? 'text-purple-200' : (p.isOverdue ? 'text-red-400' : 'text-gray-500')}`}>
                      {p.subLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ay ve Yıl Dropdown Grubu */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="relative">
          <label className="text-[10px] text-gray-400 block mb-0.5">Ay</label>
          <select
            value={selectedMonth}
            onChange={(e) => onChange(parseInt(e.target.value, 10), selectedYear)}
            className="w-full appearance-none bg-black border-2 border-purple-500/60 focus:border-purple-400 rounded-xl px-3 py-2 text-white font-bold text-xs outline-none cursor-pointer pr-7"
          >
            {TURKISH_MONTHS.map(m => (
              <option key={m.value} value={m.value} className="bg-gray-900 text-white">
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 bottom-2.5 pointer-events-none" />
        </div>

        <div className="relative">
          <label className="text-[10px] text-gray-400 block mb-0.5">Yıl</label>
          <select
            value={selectedYear}
            onChange={(e) => onChange(selectedMonth, parseInt(e.target.value, 10))}
            className="w-full appearance-none bg-black border-2 border-purple-500/60 focus:border-purple-400 rounded-xl px-3 py-2 text-white font-bold text-xs outline-none cursor-pointer pr-7"
          >
            {AVAILABLE_YEARS.map(y => (
              <option key={y} value={y} className="bg-gray-900 text-white">
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 bottom-2.5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

/**
 * 3. KİRA BAŞLANGIÇ VE YÜRÜRLÜK DÖNEMİ SEÇİCİ (AY & YIL)
 * Gün bilgisini tamamen kaldırıp yalnızca "Ay" ve "Yıl" formatında dönem seçtirir.
 */
export function MonthYearPicker({
  value,
  onChange,
  label = "Kira Başlangıç Dönemi",
  color = "purple",
  showPresets = true
}) {
  const parsed = useMemo(() => {
    if (!value) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth() + 1 };
    }
    const parts = String(value).split(/[-/.]/);
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10) || 2026;
      const m = parseInt(parts[1], 10) || 1;
      return { year: y, month: m };
    }
    return { year: 2026, month: 1 };
  }, [value]);

  const handleUpdate = (newYear, newMonth) => {
    const formatted = `${newYear}-${String(newMonth).padStart(2, '0')}-01`;
    onChange(formatted);
  };

  const handleSetThisMonth = () => {
    const now = new Date();
    handleUpdate(now.getFullYear(), now.getMonth() + 1);
  };

  const handleSetNextMonth = () => {
    const now = new Date();
    let m = now.getMonth() + 2;
    let y = now.getFullYear();
    if (m > 12) {
      m = 1;
      y += 1;
    }
    handleUpdate(y, m);
  };

  const monthName = TURKISH_MONTHS.find(m => m.value === parsed.month)?.name || '';

  const colorStyles = {
    purple: {
      border: 'border-purple-500/60 focus:border-purple-400',
      badge: 'bg-purple-950/60 text-purple-300 border-purple-800',
      accent: 'text-purple-400'
    },
    amber: {
      border: 'border-amber-500/60 focus:border-amber-400',
      badge: 'bg-amber-950/60 text-amber-300 border-amber-800',
      accent: 'text-amber-400'
    }
  }[color] || {
    border: 'border-purple-500/60 focus:border-purple-400',
    badge: 'bg-purple-950/60 text-purple-300 border-purple-800',
    accent: 'text-purple-400'
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-300 flex items-center">
          <Calendar className={`w-3.5 h-3.5 mr-1.5 ${colorStyles.accent}`} />
          {label}
        </label>
        <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${colorStyles.badge}`}>
          {monthName} {parsed.year} Dönemi
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Ay Dropdown */}
        <div className="relative">
          <select
            value={parsed.month}
            onChange={(e) => handleUpdate(parsed.year, parseInt(e.target.value, 10))}
            className={`w-full appearance-none bg-black border-2 ${colorStyles.border} rounded-xl px-3 py-2 text-white font-bold text-xs outline-none cursor-pointer pr-7`}
          >
            {TURKISH_MONTHS.map(m => (
              <option key={m.value} value={m.value} className="bg-gray-900 text-white">
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Yıl Dropdown */}
        <div className="relative">
          <select
            value={parsed.year}
            onChange={(e) => handleUpdate(parseInt(e.target.value, 10), parsed.month)}
            className={`w-full appearance-none bg-black border-2 ${colorStyles.border} rounded-xl px-3 py-2 text-white font-bold text-xs outline-none cursor-pointer pr-7`}
          >
            {AVAILABLE_YEARS.map(y => (
              <option key={y} value={y} className="bg-gray-900 text-white">
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {showPresets && (
        <div className="flex items-center space-x-1.5 pt-0.5">
          <span className="text-[10px] text-gray-500 font-bold">Hızlı:</span>
          <button
            type="button"
            onClick={handleSetThisMonth}
            className="px-2 py-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-300 font-bold border border-gray-700 transition"
          >
            Bu Ay (Cari)
          </button>
          <button
            type="button"
            onClick={handleSetNextMonth}
            className="px-2 py-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-300 font-bold border border-gray-700 transition"
          >
            Gelecek Ay
          </button>
        </div>
      )}
    </div>
  );
}

