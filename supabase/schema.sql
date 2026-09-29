-- ============================================================
-- UŞAK YARIŞ PİSTİ PADDOCK GARAJ YÖNETİMİ
-- Supabase SQL Şeması, İndeksler ve Canlı Log Sistemi
-- Bu SQL dosyasını Supabase SQL Editor'da tek seferde
-- veya dilediğiniz kadar güvenle çalıştırabilirsiniz.
-- ============================================================

-- ============================================================
-- 1. YETKİLİLER VE KULLANICILAR (ADMINS) TABLOSU
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'VIEWER' CHECK (role IN ('ADMIN', 'VIEWER')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Eğer daha önceden tablo varsa 'role' sütununun var olduğundan emin olalım
ALTER TABLE IF EXISTS public.admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'ADMIN';

-- Varsayılan yöneticiyi ekleyelim (id belirtilmez, veritabanı UUID üretir)
INSERT INTO public.admins (username, password, name, role)
VALUES ('admin', '123', 'Pist Yöneticisi', 'ADMIN')
ON CONFLICT (username) DO UPDATE 
SET role = 'ADMIN' WHERE public.admins.username = 'admin';


-- ============================================================
-- 2. 10 PADDOCK BOX GARAJ TABLOSU
-- ============================================================
CREATE TABLE IF NOT EXISTS public.garages (
    id TEXT PRIMARY KEY, -- 'box-1', 'box-2' ... 'box-10'
    box_number INT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10 Garajı yükleyelim
INSERT INTO public.garages (id, box_number, name) VALUES
('box-1', 1, 'Paddock Box 1'),
('box-2', 2, 'Paddock Box 2'),
('box-3', 3, 'Paddock Box 3'),
('box-4', 4, 'Paddock Box 4'),
('box-5', 5, 'Paddock Box 5'),
('box-6', 6, 'Paddock Box 6'),
('box-7', 7, 'Paddock Box 7'),
('box-8', 8, 'Paddock Box 8'),
('box-9', 9, 'Paddock Box 9'),
('box-10', 10, 'Paddock Box 10')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 3. MOTORLAR VE SÜRÜCÜLER TABLOSU
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bikes (
    id TEXT PRIMARY KEY, -- örn: 'USAK-01'
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
    
    -- Sürücü & Pilot Bilgileri
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    blood_type TEXT DEFAULT 'A Rh+',
    emergency_name TEXT,
    emergency_relation TEXT DEFAULT 'Eşi',
    emergency_phone TEXT,
    
    -- Bakiye & Pist Giriş Hakları
    payment_amount NUMERIC DEFAULT 7000,
    remaining_entries INT DEFAULT 5,
    total_entries_granted INT DEFAULT 5,
    
    -- JSONB Donanımlar ve Giriş Logları
    equipped_parts JSONB DEFAULT '[]'::jsonb,
    entry_history JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 4. PİST GİRİŞ VE SİSTEM İŞLEM LOGLARI (AUDIT & ENTRY LOGS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.entry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bike_id TEXT,
    race_number TEXT,
    driver_name TEXT,
    garage_no TEXT,
    action_type TEXT NOT NULL, -- 'TRACK_ENTRY', 'ENTRIES_GRANTED', 'BIKE_ADDED', 'BIKE_MOVED', 'USER_CREATED', 'USER_DELETED'
    note TEXT,
    remaining_entries INT,
    performed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 5. PERFORMANS VE ARAMA İNDEKSLERİ (B-TREE INDEXES)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_admins_username ON public.admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);

CREATE INDEX IF NOT EXISTS idx_bikes_garage_id ON public.bikes(garage_id);
CREATE INDEX IF NOT EXISTS idx_bikes_race_number ON public.bikes(race_number);
CREATE INDEX IF NOT EXISTS idx_bikes_owner_name ON public.bikes(owner_name);
CREATE INDEX IF NOT EXISTS idx_bikes_owner_phone ON public.bikes(owner_phone);
CREATE INDEX IF NOT EXISTS idx_bikes_chassis ON public.bikes(chassis_number);
CREATE INDEX IF NOT EXISTS idx_bikes_remaining ON public.bikes(remaining_entries);
CREATE INDEX IF NOT EXISTS idx_bikes_blood_type ON public.bikes(blood_type);

CREATE INDEX IF NOT EXISTS idx_entry_logs_bike_id ON public.entry_logs(bike_id);
CREATE INDEX IF NOT EXISTS idx_entry_logs_created_at ON public.entry_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entry_logs_action ON public.entry_logs(action_type);


-- ============================================================
-- 6. RLS (ROW LEVEL SECURITY) POLİTİKALARI
-- ============================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_logs ENABLE ROW LEVEL SECURITY;

-- Eski politikalar varsa temizle ve yeniden oluştur (Hata vermez)
DROP POLICY IF EXISTS "Admins okuma/yazma politikası" ON public.admins;
CREATE POLICY "Admins okuma/yazma politikası" ON public.admins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Garajlar okuma/yazma politikası" ON public.garages;
CREATE POLICY "Garajlar okuma/yazma politikası" ON public.garages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Motorlar okuma/yazma politikası" ON public.bikes;
CREATE POLICY "Motorlar okuma/yazma politikası" ON public.bikes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Loglar okuma/yazma politikası" ON public.entry_logs;
CREATE POLICY "Loglar okuma/yazma politikası" ON public.entry_logs FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- 7. SUPABASE REALTIME (CANLI ANINDA WEBSOCKET SENKRONİZASYONU)
-- ============================================================
-- Mobilde ve PC'de yapılan işlemlerin saniyenin onda birinde diğer ekranda belirmesini sağlar
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bikes;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admins;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
