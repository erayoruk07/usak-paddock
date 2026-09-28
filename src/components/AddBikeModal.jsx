import React, { useState } from 'react';
import { X, Bike, User, Camera, Check, Heart, ShieldAlert } from 'lucide-react';
import { 
  TURKEY_MOTORCYCLE_DATABASE, 
  BLOOD_TYPES, 
  RELATIONS, 
  formatPhoneNumber 
} from '../data/mockData';

export default function AddBikeModal({ onClose, onAddBike, garages, defaultGarageId }) {
  const brandList = Object.keys(TURKEY_MOTORCYCLE_DATABASE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    raceNumber: '',
    garageId: defaultGarageId || 'box-1',
    brand: 'Yamaha',
    model: '',
    year: 2024,
    engineSize: '', // Boş
    chassisNumber: '', // Motor Şasi Numarası
    color: '',
    photoUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80',
    ownerName: '',
    ownerPhone: '0 (',
    bloodType: 'A Rh+',
    emergencyName: '',
    emergencyRelation: 'Eşi',
    emergencyPhone: '0 (',
    paymentAmount: 7000,
    totalEntriesGranted: 5,
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
    if (isSubmitting) return; // Çift tıklama / çift kayıt engeli!

    if (!formData.model || !formData.ownerName) {
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
      brand: formData.brand,
      model: formData.model,
      year: Number(formData.year) || 2024,
      engineSize: formData.engineSize || '',
      chassisNumber: formData.chassisNumber || '',
      color: formData.color || 'Yarış Tasarımı',
      photoUrl: formData.photoUrl,
      owner: {
        fullName: formData.ownerName,
        phone: formData.ownerPhone,
        bloodType: formData.bloodType,
        emergencyName: formData.emergencyName || '',
        emergencyRelation: formData.emergencyRelation || 'Eşi',
        emergencyPhone: formData.emergencyPhone || ''
      },
      paymentAmount: Number(formData.paymentAmount) || 7000,
      remainingEntries: Number(formData.totalEntriesGranted) || 5,
      totalEntriesGranted: Number(formData.totalEntriesGranted) || 5,
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
                Yeni Motosiklet & Sürücü Kaydı
              </h3>
              <p className="text-xs text-gray-400">Paddock Box garajına yeni araç ve bakiye tanımlama</p>
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

          {/* 2. Marka & Model (Combobox) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-bold mb-1">
                Marka (Listeden Seçin veya Yazın)
              </label>
              <input
                list="brands-list"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                placeholder="Marka seçin veya yazın..."
                className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                required
              />
              <datalist id="brands-list">
                {brandList.map(b => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">
                Model (Listeden Seçin veya Yazın)
              </label>
              <input
                list="models-list"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Model seçin veya yazın..."
                className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                required
              />
              <datalist id="models-list">
                {availableModels.map(m => (
                  <option key={m} value={m} />
                ))}
              </datalist>
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
                placeholder="örn: 600 cc (İsteğe bağlı)"
                value={formData.engineSize}
                onChange={(e) => setFormData({ ...formData, engineSize: e.target.value })}
                className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-semibold text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-bold mb-1">
                Motor Şasi Numarası
              </label>
              <input
                type="text"
                placeholder="Ruhsat şasi no (VIN)"
                value={formData.chassisNumber}
                onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
                className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2 text-white font-mono text-xs uppercase"
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
          </div>

          {/* 4. Sürücü & Kan Grubu ve Telefon */}
          <div className="p-4 rounded-2xl bg-gray-900 border-2 border-gray-800 space-y-3">
            <div className="font-black text-orange-400 uppercase tracking-wider flex items-center">
              <User className="w-4 h-4 mr-1.5" /> Sürücü & Pilot Bilgileri
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">Pilot Adı Soyadı</label>
                <input
                  type="text"
                  placeholder="Pilot Adı Soyadı"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-bold">Telefon Numarası</label>
                <input
                  type="tel"
                  placeholder="0 (5XX) XXX XX XX"
                  value={formData.ownerPhone}
                  onChange={(e) => handlePhoneChange('ownerPhone', e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-emerald-400 font-bold font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-red-400 mb-1 font-black flex items-center">
                  <Heart className="w-3 h-3 mr-1 fill-red-500 text-red-500" /> Kan Grubu
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full bg-black border-2 border-red-900/60 rounded-xl px-3 py-2 text-red-400 font-black text-xs"
                >
                  {BLOOD_TYPES.map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Acil Durum Yakını */}
            <div className="pt-2 border-t border-gray-800">
              <div className="text-[11px] font-bold text-red-400 mb-2 flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Acil Durumda Ulaşılacak Kişi:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Adı Soyadı</label>
                  <input
                    type="text"
                    placeholder="Acil kişi adı soyadı"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
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

          {/* 5. Pist Giriş Hakkı ve Ödeme Paketi */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border-2 border-amber-800/40 space-y-2">
            <div className="font-black text-amber-400 uppercase tracking-wider">
              🎟️ Pist Giriş Hakkı & Ödeme Paketi
            </div>
            <p className="text-[11px] text-gray-400">
              Sürücü her piste geldiğinde 1 hak düşülür.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Ödenen Tutar (TL)</label>
                <input
                  type="number"
                  value={formData.paymentAmount}
                  onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-amber-400 font-black text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Tanımlanan Piste Giriş Hakkı</label>
                <input
                  type="number"
                  value={formData.totalEntriesGranted}
                  onChange={(e) => setFormData({ ...formData, totalEntriesGranted: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-black text-sm"
                />
              </div>
            </div>
          </div>

          {/* 6. Takılı Parçalar */}
          <div className="space-y-1">
            <label className="block text-gray-300 font-bold">
              Takılı Parçalar & Donanım (Virgülle Ayırın)
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
              <span>{isSubmitting ? 'Kaydediliyor...' : 'Motoru ve Hakları Kaydet'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
