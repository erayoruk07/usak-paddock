import React, { useState } from 'react';
import { 
  X, 
  Bike, 
  User, 
  Camera, 
  Check, 
  Heart, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Tag, 
  Link as LinkIcon, 
  Sparkles,
  Upload
} from 'lucide-react';
import { 
  TURKEY_MOTORCYCLE_DATABASE, 
  BLOOD_TYPES, 
  RELATIONS, 
  formatPhoneNumber,
  formatTitleCaseTurkish
} from '../data/mockData';
import { compressImage } from '../utils/imageCompressor';
import { MonthYearPicker } from './CustomDateSelectors';

// Hızlı Pist Donanımı Önerileri
const POPULAR_TRACK_PARTS = [
  'Capit Lastik Isıtıcı',
  'AIM Solo 2 Laptimer',
  'Motor Koruma Demiri',
  'Quickshifter',
  'Yarış Grenajı',
  'Akrapovič Egzoz',
  'Çelik Fren Hortumu',
  'Öhlins Direksiyon Amortisörü',
  'Radyatör Koruma',
  'Karbon Şasi Koruma'
];

export default function AddBikeModal({ onClose, onAddBike, garages, defaultGarageId }) {
  const brandList = Object.keys(TURKEY_MOTORCYCLE_DATABASE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combobox özel yazma geçişleri (Mobil uyumlu)
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);

  // Fotoğraf URL modal/input modu
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Parçalar (Widget & Badge Sistemi)
  const [partsList, setPartsList] = useState([
    { id: 'part_1', name: 'Capit Lastik Isıtıcı', installedAt: new Date().toISOString().split('T')[0] },
    { id: 'part_2', name: 'AIM Solo 2 Laptimer', installedAt: new Date().toISOString().split('T')[0] },
    { id: 'part_3', name: 'Motor Koruma Demiri', installedAt: new Date().toISOString().split('T')[0] }
  ]);
  const [newPartName, setNewPartName] = useState('');

  const [formData, setFormData] = useState({
    raceNumber: '',
    garageId: defaultGarageId || 'box-1',
    garageJoinDate: new Date().toISOString().split('T')[0],
    brand: 'Yamaha',
    model: 'YZF-R6',
    year: 2024,
    engineSize: '',
    chassisNumber: '',
    color: '',
    photoUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80',
    ownerName: '',
    ownerPhone: '0 (',
    bloodType: 'A Rh+',
    emergencyName: '',
    emergencyRelation: 'Eşi',
    emergencyPhone: '0 ('
  });

  const availableModels = TURKEY_MOTORCYCLE_DATABASE[formData.brand] || [];

  const handlePhoneChange = (field, value) => {
    setFormData({ ...formData, [field]: formatPhoneNumber(value) });
  };

  // Fotoğraf Yükleme (Dosya / Kamera) - Ultra Hızlı İstemci Taraflı Sıkıştırma (8 MB -> 80 KB)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 1080, 1080, 0.75);
        setFormData(prev => ({ ...prev, photoUrl: compressedBase64 }));
      } catch (err) {
        console.warn('Fotoğraf sıkıştırma hatası, orijinal yükleniyor:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, photoUrl: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // URL ile Fotoğraf Ekleme
  const handleApplyPhotoUrl = (e) => {
    e.preventDefault();
    if (customPhotoUrl.trim()) {
      setFormData(prev => ({ ...prev, photoUrl: customPhotoUrl.trim() }));
      setShowUrlInput(false);
      setCustomPhotoUrl('');
    }
  };

  // Parça Ekleme (Widget)
  const handleAddPart = (partNameToAdd = null) => {
    const name = (partNameToAdd || newPartName).trim();
    if (!name) return;

    // Aynı parça varsa tekrar ekleme
    if (partsList.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setNewPartName('');
      return;
    }

    const newPart = {
      id: 'part_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name,
      installedAt: new Date().toISOString().split('T')[0]
    };

    setPartsList(prev => [...prev, newPart]);
    setNewPartName('');
  };

  // Parça Silme (Widget)
  const handleRemovePart = (partId) => {
    setPartsList(prev => prev.filter(p => p.id !== partId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.model?.trim() || !formData.ownerName?.trim()) {
      alert('Lütfen motor modelini ve pilot adını giriniz.');
      return;
    }

    setIsSubmitting(true);

    const bikeId = 'USAK-' + String(Math.floor(1000 + Math.random() * 9000));
    const targetGarage = garages?.find(g => g.id === formData.garageId) || garages?.[0];

    // İsimleri standart tek tip formata getir (Örn: "ahmet can" -> "Ahmet Can")
    const formattedOwnerName = formatTitleCaseTurkish(formData.ownerName.trim());
    const formattedEmergencyName = formData.emergencyName?.trim() 
      ? formatTitleCaseTurkish(formData.emergencyName.trim()) 
      : '';

    const startPeriod = formData.garageStartPeriod || (formData.garageJoinDate ? formData.garageJoinDate.substring(0, 7) : new Date().toISOString().substring(0, 7));
    const joinDate = formData.garageJoinDate || `${startPeriod}-01`;

    const newBike = {
      id: bikeId,
      garageId: targetGarage ? targetGarage.id : 'box-1',
      garageNo: targetGarage ? targetGarage.name : 'Paddock Box 1',
      garageStartPeriod: startPeriod,
      garageJoinDate: joinDate,
      raceNumber: formData.raceNumber || '99',
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      year: Number(formData.year) || 2024,
      engineSize: formData.engineSize?.trim() || '',
      chassisNumber: formData.chassisNumber?.trim() || '',
      color: formData.color?.trim() || 'Yarış Tasarımı',
      photoUrl: formData.photoUrl,
      owner: {
        fullName: formattedOwnerName,
        phone: formData.ownerPhone.trim(),
        bloodType: formData.bloodType,
        emergencyName: formattedEmergencyName,
        emergencyRelation: formData.emergencyRelation || 'Eşi',
        emergencyPhone: formData.emergencyPhone?.trim() || ''
      },
      paymentAmount: 0,
      remainingEntries: 0, // Pist giriş hakkı sonradan bağımsız hak yükle pop-up'ından eklenir
      totalEntriesGranted: 0,
      entryHistory: [
        {
          type: 'RENT_CONFIG',
          garageStartPeriod: startPeriod,
          garageJoinDate: joinDate,
          customMonthlyRent: null
        }
      ],
      equippedParts: partsList
    };

    onAddBike(newBike);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#151922] border-2 border-gray-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Başlık */}
        <div className="p-4 sm:p-5 bg-gray-900 border-b-2 border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-red-600 text-white shadow-lg">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                Yeni Motosiklet &amp; Sürücü Kaydı
              </h3>
              <p className="text-xs text-gray-400">Paddock Box garajına araç ve donanım tanımlama</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          
          {/* 1. Fotoğraf, Yarış Numarası, Garaj ve Kira Başlangıç Dönemi */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-3.5">
            {/* Üst Kısım: Fotoğraf ve Yarış Numarası & Garaj Seçimi */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              
              {/* Fotoğraf Alanı & Kontrolleri */}
              <div className="flex flex-col items-center space-y-2 shrink-0">
                <div className="relative w-36 h-28 rounded-2xl overflow-hidden bg-black border-2 border-gray-700 shadow-md group">
                  <img 
                    src={formData.photoUrl} 
                    alt="Motor Önizleme" 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-white">
                    <Camera className="w-5 h-5 mb-1 text-cyan-400" />
                    <span className="text-[10px] font-bold">Fotoğraf Değiştir</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>

                {/* Fotoğraf Butonları: Galeri, Kamera, URL */}
                <div className="flex items-center space-x-1">
                  <label className="px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold cursor-pointer flex items-center space-x-1 border border-gray-700">
                    <Upload className="w-3 h-3 text-cyan-400" />
                    <span>Yükle</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold flex items-center space-x-1 border border-gray-700"
                  >
                    <LinkIcon className="w-3 h-3 text-amber-400" />
                    <span>Link Gir</span>
                  </button>
                </div>

                {showUrlInput && (
                  <div className="w-full flex items-center space-x-1 mt-1">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded-lg px-2 py-1 text-[10px] text-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPhotoUrl}
                      className="px-2 py-1 rounded-lg bg-cyan-600 text-white font-bold text-[10px]"
                    >
                      Uygula
                    </button>
                  </div>
                )}
              </div>

              {/* Yarış Numarası ve Garaj Seçimi */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    Yarış Numarası (#)
                  </label>
                  <input
                    type="text"
                    placeholder="örn: 46, 54, 99"
                    value={formData.raceNumber}
                    onChange={(e) => setFormData({ ...formData, raceNumber: e.target.value })}
                    className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-black text-sm text-center focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    Paddock Box Garajı
                  </label>
                  <select
                    value={formData.garageId}
                    onChange={(e) => setFormData({ ...formData, garageId: e.target.value })}
                    className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  >
                    {(garages || []).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Alt Kısım: Kira Başlangıç Dönemi (Ay / Yıl) - Tam Genişlik */}
            <div className="w-full pt-3 border-t border-gray-800">
              <MonthYearPicker
                label="Garaj Kira Başlangıç Dönemi (Ay / Yıl)"
                value={formData.garageJoinDate}
                onChange={(val) => setFormData({ 
                  ...formData, 
                  garageJoinDate: val,
                  garageStartPeriod: val.substring(0, 7)
                })}
                color="purple"
                showPresets={true}
              />
            </div>
          </div>

          {/* 2. Marka & Model (Mobil Uyumlu Combobox) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Marka Seçimi */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-300 font-bold">
                  Motosiklet Markası
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomBrand(!isCustomBrand);
                    if (!isCustomBrand) setIsCustomModel(true);
                  }}
                  className="text-[10px] text-cyan-400 font-bold hover:underline"
                >
                  {isCustomBrand ? "← Listeden Seç" : "+ Elle Yaz"}
                </button>
              </div>

              {isCustomBrand ? (
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Marka adı yazın (örn: Ducati...)"
                  className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-red-500 focus:outline-none"
                  required
                />
              ) : (
                <select
                  value={formData.brand}
                  onChange={(e) => {
                    const b = e.target.value;
                    const models = TURKEY_MOTORCYCLE_DATABASE[b] || [];
                    setFormData({ 
                      ...formData, 
                      brand: b, 
                      model: models.length > 0 ? models[0] : '' 
                    });
                    setIsCustomModel(false);
                  }}
                  className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-red-500 focus:outline-none"
                >
                  {brandList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Model Seçimi */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-300 font-bold">
                  Model
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomModel(!isCustomModel)}
                  className="text-[10px] text-cyan-400 font-bold hover:underline"
                >
                  {isCustomModel ? "← Listeden Seç" : "+ Elle Yaz"}
                </button>
              </div>

              {isCustomModel || availableModels.length === 0 ? (
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Model adı yazın (örn: YZF-R6, Panigale V4...)"
                  className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-red-500 focus:outline-none"
                  required
                />
              ) : (
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:border-red-500 focus:outline-none"
                  required
                >
                  <option value="">-- Model Seçin --</option>
                  {availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 3. Motor Hacmi, Yıl ve Şasi No */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-300 font-bold mb-1">
                Motor Hacmi
              </label>
              <input
                type="text"
                placeholder="örn: 599 cc, 1000 cc"
                value={formData.engineSize}
                onChange={(e) => setFormData({ ...formData, engineSize: e.target.value })}
                className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">
                Model Yılı
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">
                Motor Şasi No (VIN)
              </label>
              <input
                type="text"
                placeholder="örn: JYARJ27E0001046"
                value={formData.chassisNumber}
                onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() })}
                className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Renk */}
          <div>
            <label className="block text-gray-300 font-bold mb-1">
              Renk / Kaplama Tasarımı
            </label>
            <input
              type="text"
              placeholder="örn: Yarış Mavisi / Karbon, Monster Energy vb."
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white text-xs"
            />
          </div>

          {/* 4. Sürücü ve Acil Durum Bilgileri (Otomatik Baş Harf Algılama) */}
          <div className="p-4 rounded-2xl bg-gray-900/90 border-2 border-gray-800 space-y-3">
            <div className="font-black text-cyan-400 uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1.5" />
                <span>Sürücü / Pilot Bilgileri</span>
              </div>
              <span className="text-[10px] text-gray-400 font-normal">
                (Nasıl yazarsanız yazın tek tip formatlanır)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 mb-1">Pilot Adı Soyadı</label>
                <input
                  type="text"
                  placeholder="örn: Ahmet Can Yılmaz"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  onBlur={() => setFormData(prev => ({ ...prev, ownerName: formatTitleCaseTurkish(prev.ownerName) }))}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  placeholder="0 (5XX) XXX XX XX"
                  value={formData.ownerPhone}
                  onChange={(e) => handlePhoneChange('ownerPhone', e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-emerald-400 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 flex items-center">
                  <Heart className="w-3 h-3 mr-1 text-red-500 fill-red-500" />
                  Kan Grubu
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-red-400 font-bold text-xs"
                >
                  {BLOOD_TYPES.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Acil Durum Yakını */}
            <div className="pt-2 border-t border-gray-800 space-y-2">
              <div className="text-[11px] font-bold text-red-400 flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Acil Durumda Ulaşılacak Kişi:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Adı Soyadı</label>
                  <input
                    type="text"
                    placeholder="örn: Ayşe Yılmaz"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    onBlur={() => setFormData(prev => ({ ...prev, emergencyName: formatTitleCaseTurkish(prev.emergencyName) }))}
                    className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Yakınlık Derecesi</label>
                  <select
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  >
                    {RELATIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Yakını Telefon Numarası</label>
                  <input
                    type="tel"
                    placeholder="0 (5XX) XXX XX XX"
                    value={formData.emergencyPhone}
                    onChange={(e) => handlePhoneChange('emergencyPhone', e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* 5. Takılı Parçalar & Donanım (Yeni Widget & Badge Sistemi) */}
          <div className="p-4 rounded-2xl bg-gray-900/90 border-2 border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-black text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Takılı Donanım &amp; Parçalar ({partsList.length})</span>
              </div>
              <span className="text-[10px] text-gray-400">Tek tek ekle / sil</span>
            </div>

            {/* Parça Ekleme Inputu */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPart();
                  }
                }}
                placeholder="Yeni parça yazın (örn: Akrapovič Egzoz, Quickshifter...)"
                className="flex-1 bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddPart()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs flex items-center space-x-1 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </button>
            </div>

            {/* Hızlı Öneri Chip'leri */}
            <div>
              <span className="text-[10px] text-gray-400 font-bold block mb-1.5 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                Hızlı Ekle (Pist Donanımları):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TRACK_PARTS.map((part) => {
                  const alreadyAdded = partsList.some(p => p.name.toLowerCase() === part.toLowerCase());
                  return (
                    <button
                      key={part}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddPart(part)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        alreadyAdded
                          ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed line-through'
                          : 'bg-black/60 text-gray-300 border-gray-700 hover:border-amber-500 hover:text-amber-400 active:scale-95'
                      }`}
                    >
                      + {part}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Eklenen Parçaların Widget / Badge Listesi */}
            <div className="space-y-1.5 pt-1">
              {partsList.map((part) => (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-gray-700/80 group hover:border-amber-500/60 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="text-white font-bold text-xs">{part.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">({part.installedAt})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePart(part.id)}
                    className="p-1 text-gray-500 hover:text-red-400 transition"
                    title="Parçayı Kaldır"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {partsList.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-[11px] italic bg-black/40 rounded-xl border border-dashed border-gray-800">
                  Henüz parça eklenmedi. Yukarıdaki önerilerden seçebilir veya elle yazıp ekleyebilirsiniz.
                </div>
              )}
            </div>

          </div>

          {/* Kaydet Butonları */}
          <div className="pt-3 border-t-2 border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-2xl bg-gray-800 text-gray-300 font-bold text-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-sm flex items-center space-x-2 shadow-lg ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-500 hover:to-orange-500 active:scale-95'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>{isSubmitting ? 'Kaydediliyor...' : 'Motoru Kaydet'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
