const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// 1. Logo base64
const logoPath = path.join(__dirname, 'public', 'logo.png');
let logoBase64 = '';
if (fs.existsSync(logoPath)) {
  logoBase64 = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
}

const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Uşak Yarış Pisti - Pist Giriş Hakları ve Bakiye Yönetimi Analiz Raporu</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0b0f17;
      color: #e2e8f0;
      font-size: 11px;
      line-height: 1.5;
    }

    .page {
      page-break-after: always;
      position: relative;
      min-height: 260mm;
      padding-bottom: 10mm;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* HEADER */
    .doc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #ef4444;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }

    .brand-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      object-fit: cover;
      background: #000;
    }

    .brand-title h1 {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #ffffff;
      text-transform: uppercase;
      line-height: 1.1;
    }

    .brand-title p {
      font-size: 9px;
      font-weight: 800;
      color: #ef4444;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .doc-meta {
      text-align: right;
      font-size: 9px;
      color: #94a3b8;
    }

    .doc-badge {
      display: inline-block;
      padding: 3px 8px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #fca5a5;
      font-weight: 800;
      border-radius: 6px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    /* SECTION HEADINGS */
    .section-title {
      font-size: 14px;
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 16px 0 10px 0;
      padding-left: 8px;
      border-left: 3px solid #ef4444;
    }

    .section-title .sub {
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
      text-transform: none;
      letter-spacing: 0;
    }

    /* 3N 1S GRID */
    .grid-3n1s {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }

    .card-3n {
      background: #141822;
      border: 1px solid #1f293d;
      border-radius: 10px;
      padding: 12px;
      position: relative;
      break-inside: avoid;
    }

    .card-3n.highlight-red {
      border-left: 4px solid #ef4444;
    }
    .card-3n.highlight-amber {
      border-left: 4px solid #f59e0b;
    }
    .card-3n.highlight-emerald {
      border-left: 4px solid #10b981;
    }
    .card-3n.highlight-cyan {
      border-left: 4px solid #06b6d4;
    }

    .card-header-3n {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .pill-3n {
      font-size: 9px;
      font-weight: 900;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pill-red { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
    .pill-amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
    .pill-emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
    .pill-cyan { background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid #06b6d4; }

    .card-title-3n {
      font-size: 12px;
      font-weight: 800;
      color: #fff;
    }

    .card-body-3n {
      font-size: 9.5px;
      color: #cbd5e1;
      line-height: 1.45;
    }

    .card-body-3n ul {
      margin-left: 14px;
      margin-top: 4px;
    }

    .card-body-3n li {
      margin-bottom: 3px;
    }

    /* MOCKUP SCREENS CONTAINER */
    .mockup-container {
      background: #111622;
      border: 1px solid #232d42;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 14px;
      break-inside: avoid;
    }

    .mockup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #1e293b;
    }

    .mockup-label {
      font-size: 11px;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .mockup-num {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ef4444;
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 900;
    }

    .mockup-desc {
      font-size: 9px;
      color: #94a3b8;
    }

    /* UI MOCKUP ELEMENTS */
    .ui-panel {
      background: #090d14;
      border: 1px solid #1f293d;
      border-radius: 8px;
      padding: 10px;
    }

    .ui-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #141822;
      border: 1px solid #243048;
      border-radius: 6px;
      padding: 6px 10px;
      margin-bottom: 8px;
      font-size: 9.5px;
    }

    .ui-btn-group {
      display: flex;
      gap: 4px;
    }

    .ui-btn {
      font-size: 8.5px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 5px;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .btn-red { background: #ef4444; color: white; }
    .btn-amber { background: #f59e0b; color: white; }
    .btn-emerald { background: #10b981; color: white; }
    .btn-cyan { background: #06b6d4; color: white; }
    .btn-dark { background: #1e293b; color: #94a3b8; }

    /* BIKE ROW COMPONENT */
    .bike-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #141822;
      border: 1px solid #1f293d;
      border-radius: 8px;
      padding: 8px 10px;
      margin-bottom: 6px;
    }

    .bike-row.expired {
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(239, 68, 68, 0.05);
    }

    .bike-num-badge {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: #ef4444;
      color: #fff;
      font-size: 13px;
      font-weight: 900;
      font-style: italic;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      flex-shrink: 0;
    }

    .bike-info {
      flex: 1;
    }

    .bike-name {
      font-size: 11px;
      font-weight: 800;
      color: #fff;
    }

    .bike-meta {
      font-size: 8.5px;
      color: #94a3b8;
    }

    .balance-box {
      text-align: right;
      margin-right: 12px;
    }

    .balance-val {
      font-size: 13px;
      font-weight: 900;
    }
    .val-expired { color: #f87171; }
    .val-active { color: #34d399; }

    /* TABLE STYLES */
    .table-modern {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin: 8px 0;
    }

    .table-modern th {
      background: #141822;
      color: #94a3b8;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      border-bottom: 1px solid #1f293d;
      text-align: left;
    }

    .table-modern td {
      padding: 6px 8px;
      border-bottom: 1px solid #171f2e;
      color: #cbd5e1;
    }

    .table-modern tr:nth-child(even) td {
      background: rgba(255, 255, 255, 0.015);
    }

    .tag-allowed {
      color: #34d399;
      font-weight: 800;
      background: rgba(16, 185, 129, 0.15);
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid rgba(16, 185, 129, 0.3);
      display: inline-block;
    }

    .tag-denied {
      color: #f87171;
      font-weight: 800;
      background: rgba(239, 68, 68, 0.15);
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid rgba(239, 68, 68, 0.3);
      display: inline-block;
    }

    /* FLOWCHART STEPS */
    .flow-steps {
      display: flex;
      gap: 8px;
      margin: 10px 0;
    }

    .flow-step {
      flex: 1;
      background: #141822;
      border: 1px solid #1f293d;
      border-radius: 8px;
      padding: 10px 8px;
      text-align: center;
      position: relative;
    }

    .flow-step:not(:last-child)::after {
      content: '➔';
      position: absolute;
      right: -7px;
      top: 50%;
      transform: translateY(-50%);
      color: #ef4444;
      font-size: 11px;
      font-weight: 900;
      z-index: 2;
    }

    .flow-step-num {
      width: 18px;
      height: 18px;
      background: #ef4444;
      color: #fff;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 900;
      margin-bottom: 4px;
    }

    .flow-step-title {
      font-size: 10px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 2px;
    }

    .flow-step-desc {
      font-size: 8px;
      color: #94a3b8;
      line-height: 1.3;
    }

    /* FOOTER */
    .doc-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      border-top: 1px solid #1e293b;
      padding-top: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 8px;
      color: #64748b;
    }

    .badge-callout {
      background: #1e293b;
      border-left: 3px solid #06b6d4;
      padding: 6px 10px;
      border-radius: 0 6px 6px 0;
      font-size: 9px;
      color: #cbd5e1;
      margin: 8px 0;
    }
  </style>
</head>
<body>

  <!-- SAYFA 1: BAŞLIK, 3N 1S ANALİZ ÇERÇEVESİ VE YÖNETİCİ ÖZETİ -->
  <div class="page">
    <div class="doc-header">
      <div class="brand-box">
        ${logoBase64 ? `<img src="${logoBase64}" class="brand-logo" alt="Logo">` : ''}
        <div class="brand-title">
          <h1>Uşak Yarış Pisti • Paddock Box</h1>
          <p>Yazılım Geliştirme ve İş Analiz Raporu</p>
        </div>
      </div>
      <div class="doc-meta">
        <span class="doc-badge">Planlama / Ön Analiz</span>
        <div><strong>Doküman Kodu:</strong> UYP-FRM-2026-03</div>
        <div><strong>Tarih:</strong> 30 Eylül 2026</div>
        <div><strong>Hazırlayan:</strong> Sistem & Yazılım Analiz Ekibi</div>
      </div>
    </div>

    <div class="badge-callout">
      <strong>📌 Doküman Amacı:</strong> Bu analiz, Uşak Yarış Pisti bünyesinde devreye alınacak olan 
      <strong>"Pist Giriş Hakları, Bakiye & Seans Yönetim Modülü"</strong> için henüz geliştirme yapılmadan önce hazırlanan resmi ihtiyaç ve gereksinim spesifikasyonudur.
    </div>

    <!-- 3N 1S BÖLÜMÜ -->
    <div class="section-title">
      <span>3N 1S Analiz Çerçevesi</span>
      <span class="sub">(Ne? Neden? Niçin? Nasıl?)</span>
    </div>

    <div class="grid-3n1s">
      <!-- 1. NE? -->
      <div class="card-3n highlight-red">
        <div class="card-header-3n">
          <span class="card-title-3n">1. NE? (Kapsam & Özellik)</span>
          <span class="pill-3n pill-red">Konu</span>
        </div>
        <div class="card-body-3n">
          Paddock Box sistemine eklenecek olan <strong>"Merkezi Pist Giriş Hakları & Bakiye Takip Modülü"</strong>dür.
          <ul>
            <li>Pilotlara ait seans bakiye haklarının (5'li paket, tek seans vb.) dijitalleştirilmesi.</li>
            <li>Piste çıkış esnasında tek tıkla veya QR kodla anında hak düşümü yapılması.</li>
            <li>Ödeme ve seans geçmişinin (tahsilat defteri / ledger) loglanması.</li>
            <li>Yönetici (Admin) ile Gözlemci (Viewer) rollerinin kesin çizgilerle ayrıştırılması.</li>
          </ul>
        </div>
      </div>

      <!-- 2. NEDEN? -->
      <div class="card-3n highlight-amber">
        <div class="card-header-3n">
          <span class="card-title-3n">2. NEDEN? (Gerekçe & Sorun)</span>
          <span class="pill-3n pill-amber">Mevcut Durum</span>
        </div>
        <div class="card-body-3n">
          Pist işletmesinde kağıt veya sözlü takipten kaynaklanan aksaklıkları gidermek:
          <ul>
            <li><strong>Bakiye Belirsizliği:</strong> Pilotların kaç hakkı kaldığını unutması ve pist kapısında tartışmaların yaşanması.</li>
            <li><strong>Gelir Kaybı:</strong> Tahsilatı yapılmamış veya indirim uygulanmış hakların denetim altına alınamaması.</li>
            <li><strong>Yetki Karmaşası:</strong> Garajdaki teknik personelin yanlışlıkla pilot bakiyesini düşürmesi veya silmesi riski.</li>
            <li><strong>Hatalı Duruşlar:</strong> Sistemde oluşabilecek beklenmedik hatalarda tüm ekranın çökmesi riski.</li>
          </ul>
        </div>
      </div>

      <!-- 3. NİÇİN? -->
      <div class="card-3n highlight-emerald">
        <div class="card-header-3n">
          <span class="card-title-3n">3. NİÇİN? (Hedef & Kazanım)</span>
          <span class="pill-3n pill-emerald">İş Değeri</span>
        </div>
        <div class="card-body-3n">
          Pist operasyonunu profesyonel motorsport standartlarına taşımak ve finansal güvence sağlamak:
          <ul>
            <li><strong>%100 Finansal Şeffaflık:</strong> Piste giren her motorun ödemesini ve seans sayısını kuruşu kuruşuna denetlemek.</li>
            <li><strong>Operasyonel Hız:</strong> Pitlane çıkışında pilotların saniyeler içinde piste onaylanması.</li>
            <li><strong>Müşteri Sadakati:</strong> Bakiyesi biten pilotlara otomatik motorsport temalı WhatsApp bildirimiyle yeni paket satışı sağlamak.</li>
            <li><strong>Veri Güvenliği:</strong> Gözlemcilerin sadece parça yönetimi yapmasını, bakiye düşememesini garanti altına almak.</li>
          </ul>
        </div>
      </div>

      <!-- 4. NASIL? -->
      <div class="card-3n highlight-cyan">
        <div class="card-header-3n">
          <span class="card-title-3n">4. NASIL? (Uygulama & Yöntem)</span>
          <span class="pill-3n pill-cyan">Metodoloji</span>
        </div>
        <div class="card-body-3n">
          Modern web ve mobil teknolojileriyle entegre 5 aşamalı çözüm mimarisi:
          <ul>
            <li><strong>Arayüz:</strong> Responsive Tailwind CSS ile mobil ve tablet optimize 2 ana ekran ve 2 modal.</li>
            <li><strong>Rol Güvenliği (RBAC):</strong> Admin tam yetkili, Gözlemci ise salt okunur ve parça kontrolcüsü olacak.</li>
            <li><strong>Hata İzolasyonu:</strong> React ErrorBoundary ile izole edilen bileşenler, beklenmeyen hatalarda çökmeden geri kurtarılacak.</li>
            <li><strong>Gerçek Zamanlı DB:</strong> Supabase PostgreSQL üzerinde anlık senkronizasyon kurulacak.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- SÜREÇ VE İŞ AKIŞI -->
    <div class="section-title">
      <span>Planlanan Operasyonel İş Akışı (Pilot Seans Yaşam Döngüsü)</span>
    </div>

    <div class="flow-steps">
      <div class="flow-step">
        <div class="flow-step-num">1</div>
        <div class="flow-step-title">Paket Yükleme</div>
        <div class="flow-step-desc">Yönetici tarafından 5/10 seanslık hak ve tahsilat tutarı sisteme girilir.</div>
      </div>
      <div class="flow-step">
        <div class="flow-step-num">2</div>
        <div class="flow-step-title">Pit Çıkışı / Onay</div>
        <div class="flow-step-desc">Pilot kapıya geldiğinde tek tıkla (-1 Hak) düşülerek seans tarihi kaydedilir.</div>
      </div>
      <div class="flow-step">
        <div class="flow-step-num">3</div>
        <div class="flow-step-title">0 Hak Tetikleyici</div>
        <div class="flow-step-desc">Kalan hak 0 olduğunda motor otomatik olarak "Kırmızı Uyarı" listesine düşer.</div>
      </div>
      <div class="flow-step">
        <div class="flow-step-num">4</div>
        <div class="flow-step-title">WhatsApp Hatırlatma</div>
        <div class="flow-step-desc">Tek tıkla pilota motorsport formatında profesyonel bakiye yenileme mesajı gider.</div>
      </div>
    </div>

    <div class="doc-footer">
      <span>Uşak Yarış Pisti • Yazılım Mühendisliği & Ürün Yönetimi</span>
      <span>Sayfa 1 / 3</span>
    </div>
  </div>

  <!-- SAYFA 2: PLANLANAN EKRAN GÖRSELLERİ (MOCKUPS 1 VE 2) -->
  <div class="page">
    <div class="doc-header">
      <div class="brand-box">
        ${logoBase64 ? `<img src="${logoBase64}" class="brand-logo" alt="Logo">` : ''}
        <div class="brand-title">
          <h1>Planlanan Ekran Görselleri & Arayüz Tasarımları</h1>
          <p>Kullanıcı Deneyimi (UI/UX) Prototip Çizimleri</p>
        </div>
      </div>
      <div class="doc-meta">
        <span class="doc-badge">Modül Görselleri</span>
        <div><strong>Ekran Sayısı:</strong> 4 Ana Görünüm</div>
        <div><strong>Cihaz Uyumu:</strong> Mobil & Masaüstü</div>
      </div>
    </div>

    <!-- EKRAN 1 MOCKUP -->
    <div class="mockup-container">
      <div class="mockup-header">
        <div class="mockup-label">
          <span class="mockup-num">1</span>
          <span>Pist Giriş Hakları & Bakiye Takip Ekranı (Merkezi Liste)</span>
        </div>
        <span class="mockup-desc">Geliştirilecek Ana Yönetim Ekranı Görünümü</span>
      </div>

      <div class="ui-panel">
        <!-- Arama ve Filtre Çubuğu -->
        <div class="ui-bar">
          <div style="color: #94a3b8; font-size: 9px; display: flex; align-items: center; gap: 4px;">
            <span>🔍</span>
            <span style="color: #64748b;">Pilot adı (#46 Tolga), garaj no, telefon ara...</span>
          </div>
          <div class="ui-btn-group">
            <button class="ui-btn btn-red">⚠️ Bitenler (2)</button>
            <button class="ui-btn btn-emerald">✅ Aktifler (8)</button>
            <button class="ui-btn btn-cyan">Tümü (10)</button>
          </div>
        </div>

        <!-- Motor Satırı 1: Aktif Bakiye -->
        <div class="bike-row">
          <div style="display: flex; align-items: center;">
            <div class="bike-num-badge">#46</div>
            <div class="bike-info">
              <div class="bike-name">
                Tolga Yılmaz 
                <span style="font-size: 8px; background: #3b0764; color: #d8b4fe; padding: 1px 5px; border-radius: 4px; margin-left: 4px;">0 Rh+</span>
                <span style="font-size: 8px; background: #083344; color: #67e8f9; padding: 1px 5px; border-radius: 4px; margin-left: 2px;">Özet Detayı</span>
              </div>
              <div class="bike-meta">Box 1 • Yamaha YZF-R1 • 0532 999 46 46</div>
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="balance-box">
              <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase;">Kalan Giriş</div>
              <div class="balance-val val-active">4 Giriş</div>
              <div style="font-size: 7.5px; color: #64748b;">Toplam 5 seanslık paket</div>
            </div>
            <div class="ui-btn-group">
              <button class="ui-btn btn-red">▶ Piste Gir</button>
              <button class="ui-btn btn-amber">+ Hak Yükle</button>
            </div>
          </div>
        </div>

        <!-- Motor Satırı 2: Biten Bakiye (0 Hak) -->
        <div class="bike-row expired">
          <div style="display: flex; align-items: center;">
            <div class="bike-num-badge" style="background: #991b1b;">#54</div>
            <div class="bike-info">
              <div class="bike-name">
                Kenan Sofuoğlu
                <span style="font-size: 8px; background: #450a0a; color: #fca5a5; padding: 1px 5px; border-radius: 4px; margin-left: 4px;">A Rh+</span>
              </div>
              <div class="bike-meta">Box 2 • Kawasaki ZX-10RR • 0555 123 54 54</div>
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="balance-box">
              <div style="font-size: 8px; color: #ef4444; font-weight: 800; text-transform: uppercase;">Giriş Hakkı Bitti</div>
              <div class="balance-val val-expired">0 Giriş</div>
              <div style="font-size: 7.5px; color: #f87171;">Yeni paket bekleniyor</div>
            </div>
            <div class="ui-btn-group">
              <button class="ui-btn btn-dark" style="opacity: 0.5;">▶ Piste Gir</button>
              <button class="ui-btn btn-amber">+ Hak Yükle</button>
              <button class="ui-btn btn-emerald" style="background: #059669;">💬 WhatsApp</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- EKRAN 2 MOCKUP: PADDOCK ÖZET & DETAY MODALI -->
    <div class="mockup-container">
      <div class="mockup-header">
        <div class="mockup-label">
          <span class="mockup-num">2</span>
          <span>Paddock Özet & Seans Defteri Modalı (Finansal & Seans Logları)</span>
        </div>
        <span class="mockup-desc">Herhangi bir motora tıklandığında açılacak detay penceresi</span>
      </div>

      <div class="ui-panel" style="background: #111622; border-color: rgba(6, 182, 212, 0.4);">
        <!-- Modal Başlık -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(6, 182, 212, 0.3); padding-bottom: 6px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; background: #0891b2; color: #fff; font-weight: 900; font-size: 11px; display: flex; align-items: center; justify-content: center; border-radius: 6px;">#46</div>
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #fff;">Tolga Yılmaz • Box 1 Paddock Özeti</div>
              <div style="font-size: 8px; color: #22d3ee;">Yamaha YZF-R1 • Şasi: JYARN28 • Tel: 0532 999 46 46</div>
            </div>
          </div>
          <span style="font-size: 9px; color: #94a3b8; cursor: pointer;">✕ Kapat</span>
        </div>

        <!-- 3 İstatistik Kutusu -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 8px;">
          <div style="background: #161d2d; padding: 6px; border-radius: 6px; text-align: center; border: 1px solid #1f2a3f;">
            <div style="font-size: 7.5px; color: #94a3b8; text-transform: uppercase;">Kalan Hak</div>
            <div style="font-size: 13px; font-weight: 900; color: #34d399;">4 Seans</div>
          </div>
          <div style="background: #161d2d; padding: 6px; border-radius: 6px; text-align: center; border: 1px solid #1f2a3f;">
            <div style="font-size: 7.5px; color: #94a3b8; text-transform: uppercase;">Toplam Tanımlanan</div>
            <div style="font-size: 13px; font-weight: 900; color: #22d3ee;">5 Seans</div>
          </div>
          <div style="background: #161d2d; padding: 6px; border-radius: 6px; text-align: center; border: 1px solid #1f2a3f;">
            <div style="font-size: 7.5px; color: #94a3b8; text-transform: uppercase;">Toplam Tahsilat</div>
            <div style="font-size: 13px; font-weight: 900; color: #fbbf24;">4.500 ₺</div>
          </div>
        </div>

        <!-- Sekmeler & Tablo -->
        <div style="display: flex; gap: 4px; margin-bottom: 6px; border-bottom: 1px solid #1e293b; padding-bottom: 4px;">
          <span style="font-size: 9px; font-weight: 800; color: #22d3ee; border-bottom: 2px solid #06b6d4; padding-bottom: 2px;">💳 Tahsilat & Ödemeler (1)</span>
          <span style="font-size: 9px; font-weight: 700; color: #64748b; padding-left: 8px;">🏎️ Piste Çıkış Geçmişi (1)</span>
        </div>

        <table class="table-modern">
          <thead>
            <tr>
              <th>İşlem Tarihi</th>
              <th>Ödeme Yöntemi</th>
              <th>Tanımlanan Paket</th>
              <th>Tutar</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>29.09.2026 14:30</td>
              <td>Kredi Kartı (POS)</td>
              <td>5 Seanslık Giriş Paketi</td>
              <td style="color: #34d399; font-weight: 800;">4.500 ₺</td>
              <td><span class="tag-allowed">Tahsil Edildi</span></td>
            </tr>
          </tbody>
        </table>

        <!-- Alt Aksiyon Butonları -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid #1e293b;">
          <span style="font-size: 8px; color: #64748b;">🔒 Tüm mali kayıtlar ve seanslar sunucuda kriptolu loglanır.</span>
          <div class="ui-btn-group">
            <button class="ui-btn btn-red">▶ Piste Çıkış Ver (-1 Hak)</button>
            <button class="ui-btn btn-amber">+ Hak / Paket Ekle</button>
          </div>
        </div>
      </div>
    </div>

    <div class="doc-footer">
      <span>Uşak Yarış Pisti • Yazılım Mühendisliği & Ürün Yönetimi</span>
      <span>Sayfa 2 / 3</span>
    </div>
  </div>

  <!-- SAYFA 3: ROL GÜVENLİĞİ, WHATSAPP ŞABLONU VE HATA İZOLASYONU -->
  <div class="page">
    <div class="doc-header">
      <div class="brand-box">
        ${logoBase64 ? `<img src="${logoBase64}" class="brand-logo" alt="Logo">` : ''}
        <div class="brand-title">
          <h1>Güvenlik Matrisi, İletişim Otomasyonu & Dayanıklılık</h1>
          <p>Rol Tabanlı Erişim Kontrolü (RBAC) & Teknik Standartlar</p>
        </div>
      </div>
      <div class="doc-meta">
        <span class="doc-badge">Mimari & Güvenlik</span>
        <div><strong>Güvenlik Seviyesi:</strong> Kritik (RBAC)</div>
        <div><strong>Hata Yakalama:</strong> ErrorBoundary Aktif</div>
      </div>
    </div>

    <!-- ROL YETKİ MATRİSİ -->
    <div class="section-title">
      <span>Rol & Yetkilendirme Matrisi (Admin vs. Gözlemci)</span>
      <span class="sub">Hangi rol neleri yapabilir?</span>
    </div>

    <table class="table-modern">
      <thead>
        <tr>
          <th>Modül / Fonksiyon</th>
          <th>Yönetici (Pist Admini)</th>
          <th>Gözlemci (Garaj Sorumlusu)</th>
          <th>Güvenlik Gerekçesi</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Giriş Hakları Menüsü</strong></td>
          <td><span class="tag-allowed">Görüntüler & Yönetir</span></td>
          <td><span class="tag-denied">Menü Gizli / Kısıtlı</span></td>
          <td>Gözlemcilerin ticari bakiye verilerini görmesi engellenir.</td>
        </tr>
        <tr>
          <td><strong>Piste Çıkış Onayı (-1 Hak Düşme)</strong></td>
          <td><span class="tag-allowed">Yetkili (Tek tıkla düşer)</span></td>
          <td><span class="tag-denied">Kısıtlı (Hak düşemez)</span></td>
          <td>Garaj personelinin sehven pilot hakkını yakması önlenir.</td>
        </tr>
        <tr>
          <td><strong>Yeni Hak / Tahsilat Tanımlama</strong></td>
          <td><span class="tag-allowed">Yetkili (Tutar ve paket girer)</span></td>
          <td><span class="tag-denied">Engelli</span></td>
          <td>Mali ve kasa işlemleri sadece yöneticinin kontrolündedir.</td>
        </tr>
        <tr>
          <td><strong>Motosiklet Parça Ekleme / Silme</strong></td>
          <td><span class="tag-allowed">Yetkili</span></td>
          <td><span class="tag-allowed">Yetkili (Tam Yetki)</span></td>
          <td>Teknik ekibin lastik, laptimer ve ekipman takibini rahat yapması sağlanır.</td>
        </tr>
        <tr>
          <td><strong>Sürücü Kartı Düzenleme & Silme</strong></td>
          <td><span class="tag-allowed">Yetkili</span></td>
          <td><span class="tag-denied">Salt Okunur</span></td>
          <td>Kritik pilot ve motor künye verilerinin korunması sağlanır.</td>
        </tr>
      </tbody>
    </table>

    <!-- EKRAN 3 & 4: GÖZLEMCİ UYARISI & WHATSAPP ŞABLONU -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
      
      <!-- GÖZLEMCİ GÜVENLİK EKRANI MOCKUP -->
      <div class="mockup-container">
        <div class="mockup-header">
          <div class="mockup-label">
            <span class="mockup-num">3</span>
            <span>Gözlemci Kısıtlama Ekranı</span>
          </div>
        </div>
        <div class="ui-panel" style="text-align: center; padding: 16px 8px; border: 1px dashed #ef4444;">
          <div style="font-size: 24px; margin-bottom: 4px;">🛡️</div>
          <div style="font-size: 11px; font-weight: 900; color: #fff;">Yetki Kısıtlaması</div>
          <div style="font-size: 8.5px; color: #94a3b8; margin: 4px 0 8px 0; line-height: 1.4;">
            Gözlemci hesabıyla oturum açtığınız için bakiye ve tahsilat yönetimini görüntüleme yetkiniz kısıtlanmıştır.
          </div>
          <button class="ui-btn btn-red" style="font-size: 8.5px; margin: 0 auto;">➔ 10 Box Garajlara Dön</button>
        </div>
        <div style="font-size: 8px; color: #64748b; margin-top: 6px;">
          * Yetkisiz sekmeye tıklandığında ekranın boş/beyaz kalması engellenip kullanıcıya nazik yönlendirme sunulur.
        </div>
      </div>

      <!-- WHATSAPP MOTORSPORT ŞABLONU -->
      <div class="mockup-container">
        <div class="mockup-header">
          <div class="mockup-label">
            <span class="mockup-num">4</span>
            <span>WhatsApp 0-Hak Bildirimi</span>
          </div>
        </div>
        <div class="ui-panel" style="background: #0d1e18; border-color: #059669; padding: 10px;">
          <div style="font-size: 9px; font-weight: 800; color: #34d399; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
            <span>🟢</span> <span>WhatsApp Mesaj Taslağı</span>
          </div>
          <div style="font-family: monospace; font-size: 8px; color: #d1fae5; line-height: 1.4; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 6px;">
            🏁 <strong>UŞAK YARIŞ PİSTİ BİLGİLENDİRME</strong><br><br>
            Sayın <strong>Tolga Yılmaz</strong>,<br>
            🏍️ <strong>#46</strong> (Yamaha YZF-R1) için pist giriş hakkınız tükenmiştir.<br><br>
            ⏱️ <strong>Kalan Hak: 0 Seans</strong><br>
            📍 Pist çıkışına devam edebilmek için lütfen resepsiyondan yeni paket tanımlatınız.<br><br>
            <em>Keyifli ve güvenli sürüşler dileriz! 🏎️💨</em>
          </div>
        </div>
        <div style="font-size: 8px; color: #64748b; margin-top: 6px;">
          * Tek tıkla Türkiye formatlı (905xx) numaralara otomatik yönlendirme açılır.
        </div>
      </div>

    </div>

    <!-- HATA İZOLASYONU VE DAYANIKLILIK -->
    <div class="section-title">
      <span>Teknik Güvenlik & Hata Kalkanı (ErrorBoundary & String Güvenliği)</span>
    </div>

    <div class="card-3n highlight-cyan" style="margin-bottom: 0;">
      <div class="card-body-3n">
        <ul>
          <li><strong>ErrorBoundary Katmanı:</strong> Sistemde oluşabilecek JS çalışma zamanı istisnalarında tüm uygulamanın beyaza düşmesi önlenir; kullanıcıya tek tıkla <em>"Yeniden Dene"</em> imkanı verilir.</li>
          <li><strong>Tip ve Karakter Güvenliği:</strong> Yarış numarası (örn: 46) veya telefon gibi sayısal değerler arama kutusuna yazıldığında <code>toLowerCase()</code> fonksiyonunun patlamaması için tam string sanitizasyonu uygulanır.</li>
          <li><strong>Otomatik Rol Güvencesi:</strong> Supabase veritabanında rol kolonu boş veya null kalsa dahi ana yönetici (admin) hesabı hiçbir koşulda gözlemciye düşürülmez.</li>
        </ul>
      </div>
    </div>

    <div class="doc-footer">
      <span>Uşak Yarış Pisti • Yazılım Mühendisliği & Ürün Yönetimi</span>
      <span>Sayfa 3 / 3</span>
    </div>
  </div>

</body>
</html>`;

const htmlFilePath = path.join(__dirname, 'analiz_raporu.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML generated at:', htmlFilePath);

// 2. Print to PDF via Headless Chrome
const pdfOutputPath = path.join(__dirname, 'Pist_Giris_Haklari_Ve_Bakiye_Yonetimi_Analiz_Raporu.pdf');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

try {
  execFileSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--run-all-compositor-stages-before-draw',
    '--user-data-dir=C:\\Users\\erayy\\.gemini\\antigravity\\scratch\\chrome_temp',
    '--print-to-pdf=' + pdfOutputPath,
    '--no-pdf-header-footer',
    htmlFilePath
  ]);
  console.log('PDF successfully created at:', pdfOutputPath);
} catch (err) {
  console.error('Chrome PDF Error:', err.message);
}
