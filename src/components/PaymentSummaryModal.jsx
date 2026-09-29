import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft, 
  Clock, 
  User, 
  Ticket, 
  Play, 
  Plus, 
  CheckCircle2,
  Eye
} from 'lucide-react';

export default function PaymentSummaryModal({ 
  bike, 
  onClose, 
  onOpenAddEntries, 
  onOpenTrackEntry,
  currentUser 
}) {
  if (!bike) return null;

  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'entries'

  const remaining = bike.remainingEntries ?? 0;
  const totalGranted = bike.totalEntriesGranted ?? 0;
  const isExpired = remaining <= 0;

  // Ödeme kayıtlarını ayıkla
  const allHistory = Array.isArray(bike.entryHistory) ? bike.entryHistory : [];
  
  // Gerçek ödeme kayıtları (type === 'PAYMENT' veya içinde ödeme notu geçenler)
  const paymentRecords = allHistory.filter(h => 
    h.type === 'PAYMENT' || 
    (h.note && (h.note.includes('ödendi') || h.note.includes('Ödeme') || h.note.includes('paket') || h.note.includes('TL')))
  );

  // Seans çıkış kayıtları
  const entryRecords = allHistory.filter(h => 
    h.type === 'ENTRY' || 
    (h.note && (h.note.includes('piste') || h.note.includes('Piste') || h.note.includes('seans')))
  );

  // Sadece sisteme gerçek girilmiş ödeme kayıtlarını göster (otomatik tahsilat kaydı atılmaz)
  const displayPayments = paymentRecords;
  const totalPaid = paymentRecords.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || (bike.paymentAmount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#111622] border border-cyan-500/50 sm:border-2 sm:border-cyan-500/70 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-6 max-h-[92vh] flex flex-col">
        
        {/* 1. ÜST BAŞLIK & PİLOT KÜNYESİ */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-cyan-950 via-gray-900 to-black border-b border-cyan-500/40 relative shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-600 text-white font-black text-lg sm:text-2xl italic flex items-center justify-center shadow-lg shadow-cyan-600/30 border border-white/20 shrink-0">
                #{bike.raceNumber}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase">
                    {bike.garageNo} • ÖZET
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[9px] border border-cyan-800">
                    ID: {bike.id}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-white tracking-tight truncate">
                  {bike.owner?.fullName}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-300 font-semibold truncate">
                  {bike.brand} {bike.model} • Tel: {bike.owner?.phone}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 text-gray-400 hover:text-white hover:bg-black transition border border-white/10 shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* 2. HIZLI ÖZET İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 p-2.5 sm:p-4 bg-black/50 border-b border-gray-800 text-center shrink-0">
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase block">Kalan</span>
            <span className={`text-sm sm:text-xl font-black block truncate ${isExpired ? 'text-red-500' : 'text-emerald-400'}`}>
              {remaining} Seans
            </span>
          </div>

          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase block">Yüklenen</span>
            <span className="text-sm sm:text-xl font-black text-cyan-400 block truncate">
              {totalGranted} Seans
            </span>
          </div>

          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase block">Tahsilat</span>
            <span className="text-sm sm:text-xl font-black text-amber-400 block truncate">
              {Number(totalPaid).toLocaleString('tr-TR')} ₺
            </span>
          </div>
        </div>

        {/* 3. SEKME GEÇİŞİ */}
        <div className="px-3 sm:px-5 pt-2.5 sm:pt-3 flex space-x-1 sm:space-x-2 border-b border-gray-800 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-2.5 px-2.5 sm:px-3 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'payments'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Ödemeler ({displayPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('entries')}
            className={`pb-2.5 px-2.5 sm:px-3 text-[11px] sm:text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'entries'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Pist Çıkışları ({entryRecords.length})</span>
          </button>
        </div>

        {/* 4. SEKME İÇERİĞİ (KAYDIRILABİLİR ALAN) */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-2.5 sm:space-y-3 flex-1">
          
          {/* A. ÖDEME GEÇMİŞİ LİSTESİ */}
          {activeTab === 'payments' && (
            <div className="space-y-2.5">
              {displayPayments.map((pay, idx) => {
                const method = pay.method || 'Nakit';
                const isCard = method.toLowerCase().includes('kart');
                const isHavale = method.toLowerCase().includes('havale') || method.toLowerCase().includes('eft');
                
                return (
                  <div 
                    key={pay.id || idx}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-900/90 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow"
                  >
                    <div className="flex items-start space-x-2.5 sm:space-x-3">
                      <div className={`p-2 rounded-xl text-white shrink-0 mt-0.5 ${
                        isCard ? 'bg-purple-600' : isHavale ? 'bg-blue-600' : 'bg-emerald-600'
                      }`}>
                        {isCard ? <CreditCard className="w-4 h-4" /> : isHavale ? <ArrowRightLeft className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-sm sm:text-base font-black text-white">
                            {pay.amount ? `${Number(pay.amount).toLocaleString('tr-TR')} ₺` : 'Ödeme Kaydı'}
                          </span>
                          
                          <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                            isCard 
                              ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                              : isHavale 
                              ? 'bg-blue-950 text-blue-300 border border-blue-800' 
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {method}
                          </span>

                          {pay.entriesCount && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 text-[9px] sm:text-[10px] font-bold border border-amber-800/80">
                              +{pay.entriesCount} Seans
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5 font-medium">
                          {pay.note || 'Pist seans paketi ödemesi'}
                        </p>

                        <div className="flex items-center space-x-2.5 text-[10px] text-gray-500 mt-1 font-mono flex-wrap">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-gray-400" />
                            {pay.date}
                          </span>
                          {pay.performedBy && (
                            <span className="flex items-center text-gray-400">
                              <User className="w-3 h-3 mr-1" />
                              {pay.performedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="self-end sm:self-center shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-400 text-[10px] sm:text-xs font-black inline-flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Tahsil Edildi
                      </span>
                    </div>
                  </div>
                );
              })}

              {displayPayments.length === 0 && (
                <div className="py-10 px-4 text-center rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
                  <Receipt className="w-10 h-10 text-gray-600 mx-auto" />
                  <div className="text-sm font-bold text-gray-300">
                    Henüz Tahsilat / Ödeme Kaydı Yok
                  </div>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Bu motor için henüz bir ödeme veya seans paketi tahsilatı girilmemiştir.
                  </p>
                  {currentUser?.role !== 'VIEWER' && (
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenAddEntries) onOpenAddEntries(bike);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs inline-flex items-center space-x-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ İlk Tahsilatı & Hak Paketini Gir</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* B. PİSTE ÇIKIŞ (SEANS) LİSTESİ */}
          {activeTab === 'entries' && (
            <div className="space-y-2">
              {entryRecords.map((ent, idx) => {
                const count = ent.deductCount || (ent.note?.match(/-(\d+)\s*Hak/i)?.[1]) || (ent.note?.match(/(\d+)\s*seans/i)?.[1]) || 1;
                return (
                  <div 
                    key={ent.id || idx}
                    className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-800/60 text-red-400 flex items-center justify-center font-black shrink-0">
                        🏁
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">
                          {ent.note || `Piste Çıkış Yapıldı (-${count} Hak)`}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono flex items-center mt-0.5">
                          <Clock className="w-3 h-3 mr-1 text-gray-400" />
                          {ent.date}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-lg bg-red-950/70 border border-red-800/80 text-red-400 font-mono font-bold text-[10px] shrink-0">
                      -{count} Hak
                    </span>
                  </div>
                );
              })}

              {entryRecords.length === 0 && (
                <div className="py-10 text-center text-gray-500 text-xs">
                  Bu motor ile henüz piste çıkış yapılmamış.
                </div>
              )}
            </div>
          )}

        </div>

        {/* 5. ALT AKSİYONLAR */}
        <div className="p-3 sm:p-4 bg-gray-900 border-t border-gray-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-[11px] text-gray-400 font-semibold hidden sm:block">
            Tüm ödemeler ve seans düşümleri loglanır.
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onOpenTrackEntry && !isViewer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTrackEntry(bike);
                }}
                disabled={isExpired}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs flex items-center justify-center space-x-1 shadow transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Piste Çıkış</span>
              </button>
            )}

            {onOpenAddEntries && !isViewer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddEntries(bike);
                }}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center justify-center space-x-1 shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Hak / Ödeme</span>
              </button>
            )}

            {isViewer && (
              <div className="px-3 py-1.5 rounded-xl bg-gray-800/70 border border-gray-700 text-gray-400 text-[11px] font-semibold flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gözlemci Modu (Hak Düşme Yetkisi Yok)</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
            >
              Kapat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
