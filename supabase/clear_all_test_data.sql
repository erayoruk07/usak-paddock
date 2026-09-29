-- =========================================================================
-- UŞAK YARIŞ PİSTİ - TEST VERİLERİNİ TEMİZLEME (SIFIRLAMA) SCRİPTİ
-- =========================================================================
-- Bu script pistteki tüm test motorlarını, parça bilgilerini ve logları temizler.
-- 10 Garaj (Paddock Box 1-10) ve Yetkili Kullanıcılar (admins) KORUNUR.
-- Gerçek veri girişine sıfırdan başlamak için Supabase SQL Editor'da çalıştırın.
-- =========================================================================

-- 1. Seans ve denetim loglarını temizle
TRUNCATE TABLE public.entry_logs CASCADE;

-- 2. Test motorlarını temizle
TRUNCATE TABLE public.bikes CASCADE;

-- 3. Durum Kontrolü (Garajlar: 10, Adminler: >=1, Motorlar: 0 olmalı)
SELECT 'bikes (motorlar)' AS tablo, count(*) AS kayit_sayisi FROM public.bikes
UNION ALL
SELECT 'entry_logs (loglar)' AS tablo, count(*) AS kayit_sayisi FROM public.entry_logs
UNION ALL
SELECT 'garages (garajlar)' AS tablo, count(*) AS kayit_sayisi FROM public.garages
UNION ALL
SELECT 'admins (yetkililer)' AS tablo, count(*) AS kayit_sayisi FROM public.admins;
