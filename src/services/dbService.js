// Uşak Yarış Pisti - Supabase & Veritabanı Servis Katmanı
// Hem Supabase (Canlı DB) hem de Yerel Önbellek (Offline/Fallback) ile çalışır.

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_ADMINS, loadAdmins, saveAdmins } from '../data/authData';
import { INITIAL_GARAGES, INITIAL_BIKES, loadGarages, saveGarages, loadBikes, saveBikes } from '../data/mockData';

// ============================================================
// 1. DÖNÜŞTÜRÜCÜLER (MAPPERS: Postgres <-> Frontend)
// ============================================================

export function bikeToDb(b) {
  return {
    id: b.id,
    garage_id: b.garageId,
    garage_no: b.garageNo,
    race_number: String(b.raceNumber),
    brand: b.brand,
    model: b.model,
    year: b.year ? parseInt(b.year, 10) : 2024,
    engine_size: b.engineSize || '',
    chassis_number: b.chassisNumber || '',
    color: b.color || '',
    photo_url: b.photoUrl || '',
    owner_name: b.owner?.fullName || '',
    owner_phone: b.owner?.phone || '',
    blood_type: b.owner?.bloodType || 'A Rh+',
    emergency_name: b.owner?.emergencyName || '',
    emergency_relation: b.owner?.emergencyRelation || 'Eşi',
    emergency_phone: b.owner?.emergencyPhone || '',
    payment_amount: b.paymentAmount ?? 0,
    remaining_entries: b.remainingEntries ?? 0,
    total_entries_granted: b.totalEntriesGranted ?? 0,
    equipped_parts: b.equippedParts || [],
    entry_history: b.entryHistory || [],
    updated_at: new Date().toISOString()
  };
}

export function bikeFromDb(row) {
  return {
    id: row.id,
    garageId: row.garage_id,
    garageNo: row.garage_no,
    raceNumber: String(row.race_number),
    brand: row.brand,
    model: row.model,
    year: row.year,
    engineSize: row.engine_size,
    chassisNumber: row.chassis_number,
    color: row.color,
    photoUrl: row.photo_url,
    owner: {
      fullName: row.owner_name,
      phone: row.owner_phone,
      bloodType: row.blood_type,
      emergencyName: row.emergency_name,
      emergencyRelation: row.emergency_relation,
      emergencyPhone: row.emergency_phone
    },
    paymentAmount: row.payment_amount,
    remainingEntries: row.remaining_entries,
    totalEntriesGranted: row.total_entries_granted,
    equippedParts: Array.isArray(row.equipped_parts) ? row.equipped_parts : [],
    entryHistory: Array.isArray(row.entry_history) ? row.entry_history : []
  };
}

// ============================================================
// 2. YÖNETİCİ & KULLANICI (ADMINS) DB İŞLEMLERİ
// ============================================================

export async function fetchAdmins() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map(a => ({
          id: a.id,
          username: a.username,
          password: a.password,
          name: a.name || a.username,
          role: a.role || 'VIEWER',
          createdAt: a.created_at ? a.created_at.split('T')[0] : '2026-09-28'
        }));
        saveAdmins(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('[DB fetchAdmins] Supabase okuma hatası, yerel veriye geçildi:', e.message);
    }
  }
  return loadAdmins();
}

export async function insertAdmin(admin, currentUsername = 'Admin') {
  const dbPayload = {
    username: admin.username.trim(),
    password: admin.password.trim(),
    name: (admin.name || admin.username).trim(),
    role: admin.role || 'VIEWER'
  };

  let createdAdmin = { 
    ...dbPayload, 
    id: admin.id || ('admin_' + Date.now()),
    createdAt: new Date().toISOString().split('T')[0]
  };

  // 1. Supabase Canlı DB'ye Insert
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase veritabanı istemcisi bağlı değil! Lütfen sayfayı yenileyiniz.');
  }

  try {
    const { data, error } = await supabase.from('admins').insert([dbPayload]).select();
    if (error) {
      console.error('[DB insertAdmin] Supabase insert hatası:', error.message);
      throw new Error(`Veritabanı Hatası: ${error.message}`);
    } else if (data && data[0]) {
      createdAdmin = {
        id: data[0].id,
        username: data[0].username,
        password: data[0].password,
        name: data[0].name || data[0].username,
        role: data[0].role || 'VIEWER',
        createdAt: data[0].created_at ? data[0].created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      };
      console.log('[DB insertAdmin] Başarıyla Supabase DB\'ye eklendi:', createdAdmin);
    }
  } catch (e) {
    console.error('[DB insertAdmin] Bağlantı hatası:', e);
    throw e;
  }

  // 2. Yerel Admin listesini de güncelle
  const currentAdmins = loadAdmins();
  const nextAdmins = [
    ...currentAdmins.filter(a => a.username.toLowerCase() !== dbPayload.username.toLowerCase()),
    createdAdmin
  ];
  saveAdmins(nextAdmins);

  // 3. İşlem Logunu DB'ye Kaydet
  await logAction({
    actionType: 'USER_CREATED',
    note: `Yeni kullanıcı oluşturuldu: ${dbPayload.username} (Yetki: ${dbPayload.role})`,
    performedBy: currentUsername
  });

  return createdAdmin;
}

