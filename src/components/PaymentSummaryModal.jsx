import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft, 
  Calendar, 
  Clock, 
  User, 
  Ticket, 
  Play, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  FileText
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
  const totalGranted = bike.totalEntriesGranted ?? 5;
  const isExpired = remaining <= 0;

  // Ödeme kayıtlarını ayıkla
  const allHistory = Array.isArray(bike.entryHistory) ? bike.entryHistory : [];
  
  // Ödeme kayıtları (type === 'PAYMENT' veya içinde ödeme notu geçenler)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#111622] border-2 border-cyan-500/70 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* 1. ÜST BAŞLIK & PİLOT KÜNYESİ */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-cyan-950 via-gray-900 to-black border-b-2 border-cyan-500/40 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-13 h-13 rounded-2xl bg-cyan-600 text-white font-black text-2xl italic flex items-center justify-center shadow-lg shadow-cyan-600/30 border border-white/20 shrink-0">
                #{bike.raceNumber}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase block">
                    {bike.garageNo} • ÖDEME & SEANS ÖZETİ
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[10px] border border-cyan-800">
                    ID: {bike.id}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {bike.owner?.fullName}
                </h3>
                <p className="text-xs text-gray-300 font-semibold">
                  {bike.brand} {bike.model} {bike.engineSize ? `(${bike.engineSize})` : ''} • Tel: {bike.owner?.phone}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 text-gray-400 hover:text-white hover:bg-black transition border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. HIZLI ÖZET İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-3 gap-3 p-4 sm:p-5 bg-black/50 border-b border-gray-800 text-center">
          <div className="p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Kalan Giriş</span>
            <span className={`text-xl sm:text-2xl font-black ${isExpired ? 'text-red-500' : 'text-emerald-400'}`}>
              {remaining} Seans
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Toplam Yüklenen</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-400">
              {totalGranted} Seans
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Toplam Tahsilat</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {Number(totalPaid).toLocaleString('tr-TR')} ₺
            </span>
          </div>
        </div>

        {/* 3. SEKME GEÇİŞİ (Ödemeler vs Seans Girişleri) */}
        <div className="px-5 pt-4 flex space-x-2 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'payments'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Ödeme & Tahsilat Geçmişi ({displayPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('entries')}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'entries'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Piste Çıkış Kayıtları ({entryRecords.length})</span>
          </button>
        </div>

        {/* 4. SEKME İÇERİĞİ */}
        <div className="p-4 sm:p-6 max-h-[48vh] overflow-y-auto space-y-3">
          
          {/* A. ÖDEME GEÇMİŞİ LİSTESİ */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              {displayPayments.map((pay, idx) => {
                const method = pay.method || 'Nakit';
                const isCard = method.toLowerCase().includes('kart');
                const isHavale = method.toLowerCase().includes('havale') || method.toLowerCase().includes('eft');
                
                return (
                  <div 
                    key={pay.id || idx}
                    className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 hover:border-gray-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2.5 rounded-xl text-white shrink-0 mt-0.5 ${
                        isCard ? 'bg-purple-600' : isHavale ? 'bg-blue-600' : 'bg-emerald-600'
                      }`}>
                        {isCard ? <CreditCard className="w-5 h-5" /> : isHavale ? <ArrowRightLeft className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-black text-white">
                            {pay.amount ? `${Number(pay.amount).toLocaleString('tr-TR')} ₺` : 'Ödeme Kaydı'}
                          </span>
                          
                          {/* Ödeme Yöntemi Rozeti */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            isCard 
                              ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                              : isHavale 
                              ? 'bg-blue-950 text-blue-300 border border-blue-800' 
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            {method}
                          </span>

                          {pay.entriesCount && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-950/70 text-amber-300 text-[10px] font-bold border border-amber-800/80">
                              +{pay.entriesCount} Seans
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-300 mt-1 font-medium">
                          {pay.note || 'Pist seans paketi ödemesi'}
                        </p>

                        <div className="flex items-center space-x-3 text-[11px] text-gray-500 mt-1.5 font-mono">
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {pay.date}
                          </span>
                          {pay.performedBy && (
                            <span className="flex items-center text-gray-400">
                              <User className="w-3.5 h-3.5 mr-1" />
                              Yetkili: {pay.performedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 text-xs font-black inline-flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Tahsil Edildi
                      </span>
                    </div>
                  </div>
                );
              })}

              {displayPayments.length === 0 && (
                <div className="py-12 px-4 text-center rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
                  <Receipt className="w-10 h-10 text-gray-600 mx-auto" />
                  <div className="text-sm font-bold text-gray-300">
                    Henüz Tahsilat / Ödeme Kaydı Yok
                  </div>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
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
            <div className="space-y-2.5">
              {entryRecords.map((ent, idx) => (
                <div 
                  key={ent.id || idx}
                  className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-800/60 text-red-400 flex items-center justify-center font-black">
                      🏁
                    </div>
                    <div>
                      <div className="text-white font-bold">{ent.note || 'Piste Çıkış Yapıldı'}</div>
                      <div className="text-[11px] font-mono text-gray-400 mt-0.5">📅 {ent.date}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-black text-xs">
                      -{ent.deductCount || 1} Seans
                    </span>
                    {ent.remainingEntries !== undefined && (
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Kalan: {ent.remainingEntries}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {entryRecords.length === 0 && (
                <div className="py-10 text-center text-gray-500 text-xs">
                  Bu motor ile henüz piste çıkış yapılmamış.
                </div>
              )}
            </div>
          )}

        </div>

        {/* 5. ALT AKSİYONLAR */}
        <div className="p-4 sm:p-5 bg-gray-900 border-t-2 border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-400 font-semibold">
            Tüm ödemeler ve seans düşümleri loglanır.
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            {onOpenTrackEntry && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTrackEntry(bike);
                }}
                disabled={isExpired}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs flex items-center justify-center space-x-1 shadow transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Piste Çıkış</span>
              </button>
            )}

            {onOpenAddEntries && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddEntries(bike);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center justify-center space-x-1 shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Hak / Ödeme Yükle</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
            >
              Kapat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
