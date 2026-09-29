import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import mock data
import { INITIAL_GARAGES, INITIAL_BIKES } from '../src/data/mockData.js';
import { INITIAL_ADMINS } from '../src/data/authData.js';

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeJson(obj) {
  if (!obj) return `'[]'::jsonb`;
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

let sql = `-- ============================================================
-- UŞAK YARIŞ PİSTİ PADDOCK GARAJ YÖNETİMİ
-- CANLI VERİTABANI BAŞLANGIÇ VE SEED SQL DOSYASI
-- ============================================================

-- 1. YETKİLİLER / KULLANICILAR (ADMINS)
INSERT INTO public.admins (username, password, name, role) VALUES
`;

const adminValues = INITIAL_ADMINS.map(a => 
  `(${escapeSql(a.username)}, ${escapeSql(a.password)}, ${escapeSql(a.name)}, ${escapeSql(a.role || 'ADMIN')})`
).join(',\n');

sql += adminValues;
sql += `\nON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password, name = EXCLUDED.name, role = EXCLUDED.role;\n\n`;

// 2. GARAJLAR
sql += `-- 2. 10 PADDOCK BOX GARAJ
INSERT INTO public.garages (id, box_number, name) VALUES
`;

const garageValues = INITIAL_GARAGES.map(g => 
  `(${escapeSql(g.id)}, ${g.boxNumber}, ${escapeSql(g.name)})`
).join(',\n');

sql += garageValues;
sql += `\nON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, box_number = EXCLUDED.box_number;\n\n`;

// 3. MOTORLAR VE SÜRÜCÜLER
sql += `-- 3. 20 ADET PADDOCK MOTORU, SÜRÜCÜ BİLGİLERİ, KAN GRUPLARI, PARÇALAR VE BAKİYELER
INSERT INTO public.bikes (
    id, garage_id, garage_no, race_number, brand, model, year, engine_size,
    chassis_number, color, photo_url,
    owner_name, owner_phone, blood_type, emergency_name, emergency_relation, emergency_phone,
    payment_amount, remaining_entries, total_entries_granted,
    equipped_parts, entry_history
) VALUES
`;

const bikeValues = INITIAL_BIKES.map(b => {
  return `(
    ${escapeSql(b.id)},
    ${escapeSql(b.garageId)},
    ${escapeSql(b.garageNo)},
    ${escapeSql(b.raceNumber)},
    ${escapeSql(b.brand)},
    ${escapeSql(b.model)},
    ${b.year || 2024},
    ${escapeSql(b.engineSize || '')},
    ${escapeSql(b.chassisNumber || '')},
    ${escapeSql(b.color || '')},
    ${escapeSql(b.photoUrl || '')},
    ${escapeSql(b.owner?.fullName || '')},
    ${escapeSql(b.owner?.phone || '')},
    ${escapeSql(b.owner?.bloodType || 'A Rh+')},
    ${escapeSql(b.owner?.emergencyName || '')},
    ${escapeSql(b.owner?.emergencyRelation || 'Eşi')},
    ${escapeSql(b.owner?.emergencyPhone || '')},
    ${b.paymentAmount || 7000},
    ${b.remainingEntries ?? 5},
    ${b.totalEntriesGranted ?? 5},
    ${escapeJson(b.equippedParts || [])},
    ${escapeJson(b.entryHistory || [])}
)`;
}).join(',\n');

sql += bikeValues;
sql += `\nON CONFLICT (id) DO UPDATE SET
    garage_id = EXCLUDED.garage_id,
    garage_no = EXCLUDED.garage_no,
    race_number = EXCLUDED.race_number,
    brand = EXCLUDED.brand,
    model = EXCLUDED.model,
    year = EXCLUDED.year,
    engine_size = EXCLUDED.engine_size,
    chassis_number = EXCLUDED.chassis_number,
    color = EXCLUDED.color,
    photo_url = EXCLUDED.photo_url,
    owner_name = EXCLUDED.owner_name,
    owner_phone = EXCLUDED.owner_phone,
    blood_type = EXCLUDED.blood_type,
    emergency_name = EXCLUDED.emergency_name,
    emergency_relation = EXCLUDED.emergency_relation,
    emergency_phone = EXCLUDED.emergency_phone,
    payment_amount = EXCLUDED.payment_amount,
    remaining_entries = EXCLUDED.remaining_entries,
    total_entries_granted = EXCLUDED.total_entries_granted,
    equipped_parts = EXCLUDED.equipped_parts,
    entry_history = EXCLUDED.entry_history,
    updated_at = now();\n\n`;

// 4. İLK SİSTEM LOGU
sql += `-- 4. İLK SİSTEM LOGU
INSERT INTO public.entry_logs (bike_id, race_number, driver_name, garage_no, action_type, note, remaining_entries, performed_by)
VALUES (NULL, NULL, NULL, NULL, 'SYSTEM_INIT', 'Uşak Pist Garaj Veritabanı ve 20 Paddock Motoru başarıyla yüklendi.', NULL, 'Sistem');
`;

const outputPath = path.join(__dirname, '../supabase/seed.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log('Seed SQL başarıyla üretildi:', outputPath);

// Full Setup SQL (DDL + İndeksler + RLS + Seed Verileri)
const fullSetupPath = path.join(__dirname, '../supabase/full_setup.sql');
const fullSetupContent = `-- ============================================================
-- UŞAK YARIŞ PİSTİ PADDOCK GARAJ YÖNETİMİ
-- TEK TIKLA TAM VERİTABANI KURULUMU (FULL SETUP: TABLOLAR + İNDEKSLER + SEED VERİSİ)
-- Supabase SQL Editor'da doğrudan çalıştırılabilir.
-- ============================================================

-- 1. TABLOLAR
CREATE TABLE IF NOT EXISTS public.admins (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'VIEWER' CHECK (role IN ('ADMIN', 'VIEWER')),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE IF EXISTS public.admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'ADMIN';

CREATE TABLE IF NOT EXISTS public.garages (
    id TEXT PRIMARY KEY,
    box_number INT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bikes (
    id TEXT PRIMARY KEY,
    garage_id TEXT REFERENCES public.garages(id) ON DELETE SET NULL,
    garage_no TEXT NOT NULL,
    race_number TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT DEFAULT 2024,
    engine_size TEXT,
    chassis_number TEXT,
    color TEXT,
    photo_url TEXT,
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    blood_type TEXT DEFAULT 'A Rh+',
    emergency_name TEXT,
    emergency_relation TEXT DEFAULT 'Eşi',
    emergency_phone TEXT,
    payment_amount NUMERIC DEFAULT 7000,
    remaining_entries INT DEFAULT 5,
    total_entries_granted INT DEFAULT 5,
    equipped_parts JSONB DEFAULT '[]'::jsonb,
    entry_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.entry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bike_id TEXT,
    race_number TEXT,
    driver_name TEXT,
    garage_no TEXT,
    action_type TEXT NOT NULL,
    note TEXT,
    remaining_entries INT,
    performed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. İNDEKSLER
CREATE INDEX IF NOT EXISTS idx_admins_username ON public.admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);
CREATE INDEX IF NOT EXISTS idx_bikes_garage_id ON public.bikes(garage_id);
CREATE INDEX IF NOT EXISTS idx_bikes_race_number ON public.bikes(race_number);
CREATE INDEX IF NOT EXISTS idx_bikes_owner_name ON public.bikes(owner_name);
CREATE INDEX IF NOT EXISTS idx_bikes_chassis ON public.bikes(chassis_number);
CREATE INDEX IF NOT EXISTS idx_bikes_remaining ON public.bikes(remaining_entries);
CREATE INDEX IF NOT EXISTS idx_entry_logs_bike_id ON public.entry_logs(bike_id);
CREATE INDEX IF NOT EXISTS idx_entry_logs_created_at ON public.entry_logs(created_at DESC);

-- 3. RLS POLİTİKALARI
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins okuma/yazma politikası" ON public.admins;
CREATE POLICY "Admins okuma/yazma politikası" ON public.admins FOR ALL USING (true);

DROP POLICY IF EXISTS "Garajlar okuma/yazma politikası" ON public.garages;
CREATE POLICY "Garajlar okuma/yazma politikası" ON public.garages FOR ALL USING (true);

DROP POLICY IF EXISTS "Motorlar okuma/yazma politikası" ON public.bikes;
CREATE POLICY "Motorlar okuma/yazma politikası" ON public.bikes FOR ALL USING (true);

DROP POLICY IF EXISTS "Loglar okuma/yazma politikası" ON public.entry_logs;
CREATE POLICY "Loglar okuma/yazma politikası" ON public.entry_logs FOR ALL USING (true);

-- 4. VERİLER (DATA INSERTS)
` + sql;

fs.writeFileSync(fullSetupPath, fullSetupContent, 'utf8');
console.log('Full Setup SQL başarıyla üretildi:', fullSetupPath);

