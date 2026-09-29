import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ArrowDown, CheckCircle2 } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const PULL_THRESHOLD = 70; // Tetiklenme eşiği (piksel)
  const MAX_PULL = 90; // Maksimum çekme mesafesi

  useEffect(() => {
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e) => {
      // Sadece sayfa en tepedeyken çekmeye izin ver
      if (window.scrollY <= 0 && !isRefreshing) {
        startY = e.touches[0].clientY;
        startYRef.current = startY;
        isPullingRef.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPullingRef.current || isRefreshing) return;

      currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      if (diff > 0 && window.scrollY <= 0) {
        // Dirençli çekme efekti (logaritmik his)
        const distance = Math.min(diff * 0.45, MAX_PULL);
        setPullDistance(distance);

        // Tarayıcının varsayılan aşağı çekip beyaz ekran göstermesini önle
        if (distance > 10 && e.cancelable) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
        isPullingRef.current = false;
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current || isRefreshing) return;
      isPullingRef.current = false;

      if (pullDistance >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        setPullDistance(50); // Spinner için sabit yükseklik

        try {
          if (navigator.vibrate) navigator.vibrate(30);
          await onRefresh();
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setIsRefreshing(false);
            setPullDistance(0);
          }, 450);
        } catch (err) {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  const readyToRefresh = pullDistance >= PULL_THRESHOLD;

  return (
    <div className="relative">
      {/* Aşağı Çekme & Yenileme Göstergesi */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-200"
        style={{
          transform: `translateY(${pullDistance > 0 ? pullDistance - 15 : -80}px)`,
          opacity: pullDistance > 10 ? 1 : 0
        }}
      >
        <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-900/95 border-2 border-red-500/80 text-white shadow-2xl backdrop-blur-md">
          {isRefreshing ? (
            showSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-emerald-400">Veriler Güncellendi</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />
                <span className="text-xs font-black text-white">Veritabanından Yenileniyor...</span>
              </>
            )
          ) : (
            <>
              <ArrowDown 
                className={`w-4 h-4 text-red-500 transition-transform duration-200 ${
                  readyToRefresh ? 'rotate-180 text-emerald-400' : ''
                }`} 
              />
              <span className="text-xs font-bold text-gray-200">
                {readyToRefresh ? 'Yenilemek için Bırakın' : 'Yenilemek için Aşağı Çekin'}
              </span>
            </>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
