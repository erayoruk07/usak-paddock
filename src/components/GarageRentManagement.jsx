import React, { useState } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  X, 
  Settings, 
  CreditCard, 
  MessageCircle, 
  Receipt, 
  Calendar, 
  Edit3, 
  Banknote,
  Heart,
  TrendingUp,
  Tag,
  Eye,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getBikeRentInfo, formatDateTR } from '../utils/garageRentHelper';
import { openWhatsAppMessage, getGarageRentWhatsAppMessage } from '../utils/whatsappHelper';
import RentPaymentModal from './RentPaymentModal';
import RentSettingsModal from './RentSettingsModal';
import RentHistoryModal from './RentHistoryModal';
import EditBikeRentModal from './EditBikeRentModal';
import RentSummaryModal from './RentSummaryModal';

export default function GarageRentManagement({
  bikes = [],
  currentUser,
  rentSettings,
  onUpdateSettings,
  onUpdateBike
}) {
  const isViewer = currentUser?.role?.toUpperCase() === 'VIEWER';

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'OVERDUE' | 'PAID'
  const [searchTerm, setSearchTerm] = useState('');

  // Modallar
  const [selectedBikeForSummary, setSelectedBikeForSummary] = useState(null);
  const [selectedBikeForPayment, setSelectedBikeForPayment] = useState(null);
  const [selectedBikeForHistory, setSelectedBikeForHistory] = useState(null);
  const [selectedBikeForEdit, setSelectedBikeForEdit] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const safeBikes = Array.isArray(bikes) ? bikes : [];

  // Her motor için kira bilgilerini hesapla
  const bikesWithRent = safeBikes.map(bike => {
    const rentInfo = getBikeRentInfo(bike, rentSettings);
    return { bike, rentInfo };
  });

  // Metrik Hesaplamaları
  const unpaidItems = bikesWithRent.filter(item => item.rentInfo.status === 'OVERDUE' || item.rentInfo.status === 'PENDING');
  const paidItems = bikesWithRent.filter(item => item.rentInfo.status === 'PAID');
  const upcomingItems = bikesWithRent.filter(item => item.rentInfo.status === 'UPCOMING');

  const totalUnpaidDebt = unpaidItems.reduce((acc, item) => acc + item.rentInfo.totalOverdueDebt, 0);
  const totalPaidRevenue = bikesWithRent.reduce((acc, item) => acc + item.rentInfo.totalRentPaid, 0);
  const totalExpectedMonthly = bikesWithRent.reduce((acc, item) => acc + item.rentInfo.monthlyRent, 0);

  // Filtreleme
  let baseItems = bikesWithRent;
  if (filter === 'UNPAID' || filter === 'OVERDUE') baseItems = unpaidItems;
  else if (filter === 'PAID') baseItems = paidItems;
  else if (filter === 'UPCOMING') baseItems = upcomingItems;

  const displayedItems = baseItems.filter(({ bike }) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (bike.owner?.fullName && String(bike.owner.fullName).toLowerCase().includes(q)) ||
      (bike.raceNumber && String(bike.raceNumber).toLowerCase().includes(q)) ||
      (bike.garageNo && String(bike.garageNo).toLowerCase().includes(q)) ||
      (bike.brand && String(bike.brand).toLowerCase().includes(q)) ||
      (bike.model && String(bike.model).toLowerCase().includes(q)) ||
      (bike.owner?.phone && String(bike.owner.phone).includes(q)) ||
      (bike.owner?.bloodType && String(bike.owner.bloodType).toLowerCase().includes(q))
    );
  });

  // WhatsApp'tan Kira Hatırlatması Gönder
  const handleSendWhatsAppReminder = (bike, rentInfo, e) => {
    if (e) e.stopPropagation();
    const text = getGarageRentWhatsAppMessage(bike, rentInfo, rentSettings);
    openWhatsAppMessage(bike.owner?.phone, text);
  };

  // Kira Tahsilatını Kaydet
  const handleSavePayment = (bike, paymentRecord) => {
    const newEntryHistory = [
      paymentRecord,
      ...(bike.entryHistory || [])
    ];

    const updatedBike = {
      ...bike,
      rentStatus: 'PAID',
      lastRentDate: paymentRecord.date.split(' ')[0],
      entryHistory: newEntryHistory
    };

    onUpdateBike(updatedBike, {
      actionType: 'RENT_PAYMENT',
      note: `${paymentRecord.period} Garaj Kirası Tahsil Edildi (${paymentRecord.amount.toLocaleString('tr-TR')} ₺ - ${paymentRecord.method})`
    });

    setSelectedBikeForPayment(null);
    setSelectedBikeForSummary(prev => prev && prev.id === updatedBike.id ? updatedBike : prev);
    setSelectedBikeForHistory(prev => prev && prev.id === updatedBike.id ? updatedBike : prev);
  };

  // Özel Kira / Üyelik Tarihi Güncelleme
  const handleSaveBikeEdit = (updatedBike) => {
    onUpdateBike(updatedBike, {
      actionType: 'BIKE_UPDATED',
      note: `Garaj üyelik ve özel kira ayarları güncellendi (#${updatedBike.raceNumber} ${updatedBike.owner?.fullName})`
    });
    setSelectedBikeForEdit(null);
    setSelectedBikeForSummary(prev => prev && prev.id === updatedBike.id ? updatedBike : prev);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. ÜST İSTATİSTİK & AYAR KARTLARI (4 KUTU) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Kırmızı: Ödeme Bekleyen Kiralar */}
        <div 
          onClick={() => setFilter('UNPAID')}
          className={`cursor-pointer p-4 sm:p-5 rounded-3xl border-2 transition shadow-xl ${
            filter === 'UNPAID'
              ? 'bg-red-950/70 border-red-500 shadow-red-950/50 scale-[1.01]'
              : 'bg-[#151922] border-gray-800 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-red-400 font-black text-xs uppercase mb-1">
            <span className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1 text-red-500 animate-pulse" />
              Ödeme Bekleyenler
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
              {unpaidItems.length} Motor
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-400 mt-1">
            {totalUnpaidDebt.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-[11px] text-red-300/80 font-medium mt-1 truncate">
            {unpaidItems.length > 0 ? `${unpaidItems.length} motorun ödenmemiş kirası var` : 'Ödenmemiş kira borcu yok'}
          </div>
        </div>

        {/* Yeşil: Bu Ay Ödeyenler */}
        <div 
          onClick={() => setFilter('PAID')}
          className={`cursor-pointer p-4 sm:p-5 rounded-3xl border-2 transition shadow-xl ${
            filter === 'PAID'
              ? 'bg-emerald-950/70 border-emerald-500 shadow-emerald-950/50 scale-[1.01]'
              : 'bg-[#151922] border-gray-800 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 font-black text-xs uppercase mb-1">
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Ödemesi Tamam
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
              {paidItems.length} Motor
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {paidItems.length} Pilot
          </div>
          <div className="text-[11px] text-emerald-300/80 font-medium mt-1 truncate">
            Kirasını ödemiş güncel araçlar
          </div>
        </div>

        {/* Mavi/Camgöbeği: Toplam Garaj Geliri */}
        <div 
          onClick={() => setFilter('ALL')}
          className={`cursor-pointer p-4 sm:p-5 rounded-3xl border-2 transition shadow-xl ${
            filter === 'ALL'
              ? 'bg-cyan-950/70 border-cyan-500 shadow-cyan-950/50 scale-[1.01]'
              : 'bg-[#151922] border-gray-800 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-cyan-400 font-black text-xs uppercase mb-1">
            <span className="flex items-center">
              <Building2 className="w-4 h-4 mr-1" />
              Garajdaki Araçlar
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-600 text-white text-[10px] font-black">
              {bikesWithRent.length} Üye
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">
            {totalExpectedMonthly.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-[11px] text-cyan-300/80 font-medium mt-1 truncate">
            {unpaidItems.length > 0 ? `${unpaidItems.length} ödeme bekliyor` : 'Tüm kiralar güncel'}
          </div>
        </div>

        {/* Mor: Genel Kira Ücreti & Ayarlar Paneli Butonu */}
        <div className="p-4 sm:p-5 rounded-3xl border-2 bg-gradient-to-br from-purple-950/60 to-[#151922] border-purple-500/40 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-purple-400 font-black text-xs uppercase mb-1">
              <span className="flex items-center">
                <Banknote className="w-4 h-4 mr-1 text-purple-400" />
                Standart Kira
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-700">
                Genel Fiyat
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-1">
              {Number(rentSettings?.defaultMonthlyRent || 5000).toLocaleString('tr-TR')} ₺
            </div>
            <div className="text-[11px] text-purple-300/70 font-medium mt-1">
              Aylık standart box kullanım bedeli
            </div>
          </div>

          {!isViewer && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-purple-600/30 transition transform active:scale-95"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Fiyat Artışı & Ayarlar</span>
            </button>
          )}
        </div>

      </div>

      {/* 2. ARAMA VE FİLTRE ÇUBUĞU */}
      <div className="p-4 rounded-3xl bg-[#141822] border-2 border-gray-700 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* İsim & Metin Arama Kutusu */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pilot adı (Tolga), yarış no (#46), garaj box, model, telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border-2 border-gray-700 rounded-2xl pl-11 pr-10 py-2.5 text-sm text-white placeholder-gray-500 font-bold focus:outline-none focus:border-purple-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Durum Filtre Butonları */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto shrink-0 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center justify-center shrink-0 ${
                filter === 'ALL'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>Tümü ({bikesWithRent.length})</span>
            </button>

            <button
              onClick={() => setFilter('UNPAID')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1 shrink-0 ${
                filter === 'UNPAID' || filter === 'OVERDUE'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-800 text-red-400 hover:bg-gray-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              <span>Ödeme Bekleyenler ({unpaidItems.length})</span>
            </button>

            <button
              onClick={() => setFilter('PAID')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1 shrink-0 ${
                filter === 'PAID'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-800 text-emerald-400 hover:bg-gray-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Ödeyenler ({paidItems.length})</span>
            </button>

            {upcomingItems.length > 0 && (
              <button
                onClick={() => setFilter('UPCOMING')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1 shrink-0 ${
                  filter === 'UPCOMING'
                    ? 'bg-purple-800 text-purple-200 shadow-lg border border-purple-500'
                    : 'bg-gray-800 text-purple-300 hover:bg-gray-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>Gelecek Başlangıç ({upcomingItems.length})</span>
              </button>
            )}
          </div>

        </div>

        {/* Sonuç Özeti */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-gray-400 px-1 pt-1 border-t border-gray-800/80">
          <span>
            {filter === 'UNPAID' || filter === 'OVERDUE'
              ? '⚠️ Kirasını henüz ödememiş olan araçlar listeleniyor'
              : filter === 'PAID'
              ? '✅ Kirası ödenmiş güncel araçlar listeleniyor'
              : filter === 'UPCOMING'
              ? '✨ Kira başlangıç dönemi henüz gelmemiş araçlar listeleniyor'
              : '🏢 Tüm kayıtlı garaj motorları listeleniyor'}
            {searchTerm && ` • "${searchTerm}" için ${displayedItems.length} sonuç bulundu`}
          </span>
          <span className="font-bold text-gray-300 shrink-0">Toplam: {displayedItems.length} Motor • Detay için karta tıklayın</span>
        </div>
      </div>

      {/* 3. MOTOR VE GARAJ KİRASI LİSTESİ */}
      <div className="space-y-3">
        {displayedItems.map(({ bike, rentInfo }) => {
          const isOverdue = rentInfo.status === 'OVERDUE';
          const isPending = rentInfo.status === 'PENDING';
          const isPaid = rentInfo.status === 'PAID';
          const isUpcoming = rentInfo.status === 'UPCOMING';

          return (
            <div 
              key={bike.id}
              onClick={() => setSelectedBikeForSummary(bike)}
              className={`cursor-pointer group p-4 sm:p-5 rounded-3xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-lg hover:scale-[1.005] ${
                isOverdue
                  ? 'bg-red-950/20 border-red-600/70 hover:border-red-500 hover:shadow-red-950/40'
                  : isPending
                  ? 'bg-amber-950/20 border-amber-600/70 hover:border-amber-500 hover:shadow-amber-950/40'
                  : isUpcoming
                  ? 'bg-[#151922] border-purple-800/60 hover:border-purple-500 hover:shadow-purple-950/40'
                  : isPaid
                  ? 'bg-[#151922] border-emerald-900/50 hover:border-emerald-600/70 hover:shadow-emerald-950/40'
                  : 'bg-[#151922] border-gray-800 hover:border-purple-500/60 hover:shadow-purple-950/40'
              }`}
            >
              {/* Sol: Motor & Pilot Bilgisi */}
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-black text-xl italic flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/30">
                  #{bike.raceNumber}
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-base sm:text-lg font-black text-white group-hover:text-purple-300 transition">
                      {bike.owner?.fullName}
                    </span>
                    {/* Kan Grubu Rozeti */}
                    <span className="px-2 py-0.5 rounded-lg bg-red-950 border border-red-700 text-red-400 font-black text-xs flex items-center">
                      <Heart className="w-3 h-3 mr-1 fill-red-500 text-red-500" />
                      {bike.owner?.bloodType || "Kan Grubu Yok"}
                    </span>
                    {rentInfo.isCustomRent && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-700 text-purple-300 font-bold text-[10px] flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        Özel Fiyat
                      </span>
                    )}
                    <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800">
                      Özet için tıkla ➔
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-300 font-semibold mt-0.5">
                    {bike.garageNo} • {bike.brand} {bike.model}
                  </div>

                  <div className="text-xs text-gray-400 flex items-center space-x-3 mt-1 flex-wrap">
                    <span className="flex items-center text-purple-300 font-medium">
                      <Calendar className="w-3 h-3 mr-1 text-purple-400" />
                      Kayıt: {rentInfo.joinDateFormatted}
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {bike.owner?.phone}
                    </span>
                    <span className="text-gray-400">
                      Toplam Ödenen: <strong className="text-emerald-400 font-mono">{rentInfo.totalRentPaid.toLocaleString('tr-TR')} ₺</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Orta: Kira Durumu & Vade Tarihi */}
              <div className="sm:text-right">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Kira Vadesi & Durum
                </div>

                <div className="mt-1">
                  {isPaid ? (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-400 font-black text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {rentInfo.validUntilStr}'a kadar ödendi
                      </span>
                      <div className="text-[11px] text-gray-400 font-medium">
                        Aylık: {rentInfo.monthlyRent.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  ) : isUpcoming ? (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl bg-purple-950 border border-purple-600 text-purple-300 font-black text-xs">
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" />
                        {rentInfo.statusLabel}
                      </span>
                      <div className="text-[11px] text-purple-300/80 font-medium">
                        Henüz başlamadı (Aylık: {rentInfo.monthlyRent.toLocaleString('tr-TR')} ₺)
                      </div>
                    </div>
                  ) : isPending ? (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl bg-amber-950 border border-amber-600 text-amber-400 font-black text-xs">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {rentInfo.statusLabel}
                      </span>
                      <div className="text-[11px] text-amber-300 font-bold">
                        Ödenecek Tutar: {rentInfo.totalOverdueDebt.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl bg-red-950 border border-red-600 text-red-400 font-black text-xs animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        {rentInfo.statusLabel}
                      </span>
                      <div className="text-[11px] text-red-300 font-bold">
                        Vade: {rentInfo.nextDuePeriod?.label || rentInfo.validUntilStr} ({rentInfo.totalOverdueDebt.toLocaleString('tr-TR')} ₺)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sağ: Aksiyon Butonları */}
              <div 
                className="flex items-center space-x-2 shrink-0 flex-wrap sm:flex-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                {!isViewer ? (
                  <>
                    {/* Kira Tahsil Et Butonu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBikeForPayment(bike);
                      }}
                      className="px-3.5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-purple-600/30 transition transform active:scale-95"
                      title="Kira Tahsilatını Gir"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Kira Al</span>
                    </button>

                    {/* WhatsApp Kira Hatırlatması */}
                    <button
                      onClick={(e) => handleSendWhatsAppReminder(bike, rentInfo, e)}
                      className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
                      title="WhatsApp'tan Kira Hatırlatması Gönder"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    {/* Geçmiş Ödemeler */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBikeForHistory(bike);
                      }}
                      className="p-2.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition"
                      title="Geçmiş Kira Tahsilatları"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>

                    {/* Özel Fiyat & Üyelik Düzenleme */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBikeForEdit(bike);
                      }}
                      className="p-2.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition"
                      title="Özel Kira & Üyelik Tarihi Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBikeForHistory(bike);
                      }}
                      className="px-3 py-2 rounded-2xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-400 flex items-center space-x-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Geçmiş</span>
                    </button>
                    <div className="px-3 py-2 rounded-2xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-500">
                      Gözlemci Modu
                    </div>
                  </>
                )}
              </div>

            </div>
          );
        })}

        {displayedItems.length === 0 && (
          <div className="py-16 text-center text-gray-400 bg-[#151922] rounded-3xl border border-gray-800">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <div className="text-base font-bold text-white">Kayıt Bulunamadı</div>
            <p className="text-xs text-gray-500 mt-1">
              Filtrelerinize veya arama kriterinize uygun motor bulunamadı.
            </p>
          </div>
        )}
      </div>

      {/* 4. MODALLAR */}
      
      {/* Kişi Kartına Tıklayınca Açılan Kira Özeti & Vade Modalı */}
      {selectedBikeForSummary && (() => {
        const liveBike = safeBikes.find(b => b.id === selectedBikeForSummary.id) || selectedBikeForSummary;
        return (
          <RentSummaryModal
            bike={liveBike}
            rentInfo={getBikeRentInfo(liveBike, rentSettings)}
            settings={rentSettings}
            onClose={() => setSelectedBikeForSummary(null)}
            onOpenPayment={(b) => setSelectedBikeForPayment(b)}
            onOpenEdit={(b) => setSelectedBikeForEdit(b)}
            onSendWhatsApp={(b, info) => handleSendWhatsAppReminder(b, info)}
          />
        );
      })()}

      {/* Kira Tahsilat Modalı */}
      {selectedBikeForPayment && (() => {
        const liveBike = safeBikes.find(b => b.id === selectedBikeForPayment.id) || selectedBikeForPayment;
        return (
          <RentPaymentModal
            bike={liveBike}
            rentInfo={getBikeRentInfo(liveBike, rentSettings)}
            settings={rentSettings}
            onClose={() => setSelectedBikeForPayment(null)}
            onSavePayment={handleSavePayment}
          />
        );
      })()}

      {/* Kira Ayarları Modalı */}
      {isSettingsOpen && (
        <RentSettingsModal
          currentSettings={rentSettings}
          onClose={() => setIsSettingsOpen(false)}
          onSaveSettings={(newSettings) => {
            onUpdateSettings(newSettings);
          }}
        />
      )}

      {/* Geçmiş Kira Tahsilatları Modalı */}
      {selectedBikeForHistory && (() => {
        const liveBike = safeBikes.find(b => b.id === selectedBikeForHistory.id) || selectedBikeForHistory;
        return (
          <RentHistoryModal
            bike={liveBike}
            rentInfo={getBikeRentInfo(liveBike, rentSettings)}
            onClose={() => setSelectedBikeForHistory(null)}
            onOpenPaymentModal={(b) => setSelectedBikeForPayment(b)}
          />
        );
      })()}

      {/* Özel Kira & Üyelik Düzenleme Modalı */}
      {selectedBikeForEdit && (() => {
        const liveBike = safeBikes.find(b => b.id === selectedBikeForEdit.id) || selectedBikeForEdit;
        return (
          <EditBikeRentModal
            bike={liveBike}
            rentInfo={getBikeRentInfo(liveBike, rentSettings)}
            settings={rentSettings}
            onClose={() => setSelectedBikeForEdit(null)}
            onSave={handleSaveBikeEdit}
          />
        );
      })()}

    </div>
  );
}
