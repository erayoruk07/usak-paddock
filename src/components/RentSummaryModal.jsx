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
  Heart, 
  Phone, 
  Edit3 
} from 'lucide-react';
import { formatDateTR } from '../utils/garageRentHelper';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#141822] border-2 border-purple-500/80 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* 1. ÜST BAŞLIK & PİLOT KÜNYESİ */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-gray-900 to-black border-b border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-2xl italic flex items-center justify-center shadow-lg shadow-purple-600/40 shrink-0">
              #{bike.raceNumber}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-[10px] text-purple-400 font-black tracking-widest uppercase">
                  {bike.garageNo} • GARAJ KİRA ÖZETİ
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-red-950 border border-red-700 text-red-400 font-black text-[10px] flex items-center">
                  <Heart className="w-2.5 h-2.5 mr-1 fill-red-500 text-red-500" />
                  {bike.owner?.bloodType || "Kan Grubu Yok"}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white truncate">
                {bike.owner?.fullName}
              </h3>
              <p className="text-xs text-gray-300 font-semibold truncate">
                {bike.brand} {bike.model} • Tel: {bike.owner?.phone}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 text-gray-400 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. DÖRT ANA ÖZET METRİK KARTLARI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-4 bg-black/40 border-b border-gray-800 shrink-0">
          
          {/* Garaj Kayıt Tarihi */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Garaj Kayıt</span>
            <span className="text-xs sm:text-sm font-black text-white block mt-0.5">
              {rentInfo.joinDateFormatted}
            </span>
            <span className="text-[9px] text-purple-300 font-medium block">
              Üyelik Başlangıcı
            </span>
          </div>

          {/* Bugüne Kadar Ödenen Toplam Kira */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Ödenen Kira</span>
            <span className="text-sm sm:text-base font-black text-emerald-400 font-mono block mt-0.5">
              {rentInfo.totalRentPaid.toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-[9px] text-emerald-500 font-medium block">
              {rentInfo.paidPeriodsCount} Dönem Tahsil Edildi
            </span>
          </div>

          {/* Hangi Tarihe Kadar Vadesi Var (Kapsanan Son Tarih) */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gray-900/90 border border-gray-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Kira Bitiş Vadesi</span>
            <span className={`text-xs sm:text-sm font-black block mt-0.5 ${
              isPaid ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {rentInfo.validUntilStr}
            </span>
            <span className="text-[9px] text-gray-400 block truncate">
              {isPaid ? '✅ Bu tarihe kadar ödendi' : `⚠️ ${rentInfo.overdueDays} gün gecikti`}
            </span>
          </div>

          {/* Aylık Kira Bedeli */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Aylık Kira</span>
            <span className="text-sm sm:text-base font-black text-purple-400 font-mono block mt-0.5">
              {rentInfo.monthlyRent.toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-[9px] text-purple-300 block">
              {rentInfo.isCustomRent ? 'Özel Tarife' : 'Standart Tarife'}
            </span>
          </div>

        </div>

        {/* 3. DETAY İÇERİĞİ (VADE DURUMU & GEÇMİŞ LİSTESİ) */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          
          {/* Durum Banner'ı */}
          {isPaid ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-black text-white text-sm">
                    Kira Ödemesi Güncel (Vadesi Gelmedi)
                  </div>
                  <div className="text-emerald-300 text-[11px] mt-0.5">
                    Bu motosiklet için <strong>{rentInfo.validUntilStr}</strong> tarihine kadar tüm garaj kullanım kiraları eksiksiz ödenmiştir.
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs shrink-0 hidden sm:inline-block">
                Ödendi
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
                  <span className="font-black text-white text-sm">
                    Kira Vadesi Geçmiş ({rentInfo.overdueDays} Gün Gecikmede)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-xs">
                  {rentInfo.totalOverdueDebt.toLocaleString('tr-TR')} ₺ Borç
                </span>
              </div>

              <div className="text-red-200 text-[11px]">
                Son ödenen dönemin bitiş tarihi <strong>{rentInfo.validUntilStr}</strong> idi. Bu tarihten bugüne kadar olan ödenmemiş dönemler aşağıdadır:
              </div>

              {/* Gecikmiş Dönemler Listesi */}
              {rentInfo.unpaidPeriods && rentInfo.unpaidPeriods.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {rentInfo.unpaidPeriods.map((p, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-black/60 border border-red-900/60 flex items-center justify-between text-xs">
                      <span className="text-gray-300 font-medium">
                        🗓️ {p.label} ({p.periodName})
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-red-400 font-bold">
                          {p.overdueDays} gün gecikti
                        </span>
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

          {/* Tahsil Edilen Kira Geçmişi */}
          <div className="space-y-2">
            <div className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center">
                <Receipt className="w-4 h-4 mr-1.5 text-purple-400" />
                Tahsil Edilen Kira Makbuzları ({rentInfo.rentPayments?.length || 0})
              </span>
            </div>

            {rentInfo.rentPayments && rentInfo.rentPayments.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {rentInfo.rentPayments.map((p, idx) => (
                  <div key={p.id || idx} className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">
                        {p.period || 'Garaj Kirası'}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {p.date} • {p.method || 'Nakit'} {p.coverageStart && `(${p.coverageStart} - ${p.coverageEnd})`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-emerald-400">
                        +{Number(p.amount || 0).toLocaleString('tr-TR')} ₺
                      </div>
                      <span className="text-[9px] text-emerald-500 font-bold">Ödendi</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 text-center text-xs text-gray-500">
                Bu motor için sisteme henüz geçmiş bir kira ödemesi girilmemiş.
              </div>
            )}
          </div>

        </div>

        {/* 4. ALT AKSİYONLAR */}
        <div className="p-3 sm:p-4 bg-gray-900 border-t border-gray-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenEdit(bike);
              }}
              className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Kayıt Tarihi / Özel Fiyat</span>
            </button>

            <button
              onClick={() => {
                onSendWhatsApp(bike, rentInfo);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Bildirimi</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
            >
              Kapat
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenPayment(bike);
              }}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-600/30"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>+ Kira Tahsil Et</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
