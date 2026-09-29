import React, { useState } from 'react';
import { X, Users, UserPlus, Trash2, CheckCircle2, AlertTriangle, ShieldCheck, User, Shield, Eye } from 'lucide-react';
import { formatFirstLetterLower } from '../data/mockData';

export default function AdminManagementModal({ admins, currentUser, dbStatus, onClose, onAddAdmin, onDeleteAdmin, onClearAllTestBikes }) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('VIEWER'); // Varsayılan olarak Gözlemci veya Admin
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (currentUser?.role !== 'ADMIN') {
      alert('Sadece Yönetici (Admin) yeni kullanıcı tanımlayabilir.');
      return;
    }
    if (!newUsername.trim() || !newPassword.trim()) return;

    if (admins.some(a => a.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      setErrorMsg('Bu kullanıcı adı zaten mevcut! Lütfen farklı bir kullanıcı adı seçin.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    const newAdmin = {
      id: 'admin_' + Date.now(),
      username: newUsername.trim(),
      password: newPassword.trim(),
      name: newName.trim() || newUsername.trim(),
      role: newRole, // 'ADMIN' veya 'VIEWER'
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      await onAddAdmin(newAdmin);
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewRole('VIEWER');
      setSuccessMsg('Yeni kullanıcı başarıyla tanımlandı ve canlı veritabanına kaydedildi!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Veritabanına kaydedilirken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#151922] border-2 border-gray-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Başlık */}
        <div className="p-4 sm:p-5 bg-gray-900 border-b-2 border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-600 text-white shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <span>Kullanıcı ve Yetki Yönetimi</span>
              </h3>
              <p className="text-xs text-gray-400">Yönetici veya Sadece Görüntüleme yetkili hesap tanımlayın</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Veritabanı Canlı Durum Bildirimi */}
          <div className="p-2.5 rounded-2xl bg-gray-900/90 border border-gray-800 flex items-center justify-between">
            <span className="text-gray-400 font-bold flex items-center">
              <span className="w-2 h-2 rounded-full mr-2 bg-emerald-400 animate-pulse"></span>
              Veritabanı Entegrasyonu:
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              Supabase DB (public.admins & logs) Aktif
            </span>
          </div>

          {/* Başarı Mesajı */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-600 text-emerald-400 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Hata Mesajı */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-950/80 border border-red-600 text-red-300 text-xs font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. YENİ KULLANICI EKLEME FORMU */}
          <form onSubmit={handleAdd} className="p-4 bg-gray-900/90 border-2 border-gray-800 rounded-2xl space-y-3">
            <div className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center">
              <UserPlus className="w-4 h-4 mr-1.5" />
              Yeni Kullanıcı Tanımla
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Ad Soyad (İsteğe Bağlı)</label>
                <input
                  type="text"
                  placeholder="örn: mehmet görevli"
                  value={newName}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  onChange={(e) => setNewName(formatFirstLetterLower(e.target.value))}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Kullanıcı Adı</label>
                <input
                  type="text"
                  placeholder="Kullanıcı adı"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Giriş Şifresi</label>
                <input
                  type="text"
                  placeholder="Giriş şifresi"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              {/* ROL / YETKİ SEÇİMİ */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">Yetki Seviyesi</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-black border-2 border-cyan-700 rounded-xl px-3 py-2 text-white font-black text-xs"
                >
                  <option value="VIEWER">👁️ Sadece Görüntüleme (Hak düşemez, araç ekleyemez)</option>
                  <option value="ADMIN">🛡️ Yönetici (Tam Yetkili - Hak düşer, ödeme alır, araç ekler)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black text-xs shadow transition flex items-center space-x-1.5"
              >
                {isSubmitting ? (
                  <span>Kaydediliyor...</span>
                ) : (
                  <span>+ Kullanıcıyı Kaydet</span>
                )}
              </button>
            </div>
          </form>

          {/* 2. MEVCUT KULLANICILAR LİSTESİ */}
          <div className="space-y-2">
            <div className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-orange-400" />
              Kayıtlı Kullanıcılar ({admins.length})
            </div>

            <div className="space-y-2">
              {admins.map((admin) => {
                const isAdmin = admin.role === 'ADMIN';

                return (
                  <div 
                    key={admin.id}
                    className="p-3.5 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-white font-bold">
                        {isAdmin ? <Shield className="w-5 h-5 text-red-500" /> : <Eye className="w-5 h-5 text-cyan-400" />}
                      </div>
                      <div>
                        <div className="text-sm font-black text-white flex items-center space-x-2">
                          <span>{admin.name || admin.username}</span>
                          
                          {/* Yetki Rozeti */}
                          {isAdmin ? (
                            <span className="px-2 py-0.5 rounded-md bg-red-950 text-red-400 text-[10px] font-black border border-red-700 flex items-center">
                              <Shield className="w-3 h-3 mr-1" /> Yönetici
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 text-[10px] font-black border border-cyan-700 flex items-center">
                              <Eye className="w-3 h-3 mr-1" /> Sadece Görüntüleme
                            </span>
                          )}

                          {admin.username === currentUser?.username && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                              (Siz)
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-400 mt-0.5">
                          Kullanıcı Adı: <span className="text-white font-mono font-bold">{admin.username}</span> • Şifre: <span className="text-gray-300 font-mono">{admin.password}</span>
                        </div>
                      </div>
                    </div>

                    {admins.length > 1 && currentUser?.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          if (confirm(`${admin.username} kullanıcısını silmek istediğinize emin misiniz?`)) {
                            onDeleteAdmin(admin.id);
                          }
                        }}
                        className="p-2 text-gray-500 hover:text-red-400 transition"
                        title="Kullanıcıyı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. GERÇEK VERİYE GEÇİŞ & TEST VERİLERİNİ TEMİZLEME */}
          {currentUser?.role === 'ADMIN' && onClearAllTestBikes && (
            <div className="p-4 bg-red-950/20 border border-red-900/60 rounded-2xl space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-red-400 uppercase tracking-wider">
                    Sistemi Gerçek Veriye Sıfırla
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Tüm test motorlarını, parçalarını ve giriş geçmişini temizler. 10 Paddock Box ve kullanıcı hesaplarınız korunur.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClearAllTestBikes}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shrink-0 transition shadow-lg shadow-red-900/40"
                >
                  Tüm Test Verilerini Temizle
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Kapat */}
        <div className="p-4 bg-gray-900 border-t-2 border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-800 text-white font-bold text-xs"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
