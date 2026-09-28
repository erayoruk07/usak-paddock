import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  X, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  ScanLine, 
  Bike
} from 'lucide-react';

export default function QRScannerModal({ bikes, onBikeFound, onClose }) {
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDemoBike, setSelectedDemoBike] = useState(bikes[0]?.id || '');
  const html5QrCodeRef = useRef(null);

  // Sesli Bip Çalma (Web Audio API)
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.log('Audio not supported or blocked', e);
    }
  };

  const handleScanSuccess = (decodedText) => {
    playBeep();
    setScanResult(decodedText);

    // ID çözümleme: "USAK_TRACK_BIKE:USAK-01" veya "USAK-01"
    let bikeId = decodedText;
    if (decodedText.includes('USAK_TRACK_BIKE:')) {
      bikeId = decodedText.replace('USAK_TRACK_BIKE:', '').trim();
    }

    const matchedBike = bikes.find(b => b.id.toLowerCase() === bikeId.toLowerCase());

    if (matchedBike) {
      stopScanner();
      setTimeout(() => {
        onBikeFound(matchedBike);
      }, 500);
    } else {
      setErrorMsg(`QR kod okundu ancak bu ID ile eşleşen motor bulunamadı: "${decodedText}"`);
    }
  };

  const startScanner = async () => {
    try {
      setErrorMsg(null);
      const scanner = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await scanner.start(
        { facingMode: 'environment' }, // Arka kamera öncelikli
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (error) => {
          // scanning progress (not fatal)
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setErrorMsg('Kamera erişimi sağlanamadı. Lütfen kamera izni verildiğinden emin olun veya aşağıdaki simülasyon/dosya yükleme seçeneğini kullanın.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error('Stop scanner error', e);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  // Dosyadan / Galeriden QR Okuma
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-file-reader-dummy');
      const result = await html5QrCode.scanFile(file, true);
      handleScanSuccess(result);
    } catch (err) {
      setErrorMsg('Yüklenen fotoğrafta geçerli bir motor karekodu tespit edilemedi.');
    }
  };

  // Test / Hızlı Simülasyon
  const handleSimulateScan = (bikeId) => {
    const selected = bikes.find(b => b.id === bikeId);
    if (selected) {
      playBeep();
      setScanResult(`USAK_TRACK_BIKE:${selected.id}`);
      setTimeout(() => {
        onBikeFound(selected);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#121620] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Başlık */}
        <div className="p-4 sm:p-5 bg-[#0E121A] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Karekod (QR) Okuyucu
              </h3>
              <p className="text-xs text-gray-400">Motora yapıştırılan etiketi kameraya gösterin</p>
            </div>
          </div>

          <button 
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kamera Alanı */}
        <div className="p-4 sm:p-6 space-y-4">
          
          <div className="relative w-full aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden bg-black border-2 border-gray-700 flex items-center justify-center shadow-inner">
            
            {/* HTML5 QR Code Container */}
            <div id="qr-reader-container" className="w-full h-full"></div>
            <div id="qr-file-reader-dummy" className="hidden"></div>

            {/* Yarış Kaskatı Nişangah / Lazer Çizgisi */}
            <div className="pointer-events-none absolute inset-4 border border-cyan-500/40 rounded-xl flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
              </div>
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400 animate-bounce"></div>
              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
              </div>
            </div>

            {/* Kamera kapalı / İzin uyarısı */}
            {!isScanning && (
              <div className="absolute inset-0 bg-gray-950/90 flex flex-col items-center justify-center p-4 text-center">
                <Camera className="w-10 h-10 text-gray-500 mb-2" />
                <p className="text-xs text-gray-400 mb-3">Kamera henüz aktif değil veya izin bekliyor</p>
                <button
                  onClick={startScanner}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow"
                >
                  Kamerayı Yeniden Başlat
                </button>
              </div>
            )}
          </div>

          {/* Hata Mesajı */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Alternatif 1: Galeriden / Fotoğraftan QR Seç */}
          <div className="flex items-center justify-center space-x-3 pt-1">
            <label className="cursor-pointer px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 text-xs font-semibold border border-gray-700 flex items-center space-x-2 transition">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Fotoğraf Yükle & Çöz</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>
          </div>

          {/* Alternatif 2: Hızlı Test & Demo Simülatörü */}
          <div className="mt-4 p-3.5 rounded-2xl bg-gray-900/70 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Hızlı Test & Simülasyon
              </span>
              <span className="text-[10px] text-gray-500">Masaüstü Testi İçin</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Telefon kameranız yanınızda değilse, garajdaki motorlardan birini seçip okutmuş gibi simüle edebilirsiniz:
            </p>
            <div className="flex space-x-2">
              <select
                value={selectedDemoBike}
                onChange={(e) => setSelectedDemoBike(e.target.value)}
                className="flex-1 bg-black/60 border border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                {bikes.map(b => (
                  <option key={b.id} value={b.id}>
                    #{b.raceNumber} - {b.brand} {b.model} ({b.owner?.fullName})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleSimulateScan(selectedDemoBike)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Simüle Et
              </button>
            </div>
          </div>

        </div>

        {/* Kapat Çubuğu */}
        <div className="p-4 bg-[#0E121A] border-t border-gray-800 text-center">
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition"
          >
            Kamerayı Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
