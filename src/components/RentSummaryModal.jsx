import React from 'react';
import { 
  X, 
  Calendar, 
  CreditCard, 
  Banknote, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageCircle, 
  Receipt, 
  ChevronRight, 
  Edit3,
  Sparkles
} from 'lucide-react';

export default function RentSummaryModal({ 
  bike, 
  rentInfo, 
  settings, 
  onClose, 
  onOpenPayment, 
  onOpenEdit, 
  onSendWhatsApp 
}) {
  if (!bike || !rentInfo) return null;

  const isOverdue = rentInfo.status === 'OVERDUE';
  const isPaid = rentInfo.status === 'PAID';
  const isUpcoming = rentInfo.status === 'UPCOMING';
  const isPending = rentInfo.status === 'PENDING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#141822] border-2 border-purple-500/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* 1. ÜST BAŞLIK & PİLOT KÜNYESİ (Sabit) */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-600 text-white font-black text-xl sm:text-2xl italic flex items-center justify-center shadow-lg shadow-purple-600/40 shrink-0">
              #{bike.raceNumber}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase">
                  {bike.garageNo} • GARAJ KİRA ÖZETİ
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white truncate">
                {bike.owner?.fullName}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium truncate">
                Garaj Kayıt: {rentInfo.joinDateFormatted || rentInfo.garageJoinDate}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 text-gray-400 hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 2. DÖRT ANA ÖZET METRİK KARTLARI (Mobilde 2x2 Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 sm:p-4 bg-black/40 border-b border-gray-800 shrink-0 text-xs">
          
          {/* Kira Başlangıç Dönemi */}
          <div className="p-2 sm:p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Başlangıç</span>
            <span className="text-xs sm:text-sm font-black text-white block mt-0.5 truncate">
              {rentInfo.startPeriodLabel}
            </span>
            <span className="text-[9px] text-purple-300 font-medium block">
              Kira Başlangıç Dönemi
            </span>
          </div>

          {/* Bugüne Kadar Ödenen Toplam Kira */}
          <div className="p-2 sm:p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Ödenen Kira</span>
            <span className="text-xs sm:text-base font-black text-emerald-400 font-mono block mt-0.5">
              {rentInfo.totalRentPaid.toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-[9px] text-emerald-500 font-medium block">
              {rentInfo.paidPeriodsCount} Ay Tahsil Edildi
            </span>
          </div>

          {/* Ödenen Son Dönem */}
          <div className="p-2 sm:p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Ödenen Son Dönem</span>
            <span className={`text-xs sm:text-sm font-black block mt-0.5 truncate ${
              isPaid ? 'text-emerald-400' : isUpcoming ? 'text-purple-300' : 'text-red-400'
            }`}>
              {rentInfo.paidUntilPeriodLabel}
            </span>
            <span className="text-[9px] text-gray-400 block truncate">
              {isPaid ? '✅ Dönem güncel' : isUpcoming ? '⏳ Başlamadı' : `⚠️ Ödeme Bekliyor`}
            </span>
          </div>

          {/* Aylık Kira Bedeli */}
          <div className="p-2 sm:p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Aylık Kira</span>
            <span className="text-xs sm:text-base font-black text-purple-400 font-mono block mt-0.5">
              {rentInfo.monthlyRent.toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-[9px] text-purple-300 block">
              {rentInfo.isCustomRent ? 'Özel Tarife' : 'Standart Tarife'}
            </span>
          </div>

        </div>

        {/* 3. DETAY İÇERİĞİ (Mobilde Rahat Kayan Alan) */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-3.5 text-xs">
          
          {/* DURUM BANNER'I */}
          {isUpcoming && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/60 flex items-start space-x-2.5">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-white text-sm">
                  Kira Başlangıcı Bekleniyor (Vadesi Gelmedi)
                </div>
                <div className="text-purple-300 text-[11px] mt-0.5">
                  Bu motosiklet için kira hesaplaması <strong>{rentInfo.startPeriodLabel}</strong> döneminde başlayacaktır. Henüz vadesi gelmemiştir ve gecikmiş borcu yoktur.
                </div>
              </div>
            </div>
          )}

          {isPaid && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/60 flex items-start space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-white text-sm">
                  Kira Ödemesi Güncel
                </div>
                <div className="text-emerald-300 text-[11px] mt-0.5">
                  Bu motosiklet için <strong>{rentInfo.paidUntilPeriodLabel}</strong> dönemine kadar tüm garaj kiraları eksiksiz ödenmiştir.
                </div>
              </div>
            </div>
          )}

          {isPending && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/60 flex items-start justify-between">
              <div className="flex items-start space-x-2.5">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-white text-sm">
                    {rentInfo.currentPeriodLabel} Kirası Tahsilat Bekliyor
                  </div>
                  <div className="text-amber-300 text-[11px] mt-0.5">
                    Bu ayın ({rentInfo.currentPeriodLabel}) garaj kirası henüz tahsil edilmedi.
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-600 text-white font-black text-xs shrink-0">
                {rentInfo.monthlyRent.toLocaleString('tr-TR')} ₺
              </span>
            </div>
          )}

          {isOverdue && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-red-950/40 border border-red-500/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
                  <span className="font-black text-white text-sm">
                    Kira Gecikmede ({rentInfo.statusLabel})
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-xs">
                  {rentInfo.totalOverdueDebt.toLocaleString('tr-TR')} ₺ Borç
                </span>
              </div>

              <div className="text-red-200 text-[11px]">
                Ödenmemiş geçmiş dönemler dökümü aşağıdadır:
              </div>

              {/* Gecikmiş Dönemler Listesi */}
              {rentInfo.unpaidPeriods && rentInfo.unpaidPeriods.length > 0 && (
                <div className="space-y-1 pt-1">
                  {rentInfo.unpaidPeriods.map((p, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-black/60 border border-red-900/60 flex items-center justify-between">
                      <span className="text-gray-300 font-medium">
                        🗓️ {p.periodName}
                      </span>
                      <div className="flex items-center space-x-2">
                        {p.isOverdue && (
                          <span className="text-[10px] text-red-400 font-bold">
                            Gecikmiş Ay
                          </span>
                        )}
                        <span className="font-mono font-black text-red-400">
                          {p.amount.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tahsil Edilen Kira Makbuzları */}
          <div className="space-y-2">
            <div className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center">
                <Receipt className="w-4 h-4 mr-1.5 text-purple-400" />
                Tahsil Edilen Kira Makbuzları ({rentInfo.rentPayments?.length || 0})
              </span>
            </div>

            {rentInfo.rentPayments && rentInfo.rentPayments.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {rentInfo.rentPayments.map((p, idx) => (
                  <div key={p.id || idx} className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">
                        {p.period || 'Garaj Kirası'}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {p.date} • {p.method || 'Nakit'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-emerald-400 text-xs sm:text-sm">
                        +{Number(p.amount).toLocaleString('tr-TR')} ₺
                      </div>
                      <span className="text-[9px] text-gray-500">
                        {p.periodCount ? `${p.periodCount} Ay` : 'Tahsil Edildi'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 text-center text-gray-500 text-xs">
                Bu motosiklet için henüz kayıtlı kira tahsilatı bulunmamaktadır.
              </div>
            )}
          </div>

        </div>

        {/* 4. SABİT ALT AKSİYON BARI (Mobilde Asla Kaybolmaz) */}
        <div className="p-3 sm:p-4 bg-gray-950/95 border-t border-gray-800 flex flex-wrap items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
          >
            Kapat
          </button>

          <button
            type="button"
            onClick={() => onOpenEdit(bike, rentInfo)}
            className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-700/60 text-purple-300 font-bold text-xs flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dönem & Özel Fiyat</span>
            <span className="sm:hidden">Düzenle</span>
          </button>

          <button
            type="button"
            onClick={() => onSendWhatsApp(bike, rentInfo)}
            className="px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 font-black text-xs flex items-center space-x-1"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPayment(bike, rentInfo)}
            className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-600/30"
          >
            <Banknote className="w-4 h-4" />
            <span>+ Kira Tahsil Et</span>
          </button>
        </div>

      </div>
    </div>
  );
}