// Canlı Supabase ve Yerel Giriş Doğrulama (Mobildeki anlık girişleri çözer)
export async function authenticateUser(username, password) {
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();

  // 1. Canlı Supabase DB'den anında sorgula (Mobilde henüz senkron olmasa dahi anında doğrular)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .ilike('username', cleanUser)
        .eq('password', cleanPass)
        .limit(1);

      if (!error && data && data.length > 0) {
        const found = data[0];
        const userObj = {
          id: found.id,
          username: found.username,
          password: found.password,
          name: found.name || found.username,
          role: found.role || 'VIEWER',
          createdAt: found.created_at ? found.created_at.split('T')[0] : '2026-09-28'
        };

        // Yerel önbelleğe de kaydet
        const local = loadAdmins();
        if (!local.some(a => a.username.toLowerCase() === userObj.username.toLowerCase())) {
          saveAdmins([...local, userObj]);
        }
        return { success: true, user: userObj };
      }
    } catch (err) {
      console.warn('[DB authenticateUser] Supabase canlı kontrol hatası:', err);
    }
  }

  // 2. Çevrimdışı / Yerel hafızadan kontrol
  const localAdmins = loadAdmins();
  const matched = localAdmins.find(
    a => a.username.toLowerCase() === cleanUser.toLowerCase() && a.password === cleanPass
  );

  if (matched) {
    return { success: true, user: matched };
  }

  return { success: false, message: 'Kullanıcı adı veya şifre hatalı! Lütfen kontrol ediniz.' };
}


export async function deleteAdmin(adminId, username, currentUsername = 'Admin') {
  if (isSupabaseConfigured && supabase) {
    try {
      if (username) {
        await supabase.from('admins').delete().eq('username', username);
      } else if (adminId) {
        await supabase.from('admins').delete().eq('id', adminId);
      }
    } catch (e) {
      console.error('[DB deleteAdmin] Bağlantı hatası:', e);
    }
  }

  await logAction({
    actionType: 'USER_DELETED',
    note: `Kullanıcı silindi: ${username}`,
    performedBy: currentUsername
  });
}

// ============================================================
// 3. 10 PADDOCK BOX (GARAJLAR) DB İŞLEMLERİ
// ============================================================

export async function fetchGarages() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('garages')
        .select('*')
        .order('box_number', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map(g => ({
          id: g.id,
          boxNumber: g.box_number,
          name: g.name
        }));
        saveGarages(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('[DB fetchGarages] Garajlar yerelden okunuyor:', e.message);
    }
  }
  return loadGarages();
}

// ============================================================
// 4. MOTORLAR (BIKES) DB İŞLEMLERİ
// ============================================================

export async function fetchBikes() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bikes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map(bikeFromDb);
        saveBikes(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('[DB fetchBikes] Motorlar yerelden okunuyor:', e.message);
    }
  }
  return loadBikes();
}

export async function insertBike(bike, currentUsername = 'Admin') {
  const row = bikeToDb(bike);

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase canlı veritabanı aktif değil!');
  }

  try {
    const { error } = await supabase.from('bikes').insert([row]);
    if (error) {
      console.error('[DB insertBike] Supabase insert hatası:', error.message);
      throw new Error(`Motor Eklenemedi: ${error.message}`);
    } else {
      console.log('[DB insertBike] Motor Supabase DB\'ye eklendi:', bike.id);
    }
  } catch (e) {
    console.error('[DB insertBike] Bağlantı hatası:', e);
    throw e;
  }

  await logAction({
    bikeId: bike.id,
    raceNumber: bike.raceNumber,
    driverName: bike.owner?.fullName,
    garageNo: bike.garageNo,
    actionType: 'BIKE_ADDED',
    note: `Yeni araç kaydedildi: #${bike.raceNumber} ${bike.brand} ${bike.model} (${bike.garageNo})`,
    remainingEntries: bike.remainingEntries,
    performedBy: currentUsername
  });
}

