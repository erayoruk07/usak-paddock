// Uşak Yarış Pisti - Yetkili (Admin) Hesap Yönetimi

export const INITIAL_ADMINS = [
  {
    id: "admin-1",
    username: "admin",
    password: "123", // Kullanıcı için kolay ve pratik
    name: "Pist Yöneticisi",
    createdAt: "2026-09-28"
  }
];

export const STORAGE_KEY_ADMINS = "usak_pist_admins_v1";
export const STORAGE_KEY_AUTH = "usak_pist_current_user_v1";

export function loadAdmins() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ADMINS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Admins load error", e);
  }
  return INITIAL_ADMINS;
}

export function saveAdmins(admins) {
  try {
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
  } catch (e) {
    console.error("Admins save error", e);
  }
}

export function getCurrentUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Auth load error", e);
  }
  return null;
}

export function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  } catch (e) {
    console.error("Auth save error", e);
  }
}
