import React from 'react';
import { 
  Bike, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Flame
} from 'lucide-react';

export default function StatCards({ bikes, onFilterChange, currentFilter }) {
  const totalBikes = bikes.length;
  
  const totalParts = bikes.reduce((acc, bike) => acc + (bike.equippedParts?.length || 0), 0);
  
  const warmersCount = bikes.reduce((acc, bike) => {
    const hasWarmer = bike.equippedParts?.some(p => p.name.toLowerCase().includes('ısıtıcı') || p.name.toLowerCase().includes('warmer'));
    return hasWarmer ? acc + 1 : acc;
  }, 0);

  const laptimerCount = bikes.reduce((acc, bike) => {
    const hasTimer = bike.equippedParts?.some(p => p.name.toLowerCase().includes('laptimer') || p.name.toLowerCase().includes('solo') || p.name.toLowerCase().includes('gps'));
    return hasTimer ? acc + 1 : acc;
  }, 0);

  const overdueBikes = bikes.filter(b => b.rentStatus === 'OVERDUE');
  const paidBikes = bikes.filter(b => b.rentStatus === 'PAID');
  const pendingBikes = bikes.filter(b => b.rentStatus === 'PENDING');

  const overdueTotalAmount = overdueBikes.reduce((acc, b) => acc + (b.monthlyRent || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* 1. Toplam Motor Kartı */}
      <div 
        onClick={() => onFilterChange('ALL')}
        className={`cursor-pointer group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${
          currentFilter === 'ALL'
            ? 'bg-gradient-to-br from-red-950/40 via-gray-900 to-[#121620] border-red-500/50 shadow-lg shadow-red-500/10'
            : 'bg-[#151922]/80 hover:bg-[#191e2b] border-gray-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-300">
            Garajdaki Motorlar
          </span>
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20">
            <Bike className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black text-white">{totalBikes}</span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center">
            <Flame className="w-3 h-3 mr-0.5" /> %100 Kapasite
          </span>
        </div>
        <div className="mt-2 text-[11px] text-gray-400 truncate">
          Paddock A, B, C, D blokları aktif
        </div>
      </div>

      {/* 2. Donanım & Parçalar Kartı */}
      <div 
        onClick={() => onFilterChange('WARMER')}
        className={`cursor-pointer group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${
          currentFilter === 'WARMER'
            ? 'bg-gradient-to-br from-blue-950/40 via-gray-900 to-[#121620] border-cyan-500/50 shadow-lg shadow-cyan-500/10'
            : 'bg-[#151922]/80 hover:bg-[#191e2b] border-gray-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-300">
            Kayıtlı Parça & Donanım
          </span>
          <div className="p-2 rounded-xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/20">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black text-white">{totalParts}</span>
          <span className="text-xs text-cyan-400 font-medium">Toplam Ekipman</span>
        </div>
        <div className="mt-2 text-[11px] text-gray-400 truncate">
          {warmersCount} Lastik Isıtıcı • {laptimerCount} Laptimer
        </div>
      </div>

      {/* 3. Geciken Kiralar (KIRMIZI ALARM) */}
      <div 
        onClick={() => onFilterChange('OVERDUE')}
        className={`cursor-pointer group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${
          currentFilter === 'OVERDUE'
            ? 'bg-gradient-to-br from-red-950/60 via-red-900/30 to-[#151922] border-red-500 shadow-xl shadow-red-500/20'
            : overdueBikes.length > 0
              ? 'bg-red-950/20 hover:bg-red-950/30 border-red-900/50'
              : 'bg-[#151922]/80 border-gray-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400 group-hover:text-red-300 flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-500 animate-pulse" />
            Geciken Kira!
          </span>
          <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black text-red-400">{overdueBikes.length}</span>
          <span className="text-xs text-red-400/80 font-bold">Motor Gecikmede</span>
        </div>
        <div className="mt-2 text-[11px] text-red-300/80 font-medium truncate">
          Geciken Tutar: ₺{overdueTotalAmount.toLocaleString('tr-TR')}
        </div>
      </div>

      {/* 4. Ödenen Kiralar */}
      <div 
        onClick={() => onFilterChange('PAID')}
        className={`cursor-pointer group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${
          currentFilter === 'PAID'
            ? 'bg-gradient-to-br from-emerald-950/40 via-gray-900 to-[#121620] border-emerald-500/50 shadow-lg shadow-emerald-500/10'
            : 'bg-[#151922]/80 hover:bg-[#191e2b] border-gray-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-300">
            Düzenli Ödeyenler
          </span>
          <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">{paidBikes.length}</span>
          <span className="text-xs text-gray-400">/ {totalBikes} Motor</span>
        </div>
        <div className="mt-2 text-[11px] text-gray-400 truncate">
          {pendingBikes.length} motorun vadesi yaklaşıyor
        </div>
      </div>

    </div>
  );
}
