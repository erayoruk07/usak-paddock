import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  ShieldCheck,
  Link,
  ArrowRight
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  configureSupabase, 
  testSupabaseConnection 
} from '../lib/supabaseClient';

export default function SupabaseConfigModal({ onClose, dbStatus }) {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [key, setKey] = useState(currentConfig.key || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok: bool, message: string }

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setTestResult({ ok: false, message: 'Lütfen Supabase URL ve Anon Key alanlarını doldurun.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testSupabaseConnection(url.trim(), key.trim());
      if (res.ok) {
        setTestResult({ ok: true, message: 'Bağlantı başarılı! Sayfa yenileniyor ve canlı veriler yükleniyor...' });
        setTimeout(() => {
          configureSupabase(url.trim(), key.trim());
        }, 1200);
      } else {
        setTestResult({ ok: false, message: `Bağlantı kurulamadı: ${res.message}` });
      }
    } catch (err) {
      setTestResult({ ok: false, message: `Hata: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Veritabanı bağlantı bilgilerini temizlemek istediğinize emin misiniz?')) {
      configureSupabase('', '');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#111622] border-2 border-cyan-500/80 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Üst Başlık */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-cyan-950 via-gray-900 to-black border-b-2 border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase block">
                CİHAZLAR ARASI CANLI SENKRONİZASYON
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                Veritabanı Bağlantısı
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 text-gray-400 hover:text-white hover:bg-black transition border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Neden Mobil ve PC Senkronize Olmaz Bilgilendirmesi */}
        <div className="p-4 sm:p-5 bg-black/50 border-b border-gray-800 space-y-3">
          <div className="flex items-center justify-center space-x-3 p-3 rounded-2xl bg-gray-900/90 border border-gray-800 text-xs">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
              <Monitor className="w-4 h-4" />
              <span>Bilgisayar (PC)</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500" />
            <div className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 font-black text-[11px] border border-cyan-800">
              Ortak Supabase DB
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500" />
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>Telefon (Mobil)</span>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            <strong className="text-white">Önemli:</strong> Telefonunuz ve bilgisayarınızın girdiğiniz araçları ve seansları ortak görebilmesi için ikisinin de aynı Supabase veritabanına bağlı olması gerekir.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleTestAndSave} className="p-4 sm:p-6 space-y-4 text-xs">
          
          {/* Bağlantı Durumu Rozeti */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-900/90 border border-gray-800">
            <span className="font-bold text-gray-300">Mevcut Durum:</span>
            {dbStatus === 'connected' ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-black flex items-center space-x-1.5 border border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Canlı Bulut DB Aktif</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-red-950 text-red-400 font-black flex items-center space-x-1.5 border border-red-800">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>Yerel Mod (Senkronizasyon Kapalı)</span>
              </span>
            )}
          </div>

          {/* Test Sonucu Bildirimi */}
          {testResult && (
            <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center space-x-2 ${
              testResult.ok 
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' 
                : 'bg-red-950/80 border-red-600 text-red-300'
            }`}>
              {testResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Supabase URL */}
          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              required
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
            </span>
          </div>

          {/* Supabase Anon Key */}
          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
              Supabase Anon (Public) Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full bg-black border-2 border-gray-700 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
              required
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys (anon public)
            </span>
          </div>

          {/* Butonlar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            {currentConfig.isConfigured && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-red-950 text-gray-400 hover:text-red-400 font-bold text-xs transition"
              >
                Bağlantıyı Sıfırla
              </button>
            )}

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs"
              >
                Kapat
              </button>

              <button
                type="submit"
                disabled={isTesting}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-600/30 transition active:scale-95 disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Test Ediliyor...</span>
                  </>
                ) : (
                  <>
                    <Link className="w-3.5 h-3.5" />
                    <span>Bağlantıyı Test Et &amp; Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
