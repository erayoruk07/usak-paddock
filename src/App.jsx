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

import Navbar from './components/Navbar';
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

  // Arama & Filtreler
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    saveGarages(garages);
  }, [garages]);

  useEffect(() => {
    saveBikes(bikes);
  }, [bikes]);

  useEffect(() => {
    saveAdmins(admins);
  }, [admins]);

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

  // Yeni Admin Ekleme
  const handleAddAdmin = (newAdmin) => {
    setAdmins([...admins, newAdmin]);
  };

  // Admin Silme
  const handleDeleteAdmin = (adminId) => {
    setAdmins(admins.filter(a => a.id !== adminId));
  };

  // Motor Güncelleme
  const handleUpdateBike = (updatedBike) => {
    const nextBikes = bikes.map(b => b.id === updatedBike.id ? updatedBike : b);
    setBikes(nextBikes);
    if (selectedBike?.id === updatedBike.id) {
      setSelectedBike(updatedBike);
    }
  };

  // Motor Ekleme (Mükerrer Kayıt Korumalı)
  const handleAddBike = (newBike) => {
    setBikes(prevBikes => {
      // Aynı ID veya aynı şasi numaralı araç varsa ikinci kez ekleme
      const isDuplicate = prevBikes.some(
        b => b.id === newBike.id || (newBike.chassisNumber && b.chassisNumber && b.chassisNumber === newBike.chassisNumber)
      );
      if (isDuplicate) return prevBikes;
      return [newBike, ...prevBikes];
    });
  };

  // Motor Silme
  const handleDeleteBike = (bikeId) => {
    setBikes(bikes.filter(b => b.id !== bikeId));
    if (selectedBike?.id === bikeId) setSelectedBike(null);
  };

  // Motoru Başka Paddock Box'a Taşıma
  const handleMoveBike = (bikeId, targetGarageId) => {
    const targetGarage = garages.find(g => g.id === targetGarageId);
    if (!targetGarage) return;

    const nextBikes = bikes.map(b => {
      if (b.id === bikeId) {
        return {
          ...b,
          garageId: targetGarage.id,
          garageNo: targetGarage.name
        };
      }
      return b;
    });

    setBikes(nextBikes);
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

  // WhatsApp Hatırlatma
  const handleQuickWhatsApp = (bike) => {
    const phone = bike.owner?.phone?.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Sayın ${bike.owner?.fullName}, ${bike.garageNo} garajındaki #${bike.raceNumber} yarış numaralı ${bike.brand} ${bike.model} motorunuzun pist giriş hakkı tükenmiştir (0 Hak). Yeni seans paketi yüklemek için bizimle iletişime geçebilirsiniz. - Uşak Paddock Yönetimi`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
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
                onOpenGarage={(garage) => setCurrentGarage(garage)} 
              />
            ) : (
              <GarageInsideView 
                garage={currentGarage}
                bikes={bikes}
                allGarages={garages}
                onBack={() => setCurrentGarage(null)}
                onSelectBike={(b) => setSelectedBike(b)}
                onShowQR={(b) => setSelectedBike({ ...b, initialTab: 'qr' })}
                onQuickWhatsApp={handleQuickWhatsApp}
                onAddNewBikeToThisGarage={(g) => {
                  setAddBikeTargetGarageId(g.id);
                  setIsAddModalOpen(true);
                }}
                onMoveBike={handleMoveBike}
                onUpdateBike={handleUpdateBike}
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
              onUpdateBike={handleUpdateBike}
              onSelectBike={(b) => setSelectedBike(b)}
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

        {/* Alt Bilgi - Sıfırlama butonu kaldırıldı, sadece temiz bilgi kaldı */}
        <div className="mt-12 pt-6 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500 no-print">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Uşak Yarış Pisti • 10 Paddock Box & Pist Giriş Bakiye Sistemi</span>
          </div>
          <div className="text-gray-600 font-mono text-[11px]">
            Yetkili: {currentUser.name || currentUser.username}
          </div>
        </div>

      </main>

      {/* MODALLAR */}

      {/* 1. Motor Detay Modalı */}
      {selectedBike && (
        <BikeDetailModal
          bike={selectedBike}
          onClose={() => setSelectedBike(null)}
          onUpdateBike={handleUpdateBike}
          onOpenPrint={(bike) => {
            setPrintBikeTarget(bike);
            setActiveTab('print');
          }}
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
          onClose={() => setIsAdminModalOpen(false)}
          onAddAdmin={handleAddAdmin}
          onDeleteAdmin={handleDeleteAdmin}
        />
      )}

    </div>
  );
}
