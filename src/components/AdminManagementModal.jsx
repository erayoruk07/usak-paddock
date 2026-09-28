import React, { useState } from 'react';
import { X, Users, UserPlus, KeyRound, Trash2, CheckCircle2, ShieldCheck, User } from 'lucide-react';

export default function AdminManagementModal({ admins, currentUser, onClose, onAddAdmin, onDeleteAdmin }) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    if (admins.some(a => a.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert('Bu kullanıcı adı zaten mevcut! Lütfen farklı bir kullanıcı adı seçin.');
      return;
    }

    const newAdmin = {
      id: 'admin_' + Date.now(),
      username: newUsername.trim(),
      password: newPassword.trim(),
      name: newName.trim() || newUsername.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddAdmin(newAdmin);
    setNewUsername('');
    setNewPassword('');
    setNewName('');
    setSuccessMsg('Yeni yetkili başarıyla eklendi!');
    setTimeout(() => setSuccessMsg(''), 3000);
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
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                Yetkili (Admin) Yönetimi
              </h3>
              <p className="text-xs text-gray-400">Sistemi kullanabilecek yetkilileri tanımlayın</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Başarı Mesajı */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-600 text-emerald-400 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. YENİ YETKİLİ EKLEME FORMU */}
          <form onSubmit={handleAdd} className="p-4 bg-gray-900/90 border-2 border-gray-800 rounded-2xl space-y-3">
            <div className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center">
              <UserPlus className="w-4 h-4 mr-1.5" />
              Yeni Yetkili Tanımla
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Ad Soyad (İsteğe Bağlı)</label>
                <input
                  type="text"
                  placeholder="örn: Ahmet Usta"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
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
                  placeholder="Şifre belirleyin"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow transition"
              >
                + Yetkiliyi Kaydet
              </button>
            </div>
          </form>

          {/* 2. MEVCUT YETKİLİLER LİSTESİ */}
          <div className="space-y-2">
            <div className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-orange-400" />
              Kayıtlı Yetkililer ({admins.length})
            </div>

            <div className="space-y-2">
              {admins.map((admin) => (
                <div 
                  key={admin.id}
                  className="p-3.5 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-white font-bold">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white flex items-center space-x-2">
                        <span>{admin.name || admin.username}</span>
                        {admin.username === currentUser?.username && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-700">
                            Siz
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Kullanıcı Adı: <span className="text-cyan-400 font-mono font-bold">{admin.username}</span> • Şifre: <span className="text-gray-300 font-mono font-bold">{admin.password}</span>
                      </div>
                    </div>
                  </div>

                  {admins.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`${admin.username} yetkilisini silmek istediğinize emin misiniz?`)) {
                          onDeleteAdmin(admin.id);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 transition"
                      title="Yetkiliyi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

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
