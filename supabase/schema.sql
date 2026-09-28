-- ============================================================
-- UŞAK YARIŞ PİSTİ PADDOCK GARAJ YÖNETİMİ
-- Supabase SQL Şeması ve Tabloları
-- ============================================================

-- 1. YETKİLİLER (ADMINS) TABLOSU
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Varsayılan ilk yöneticiyi ekleyelim
INSERT INTO public.admins (username, password, name)
VALUES ('admin', '123', 'Pist Yöneticisi')
ON CONFLICT (username) DO NOTHING;


-- 2. 10 PADDOCK BOX GARAJ TABLOSU
CREATE TABLE IF NOT EXISTS public.garages (
    id TEXT PRIMARY KEY, -- örn: 'box-1', 'box-2'
    box_number INT NOT NULL,
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


-- 3. MOTORLAR VE SÜRÜCÜLER TABLOSU
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

-- Hızlı aramalar için indeksler
CREATE INDEX IF NOT EXISTS idx_bikes_garage_id ON public.bikes(garage_id);
CREATE INDEX IF NOT EXISTS idx_bikes_race_number ON public.bikes(race_number);
CREATE INDEX IF NOT EXISTS idx_bikes_owner_name ON public.bikes(owner_name);

-- RLS (Row Level Security) Açma (Geliştirme aşaması için herkese okuma/yazma izni)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes adminleri okuyabilir/yazabilir" ON public.admins FOR ALL USING (true);
CREATE POLICY "Herkes garajları okuyabilir/yazabilir" ON public.garages FOR ALL USING (true);
CREATE POLICY "Herkes motorları okuyabilir/yazabilir" ON public.bikes FOR ALL USING (true);
