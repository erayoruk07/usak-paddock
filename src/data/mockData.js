// Uşak Yarış Pisti - 10 Paddock Box ve Motor Veritabanı
// Test motorları temizlendi. Sistem gerçek veri girişine hazır.

export const INITIAL_GARAGES = [
  { id: "box-1", boxNumber: 1, name: "Paddock Box 1" },
  { id: "box-2", boxNumber: 2, name: "Paddock Box 2" },
  { id: "box-3", boxNumber: 3, name: "Paddock Box 3" },
  { id: "box-4", boxNumber: 4, name: "Paddock Box 4" },
  { id: "box-5", boxNumber: 5, name: "Paddock Box 5" },
  { id: "box-6", boxNumber: 6, name: "Paddock Box 6" },
  { id: "box-7", boxNumber: 7, name: "Paddock Box 7" },
  { id: "box-8", boxNumber: 8, name: "Paddock Box 8" },
  { id: "box-9", boxNumber: 9, name: "Paddock Box 9" },
  { id: "box-10", boxNumber: 10, name: "Paddock Box 10" }
];

// Gerçek veri girişi için başlangıç motor listesi boş (0 Araç)
export const INITIAL_BIKES = [];

// Türkiye'deki tüm motosiklet markaları ve popüler modelleri
export const TURKEY_MOTORCYCLE_DATABASE = {
  "Yamaha": [
    "YZF-R6", "YZF-R7", "YZF-R1", "YZF-R1M", "YZF-R3", "YZF-R25", "MT-07", "MT-09", "MT-10", "MT-25", "Tracer 7", "Tracer 9", "Tenere 700", "XMAX 250", "NMAX 155"
  ],
  "Honda": [
    "CBR600RR", "CBR1000RR-R Fireblade", "CBR650R", "CBR500R", "CBR250R", "CB650R", "CB1000R", "CB500F", "CRF450R", "CRF250 Rally", "Africa Twin CRF1100L", "Transalp XL750", "Forza 250", "PCX 125"
  ],
  "Kawasaki": [
    "Ninja ZX-6R", "Ninja ZX-10R", "Ninja ZX-4RR", "Ninja 400", "Ninja 650", "Ninja H2", "Z900", "Z650", "Z400", "Versys 650", "Versys 1000", "KX450F"
  ],
  "BMW": [
    "S1000RR", "M 1000 RR", "S1000R", "M 1000 R", "R 1250 GS", "R 1300 GS", "F 900 R", "F 900 XR", "G 310 R", "S1000XR"
  ],
  "Ducati": [
    "Panigale V4", "Panigale V4 S", "Panigale V4 R", "Panigale V2", "SuperSport 950", "Streetfighter V4", "Streetfighter V2", "Monster 937", "Hypermotard 950", "Multistrada V4"
  ],
  "KTM": [
    "RC 390", "RC 8C", "RC 125", "450 SMR Supermoto", "690 SMC R", "890 Duke R", "1290 Super Duke R", "790 Duke", "390 Duke", "450 SX-F"
  ],
  "Aprilia": [
    "RSV4 Factory", "RSV4 1100", "RS 660", "RS 457", "Tuono V4 Factory", "Tuono 660", "Tuareg 660", "SX 125"
  ],
  "Suzuki": [
    "GSX-R 1000R", "GSX-R 750", "GSX-R 600", "GSX-8R", "GSX-S1000", "Hayabusa 1340", "V-Strom 800DE", "V-Strom 650", "RM-Z450"
  ],
  "Husqvarna": [
    "FS 450 Supermoto", "701 Supermoto", "Vitpilen 401", "Svartpilen 401", "Norden 901", "FC 450"
  ],
  "TM Racing": [
    "SMX 450 Fi Supermoto", "SMX 300 2T", "SMR 450", "MX 450 Fi"
  ],
  "Triumph": [
    "Daytona 675R", "Daytona 660", "Daytona 765 Moto2", "Street Triple 765 RS", "Speed Triple 1200 RS", "Tiger 900"
  ],
  "MV Agusta": [
    "F3 800 RR", "F3 800 RC", "Superveloce 800", "Brutale 1000 RR", "Dragster 800 RR"
  ],
  "CFMOTO": [
    "450SR", "300SR", "450SR S", "800NK", "450NK", "700CL-X", "800MT"
  ],
  "Bajaj": [
    "Pulsar RS200", "Pulsar NS200", "Dominar 400", "Dominar 250"
  ],
  "Kove": [
    "450RR", "321RR", "450 Rally", "800X"
  ],
  "QJ Motor": [
    "SRK 600 RR", "SRK 400 RR", "SRV 550"
  ],
  "TVS": [
    "Apache RR 310", "Apache RTR 200"
  ],
  "Benelli": [
    "TNT 600", "Leoncino 500", "TRK 502"
  ]
};

export const BLOOD_TYPES = [
  "A Rh+", "A Rh-", "B Rh+", "B Rh-", "AB Rh+", "AB Rh-", "0 Rh+", "0 Rh-"
];

export const RELATIONS = [
  "Eşi", "Kardeşi", "Babası", "Annesi", "Arkadaşı", "Takım Arkadaşı", "Diğer"
];

// Telefon formatlayıcı: 0 (5XX) XXX XX XX
export function formatPhoneNumber(value) {
  if (!value) return "0 (";
  let numbers = value.replace(/\D/g, "");
  
  if (!numbers.startsWith("0")) {
    numbers = "0" + numbers;
  }
  
  numbers = numbers.substring(0, 11);

  let formatted = "0";
  if (numbers.length > 1) {
    formatted += " (" + numbers.substring(1, 4);
  }
  if (numbers.length >= 4) {
    formatted += ") " + numbers.substring(4, 7);
  }
  if (numbers.length >= 7) {
    formatted += " " + numbers.substring(7, 9);
  }
  if (numbers.length >= 9) {
    formatted += " " + numbers.substring(9, 11);
  }
  return formatted;
}

export const STORAGE_KEY_GARAGES = "usak_pist_garage_boxes_v3";
export const STORAGE_KEY_BIKES = "usak_pist_garage_bikes_v4";

export function loadGarages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GARAGES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load garages", e);
  }
  return INITIAL_GARAGES;
}

export function saveGarages(garages) {
  try {
    localStorage.setItem(STORAGE_KEY_GARAGES, JSON.stringify(garages));
  } catch (e) {
    console.error("Failed to save garages", e);
  }
}

export function loadBikes() {
  try {
    // Eski test verilerini tarayıcı hafızasından otomatik temizle
    if (typeof window !== 'undefined') {
      if (localStorage.getItem("usak_pist_garage_bikes_v3")) {
        localStorage.removeItem("usak_pist_garage_bikes_v3");
      }
      if (localStorage.getItem("usak_pist_garage_bikes_v2")) {
        localStorage.removeItem("usak_pist_garage_bikes_v2");
      }
    }
    const saved = localStorage.getItem(STORAGE_KEY_BIKES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load bikes", e);
  }
  return INITIAL_BIKES;
}

export function saveBikes(bikes) {
  try {
    localStorage.setItem(STORAGE_KEY_BIKES, JSON.stringify(bikes));
  } catch (e) {
    console.error("Failed to save bikes", e);
  }
}
