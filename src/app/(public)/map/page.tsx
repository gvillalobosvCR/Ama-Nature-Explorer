'use client';

import { useGuide, Point } from '@/context/GuideContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function OfflineMapPage() {
  const { lang, isOnline, offlineData, discoveredPoints, changeLanguage } = useGuide();
  const router = useRouter();

  // Selected Point for floating preview drawer
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

  // Zoom and Pan States
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStartDist = useRef(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Auto redirect if not downloaded yet
  useEffect(() => {
    const isDownloaded = localStorage.getItem('ama_guide_downloaded') === 'true';
    if (!isDownloaded && !offlineData) {
      router.replace('/prepare');
    }
  }, [offlineData, router]);

  if (!offlineData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-emerald-950 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="mt-4 text-emerald-300 text-sm">Cargando mapa offline...</p>
      </div>
    );
  }

  const { points, settings, categories } = offlineData;
  const mapImageUrl = settings?.map_image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop';

  // 1. Mouse Dragging / Panning Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (scale === 1) return; // Only pan when zoomed
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Bounds checking based on container size
    const bounds = 150 * scale;
    setPosition({
      x: Math.max(-bounds, Math.min(bounds, newX)),
      y: Math.max(-bounds, Math.min(bounds, newY)),
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // 2. Touch Dragging & Pinch-to-Zoom Handlers (Mobile-First)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single finger pan
      if (scale === 1) return;
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    } else if (e.touches.length === 2) {
      // Two finger pinch zoom start
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      // Pan
      const newX = e.touches[0].clientX - dragStart.current.x;
      const newY = e.touches[0].clientY - dragStart.current.y;
      const bounds = 150 * scale;
      setPosition({
        x: Math.max(-bounds, Math.min(bounds, newX)),
        y: Math.max(-bounds, Math.min(bounds, newY)),
      });
    } else if (e.touches.length === 2) {
      // Pinch zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const factor = dist / touchStartDist.current;
      const newScale = Math.max(1, Math.min(4, scale * factor));
      setScale(newScale);
      touchStartDist.current = dist; // update reference
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom Button controls
  const zoomIn = () => {
    setScale((prev) => Math.min(4, prev + 0.5));
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(1, prev - 0.5);
      if (next === 1) setPosition({ x: 0, y: 0 }); // Reset positions if zoomed back to 100%
      return next;
    });
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setSelectedPoint(null);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-emerald-950 min-h-screen text-slate-100 pb-20 relative overflow-hidden">
      
      {/* Header section */}
      <div className="p-4 relative z-20">
        <div className="flex justify-between items-center bg-emerald-900/40 p-3 rounded-2xl border border-emerald-800/20 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <div>
              <h2 className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">{lang === 'es' ? 'Mapa de Senderos' : 'Trail Map'}</h2>
              <h1 className="text-sm font-black text-white">{lang === 'es' ? 'EXPLORA EL PARQUE' : 'EXPLORE THE PARK'}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isOnline && (
              <span className="bg-emerald-800/80 border border-emerald-500/30 text-emerald-300 font-black text-[9px] uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                <span>{lang === 'es' ? 'Offline' : 'Offline'}</span>
              </span>
            )}
            <button
              onClick={() => changeLanguage(lang === 'es' ? 'en' : 'es')}
              className="text-[11px] font-black text-emerald-300 bg-emerald-950 border border-emerald-800/80 px-2 py-1 rounded-lg hover:bg-emerald-900 active:scale-95 transition-all cursor-pointer"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map Viewport */}
      <div
        ref={mapContainerRef}
        className="flex-1 relative w-full overflow-hidden bg-emerald-900/10 cursor-grab active:cursor-grabbing flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* The Illustrated Map wrapper */}
        <div
          className="relative w-full aspect-square max-w-sm transition-transform duration-75 ease-out select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Map Image */}
          <img
            src={mapImageUrl}
            alt="Illustrated Map Arenal Mundo Aventura"
            className="w-full h-full object-contain pointer-events-none rounded-2xl border border-emerald-800/30 shadow-2xl"
            draggable="false"
          />

          {/* Interactive Plot Pins */}
          {points.map((pt) => {
            const discovered = discoveredPoints.includes(pt.number);
            const category = categories.find((c) => c.id === pt.category_id);
            const isSelected = selectedPoint?.id === pt.id;

            return (
              <button
                key={pt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPoint(pt);
                }}
                style={{
                  left: `${pt.map_x}%`,
                  top: `${pt.map_y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg transition-all border cursor-pointer ${
                  discovered
                    ? isSelected
                      ? 'bg-amber-400 border-white text-emerald-950 scale-125 z-10'
                      : 'bg-emerald-500 border-white text-white'
                    : isSelected
                    ? 'bg-amber-400 border-white text-emerald-950 scale-125 z-10'
                    : 'bg-slate-700 border-slate-500 text-slate-300'
                }`}
              >
                {pt.number}
              </button>
            );
          })}
        </div>

        {/* Floating Zoom & Pan Controls */}
        <div className="absolute right-4 bottom-6 flex flex-col gap-2 z-20">
          <button
            onClick={zoomIn}
            className="w-10 h-10 rounded-xl bg-emerald-900/90 border border-emerald-700/50 flex items-center justify-center font-black text-emerald-300 hover:text-white shadow-lg backdrop-blur-sm text-lg active:scale-90 cursor-pointer"
            title={lang === 'es' ? 'Acercar' : 'Zoom In'}
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="w-10 h-10 rounded-xl bg-emerald-900/90 border border-emerald-700/50 flex items-center justify-center font-black text-emerald-300 hover:text-white shadow-lg backdrop-blur-sm text-lg active:scale-90 cursor-pointer"
            title={lang === 'es' ? 'Alejar' : 'Zoom Out'}
          >
            -
          </button>
          <button
            onClick={resetZoom}
            className="w-10 h-10 rounded-xl bg-emerald-900/90 border border-emerald-700/50 flex items-center justify-center text-xs font-bold text-emerald-300 hover:text-white shadow-lg backdrop-blur-sm active:scale-90 cursor-pointer"
            title={lang === 'es' ? 'Restablecer Vista' : 'Reset View'}
          >
            ⟲
          </button>
        </div>

        {/* Small Instruction overlay */}
        <div className="absolute left-4 bottom-6 bg-emerald-950/80 border border-emerald-800/40 rounded-xl px-3 py-1.5 text-[9px] text-emerald-300 font-bold backdrop-blur-xs shadow-md select-none pointer-events-none">
          {lang === 'es' ? '⚡ Arrastra y pellizca para zoom' : '⚡ Drag & pinch to zoom'}
        </div>

      </div>

      {/* Floating Preview Drawer for selected pin */}
      {selectedPoint && (
        <div className="absolute inset-x-4 bottom-20 z-40 bg-emerald-900/95 border border-emerald-700/40 rounded-2xl p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md animate-slide-up relative">
          
          {/* Close preview button */}
          <button
            onClick={() => setSelectedPoint(null)}
            className="absolute top-2 right-2 text-emerald-500 hover:text-white font-bold text-xs"
          >
            ✕
          </button>

          {/* Photo */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-emerald-950 flex-shrink-0 relative">
            <img
              src={selectedPoint.main_image_url || '/icon.svg'}
              alt={lang === 'es' ? selectedPoint.name_es : selectedPoint.name_en}
              className={`w-full h-full object-cover ${
                !discoveredPoints.includes(selectedPoint.number) ? 'grayscale brightness-50' : ''
              }`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5">
              <span className="bg-emerald-950 px-1.5 py-0.5 rounded text-[8px] font-black text-emerald-400">
                #{selectedPoint.number}
              </span>
              <h4 className="text-xs font-black text-white truncate">
                {discoveredPoints.includes(selectedPoint.number)
                  ? (lang === 'es' ? selectedPoint.name_es : selectedPoint.name_en)
                  : (lang === 'es' ? 'Especie Oculta' : 'Hidden Species')}
              </h4>
            </div>
            
            <p className="text-[9px] italic text-emerald-400 truncate mt-0.5">
              {discoveredPoints.includes(selectedPoint.number)
                ? selectedPoint.scientific_name
                : '???'}
            </p>

            <Link
              href={`/explore/${selectedPoint.number}`}
              className="inline-block mt-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-[9px] px-3 py-1 rounded-md transition-all shadow-md"
            >
              {lang === 'es' ? 'VER DETALLE ➔' : 'VIEW DETAILS ➔'}
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-emerald-950 border-t border-emerald-900 flex justify-around items-center h-16 px-4 z-30 shadow-2xl">
        <Link
          href="/explore"
          className="flex flex-col items-center justify-center w-1/3 h-full text-emerald-700 hover:text-emerald-500 transition-all font-black text-[10px]"
        >
          <span className="text-lg">🌿</span>
          <span className="mt-0.5">{lang === 'es' ? 'Explorar' : 'Explore'}</span>
        </Link>
        <Link
          href="/map"
          className="flex flex-col items-center justify-center w-1/3 h-full text-emerald-400 transition-all font-black text-[10px]"
        >
          <span className="text-lg">🗺️</span>
          <span className="mt-0.5">{lang === 'es' ? 'Mapa' : 'Map'}</span>
        </Link>
      </div>

    </div>
  );
}
