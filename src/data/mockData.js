// Uşak Yarış Pisti - 10 Paddock Box ve Motor Veritabanı

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

export const INITIAL_BIKES = [
  // Paddock Box 1 (3 Motor)
  {
    id: "USAK-01",
    garageId: "box-1",
    garageNo: "Paddock Box 1",
    raceNumber: "46",
    brand: "Yamaha",
    model: "YZF-R6 Race Edition",
    year: 2023,
    engineSize: "599 cc",
    chassisNumber: "JYARJ27E0001046",
    color: "Yarış Mavisi / Karbon",
    photoUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Murat Çelik",
      phone: "0 (532) 450 12 34",
      bloodType: "A Rh+",
      emergencyName: "Fatma Çelik",
      emergencyRelation: "Eşi",
      emergencyPhone: "0 (533) 111 22 33"
    },
    paymentAmount: 7000,
    remainingEntries: 4, // 5 haktan 1'ini kullandı, 4 kaldı
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-20 14:30", note: "Hafta sonu serbest antrenman seansı" }
    ],
    equippedParts: [
      { id: "p1", name: "Capit Suprema Lastik Isıtıcı", installedAt: "2024-03-10" },
      { id: "p2", name: "AIM Solo 2 DL GPS Laptimer", installedAt: "2024-04-15" },
      { id: "p3", name: "GB Racing Motor Koruma Kapakları", installedAt: "2023-11-20" },
      { id: "p4", name: "Akrapovic Full Titanyum Egzoz", installedAt: "2024-01-12" }
    ]
  },
  {
    id: "USAK-15",
    garageId: "box-1",
    garageNo: "Paddock Box 1",
    raceNumber: "05",
    brand: "Yamaha",
    model: "YZF-R7",
    year: 2023,
    engineSize: "689 cc",
    chassisNumber: "JYARM39E0002105",
    color: "Icon Blue",
    photoUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Tolga Sezgin",
      phone: "0 (543) 908 17 26",
      bloodType: "0 Rh+",
      emergencyName: "Zafer Sezgin",
      emergencyRelation: "Kardeşi",
      emergencyPhone: "0 (544) 800 12 34"
    },
    paymentAmount: 7000,
    remainingEntries: 2,
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-12 11:00", note: "Sabah seansı" },
      { date: "2026-09-18 15:30", note: "Öğleden sonra seansı" },
      { date: "2026-09-22 16:45", note: "Zaman turu" }
    ],
    equippedParts: [
      { id: "p1", name: "GYTR Quickshifter Kiti", installedAt: "2023-11-05" },
      { id: "p2", name: "Capit Suprema Lastik Isıtıcı", installedAt: "2024-02-01" }
    ]
  },
  {
    id: "USAK-20",
    garageId: "box-1",
    garageNo: "Paddock Box 1",
    raceNumber: "06",
    brand: "Yamaha",
    model: "YZF-R6",
    year: 2020,
    engineSize: "599 cc",
    chassisNumber: "JYARJ27E0009806",
    color: "Mat Siyah",
    photoUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Gökhan Yavuz",
      phone: "0 (533) 123 45 67",
      bloodType: "B Rh+",
      emergencyName: "Derya Yavuz",
      emergencyRelation: "Eşi",
      emergencyPhone: "0 (532) 765 43 21"
    },
    paymentAmount: 7000,
    remainingEntries: 0, // HAKKI BİTTİ!
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-01 10:00", note: "1. Seans" },
      { date: "2026-09-05 14:00", note: "2. Seans" },
      { date: "2026-09-10 11:30", note: "3. Seans" },
      { date: "2026-09-14 16:00", note: "4. Seans" },
      { date: "2026-09-19 15:00", note: "5. Seans (Hak bitti)" }
    ],
    equippedParts: [
      { id: "p1", name: "Capit Suprema Lastik Isıtıcı", installedAt: "2023-03-10" },
      { id: "p2", name: "Starlane Stealth GPS-3 Laptimer", installedAt: "2023-04-15" }
    ]
  },

  // Paddock Box 2 (2 Motor)
  {
    id: "USAK-02",
    garageId: "box-2",
    garageNo: "Paddock Box 2",
    raceNumber: "99",
    brand: "BMW",
    model: "S1000RR",
    year: 2024,
    engineSize: "999 cc",
    chassisNumber: "WB10E2108P69902",
    color: "Motorsport M Renkleri",
    photoUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Serkan Yılmaz",
      phone: "0 (533) 890 55 66",
      bloodType: "0 Rh-",
      emergencyName: "Ali Yılmaz",
      emergencyRelation: "Kardeşi",
      emergencyPhone: "0 (532) 999 88 77"
    },
    paymentAmount: 7000,
    remainingEntries: 0, // HAKKI BİTTİ!
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-02 11:00", note: "Seans 1" },
      { date: "2026-09-06 14:30", note: "Seans 2" },
      { date: "2026-09-11 15:45", note: "Seans 3" },
      { date: "2026-09-15 10:15", note: "Seans 4" },
      { date: "2026-09-20 16:30", note: "Seans 5 (Bitti)" }
    ],
    equippedParts: [
      { id: "p1", name: "Thermal Technology Pro Lastik Isıtıcı", installedAt: "2024-02-14" },
      { id: "p2", name: "Starlane Stealth GPS-4 Laptimer", installedAt: "2024-05-01" },
      { id: "p3", name: "Womet-Tech Koruma Demiri", installedAt: "2024-02-10" }
    ]
  },
  {
    id: "USAK-07",
    garageId: "box-2",
    garageNo: "Paddock Box 2",
    raceNumber: "07",
    brand: "Yamaha",
    model: "YZF-R1M",
    year: 2024,
    engineSize: "998 cc",
    chassisNumber: "JYARN65E0007707",
    color: "Ham Karbon",
    photoUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Cemil Güler",
      phone: "0 (532) 900 12 34",
      bloodType: "A Rh+",
      emergencyName: "Eren Güler",
      emergencyRelation: "Babası",
      emergencyPhone: "0 (533) 800 70 60"
    },
    paymentAmount: 7000,
    remainingEntries: 3,
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-12 14:00", note: "Isınma seansı" },
      { date: "2026-09-19 16:00", note: "Hızlı tur antrenmanı" }
    ],
    equippedParts: [
      { id: "p1", name: "Thermal Technology Carbon Isıtıcı", installedAt: "2024-04-01" },
      { id: "p2", name: "Brembo GP4-RX Kaliperler", installedAt: "2024-05-15" }
    ]
  },

  // Paddock Box 3 (2 Motor)
  {
    id: "USAK-03",
    garageId: "box-3",
    garageNo: "Paddock Box 3",
    raceNumber: "54",
    brand: "Kawasaki",
    model: "Ninja ZX-6R",
    year: 2022,
    engineSize: "636 cc",
    chassisNumber: "JKAZX636EEA05454",
    color: "KRT Yeşili",
    photoUrl: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Emre Karahan",
      phone: "0 (544) 321 00 11",
      bloodType: "AB Rh+",
      emergencyName: "Oğuz Karahan",
      emergencyRelation: "Arkadaşı",
      emergencyPhone: "0 (542) 333 44 55"
    },
    paymentAmount: 7000,
    remainingEntries: 5, // Yeni paket aldı, 5 hakkı var!
    totalEntriesGranted: 5,
    entryHistory: [],
    equippedParts: [
      { id: "p1", name: "IRC Tire Warmer Lastik Isıtıcı", installedAt: "2023-09-10" },
      { id: "p2", name: "R&G Yarış Koruma Demiri", installedAt: "2023-08-01" }
    ]
  },
  {
    id: "USAK-16",
    garageId: "box-3",
    garageNo: "Paddock Box 3",
    raceNumber: "19",
    brand: "Kawasaki",
    model: "Ninja 400",
    year: 2022,
    engineSize: "399 cc",
    chassisNumber: "JKAZX400EEA01919",
    color: "Siyah / Yeşil",
    photoUrl: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Ali Can Bulut",
      phone: "0 (531) 666 44 22",
      bloodType: "A Rh+",
      emergencyName: "Sinan Bulut",
      emergencyRelation: "Babası",
      emergencyPhone: "0 (532) 555 44 33"
    },
    paymentAmount: 7000,
    remainingEntries: 1,
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-08 10:00", note: "Sabah seansı" },
      { date: "2026-09-15 14:00", note: "Öğle seansı" },
      { date: "2026-09-20 15:30", note: "Antrenman" },
      { date: "2026-09-25 16:30", note: "Hafta sonu pisti" }
    ],
    equippedParts: [
      { id: "p1", name: "Thermal Technology Isıtıcı", installedAt: "2023-04-10" },
      { id: "p2", name: "Woodcraft Yarış Ayaklıkları", installedAt: "2023-05-02" }
    ]
  },

  // Paddock Box 4 (2 Motor)
  {
    id: "USAK-04",
    garageId: "box-4",
    garageNo: "Paddock Box 4",
    raceNumber: "21",
    brand: "Ducati",
    model: "Panigale V2",
    year: 2023,
    engineSize: "955 cc",
    chassisNumber: "ZDM1RB2V2PB002121",
    color: "Yarış Kırmızısı",
    photoUrl: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Kaan Arslan",
      phone: "0 (535) 777 88 99",
      bloodType: "0 Rh+",
      emergencyName: "Selin Arslan",
      emergencyRelation: "Kardeşi",
      emergencyPhone: "0 (532) 444 55 66"
    },
    paymentAmount: 7000,
    remainingEntries: 0, // HAKKI BİTTİ!
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-03 11:00", note: "Pist günü 1" },
      { date: "2026-09-07 14:00", note: "Pist günü 2" },
      { date: "2026-09-12 15:00", note: "Pist günü 3" },
      { date: "2026-09-16 11:30", note: "Pist günü 4" },
      { date: "2026-09-21 16:00", note: "Pist günü 5 (Hak doldu)" }
    ],
    equippedParts: [
      { id: "p1", name: "Capit Leo Lastik Isıtıcı", installedAt: "2023-06-15" },
      { id: "p2", name: "AIM Solo 2 DL", installedAt: "2023-07-01" }
    ]
  },
  {
    id: "USAK-18",
    garageId: "box-4",
    garageNo: "Paddock Box 4",
    raceNumber: "28",
    brand: "Ducati",
    model: "Panigale V4 S",
    year: 2023,
    engineSize: "1103 cc",
    chassisNumber: "ZDM1RB4S4PB002828",
    color: "Ducati Red",
    photoUrl: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Ahmet Erdem",
      phone: "0 (535) 654 98 70",
      bloodType: "B Rh-",
      emergencyName: "Kenan Erdem",
      emergencyRelation: "Kardeşi",
      emergencyPhone: "0 (532) 987 65 43"
    },
    paymentAmount: 7000,
    remainingEntries: 0, // HAKKI BİTTİ!
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-01 14:00", note: "1. Seans" },
      { date: "2026-09-08 15:00", note: "2. Seans" },
      { date: "2026-09-14 11:00", note: "3. Seans" },
      { date: "2026-09-18 16:30", note: "4. Seans" },
      { date: "2026-09-24 14:00", note: "5. Seans" }
    ],
    equippedParts: [
      { id: "p1", name: "Capit Suprema Lastik Isıtıcı", installedAt: "2023-09-12" },
      { id: "p2", name: "Ducati Akrapovic Titanyum Egzoz", installedAt: "2023-10-01" }
    ]
  },

  // Paddock Box 5 (2 Motor)
  {
    id: "USAK-05",
    garageId: "box-5",
    garageNo: "Paddock Box 5",
    raceNumber: "93",
    brand: "Honda",
    model: "CBR600RR",
    year: 2021,
    engineSize: "599 cc",
    chassisNumber: "JH2PC400MK009393",
    color: "HRC Kırmızı-Beyaz",
    photoUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Burak Taşçı",
      phone: "0 (530) 654 32 10",
      bloodType: "A Rh+",
      emergencyName: "Mehmet Taşçı",
      emergencyRelation: "Babası",
      emergencyPhone: "0 (532) 123 98 76"
    },
    paymentAmount: 7000,
    remainingEntries: 4,
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-22 14:00", note: "Hafta içi seansı" }
    ],
    equippedParts: [
      { id: "p1", name: "Oxford Pro Lastik Isıtıcı", installedAt: "2023-04-10" },
      { id: "p2", name: "Puig Pro Koruma Demiri", installedAt: "2023-05-15" }
    ]
  },
  {
    id: "USAK-12",
    garageId: "box-5",
    garageNo: "Paddock Box 5",
    raceNumber: "17",
    brand: "Honda",
    model: "CBR1000RR-R Fireblade SP",
    year: 2024,
    engineSize: "999 cc",
    chassisNumber: "JH2SC820RK001717",
    color: "Grand Prix Kırmızı",
    photoUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Ozan Tekin",
      phone: "0 (533) 333 77 11",
      bloodType: "0 Rh+",
      emergencyName: "Merve Tekin",
      emergencyRelation: "Eşi",
      emergencyPhone: "0 (532) 222 33 44"
    },
    paymentAmount: 7000,
    remainingEntries: 5,
    totalEntriesGranted: 5,
    entryHistory: [],
    equippedParts: [
      { id: "p1", name: "Capit Factory Lastik Isıtıcı", installedAt: "2024-05-01" },
      { id: "p2", name: "Öhlins NPX Smart EC Çatal", installedAt: "2024-05-01" }
    ]
  },

  // Paddock Box 6 (3 Motor - Supermoto)
  {
    id: "USAK-08",
    garageId: "box-6",
    garageNo: "Paddock Box 6",
    raceNumber: "35",
    brand: "Husqvarna",
    model: "FS 450 Supermoto",
    year: 2023,
    engineSize: "449 cc",
    chassisNumber: "VKBFS450PM003535",
    color: "Beyaz / Sarı / Mavi",
    photoUrl: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Volkan Erdem",
      phone: "0 (538) 412 87 65",
      bloodType: "A Rh-",
      emergencyName: "Canan Erdem",
      emergencyRelation: "Kardeşi",
      emergencyPhone: "0 (532) 777 11 22"
    },
    paymentAmount: 7000,
    remainingEntries: 0, // HAKKI BİTTİ!
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-02 14:00", note: "Supermoto Seansı 1" },
      { date: "2026-09-07 15:30", note: "Supermoto Seansı 2" },
      { date: "2026-09-12 11:00", note: "Supermoto Seansı 3" },
      { date: "2026-09-17 14:30", note: "Supermoto Seansı 4" },
      { date: "2026-09-22 17:00", note: "Supermoto Seansı 5" }
    ],
    equippedParts: [
      { id: "p1", name: "Suter Kaydırmalı Debriyaj", installedAt: "2023-10-12" },
      { id: "p2", name: "Cycra Probend Elcik Koruması", installedAt: "2023-10-15" }
    ]
  },
  {
    id: "USAK-10",
    garageId: "box-6",
    garageNo: "Paddock Box 6",
    raceNumber: "03",
    brand: "TM Racing",
    model: "SMX 450 Fi",
    year: 2024,
    engineSize: "449 cc",
    chassisNumber: "ZTM450SMXPM000303",
    color: "TM Mavisi",
    photoUrl: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Hakan Şentürk",
      phone: "0 (537) 111 44 77",
      bloodType: "0 Rh+",
      emergencyName: "Banu Şentürk",
      emergencyRelation: "Eşi",
      emergencyPhone: "0 (535) 888 77 66"
    },
    paymentAmount: 7000,
    remainingEntries: 3,
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-15 14:00", note: "Pist antrenmanı" },
      { date: "2026-09-21 16:00", note: "Zaman turu" }
    ],
    equippedParts: [
      { id: "p1", name: "Brembo Çift Ön Disk & Kaliper", installedAt: "2024-03-01" },
      { id: "p2", name: "Capit Supermoto Lastik Isıtıcı", installedAt: "2024-03-05" }
    ]
  },
  {
    id: "USAK-19",
    garageId: "box-6",
    garageNo: "Paddock Box 6",
    raceNumber: "80",
    brand: "KTM",
    model: "450 SMR",
    year: 2024,
    engineSize: "449 cc",
    chassisNumber: "VBK450SMRPM008080",
    color: "KTM Turuncu",
    photoUrl: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Serdar Koç",
      phone: "0 (542) 432 10 98",
      bloodType: "B Rh+",
      emergencyName: "Bülent Koç",
      emergencyRelation: "Kardeşi",
      emergencyPhone: "0 (541) 321 09 87"
    },
    paymentAmount: 7000,
    remainingEntries: 2,
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-10 11:00", note: "Antrenman 1" },
      { date: "2026-09-17 15:00", note: "Antrenman 2" },
      { date: "2026-09-24 16:30", note: "Antrenman 3" }
    ],
    equippedParts: [
      { id: "p1", name: "Brembo M50 Kaliper", installedAt: "2024-04-10" },
      { id: "p2", name: "Thermal Technology Isıtıcı", installedAt: "2024-04-12" }
    ]
  },

  // Paddock Box 7 (2 Motor)
  {
    id: "USAK-09",
    garageId: "box-7",
    garageNo: "Paddock Box 7",
    raceNumber: "77",
    brand: "Aprilia",
    model: "RS 660",
    year: 2023,
    engineSize: "659 cc",
    chassisNumber: "ZD4KS000PM007777",
    color: "Stars & Stripes",
    photoUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Mert Aksoy",
      phone: "0 (532) 555 67 89",
      bloodType: "A Rh+",
      emergencyName: "Turgut Aksoy",
      emergencyRelation: "Arkadaşı",
      emergencyPhone: "0 (533) 444 33 22"
    },
    paymentAmount: 7000,
    remainingEntries: 3,
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-14 10:30", note: "Sabah seansı" },
      { date: "2026-09-20 14:00", note: "Öğle seansı" }
    ],
    equippedParts: [
      { id: "p1", name: "Capit Suprema Lastik Isıtıcı", installedAt: "2023-07-20" },
      { id: "p2", name: "Spider Racing Koruma Kapakları", installedAt: "2023-08-11" }
    ]
  },
  {
    id: "USAK-14",
    garageId: "box-7",
    garageNo: "Paddock Box 7",
    raceNumber: "34",
    brand: "MV Agusta",
    model: "F3 800",
    year: 2022,
    engineSize: "798 cc",
    chassisNumber: "ZCG34000PM003434",
    color: "Tricolore Kırmızı/Beyaz",
    photoUrl: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Cihan Vural",
      phone: "0 (532) 765 43 21",
      bloodType: "0 Rh-",
      emergencyName: "Berna Vural",
      emergencyRelation: "Eşi",
      emergencyPhone: "0 (530) 111 00 99"
    },
    paymentAmount: 7000,
    remainingEntries: 0, // HAKKI BİTTİ!
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-04 11:00", note: "1. Seans" },
      { date: "2026-09-09 14:00", note: "2. Seans" },
      { date: "2026-09-14 15:30", note: "3. Seans" },
      { date: "2026-09-19 10:30", note: "4. Seans" },
      { date: "2026-09-23 16:00", note: "5. Seans" }
    ],
    equippedParts: [
      { id: "p1", name: "Capit Suprema Vision Lastik Isıtıcı", installedAt: "2023-05-12" },
      { id: "p2", name: "SC-Project Titanyum Egzos Kiti", installedAt: "2023-05-20" }
    ]
  },

  // Paddock Box 8 (1 Motor)
  {
    id: "USAK-06",
    garageId: "box-8",
    garageNo: "Paddock Box 8",
    raceNumber: "11",
    brand: "KTM",
    model: "RC 390 R",
    year: 2023,
    engineSize: "373 cc",
    chassisNumber: "VBK390RC0PM001111",
    color: "Turuncu / Beyaz",
    photoUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Deniz Yıldız",
      phone: "0 (551) 222 33 44",
      bloodType: "A Rh+",
      emergencyName: "Ayşe Yıldız",
      emergencyRelation: "Annesi",
      emergencyPhone: "0 (533) 222 11 00"
    },
    paymentAmount: 7000,
    remainingEntries: 4,
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-25 15:00", note: "Gençler antrenman seansı" }
    ],
    equippedParts: [
      { id: "p1", name: "Capit Suprema 300cc Özel Isıtıcı", installedAt: "2024-01-10" },
      { id: "p2", name: "WP Apex Pro Süspansiyon Kiti", installedAt: "2024-02-18" }
    ]
  },

  // Paddock Box 9 (2 Motor)
  {
    id: "USAK-11",
    garageId: "box-9",
    garageNo: "Paddock Box 9",
    raceNumber: "88",
    brand: "Suzuki",
    model: "GSX-R 600",
    year: 2020,
    engineSize: "599 cc",
    chassisNumber: "JS1GN7DA0008888",
    color: "Ecstar MotoGP Mavisi",
    photoUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Barış Kurt",
      phone: "0 (541) 789 45 12",
      bloodType: "AB Rh-",
      emergencyName: "Haluk Kurt",
      emergencyRelation: "Babası",
      emergencyPhone: "0 (542) 666 55 44"
    },
    paymentAmount: 7000,
    remainingEntries: 0, // HAKKI BİTTİ!
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-01 10:00", note: "Seans 1" },
      { date: "2026-09-06 14:00", note: "Seans 2" },
      { date: "2026-09-12 11:30", note: "Seans 3" },
      { date: "2026-09-17 15:00", note: "Seans 4" },
      { date: "2026-09-21 16:30", note: "Seans 5" }
    ],
    equippedParts: [
      { id: "p1", name: "BikeTek Dijital Lastik Isıtıcı", installedAt: "2022-05-10" },
      { id: "p2", name: "Yoshimura R-11 Egzoz", installedAt: "2022-06-01" }
    ]
  },
  {
    id: "USAK-13",
    garageId: "box-9",
    garageNo: "Paddock Box 9",
    raceNumber: "67",
    brand: "Triumph",
    model: "Daytona 675R",
    year: 2017,
    engineSize: "675 cc",
    chassisNumber: "SMTMD675R0006767",
    color: "Kristal Beyaz / Kırmızı",
    photoUrl: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Levent Demir",
      phone: "0 (536) 888 23 45",
      bloodType: "0 Rh+",
      emergencyName: "Sedat Demir",
      emergencyRelation: "Kardeşi",
      emergencyPhone: "0 (533) 555 66 77"
    },
    paymentAmount: 7000,
    remainingEntries: 2,
    totalEntriesGranted: 5,
    entryHistory: [
      { date: "2026-09-15 14:00", note: "Antrenman 1" },
      { date: "2026-09-22 15:30", note: "Antrenman 2" },
      { date: "2026-09-26 16:00", note: "Antrenman 3" }
    ],
    equippedParts: [
      { id: "p1", name: "Diamond Lastik Isıtıcı", installedAt: "2023-01-15" },
      { id: "p2", name: "Öhlins TTX36 Arka Amortisör", installedAt: "2023-02-01" }
    ]
  },

  // Paddock Box 10 (1 Motor)
  {
    id: "USAK-17",
    garageId: "box-10",
    garageNo: "Paddock Box 10",
    raceNumber: "71",
    brand: "BMW",
    model: "M 1000 RR",
    year: 2024,
    engineSize: "999 cc",
    chassisNumber: "WB10M0010P69971",
    color: "Black Storm M Paketi",
    photoUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80",
    owner: {
      fullName: "Kadir Şahin",
      phone: "0 (532) 200 90 90",
      bloodType: "A Rh+",
      emergencyName: "Nazlı Şahin",
      emergencyRelation: "Eşi",
      emergencyPhone: "0 (533) 100 20 30"
    },
    paymentAmount: 7000,
    remainingEntries: 5, // Yeni 5 giriş hakkı yüklendi
    totalEntriesGranted: 5,
    entryHistory: [],
    equippedParts: [
      { id: "p1", name: "Capit Factory Termal Ceketli Isıtıcı", installedAt: "2024-06-01" },
      { id: "p2", name: "M Karbon Jantlar & Kanatlar", installedAt: "2024-06-01" },
      { id: "p3", name: "2D Datarecording Telemetri", installedAt: "2024-06-15" }
    ]
  }
];

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
  // Sadece rakamları al
  let numbers = value.replace(/\D/g, "");
  
  // Eğer 0 ile başlamıyorsa başına 0 ekle
  if (!numbers.startsWith("0")) {
    numbers = "0" + numbers;
  }
  
  // En fazla 11 hane (0 + 10 hane)
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
export const STORAGE_KEY_BIKES = "usak_pist_garage_bikes_v3";

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
