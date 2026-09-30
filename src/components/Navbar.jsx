import React from 'react';
import { 
  Warehouse, 
  ScanLine, 
  Ticket, 
  Printer, 
  Bell, 
  PlusCircle, 
  Shield, 
  LogOut,
  Building2
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  overdueCount, 
  unpaidRentCount = 0,
  onOpenAddModal, 
  onOpenNotifications,
  currentUser,
  onOpenAdminModal,
  onLogout
}) {
  const isViewer = currentUser?.role?.toUpperCase() === 'VIEWER';
  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN' || currentUser?.username?.toLowerCase() === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-gray-800 no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* 1. Sol: Logo & Pist Başlığı */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer select-none shrink-0" 
            onClick={() => setActiveTab('pitlane')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg shadow-black/60 shrink-0 border border-white/15 bg-black">
              <img src="/logo.png" alt="Uşak Paddock Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black text-white tracking-wider uppercase block leading-tight">
                UŞAK PİSTİ
              </span>
              <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase block leading-none">
                PADDOCK BOX
              </span>
            </div>
          </div>

          {/* 2. Orta: Navigasyon Butonları (Asla kaymaz, tek satırda ve dikey ortalanmış) */}
          <nav className="hidden md:flex items-center space-x-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800 shrink-0">
            <button
              onClick={() => setActiveTab('pitlane')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${
                activeTab === 'pitlane'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Garaj</span>
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${
                activeTab === 'scanner'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>QR Tara</span>
            </button>

            {!isViewer && (
              <button
                onClick={() => setActiveTab('rent')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'rent'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Giriş Hakları</span>
                {overdueCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-black">
                    {overdueCount}
                  </span>
                )}
              </button>
            )}

            {!isViewer && (
              <button
                onClick={() => setActiveTab('garageRent')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${
                  activeTab === 'garageRent'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Garaj Kirası</span>
                {unpaidRentCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-black">
                    {unpaidRentCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('print')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${
                activeTab === 'print'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Sticker Yazdır</span>
            </button>
          </nav>

          {/* 3. Sağ: Hızlı İşlemler (Bildirim, Yeni Motor, Admin Profili, Çıkış) */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {/* Bildirim Çanı (Sadece Yönetici) */}
            {!isViewer && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-200 hover:text-white transition flex items-center justify-center"
                title="Giriş Hakkı Bitenler"
              >
                <Bell className="w-4 h-4" />
                {overdueCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-black bg-red-600 text-white rounded-full leading-none">
                    {overdueCount}
                  </span>
                )}
              </button>
            )}

            {/* Yeni Motor Ekle - Sadece ADMIN görebilir */}
            {!isViewer && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center space-x-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-md transition transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Yeni Motor</span>
              </button>
            )}

            {/* Kullanıcı / Admin Yönetimi Butonu */}
            {isAdmin ? (
              <button
                onClick={onOpenAdminModal}
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-cyan-800/80 font-bold text-xs flex items-center space-x-1.5 transition"
                title="Yetkili Hesapları Yönet (Admin)"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">{currentUser?.name || currentUser?.username}</span>
                <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 text-[9px] font-black border border-red-800 hidden sm:inline">
                  Yönetici
                </span>
              </button>
            ) : (
              <div 
                className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-gray-900 text-gray-300 border border-gray-800 font-bold text-xs flex items-center space-x-1.5 cursor-default"
                title="Sadece Görüntüleme Yetkisi"
              >
                <span className="text-cyan-400 text-sm">👁️</span>
                <span className="hidden md:inline">{currentUser?.name || currentUser?.username}</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[9px] font-black border border-cyan-800">
                  Gözlemci
                </span>
              </div>
            )}

            {/* Çıkış Yap */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-gray-900 hover:bg-red-950 text-gray-400 hover:text-red-400 border border-gray-700 transition"
              title="Çıkış Yap"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </div>

      {/* Mobil Alt Çubuk */}
      <div className="md:hidden flex items-center justify-around border-t border-gray-800 bg-[#0B0F17] px-2 py-1.5">
        <button
          onClick={() => setActiveTab('pitlane')}
          className={`flex flex-col items-center p-1 text-[11px] font-bold ${
            activeTab === 'pitlane' ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          <Warehouse className="w-5 h-5 mb-0.5" />
          Garaj
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex flex-col items-center p-1 text-[11px] font-bold ${
            activeTab === 'scanner' ? 'text-cyan-400' : 'text-gray-400'
          }`}
        >
          <ScanLine className="w-5 h-5 mb-0.5" />
          QR Tara
        </button>
        {!isViewer && (
          <button
            onClick={() => setActiveTab('rent')}
            className={`flex flex-col items-center p-1 text-[11px] font-bold relative ${
              activeTab === 'rent' ? 'text-amber-400' : 'text-gray-400'
            }`}
          >
            <Ticket className="w-5 h-5 mb-0.5" />
            Haklar
            {overdueCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        )}
        {!isViewer && (
          <button
            onClick={() => setActiveTab('garageRent')}
            className={`flex flex-col items-center p-1 text-[11px] font-bold relative ${
              activeTab === 'garageRent' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5" />
            Kira
            {unpaidRentCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        )}
        <button
          onClick={() => setActiveTab('print')}
          className={`flex flex-col items-center p-1 text-[11px] font-bold ${
            activeTab === 'print' ? 'text-emerald-400' : 'text-gray-400'
          }`}
        >
          <Printer className="w-5 h-5 mb-0.5" />
          Yazdır
        </button>
      </div>
    </header>
  );
}
