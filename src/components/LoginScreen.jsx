import React, { useState } from 'react';
import { Warehouse, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

import { authenticateUser } from '../services/dbService';

export default function LoginScreen({ onLogin, admins }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const res = await authenticateUser(username, password);
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setError(res.message || 'Kullanıcı adı veya şifre hatalı!');
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col justify-between p-4 carbon-pattern">
      
      {/* Üst boşluk dengeleyici */}
      <div className="hidden sm:block"></div>

      {/* Giriş Kartı */}
      <div className="w-full max-w-md mx-auto bg-[#151922] border-2 border-gray-700 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 my-auto">
        
        {/* Logo ve Başlık */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-red-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-600/30">
            <Warehouse className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase">
            UŞAK PİSTİ GARAJ
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-bold">
            Paddock Box Yönetim & Giriş Sistemi
          </p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-700 text-xs sm:text-sm text-red-300 font-bold flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 font-bold text-xs sm:text-sm mb-1.5 flex items-center">
              <User className="w-4 h-4 mr-1.5 text-cyan-400" />
              Kullanıcı Adı:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adınızı girin"
              className="w-full bg-black border-2 border-gray-700 rounded-2xl px-4 py-3 text-base text-white font-bold focus:outline-none focus:border-red-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-gray-300 font-bold text-xs sm:text-sm mb-1.5 flex items-center">
              <Lock className="w-4 h-4 mr-1.5 text-red-400" />
              Şifre:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrenizi girin"
              className="w-full bg-black border-2 border-gray-700 rounded-2xl px-4 py-3 text-base text-white font-bold focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-black text-base flex items-center justify-center space-x-2 shadow-xl shadow-red-600/30 transition transform active:scale-95"
            >
              <span>{loading ? 'GİRİŞ YAPILIYOR...' : 'SİSTEME GİRİŞ YAP'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

      </div>

      {/* Profesyonel İmza & Yıl Bilgisi */}
      <footer className="text-center py-4 text-xs text-gray-500 font-medium tracking-wide">
        <div>
          © {currentYear} <span className="text-gray-300 font-bold">Uşak Yarış Pisti</span> • Tüm Hakları Saklıdır.
        </div>
        <div className="mt-1 text-[11px] text-gray-400">
          Designed & Developed by <span className="text-red-500 font-bold">Eray Yörük</span>
        </div>
      </footer>

    </div>
  );
}
