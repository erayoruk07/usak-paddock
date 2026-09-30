import React from 'react';
import { X, Receipt, Building2, Calendar, Banknote, CreditCard, Clock, CheckCircle2 } from 'lucide-react';

export default function RentHistoryModal({ 
  bike, 
  rentInfo, 
  onClose,
  onOpenPaymentModal 
}) {
  if (!bike || !rentInfo) return null;

  const payments = rentInfo.rentPayments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#141822] border-2 border-purple-500/60 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Üst Başlık */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-600 text-white font-black text-xl italic flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
              #{bike.raceNumber}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase">
                  {bike.garageNo} • KİRA TAHSİLAT GEÇMİŞİ
                </span>
              </div>
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

        {/* 3 Özet Kutusu */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-black/40 border-b border-gray-800 shrink-0 text-center">
          <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase block">Aylık Kira</span>
            <span className="text-xs sm:text-lg font-black text-purple-400 font-mono">
              {rentInfo.monthlyRent.toLocaleString('tr-TR')} ₺
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase block">Toplam Tahsilat</span>
            <span className="text-xs sm:text-lg font-black text-emerald-400 font-mono">
              {rentInfo.totalRentPaid.toLocaleString('tr-TR')} ₺
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase block">Kira Durumu</span>
            <span className={`text-[11px] sm:text-sm font-black block mt-0.5 truncate ${
              rentInfo.status === 'PAID' ? 'text-emerald-400' : rentInfo.status === 'OVERDUE' ? 'text-red-400' : rentInfo.status === 'UPCOMING' ? 'text-purple-400' : 'text-amber-400'
            }`}>
              {rentInfo.status === 'PAID' ? '✅ Güncel' : rentInfo.status === 'OVERDUE' ? `⚠️ ${rentInfo.statusLabel}` : rentInfo.status === 'UPCOMING' ? '✨ Başlangıç Bekliyor' : '🕒 Cari Ay Bekliyor'}
            </span>
          </div>
        </div>

        {/* Geçmiş Ödemeler Tablosu / Listesi */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-2.5">
          <div className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
            <span>Tahsil Edilen Kiralar ({payments.length}):</span>
            {onOpenPaymentModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPaymentModal(bike);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                + Yeni Kira Tahsil Et
              </button>
            )}
          </div>

          {payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map((p, idx) => (
                <div 
                  key={p.id || idx}
                  className="p-3 rounded-2xl bg-gray-900/90 border border-gray-800 flex items-center justify-between hover:border-purple-500/50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/80 text-emerald-400 flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-white">
                        {p.period || 'Garaj Kirası'}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center space-x-2 mt-0.5">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-gray-500" />
                          {p.date}
                        </span>
                        <span>•</span>
                        <span className="text-cyan-400 font-semibold">{p.method || 'Nakit'}</span>
                      </div>
                      {p.note && (
                        <div className="text-[10px] text-gray-500 italic mt-0.5">
                          {p.note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                      +{Number(p.amount || 0).toLocaleString('tr-TR')} ₺
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                      Tahsil Edildi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 bg-gray-900/40 rounded-2xl border border-gray-800">
              <Receipt className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-gray-300">Henüz Kira Ödeme Kaydı Yok</div>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Bu motor için sisteme henüz bir aylık garaj kira tahsilatı girilmemiştir.
              </p>
            </div>
          )}
        </div>

        {/* Alt Kapat */}
        <div className="p-3 bg-gray-900 border-t border-gray-800 shrink-0 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
