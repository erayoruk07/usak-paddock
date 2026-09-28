import React, { useState } from 'react';
import { Warehouse, Lock, User, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginScreen({ onLogin, admins }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const matchedAdmin = admins.find(
      a => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password
    );

    if (matchedAdmin) {
      onLogin(matchedAdmin);
    } else {
      setError('Kullanıcı adı veya şifre hatalı! Lütfen kontrol ediniz.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4 carbon-pattern">
      <div className="w-full max-w-md bg-[#151922] border-2 border-gray-700 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Logo ve Başlık */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-red-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-600/30">
            <Warehouse className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase">
            UŞAK PİSTİ GARAJ
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-bold">
            Yetkili Giriş Paneli (Paddock Box Yönetimi)
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
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-base flex items-center justify-center space-x-2 shadow-xl shadow-red-600/30 transition transform active:scale-95"
            >
              <span>SİSTEME GİRİŞ YAP</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Varsayılan Giriş İpucu (Kullanıcının ilk girişi için kolaylık) */}
        <div className="pt-4 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500 font-semibold">
            Varsayılan Giriş: Kullanıcı Adı: <span className="text-white font-bold">admin</span> • Şifre: <span className="text-white font-bold">123</span>
          </p>
        </div>

      </div>
    </div>
  );
}
