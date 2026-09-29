import React, { useState } from 'react';
import { X, Bike, User, Camera, Check, Heart, ShieldAlert } from 'lucide-react';
import { 
  TURKEY_MOTORCYCLE_DATABASE, 
  BLOOD_TYPES, 
  RELATIONS, 
  formatPhoneNumber,
  formatFirstLetterLower
} from '../data/mockData';

export default function AddBikeModal({ onClose, onAddBike, garages, defaultGarageId }) {
  const brandList = Object.keys(TURKEY_MOTORCYCLE_DATABASE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combobox özel yazma geçişleri (Mobil uyumlu)
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);

  const [formData, setFormData] = useState({
    raceNumber: '',
    garageId: defaultGarageId || 'box-1',
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
    emergencyPhone: '0 (',
    initialParts: 'Capit Lastik Isıtıcı, AIM Solo 2 Laptimer, Koruma Demiri'
  });

  const availableModels = TURKEY_MOTORCYCLE_DATABASE[formData.brand] || [];

  const handlePhoneChange = (field, value) => {
    setFormData({ ...formData, [field]: formatPhoneNumber(value) });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
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

    const partsArray = formData.initialParts
      ? formData.initialParts.split(',').map((p, idx) => ({
          id: 'part_' + Date.now() + '_' + idx,
          name: p.trim(),
          installedAt: new Date().toISOString().split('T')[0]
        }))
      : [];

    const newBike = {
      id: bikeId,
      garageId: targetGarage ? targetGarage.id : 'box-1',
      garageNo: targetGarage ? targetGarage.name : 'Paddock Box 1',
      raceNumber: formData.raceNumber || '99',
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      year: Number(formData.year) || 2024,
      engineSize: formData.engineSize?.trim() || '',
      chassisNumber: formData.chassisNumber?.trim() || '',
      color: formData.color?.trim() || 'Yarış Tasarımı',
      photoUrl: formData.photoUrl,
      owner: {
        fullName: formData.ownerName.trim(),
        phone: formData.ownerPhone.trim(),
        bloodType: formData.bloodType,
        emergencyName: formData.emergencyName?.trim() || '',
        emergencyRelation: formData.emergencyRelation || 'Eşi',
        emergencyPhone: formData.emergencyPhone?.trim() || ''
      },
      paymentAmount: 0,
      remainingEntries: 0, // Pist giriş hakkı sonradan hak yükle pop-up'ından eklenecektir
      totalEntriesGranted: 0,
      entryHistory: [],
      equippedParts: partsArray
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
              <p className="text-xs text-gray-400">Paddock Box garajına araç ve ruhsat tanımlama</p>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* 1. Fotoğraf, Yarış Numarası ve Garaj Seçimi */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-36 h-28 rounded-2xl overflow-hidden bg-gray-900 border-2 border-gray-700 shrink-0">
              <img 
                src={formData.photoUrl} 
                alt="Motor" 
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-white">
                <Camera className="w-5 h-5 mb-1 text-cyan-400" />
                <span className="text-[10px] font-bold">Fotoğraf Yükle</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            <div className="flex-1 w-full grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  Yarış Numarası (#)
                </label>
                <input
                  type="text"
                  placeholder="örn: 46, 54, 99"
                  value={formData.raceNumber}
                  onChange={(e) => setFormData({ ...formData, raceNumber: e.target.value })}
                  className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-black text-sm"
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

          {/* 3. Motor Hacmi ve Şasi Numarası */}
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

          {/* 4. Sürücü ve Acil Durum Bilgileri */}
          <div className="p-4 rounded-2xl bg-gray-900/90 border-2 border-gray-800 space-y-3">
            <div className="font-black text-cyan-400 uppercase tracking-wider flex items-center">
              <User className="w-4 h-4 mr-1.5" />
              Sürücü / Pilot Bilgileri
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 mb-1">Pilot Adı Soyadı</label>
                <input
                  type="text"
                  placeholder="örn: caner yıldız"
                  value={formData.ownerName}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  onChange={(e) => setFormData({ ...formData, ownerName: formatFirstLetterLower(e.target.value) })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white text-xs"
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
                    placeholder="örn: ayşe yıldız"
                    value={formData.emergencyName}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    onChange={(e) => setFormData({ ...formData, emergencyName: formatFirstLetterLower(e.target.value) })}
                    className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white text-xs"
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

          {/* 5. Takılı Parçalar */}
          <div className="space-y-1">
            <label className="block text-gray-300 font-bold">
              Takılı Parçalar &amp; Donanım (Virgülle Ayırın)
            </label>
            <input
              type="text"
              value={formData.initialParts}
              onChange={(e) => setFormData({ ...formData, initialParts: e.target.value })}
              placeholder="örn: Capit Lastik Isıtıcı, AIM Solo 2 Laptimer, Koruma Demiri"
              className="w-full bg-black border-2 border-gray-700 rounded-xl p-2.5 text-white text-xs"
            />
          </div>

          {/* Kaydet Butonları (isSubmitting Korumalı) */}
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
