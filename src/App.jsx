import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bike, 
  AlertTriangle
} from 'lucide-react';

import { 
  loadGarages, 
  saveGarages, 
  loadBikes, 
  saveBikes, 
  INITIAL_GARAGES, 
  INITIAL_BIKES 
} from './data/mockData';

import {
  loadAdmins,
  saveAdmins,
  getCurrentUser,
  setCurrentUser
} from './data/authData';

import {
  fetchAdmins,
  insertAdmin,
  deleteAdmin,
  fetchGarages,
  fetchBikes,
  insertBike,
  updateBike,
  deleteBike,
  clearAllTestBikes
} from './services/dbService';

import { isSupabaseConfigured } from './lib/supabaseClient';

import Navbar from './components/Navbar';
import PullToRefresh from './components/PullToRefresh';
import BikeCard from './components/BikeCard';
import BikeDetailModal from './components/BikeDetailModal';
import QRScannerModal from './components/QRScannerModal';
import QRPrintView from './components/QRPrintView';
import RentManagement from './components/RentManagement';
import AddBikeModal from './components/AddBikeModal';
import NotificationModal from './components/NotificationModal';
import PitLaneGarages from './components/PitLaneGarages';
import GarageInsideView from './components/GarageInsideView';
import LoginScreen from './components/LoginScreen';
import AdminManagementModal from './components/AdminManagementModal';
import TrackEntryModal from './components/TrackEntryModal';
import AddEntriesModal from './components/AddEntriesModal';
import { openWhatsAppMessage } from './utils/whatsappHelper';

