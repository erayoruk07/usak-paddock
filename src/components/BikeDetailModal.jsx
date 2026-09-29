import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Wrench, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Printer, 
  Camera, 
  MessageCircle, 
  Tag, 
  Heart,
  Play,
  History,
  ShieldAlert,
  Bike,
  Eye,
  Edit2,
  Save,
  RotateCcw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BLOOD_TYPES, RELATIONS, formatPhoneNumber, formatTitleCaseTurkish } from '../data/mockData';
import { compressImage } from '../utils/imageCompressor';
import { openWhatsAppMessage } from '../utils/whatsappHelper';

export default function BikeDetailModal({ 
  bike, 
  garages = [],
  currentUser, 
  onClose, 
  onUpdateBike, 
  onOpenPrint,
  onOpenTrackEntry,
  onOpenAddEntries 
}) {
  if (!bike) return null;

  const isViewer = currentUser?.role === 'VIEWER';
  const [activeTab, setActiveTab] = useState('parts'); // 'parts', 'entries', 'owner', 'qr'
  const [newPartName, setNewPartName] = useState('');
  const [showAddPart, setShowAddPart] = useState(false);

  // Araç & Ruhsat Bilgilerini Düzenleme State'i
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [vehicleForm, setVehicleForm] = useState({
    brand: bike.brand || '',
    model: bike.model || '',
    raceNumber: bike.raceNumber || '',
    garageId: bike.garageId || 'box-1',
    chassisNumber: bike.chassisNumber || '',
    engineSize: bike.engineSize || '',
    year: bike.year || 2024,
    color: bike.color || '',
    ownerName: bike.owner?.fullName || '',
    ownerPhone: bike.owner?.phone || '',
    bloodType: bike.owner?.bloodType || 'A Rh+',
    emergencyName: bike.owner?.emergencyName || '',
    emergencyRelation: bike.owner?.emergencyRelation || 'Eşi',
    emergencyPhone: bike.owner?.emergencyPhone || ''
  });

  const remaining = bike.remainingEntries ?? 0;
  const isExpired = remaining <= 0;

  // Fotoğraf değiştirme - Ultra Hızlı İstemci Sıkıştırma (8 MB -> 80 KB)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 1080, 1080, 0.75);
        onUpdateBike({ ...bike, photoUrl: compressedBase64 });
      } catch (err) {
        console.warn('Fotoğraf sıkıştırma hatası:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          onUpdateBike({ ...bike, photoUrl: reader.result });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Yeni parça ekleme
  const handleAddPart = (e) => {
    e.preventDefault();
    if (!newPartName.trim()) return;

    const newPart = {
      id: 'part_' + Date.now(),
      name: newPartName.trim(),
      installedAt: new Date().toISOString().split('T')[0]
    };

    onUpdateBike({
      ...bike,
      equippedParts: [...(bike.equippedParts || []), newPart]
    });
    setNewPartName('');
    setShowAddPart(false);
  };

  // Parça silme
  const handleRemovePart = (partId) => {
    onUpdateBike({
      ...bike,
      equippedParts: bike.equippedParts.filter(p => p.id !== partId)
    });
  };

  // Piste Giriş Yap (-1 Hak Düş)
  const handleUseEntry = () => {
    if (remaining <= 0) {
      alert(`Sayın ${bike.owner?.fullName} için pist giriş hakkı kalmamıştır!`);
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const newHistory = [
      { date: dateStr, note: "Piste giriş yapıldı" },
      ...(bike.entryHistory || [])
    ];

    onUpdateBike({
      ...bike,
      remainingEntries: remaining - 1,
      entryHistory: newHistory
    }, {
      actionType: 'TRACK_ENTRY',
      note: `Piste giriş yapıldı (-1 Hak). Kalan Hak: ${remaining - 1}`
    });

    alert(`🏎️ Piste giriş onaylandı. Kalan Pist Giriş Hakkı: ${remaining - 1}`);
  };

  // Yeni Paket / Hak Yükle (+5 Giriş Hakkı)
  const handleAddEntries = () => {
    const count = prompt(`${bike.owner?.fullName} için kaç pist giriş hakkı tanımlansın?`, '5');
    if (!count || isNaN(count)) return;

    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

    const added = parseInt(count, 10);
    onUpdateBike({
      ...bike,
      remainingEntries: remaining + added,
      totalEntriesGranted: (bike.totalEntriesGranted ?? 0) + added
    }, {
      actionType: 'ENTRIES_GRANTED',
      note: `${added} seanslık yeni hak paketi tanımlandı. Kalan Hak: ${remaining + added}`
    });
  };

  // WhatsApp hatırlatması (Güvenli & Türkiye Formatı Destekli)
  const handleSendWhatsApp = () => {
    const text = `Sayın ${bike.owner?.fullName}, Uşak Yarış Pisti ${bike.garageNo} garajındaki #${bike.raceNumber} yarış numaralı ${bike.brand} ${bike.model} motorunuzun pist giriş hakkı tükenmiştir (0 Hak). Yeni giriş paketi tanımlamak için bizimle iletişime geçebilirsiniz. İyi günler dileriz. - Uşak Paddock Yönetimi`;
    openWhatsAppMessage(bike.owner?.phone, text);
  };

  // Araç & Ruhsat Bilgilerini Kaydetme
  const handleSaveVehicleInfo = (e) => {
    e.preventDefault();
    const targetGarage = garages?.find(g => g.id === vehicleForm.garageId);

    const updated = {
      ...bike,
      brand: vehicleForm.brand.trim() || bike.brand,
      model: vehicleForm.model.trim() || bike.model,
      raceNumber: String(vehicleForm.raceNumber).trim() || bike.raceNumber,
      garageId: targetGarage ? targetGarage.id : bike.garageId,
      garageNo: targetGarage ? targetGarage.name : bike.garageNo,
      chassisNumber: vehicleForm.chassisNumber.trim(),
      engineSize: vehicleForm.engineSize.trim(),
      year: Number(vehicleForm.year) || bike.year,
      color: vehicleForm.color.trim(),
      owner: {
        ...bike.owner,
        fullName: formatTitleCaseTurkish(vehicleForm.ownerName.trim()) || bike.owner?.fullName,
        phone: vehicleForm.ownerPhone.trim() || bike.owner?.phone,
        bloodType: vehicleForm.bloodType || bike.owner?.bloodType,
        emergencyName: formatTitleCaseTurkish(vehicleForm.emergencyName.trim()),
        emergencyRelation: vehicleForm.emergencyRelation || 'Eşi',
        emergencyPhone: vehicleForm.emergencyPhone.trim()
      }
    };

    onUpdateBike(updated, {
      actionType: 'BIKE_UPDATED',
      note: `Araç ruhsat ve pilot bilgileri güncellendi (#${updated.raceNumber} ${updated.brand} ${updated.model})`
    });

    setIsEditingVehicle(false);
    setSaveSuccessMsg('Ruhsat ve araç bilgileri başarıyla güncellendi!');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // Düzenlemeyi İptal Etme
  const handleCancelVehicleEdit = () => {
    setVehicleForm({
      brand: bike.brand || '',
      model: bike.model || '',
      raceNumber: bike.raceNumber || '',
      garageId: bike.garageId || 'box-1',
      chassisNumber: bike.chassisNumber || '',
      engineSize: bike.engineSize || '',
      year: bike.year || 2024,
      color: bike.color || '',
      ownerName: bike.owner?.fullName || '',
      ownerPhone: bike.owner?.phone || '',
      bloodType: bike.owner?.bloodType || 'A Rh+',
      emergencyName: bike.owner?.emergencyName || '',
      emergencyRelation: bike.owner?.emergencyRelation || 'Eşi',
      emergencyPhone: bike.owner?.emergencyPhone || ''
    });
    setIsEditingVehicle(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#151922] border-2 border-gray-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Üst Fotoğraf ve Başlık */}
        <div className="relative h-60 w-full bg-gray-900">
          <img 
            src={bike.photoUrl} 
            alt={bike.model}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151922] via-[#151922]/50 to-black/40"></div>

          {/* Kapat Butonu */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-3 rounded-full bg-black/70 text-white hover:bg-black transition border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Fotoğraf Değiştir - Sadece Yönetici */}
          {!isViewer && (
            <label className="absolute top-4 left-4 cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/20 transition">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Fotoğraf Değiştir</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          )}

          {/* Başlık, Yarış No ve Giriş Durumu */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-lg italic shadow">
                  #{bike.raceNumber}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-black/80 text-white font-bold text-xs border border-white/10">
                  {bike.garageNo}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {bike.brand} {bike.model}
              </h2>
              {bike.chassisNumber && (
                <div className="text-xs text-gray-300 font-mono">
                  Şasi No: {bike.chassisNumber}
                </div>
              )}
            </div>

            {/* Kalan Giriş Rozeti */}
            <div>
              {isExpired ? (
                <span className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs shadow-lg animate-pulse flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Hak Bitti! (0)
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> {remaining} Giriş Hakkı
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4 ANA BÜYÜK SEKME BUTONU */}
        <div className="grid grid-cols-4 border-b-2 border-gray-700 bg-gray-900 text-center">
          <button
            onClick={() => setActiveTab('parts')}
            className={`py-3 px-2 font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition ${
              activeTab === 'parts' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Parçalar</span>
          </button>

          <button
            onClick={() => setActiveTab('entries')}
            className={`py-3 px-2 font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition ${
              activeTab === 'entries' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Pist Girişi ({remaining})</span>
          </button>

          {/* Sürücü & Araç Bilgileri */}
          <button
            onClick={() => setActiveTab('owner')}
            className={`py-3 px-2 font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition ${
              activeTab === 'owner' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Sahibi & Araç</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-2 font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 transition ${
              activeTab === 'qr' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Karekod</span>
          </button>
        </div>

        {/* SEKME İÇERİKLERİ */}
        <div className="p-4 sm:p-6 max-h-[50vh] overflow-y-auto">
          
          {/* 1. SEKME: TAKILI PARÇALAR */}
          {activeTab === 'parts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white uppercase">
                  Motora Takılan Parçalar ({bike.equippedParts?.length || 0}):
                </span>

                {!isViewer && (
                  <button
                    onClick={() => setShowAddPart(!showAddPart)}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center space-x-1 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Parça Ekle</span>
                  </button>
                )}
              </div>

              {!isViewer && showAddPart && (
                <form onSubmit={handleAddPart} className="p-3 bg-gray-900 border-2 border-cyan-500 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-cyan-400">Takılan Donanım Adı:</div>
                  <input 
                    type="text" 
                    placeholder="örn: Capit Lastik Isıtıcı, AIM Solo 2 Laptimer, Koruma Demiri..."
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-700 rounded-xl text-sm text-white font-bold"
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPart(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-400"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-black text-xs"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {(bike.equippedParts || []).map((part) => (
                  <div 
                    key={part.id}
                    className="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gray-800 text-cyan-400">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white">{part.name}</div>
                        <div className="text-xs text-gray-400">Montaj: {part.installedAt}</div>
                      </div>
                    </div>

                    {!isViewer && (
                      <button
                        onClick={() => handleRemovePart(part.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition"
                        title="Parçayı Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                {(!bike.equippedParts || bike.equippedParts.length === 0) && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Bu motora henüz takılı parça kaydedilmemiş.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. SEKME: PİST GİRİŞ BAKİYESİ VE LOGLARI */}
          {activeTab === 'entries' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-gray-900 border-2 border-gray-800 text-center space-y-3">
                <div className="text-xs text-gray-400 font-bold uppercase">
                  Mevcut Pist Giriş Bakiyesi
                </div>
                <div className="text-4xl font-black text-white">
                  <span className={isExpired ? 'text-red-500' : 'text-emerald-400'}>
                    {remaining}
                  </span>
                  <span className="text-gray-500 text-xl font-bold"> / {bike.totalEntriesGranted || 5} Giriş</span>
                </div>

                {!isViewer ? (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        if (onOpenTrackEntry) onOpenTrackEntry(bike);
                        else handleUseEntry();
                      }}
                      disabled={isExpired}
                      className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg transition ${
                        isExpired 
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white active:scale-95 shadow-red-600/30'
                      }`}
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>Piste Giriş Yap</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenAddEntries) onOpenAddEntries(bike);
                        else handleAddEntries();
                      }}
                      className="py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm flex items-center justify-center space-x-2 shadow"
                    >
                      <Plus className="w-5 h-5" />
                      <span>+ Hak Yükle</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800 text-cyan-300 text-xs font-bold flex items-center justify-center space-x-2 mt-2">
                    <Eye className="w-4 h-4" />
                    <span>Gözlemci Modu: Hak düşme ve yeni hak tanımlama yetkiniz bulunmamaktadır.</span>
                  </div>
                )}
              </div>

              {/* Giriş Geçmişi */}
              <div className="space-y-2">
                <div className="text-xs text-gray-400 font-bold uppercase flex items-center">
                  <History className="w-4 h-4 mr-1 text-cyan-400" />
                  Piste Giriş Geçmişi:
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(bike.entryHistory || []).map((entry, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-xl bg-black/50 border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-gray-300">📅 {entry.date}</span>
                      <span className="text-emerald-400 font-semibold">{entry.note}</span>
                    </div>
                  ))}
                  {(!bike.entryHistory || bike.entryHistory.length === 0) && (
                    <div className="text-xs text-gray-500 text-center py-3">
                      Henüz bu paketten piste giriş yapılmamış.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. SEKME: SÜRÜCÜ & ARACIN MARKA, MODEL, ŞASİ BİLGİLERİ */}
          {activeTab === 'owner' && (
            <div className="space-y-4">
              
              {/* Başarı Bildirimi */}
              {saveSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-600 text-emerald-400 text-xs font-black flex items-center space-x-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* DÜZENLEME FORMU VEYA GÖRÜNTÜLEME MODU */}
              {isEditingVehicle ? (
                <form onSubmit={handleSaveVehicleInfo} className="p-4 sm:p-5 rounded-3xl bg-black/80 border-2 border-amber-500/80 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                    <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center">
                      <Edit2 className="w-4 h-4 mr-1.5" />
                      Araç & Ruhsat Bilgilerini Düzenle
                    </div>
                    <span className="text-[10px] text-gray-400">Veritabanına anında işlenir</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Marka */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Marka</label>
                      <input
                        type="text"
                        value={vehicleForm.brand}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Model */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Model</label>
                      <input
                        type="text"
                        value={vehicleForm.model}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Yarış Numarası */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Yarış Numarası (#)</label>
                      <input
                        type="text"
                        value={vehicleForm.raceNumber}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, raceNumber: e.target.value })}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-amber-400 font-mono font-black focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Garaj Seçimi */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Paddock Box Garajı</label>
                      <select
                        value={vehicleForm.garageId}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, garageId: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-500 focus:outline-none"
                      >
                        {garages && garages.length > 0 ? (
                          garages.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))
                        ) : (
                          <option value={bike.garageId}>{bike.garageNo}</option>
                        )}
                      </select>
                    </div>

                    {/* Şasi Numarası (VIN) */}
                    <div className="col-span-full">
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Motor Şasi Numarası (VIN)</label>
                      <input
                        type="text"
                        value={vehicleForm.chassisNumber}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, chassisNumber: e.target.value.toUpperCase() })}
                        placeholder="örn: JYARJ27E0001046"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-mono font-bold tracking-wider focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Motor Hacmi */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Motor Hacmi</label>
                      <input
                        type="text"
                        value={vehicleForm.engineSize}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, engineSize: e.target.value })}
                        placeholder="örn: 599 cc"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Model Yılı */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Model Yılı</label>
                      <input
                        type="number"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, year: Number(e.target.value) })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Renk */}
                    <div className="col-span-full">
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Renk / Tasarım</label>
                      <input
                        type="text"
                        value={vehicleForm.color}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                        placeholder="örn: Yarış Mavisi / Karbon"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Pilot Bilgileri Düzenleme */}
                    <div className="col-span-full pt-2 border-t border-gray-800">
                      <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider block mb-2">
                        Sürücü & İletişim Bilgileri:
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Pilot Adı Soyadı</label>
                      <input
                        type="text"
                        value={vehicleForm.ownerName}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, ownerName: e.target.value })}
                        onBlur={() => setVehicleForm({ ...vehicleForm, ownerName: formatTitleCaseTurkish(vehicleForm.ownerName) })}
                        placeholder="örn: Kenan Sofuoğlu"
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-white font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Pilot Telefonu</label>
                      <input
                        type="text"
                        value={vehicleForm.ownerPhone}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, ownerPhone: formatPhoneNumber(e.target.value) })}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-emerald-400 font-mono font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Kan Grubu</label>
                      <select
                        value={vehicleForm.bloodType}
                        onChange={(e) => setVehicleForm({ ...vehicleForm, bloodType: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-red-400 font-bold focus:border-amber-500 focus:outline-none"
                      >
                        {BLOOD_TYPES.map(bt => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Acil Durum Yakını & Telefonu</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={vehicleForm.emergencyName}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, emergencyName: e.target.value })}
                          onBlur={() => setVehicleForm({ ...vehicleForm, emergencyName: formatTitleCaseTurkish(vehicleForm.emergencyName) })}
                          placeholder="Yakın Adı"
                          className="w-1/2 bg-gray-900 border border-gray-700 rounded-xl p-2 text-white font-bold text-xs"
                        />
                        <input
                          type="text"
                          value={vehicleForm.emergencyPhone}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, emergencyPhone: formatPhoneNumber(e.target.value) })}
                          placeholder="Telefon"
                          className="w-1/2 bg-gray-900 border border-gray-700 rounded-xl p-2 text-red-400 font-mono font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Butonları */}
                  <div className="pt-3 border-t border-gray-800 flex items-center justify-end space-x-2.5">
                    <button
                      type="button"
                      onClick={handleCancelVehicleEdit}
                      className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>İptal</span>
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-600/30"
                    >
                      <Save className="w-4 h-4" />
                      <span>Ruhsatı Güncelle / Kaydet</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* GÖRÜNTÜLEME MODU */
                <div className="p-4 rounded-3xl bg-black/60 border-2 border-cyan-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center">
                      <Bike className="w-4 h-4 mr-1.5" />
                      Araç & Ruhsat Bilgileri
                    </div>

                    {!isViewer && (
                      <button
                        type="button"
                        onClick={() => {
                          setVehicleForm({
                            brand: bike.brand || '',
                            model: bike.model || '',
                            raceNumber: bike.raceNumber || '',
                            garageId: bike.garageId || 'box-1',
                            chassisNumber: bike.chassisNumber || '',
                            engineSize: bike.engineSize || '',
                            year: bike.year || 2024,
                            color: bike.color || '',
                            ownerName: bike.owner?.fullName || '',
                            ownerPhone: bike.owner?.phone || '',
                            bloodType: bike.owner?.bloodType || 'A Rh+',
                            emergencyName: bike.owner?.emergencyName || '',
                            emergencyRelation: bike.owner?.emergencyRelation || 'Eşi',
                            emergencyPhone: bike.owner?.emergencyPhone || ''
                          });
                          setIsEditingVehicle(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-bold text-xs flex items-center space-x-1.5 border border-cyan-500/40 transition active:scale-95"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Ruhsatı Düzenle</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-gray-900/80 rounded-xl border border-gray-800">
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Marka & Model</span>
                      <span className="text-white font-black text-sm">{bike.brand} {bike.model}</span>
                    </div>

                    <div className="p-2.5 bg-gray-900/80 rounded-xl border border-gray-800">
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Yarış Numarası & Garaj</span>
                      <span className="text-amber-400 font-black text-sm">#{bike.raceNumber} • {bike.garageNo}</span>
                    </div>

                    <div className="p-2.5 bg-gray-900/80 rounded-xl border border-gray-800 col-span-2">
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Motor Şasi Numarası (VIN)</span>
                      <span className="text-white font-mono font-bold text-sm tracking-wider">
                        {bike.chassisNumber || "Şasi numarası girilmemiş"}
                      </span>
                    </div>

                    <div className="p-2.5 bg-gray-900/80 rounded-xl border border-gray-800">
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Motor Hacmi / Yıl</span>
                      <span className="text-gray-200 font-semibold">{bike.engineSize || "-"} • {bike.year}</span>
                    </div>

                    <div className="p-2.5 bg-gray-900/80 rounded-xl border border-gray-800">
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Renk / Tasarım</span>
                      <span className="text-gray-200 font-semibold">{bike.color || "-"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SÜRÜCÜ BİLGİLERİ */}
              <div className="p-4 rounded-3xl bg-gray-900 border-2 border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase">Sürücü / Pilot</span>
                  {/* Kan Grubu Rozeti */}
                  <span className="px-3 py-1 rounded-xl bg-red-950 border-2 border-red-600 text-red-400 font-black text-sm flex items-center">
                    <Heart className="w-4 h-4 mr-1.5 fill-red-500 text-red-500" />
                    {bike.owner?.bloodType || "Kan Grubu Yok"}
                  </span>
                </div>

                <div className="text-2xl font-black text-white">{bike.owner?.fullName}</div>
                
                <div className="text-base font-bold text-emerald-400 flex items-center font-mono">
                  <Phone className="w-4 h-4 mr-2" />
                  {bike.owner?.phone}
                </div>

                <div className="pt-3 border-t border-gray-800 flex gap-2">
                  <button
                    onClick={handleSendWhatsApp}
                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center space-x-2 shadow"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp Mesajı</span>
                  </button>
                  <a
                    href={`tel:${bike.owner?.phone}`}
                    className="py-3 px-6 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white font-black text-sm flex items-center justify-center space-x-2 border border-gray-700"
                  >
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <span>Ara</span>
                  </a>
                </div>
              </div>

              {/* Acil Durum Yakını */}
              {bike.owner?.emergencyPhone && (
                <div className="p-4 rounded-3xl bg-red-950/20 border-2 border-red-900/40 space-y-1">
                  <div className="text-xs text-red-400 font-bold flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-1.5" />
                    Acil Durumda Aranacak Yakını ({bike.owner?.emergencyRelation || 'Yakını'}):
                  </div>
                  <div className="text-base font-black text-white">{bike.owner?.emergencyName}</div>
                  <div className="text-sm font-mono font-bold text-red-400">{bike.owner?.emergencyPhone}</div>
                </div>
              )}
            </div>
          )}

          {/* 4. SEKME: KAREKOD */}
          {activeTab === 'qr' && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl max-w-xs mx-auto border-2 border-dashed border-black text-black shadow-lg">
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-gray-500 pb-1.5 border-b border-dashed border-gray-300">
                  <span>✂️ KESİM ÇİZGİSİ</span>
                  <span className="font-black text-red-600 uppercase tracking-wider">UŞAK PADDOCK</span>
                </div>

                <div className="flex items-center justify-between pt-2 pb-1 text-left">
                  <div>
                    <div className="text-[11px] font-black tracking-widest text-red-600 uppercase leading-none">
                      UŞAK YARIŞ PİSTİ
                    </div>
                    <div className="text-sm font-black uppercase text-black tracking-tight mt-0.5">
                      {bike.garageNo}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-black text-white font-black text-base italic shadow-sm">
                    #{bike.raceNumber}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center py-2">
                  <div className="p-2.5 bg-white border-2 border-black rounded-xl">
                    <QRCodeSVG 
                      value={`USAK_TRACK_BIKE:${bike.id}`}
                      size={150}
                      level="H"
                    />
                  </div>
                  <span className="text-xs font-mono font-black text-black mt-1.5 tracking-wider">
                    ID: {bike.id}
                  </span>
                </div>

                <div className="border-t-2 border-black pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-gray-600 uppercase">
                    BOX ETİKETİ
                  </span>
                  <span className="text-xs font-black text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                    PADDOCK KARTI
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenPrint(bike);
                }}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-center space-x-2 mx-auto shadow-lg"
              >
                <Printer className="w-5 h-5" />
                <span>Yazıcıdan Sticker Bas</span>
              </button>
            </div>
          )}

        </div>

        {/* Modal Kapat */}
        <div className="p-4 bg-gray-900 border-t-2 border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
