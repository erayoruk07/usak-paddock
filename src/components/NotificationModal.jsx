import React from 'react';
import { X, Bell, AlertTriangle, MessageCircle, CheckCircle2, ChevronRight, Heart } from 'lucide-react';

export default function NotificationModal({ bikes, onClose, onSelectBike, onQuickWhatsApp }) {
  const expiredBikes = bikes.filter(b => (b.remainingEntries ?? 0) <= 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#151922] border-2 border-gray-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Başlık */}
        <div className="p-4 sm:p-5 bg-gray-900 border-b-2 border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-red-600 text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Giriş Hakkı Biten Sürücüler
              </h3>
              <p className="text-xs text-gray-400">Piste giriş bakiyesi 0 olan motorlar</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bildirim Listesi */}
        <div className="p-4 sm:p-6 space-y-3 max-h-[60vh] overflow-y-auto text-xs">
          
          {expiredBikes.length > 0 ? (
            <div className="space-y-2.5">
              <div className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1 text-red-500 animate-pulse" />
                Giriş Hakkı Tükenen Motorlar ({expiredBikes.length})
              </div>

              {expiredBikes.map(bike => (
                <div 
                  key={bike.id} 
                  className="p-3.5 rounded-2xl bg-red-950/20 border-2 border-red-900/60 flex items-center justify-between hover:border-red-500 transition cursor-pointer"
                  onClick={() => {
                    onSelectBike(bike);
                    onClose();
                  }}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black italic flex items-center justify-center shrink-0 text-xs">
                      #{bike.raceNumber}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-sm text-white truncate">{bike.owner?.fullName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 font-black text-[10px] flex items-center">
                          <Heart className="w-2.5 h-2.5 mr-0.5 fill-red-500 text-red-500" />
                          {bike.owner?.bloodType || "Kan Yok"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">{bike.brand} {bike.model} • {bike.garageNo}</div>
                      <div className="text-xs text-red-400 font-bold mt-0.5">
                        Kalan Hak: 0 Giriş (Paket Bitti)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onQuickWhatsApp(bike)}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                      title="WhatsApp'tan Hatırlat"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <div className="font-black text-white text-base">Hakkı Biten Motor Yok!</div>
              <p className="text-xs text-gray-400 mt-1">Tüm sürücülerin pist giriş bakiyesi mevcut.</p>
            </div>
          )}

        </div>

        {/* Kapat Butonu */}
        <div className="p-3 bg-gray-900 border-t-2 border-gray-700 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-800 text-white font-bold text-xs"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