export default function App() {
  // Giriş ve Yetkili Durumu
  const [admins, setAdmins] = useState(() => loadAdmins());
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());

  const [garages, setGarages] = useState(() => loadGarages());
  const [bikes, setBikes] = useState(() => loadBikes());
  
  // Aktif sekme: 'pitlane' (10 Garaj), 'garage' (Tüm Motorlar), 'rent' (Giriş Hakları), 'print' (Sticker Yazdır)
  const [activeTab, setActiveTab] = useState('pitlane'); 

  // Seçili açık olan garaj
  const [currentGarage, setCurrentGarage] = useState(null);

  // Modallar
  const [selectedBike, setSelectedBike] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [printBikeTarget, setPrintBikeTarget] = useState(null);
  const [addBikeTargetGarageId, setAddBikeTargetGarageId] = useState('box-1');
  
  // Pist Giriş & Hak Yükleme Pop-up Hedef Motorları
  const [trackEntryBike, setTrackEntryBike] = useState(null);
  const [addEntriesBike, setAddEntriesBike] = useState(null);

  // Arama & Filtreler
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const [dbStatus, setDbStatus] = useState('checking'); // 'connected', 'offline', 'not_configured'

  // Standart ve Kurşun Geçirmez Veritabanı Okuma (SELECT)
  const refreshData = async () => {
    try {
      const [remoteAdmins, remoteGarages, remoteBikes] = await Promise.all([
        fetchAdmins(),
        fetchGarages(),
        fetchBikes()
      ]);

      setDbStatus(isSupabaseConfigured ? 'connected' : 'offline');
      if (remoteAdmins && remoteAdmins.length > 0) setAdmins(remoteAdmins);
      if (remoteGarages && remoteGarages.length > 0) setGarages(remoteGarages);
      if (Array.isArray(remoteBikes)) {
        setBikes(remoteBikes);
        saveBikes(remoteBikes);
      }
    } catch (err) {
      setDbStatus('offline');
      console.warn('[App DB sync error]', err);
    }
  };

  // İlk sayfa açılışında veritabanından çek
  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    saveGarages(garages);
  }, [garages]);

  useEffect(() => {
    saveBikes(bikes);
  }, [bikes]);

  useEffect(() => {
    saveAdmins(admins);
  }, [admins]);

  // Mobil & Tarayıcı Geri Tuşu Kontrolü (Boş ekrana düşmeyi tamamen engeller)
  useEffect(() => {
    const handlePopState = () => {
      // 1. Açık herhangi bir modal varsa kapat
      if (selectedBike) {
        setSelectedBike(null);
        return;
      }
      if (trackEntryBike) {
        setTrackEntryBike(null);
        return;
      }
      if (addEntriesBike) {
        setAddEntriesBike(null);
        return;
      }
      if (isAddModalOpen) {
        setIsAddModalOpen(false);
        return;
      }
      if (isAdminModalOpen) {
        setIsAdminModalOpen(false);
        return;
      }
      if (isScannerOpen) {
        setIsScannerOpen(false);
        return;
      }
      if (isNotificationOpen) {
        setIsNotificationOpen(false);
        return;
      }

      // 2. Bir garajın içindeyse, garajdan çıkıp 10 Paddock Box koridoruna dön
      if (currentGarage) {
        setCurrentGarage(null);
        return;
      }

      // 3. Başka bir sekmedeyse, ana koridora dön
      if (activeTab !== 'pitlane') {
        setActiveTab('pitlane');
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    selectedBike, 
    trackEntryBike, 
    addEntriesBike, 
    isAddModalOpen, 
    isAdminModalOpen, 
    isScannerOpen, 
    isNotificationOpen, 
    currentGarage, 
    activeTab
  ]);

  // Garaj Açma (Mobil geçmişe ekler ve sayfayı tepeye odaklar)
  const handleOpenGarage = (garage) => {
    try {
      window.history.pushState({ view: 'garage', garageId: garage.id }, '');
    } catch {}
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setCurrentGarage(garage);
  };

  // Garajdan Geri Çıkma
  const handleBackFromGarage = () => {
    setCurrentGarage(null);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    try {
      if (window.history.state?.view === 'garage') {
        window.history.back();
      }
    } catch {}
  };

  // URL Hash kontrolü
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const found = bikes.find(b => b.id.toLowerCase() === hash.toLowerCase());
        if (found) {
          const bikeGarage = garages.find(g => g.id === found.garageId);
          if (bikeGarage) setCurrentGarage(bikeGarage);
          setSelectedBike(found);
        }
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [bikes, garages]);

  // Giriş Yapma
  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentUserState(user);
  };

  // Çıkış Yapma
  const handleLogout = () => {
    if (confirm('Sistemden çıkış yapmak istediğinize emin misiniz?')) {
      setCurrentUser(null);
      setCurrentUserState(null);
    }
  };

  // Yeni Admin/Kullanıcı Ekleme - Doğrudan Supabase DB'ye Insert
  const handleAddAdmin = async (newAdmin) => {
    const created = await insertAdmin(newAdmin, currentUser?.name || currentUser?.username || 'Admin');
    setAdmins(prev => [...prev.filter(a => a.username.toLowerCase() !== created.username.toLowerCase()), created]);
  };

  // Admin/Kullanıcı Silme - Doğrudan Supabase DB'den Delete
  const handleDeleteAdmin = async (adminId) => {
    const target = admins.find(a => a.id === adminId);
    setAdmins(prev => prev.filter(a => a.id !== adminId));
    await deleteAdmin(adminId, target?.username, currentUser?.name || currentUser?.username || 'Admin');
  };

  // Motor Güncelleme - Doğrudan Supabase DB'ye Update & Log
  const handleUpdateBike = async (updatedBike, logInfo = null) => {
    const nextBikes = bikes.map(b => b.id === updatedBike.id ? updatedBike : b);
    setBikes(nextBikes);
    if (selectedBike?.id === updatedBike.id) {
      setSelectedBike(updatedBike);
    }
    await updateBike(updatedBike, currentUser?.name || currentUser?.username || 'Admin', logInfo);
  };

  // Motor Ekleme - Doğrudan Supabase DB'ye Insert & Log
  const handleAddBike = async (newBike) => {
    if (currentUser?.role === 'VIEWER') {
      alert('Sadece görüntüleme yetkiniz bulunmaktadır! Yeni araç ekleyemezsiniz.');
      return;
    }
    setBikes(prevBikes => {
      // Aynı ID veya aynı şasi numaralı araç varsa ikinci kez ekleme
      const isDuplicate = prevBikes.some(
        b => b.id === newBike.id || (newBike.chassisNumber && b.chassisNumber && b.chassisNumber === newBike.chassisNumber)
      );
      if (isDuplicate) return prevBikes;
      return [newBike, ...prevBikes];
    });

    await insertBike(newBike, currentUser?.name || currentUser?.username || 'Admin');
  };

  // Motor Silme - Doğrudan Supabase DB'den Delete & Log
  const handleDeleteBike = async (bikeId) => {
    setBikes(prev => prev.filter(b => b.id !== bikeId));
    if (selectedBike?.id === bikeId) setSelectedBike(null);
    await deleteBike(bikeId, currentUser?.name || currentUser?.username || 'Admin');
  };

  // Motoru Başka Paddock Box'a Taşıma - Doğrudan Supabase DB Update & Log
  const handleMoveBike = async (bikeId, targetGarageId) => {
    const targetGarage = garages.find(g => g.id === targetGarageId);
    if (!targetGarage) return;

    let movedBike = null;
    const nextBikes = bikes.map(b => {
      if (b.id === bikeId) {
        movedBike = {
          ...b,
          garageId: targetGarage.id,
          garageNo: targetGarage.name
        };
        return movedBike;
      }
      return b;
    });

    setBikes(nextBikes);
    if (movedBike) {
      await updateBike(movedBike, currentUser?.name || currentUser?.username || 'Admin', {
        actionType: 'BIKE_MOVED',
        note: `Araç ${targetGarage.name} garajına taşındı`
      });
    }
  };

  // Test Verilerini Sıfırlama (Canlı DB & Yerel)
  const handleClearAllTestBikes = async () => {
    if (window.confirm("⚠️ DİKKAT: Sistemdeki tüm test motorları, takılı parçalar ve seans kayıtları veritabanından tamamen silinecektir.\n\nGerçek verilerinizi sıfırdan girmek için onaylıyor musunuz?")) {
      await clearAllTestBikes(currentUser?.name || currentUser?.username || 'Admin');
      setBikes([]);
      setSelectedBike(null);
      alert("✅ Tüm test verileri başarıyla temizlendi! 10 Paddock Box garajınız gerçek motor kayıtları için hazır.");
    }
  };

  // Piste Giriş Pop-up Onayı (1 veya birden fazla hak düşme)
  const handleConfirmTrackEntry = async (deductCount, note) => {
    if (!trackEntryBike) return;
    const remaining = trackEntryBike.remainingEntries ?? 0;
    const nextRemaining = Math.max(0, remaining - deductCount);

    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const entryRecord = {
      id: 'entry_' + Date.now(),
      type: 'ENTRY',
      date: dateStr,
      deductCount,
      note: note || `${deductCount} Seans Piste Giriş`,
      remainingEntries: nextRemaining,
      performedBy: currentUser?.name || currentUser?.username || 'Pist Yöneticisi'
    };

    const newHistory = [
      entryRecord,
      ...(trackEntryBike.entryHistory || [])
    ];

    const updated = {
      ...trackEntryBike,
      remainingEntries: nextRemaining,
      entryHistory: newHistory
    };

    await handleUpdateBike(updated, {
      actionType: 'TRACK_ENTRY',
      note: `${deductCount} seans piste giriş yapıldı. ${note}. Kalan Hak: ${nextRemaining}`
    });
  };

  // Hak / Paket Yükle Pop-up Onayı (Detaylı Ödeme Loglaması)
  const handleConfirmAddEntries = async (count, paymentMethod, paymentNote, amount = null) => {
    if (!addEntriesBike) return;
    const remaining = addEntriesBike.remainingEntries ?? 0;
    const finalAmount = (amount !== null && amount !== undefined) 
      ? Number(amount) 
      : (count === 5 ? 7000 : count === 10 ? 14000 : count === 1 ? 1500 : count * 1400);

    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const paymentRecord = {
      id: 'pay_' + Date.now(),
      type: 'PAYMENT',
      date: dateStr,
      amount: finalAmount,
      method: paymentMethod || 'Nakit',
      entriesCount: count,
      note: paymentNote || `+${count} Seans Hak Tanımlandı`,
      performedBy: currentUser?.name || currentUser?.username || 'Pist Yöneticisi'
    };

    const nextHistory = [
      paymentRecord,
      ...(addEntriesBike.entryHistory || [])
    ];

    const updated = {
      ...addEntriesBike,
      remainingEntries: remaining + count,
      totalEntriesGranted: totalGranted + count,
      paymentAmount: (addEntriesBike.paymentAmount || 0) + finalAmount,
      entryHistory: nextHistory
    };

    await handleUpdateBike(updated, {
      actionType: 'PAYMENT_RECEIVED',
      note: `Ödeme Alındı: ${finalAmount.toLocaleString('tr-TR')} ₺ (${paymentMethod}). +${count} Seans tanımlandı. Not: ${paymentNote}`
    });
  };

  // QR Tarama Sonucu Motor Bulunduğunda
  const handleBikeFoundFromQR = (bike) => {
    setIsScannerOpen(false);
    const bikeGarage = garages.find(g => g.id === bike.garageId);
    if (bikeGarage) {
      setCurrentGarage(bikeGarage);
      setActiveTab('pitlane');
    }
    setSelectedBike(bike);
  };

  // WhatsApp Hatırlatma (Güvenli ve Türkiye Formatı Destekli)
  const handleQuickWhatsApp = (bike) => {
    const text = `Sayın ${bike.owner?.fullName}, ${bike.garageNo} garajındaki #${bike.raceNumber} yarış numaralı ${bike.brand} ${bike.model} motorunuzun pist giriş hakkı tükenmiştir (0 Hak). Yeni seans paketi yüklemek için bizimle iletişime geçebilirsiniz. - Uşak Paddock Yönetimi`;
    openWhatsAppMessage(bike.owner?.phone, text);
  };

  // Kalan hakkı 0 olan motorlar
  const expiredCount = bikes.filter(b => (b.remainingEntries ?? 0) <= 0).length;

  // Filtrelenmiş motorlar
  const filteredBikes = bikes.filter(bike => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      bike.brand.toLowerCase().includes(searchLower) ||
      bike.model.toLowerCase().includes(searchLower) ||
      bike.owner?.fullName?.toLowerCase().includes(searchLower) ||
      bike.garageNo.toLowerCase().includes(searchLower) ||
      bike.raceNumber.includes(searchLower) ||
      bike.chassisNumber?.toLowerCase().includes(searchLower) ||
      bike.owner?.bloodType?.toLowerCase().includes(searchLower);

    let matchesType = true;
    if (filterType === 'EXPIRED') matchesType = (bike.remainingEntries ?? 0) <= 0;
    if (filterType === 'ACTIVE') matchesType = (bike.remainingEntries ?? 0) > 0;

    return matchesSearch && matchesType;
  });

  // Eğer giriş yapılmamışsa Login Ekranını göster
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} admins={admins} />;
  }

  return (
    <PullToRefresh onRefresh={refreshData}>
      <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex flex-col selection:bg-red-600 selection:text-white carbon-pattern">
        
        {/* Üst Menü */}
        <Navbar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'scanner') {
            setIsScannerOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        overdueCount={expiredCount}
        onOpenAddModal={() => {
          if (currentUser?.role === 'VIEWER') return;
          setAddBikeTargetGarageId(currentGarage ? currentGarage.id : 'box-1');
          setIsAddModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        currentUser={currentUser}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Ana Gövde */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: 10 PADDOCK BOX (GARAJ KAPILARI) */}
        {activeTab === 'pitlane' && (
          <div>
            {!currentGarage ? (
              <PitLaneGarages 
                garages={garages} 
                bikes={bikes} 
                onOpenGarage={handleOpenGarage} 
              />
            ) : (
              <GarageInsideView 
                garage={currentGarage}
                bikes={bikes}
                allGarages={garages}
                currentUser={currentUser}
                onBack={handleBackFromGarage}
                onSelectBike={(b) => setSelectedBike(b)}
                onShowQR={(b) => setSelectedBike({ ...b, initialTab: 'qr' })}
                onQuickWhatsApp={handleQuickWhatsApp}
                onAddNewBikeToThisGarage={(g) => {
                  if (currentUser?.role === 'VIEWER') return;
                  setAddBikeTargetGarageId(g.id);
                  setIsAddModalOpen(true);
                }}
                onMoveBike={handleMoveBike}
                onUpdateBike={handleUpdateBike}
                onOpenTrackEntry={(b) => setTrackEntryBike(b)}
                onOpenAddEntries={(b) => setAddEntriesBike(b)}
              />
            )}
          </div>
        )}

        {/* TAB 2: TÜM MOTORLAR (GENEL LİSTE) */}
        {activeTab === 'garage' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Arama & Filtreler */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-[#141822] border-2 border-gray-700">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pilot adı, yarış no (#46), model, kan grubu (A Rh+)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border-2 border-gray-700 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 font-bold focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterType(filterType === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center space-x-1 ${
                    filterType === 'EXPIRED'
                      ? 'bg-red-600 text-white shadow-lg animate-pulse'
                      : 'bg-gray-800 text-red-400'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span>Hakkı Bitenler ({expiredCount})</span>
                </button>
              </div>
            </div>

            {/* Motor Kartları Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredBikes.map((bike) => (
                <BikeCard 
                  key={bike.id} 
                  bike={bike}
                  onSelect={(b) => setSelectedBike(b)}
                  onShowQR={(b) => setSelectedBike({ ...b, initialTab: 'qr' })}
                  onQuickWhatsApp={handleQuickWhatsApp}
                />
              ))}

              {filteredBikes.length === 0 && (
                <div className="col-span-full py-16 text-center rounded-3xl bg-[#141822] border-2 border-gray-700 p-8 space-y-3">
                  <Bike className="w-12 h-12 text-gray-600 mx-auto" />
                  <div className="text-base font-bold text-white">Aranan kriterlere uygun motor bulunamadı</div>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('ALL');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 text-xs font-bold text-white"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: PİST GİRİŞ HAKLARI (BAKİYE & SEANS TAKİBİ) */}
        {activeTab === 'rent' && (
          <div className="animate-fade-in">
            <RentManagement 
              bikes={bikes} 
              currentUser={currentUser}
              onUpdateBike={handleUpdateBike}
              onSelectBike={(b) => setSelectedBike(b)}
              onOpenTrackEntry={(b) => setTrackEntryBike(b)}
              onOpenAddEntries={(b) => setAddEntriesBike(b)}
            />
          </div>
        )}

        {/* TAB 4: QR KAREKOD YAZDIRMA (PRINT VIEW) */}
        {activeTab === 'print' && (
          <div className="animate-fade-in">
            <QRPrintView 
              bikes={bikes} 
              selectedBike={printBikeTarget}
              onBack={() => {
                setPrintBikeTarget(null);
                setActiveTab('pitlane');
              }}
            />
          </div>
        )}

        {/* Alt Bilgi & Profesyonel İmza */}
        <footer className="mt-12 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3 no-print">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}></span>
              <span className="font-semibold text-gray-400">
                {dbStatus === 'connected' 
                  ? 'Supabase Canlı DB Bağlı' 
                  : dbStatus === 'offline' 
                    ? 'Yerel Mod (DB Çevrimdışı)' 
                    : 'Yerel Mod (Supabase Bekleniyor)'}
              </span>
            </div>
            <span className="text-gray-600">•</span>
            <span>Uşak Yarış Pisti •</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-gray-400">
            © {new Date().getFullYear()} Uşak Yarış Pisti • Designed & Developed by <span className="text-red-500 font-bold">Eray Yörük</span>
          </div>
        </footer>

      </main>

      {/* MODALLAR */}

      {/* 1. Motor Detay Modalı */}
      {selectedBike && (
        <BikeDetailModal
          bike={selectedBike}
          garages={garages}
          currentUser={currentUser}
          onClose={() => setSelectedBike(null)}
          onUpdateBike={handleUpdateBike}
          onOpenPrint={(bike) => {
            setPrintBikeTarget(bike);
            setActiveTab('print');
          }}
          onOpenTrackEntry={(bike) => setTrackEntryBike(bike)}
          onOpenAddEntries={(bike) => setAddEntriesBike(bike)}
        />
      )}

      {/* 2. QR Tarayıcı */}
      {isScannerOpen && (
        <QRScannerModal
          bikes={bikes}
          onBikeFound={handleBikeFoundFromQR}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* 3. Yeni Motor Ekleme */}
      {isAddModalOpen && (
        <AddBikeModal
          garages={garages}
          defaultGarageId={addBikeTargetGarageId}
          onClose={() => setIsAddModalOpen(false)}
          onAddBike={handleAddBike}
        />
      )}

      {/* 4. Bildirim Modalı */}
      {isNotificationOpen && (
        <NotificationModal
          bikes={bikes}
          onClose={() => setIsNotificationOpen(false)}
          onSelectBike={(b) => setSelectedBike(b)}
          onQuickWhatsApp={handleQuickWhatsApp}
        />
      )}

      {/* 5. Yetkili / Admin Yönetim Modalı */}
      {isAdminModalOpen && (
        <AdminManagementModal
          admins={admins}
          currentUser={currentUser}
          dbStatus={dbStatus}
          onClose={() => setIsAdminModalOpen(false)}
          onAddAdmin={handleAddAdmin}
          onDeleteAdmin={handleDeleteAdmin}
          onClearAllTestBikes={handleClearAllTestBikes}
        />
      )}

      {/* 6. Piste Giriş Yap Pop-up Modalı (1 veya çoklu gün/seans düşme) */}
      {trackEntryBike && (
        <TrackEntryModal
          bike={trackEntryBike}
          onClose={() => setTrackEntryBike(null)}
          onConfirm={handleConfirmTrackEntry}
        />
      )}

      {/* 7. Hak / Paket Yükle Pop-up Modalı */}
      {addEntriesBike && (
        <AddEntriesModal
          bike={addEntriesBike}
          onClose={() => setAddEntriesBike(null)}
          onConfirm={handleConfirmAddEntries}
        />
      )}

      </div>
    </PullToRefresh>
  );
}