export async function updateBike(bike, currentUsername = 'Admin', logInfo = null) {
  const row = bikeToDb(bike);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('bikes')
        .update(row)
        .eq('id', bike.id);

      if (error) {
        console.error('[DB updateBike] Supabase update hatası:', error.message);
      }
    } catch (e) {
      console.error('[DB updateBike] Bağlantı hatası:', e);
    }
  }

  if (logInfo) {
    await logAction({
      bikeId: bike.id,
      raceNumber: bike.raceNumber,
      driverName: bike.owner?.fullName,
      garageNo: bike.garageNo,
      actionType: logInfo.actionType || 'BIKE_UPDATED',
      note: logInfo.note || 'Motor güncellendi',
      remainingEntries: bike.remainingEntries,
      performedBy: currentUsername
    });
  }
}

export async function deleteBike(bikeId, currentUsername = 'Admin') {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('bikes').delete().eq('id', bikeId);
      if (error) console.error('[DB deleteBike] Hata:', error.message);
    } catch (e) {
      console.error('[DB deleteBike] Bağlantı hatası:', e);
    }
  }

  await logAction({
    bikeId,
    actionType: 'BIKE_DELETED',
    note: `Motor sistemden silindi: ${bikeId}`,
    performedBy: currentUsername
  });
}

// ============================================================
// 5. TEST VERİLERİNİ TEMİZLEME (SIFIRLAMA)
// ============================================================

export async function clearAllTestBikes(currentUsername = 'Admin') {
  // 1. Supabase Canlı DB'deki motorları ve giriş loglarını temizle
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('entry_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('bikes').delete().neq('id', 'NONE');
      console.log('[DB clearAllTestBikes] Supabase motor ve log verileri sıfırlandı.');
    } catch (e) {
      console.error('[DB clearAllTestBikes] Supabase temizleme hatası:', e);
    }
  }

  // 2. Tarayıcı yerel önbelleklerini temizle
  saveBikes([]);
  try {
    localStorage.removeItem('usak_pist_garage_bikes_v3');
    localStorage.removeItem('usak_pist_garage_bikes_v4');
    localStorage.removeItem('usak_pist_audit_logs');
  } catch (e) {}

  // 3. Sıfırlama eylemini günlüğe kaydet
  await logAction({
    actionType: 'SYSTEM_CLEARED',
    note: 'Tüm test motorları ve giriş kayıtları temizlendi. Sistem gerçek veri girişine hazırlandı.',
    performedBy: currentUsername
  });

  return [];
}

// ============================================================
// 6. PİST İŞLEM VE GİRİŞ LOGLARI (ENTRY & AUDIT LOGS)
// ============================================================

export async function logAction({
  bikeId = null,
  raceNumber = null,
  driverName = null,
  garageNo = null,
  actionType,
  note = '',
  remainingEntries = null,
  performedBy = 'Sistem'
}) {
  const logRow = {
    bike_id: bikeId,
    race_number: raceNumber ? String(raceNumber) : null,
    driver_name: driverName,
    garage_no: garageNo,
    action_type: actionType,
    note,
    remaining_entries: remainingEntries,
    performed_by: performedBy,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('entry_logs').insert([logRow]);
      if (error) {
        console.warn('[DB logAction] Log kaydı uyarısı:', error.message);
      }
    } catch (e) {
      console.warn('[DB logAction] Log gönderilemedi:', e.message);
    }
  }

  // Yerel log önbelleği de tutalım
  try {
    const existingLogs = JSON.parse(localStorage.getItem('usak_pist_audit_logs') || '[]');
    const nextLogs = [logRow, ...existingLogs].slice(0, 100);
    localStorage.setItem('usak_pist_audit_logs', JSON.stringify(nextLogs));
  } catch (e) {
    // ignore
  }
}

export async function fetchRecentLogs(limit = 30) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('entry_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data) return data;
    } catch (e) {
      console.warn('[DB fetchRecentLogs] Hata:', e.message);
    }
  }

  try {
    return JSON.parse(localStorage.getItem('usak_pist_audit_logs') || '[]');
  } catch {
    return [];
  }
}
