'use client';

import { useGuide, Point } from '@/context/GuideContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ExploreDashboard() {
  const {
    lang,
    isOnline,
    offlineData,
    discoveredPoints,
    updateAvailable,
    startDownload,
    changeLanguage,
    resetProgress,
  } = useGuide();

  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [numInput, setNumInput] = useState('');
  const [numError, setNumError] = useState('');

  // Wait for hydration before deciding to redirect - avoids race with synchronous localStorage init
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const isDownloaded = localStorage.getItem('ama_guide_downloaded') === 'true';
    if (!isDownloaded && !offlineData) {
      router.replace('/prepare');
    }
  }, [hydrated, offlineData, router]);

  // Service Worker offline fallback: if SW served /explore shell for /explore/N, redirect properly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    const match = path.match(/^\/explore\/(\d+)$/);
    if (match) {
      router.replace(`/explore/${match[1]}`);
    }
  }, [router]);

  if (!offlineData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-emerald-950 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="mt-4 text-emerald-300 text-sm">Cargando guía offline...</p>
      </div>
    );
  }

  const { categories, points, settings } = offlineData;

  // Filter points based on category selection & search input
  const filteredPoints = points.filter((point) => {
    const matchesCategory =
      selectedCategory === 'all' || point.category_id === selectedCategory;

    const matchesSearch =
      point.name_es.toLowerCase().includes(searchQuery.toLowerCase()) ||
      point.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (point.scientific_name &&
        point.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Calculate stats
  const totalPoints = points.length;
  const discoveredCount = points.filter((p) =>
    discoveredPoints.includes(p.number)
  ).length;
  const progressPercent = totalPoints > 0 ? Math.round((discoveredCount / totalPoints) * 100) : 0;
  const isAdventureCompleted = totalPoints > 0 && discoveredCount === totalPoints;

  // Handle manual number input search
  const handleDiscoverNumber = (e: React.FormEvent) => {
    e.preventDefault();
    setNumError('');
    const num = parseInt(numInput.trim(), 10);
    
    if (isNaN(num)) {
      setNumError(lang === 'es' ? 'Ingresa un número válido.' : 'Enter a valid number.');
      return;
    }

    const pointExists = points.find((p) => p.number === num);
    if (pointExists) {
      router.push(`/explore/${num}`);
    } else {
      setNumError(
        lang === 'es'
          ? `Rótulo #${num} no encontrado en el mapa.`
          : `Sign #${num} not found on the map.`
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-emerald-950 min-h-screen text-slate-100 pb-20 relative">
      
      {/* Top Banner: Online Update availability */}
      {updateAvailable && isOnline && (
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold px-4 py-2.5 flex justify-between items-center shadow-md animate-slide-down relative z-20">
          <span>
            {lang === 'es' ? '¡Hay actualizaciones de contenido!' : 'New content updates available!'}
          </span>
          <button
            onClick={() => router.push('/prepare')}
            className="bg-emerald-950/80 hover:bg-emerald-950 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer border border-emerald-500/20"
          >
            {lang === 'es' ? 'ACTUALIZAR' : 'UPDATE'}
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center bg-emerald-900/40 p-3 rounded-2xl border border-emerald-800/20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <h2 className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Arenal Mundo Aventura</h2>
              <h1 className="text-sm font-black text-white">NATURE EXPLORER</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection indicator */}
            {!isOnline && (
              <span className="bg-emerald-800/80 border border-emerald-500/30 text-emerald-300 font-black text-[9px] uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                <span>{lang === 'es' ? 'Offline' : 'Offline'}</span>
              </span>
            )}

            {/* Language toggle */}
            <button
              onClick={() => changeLanguage(lang === 'es' ? 'en' : 'es')}
              className="text-[11px] font-black text-emerald-300 bg-emerald-950 border border-emerald-800/80 px-2 py-1 rounded-lg hover:bg-emerald-900 active:scale-95 transition-all cursor-pointer"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>

        {/* Adventure Completed Celebration */}
        {isAdventureCompleted && (
          <div className="bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 p-5 rounded-2xl text-center shadow-xl border border-amber-400/40 animate-scale-up">
            <span className="text-4xl">🏆</span>
            <h2 className="text-white font-black text-lg mt-2">
              {lang === 'es' ? '¡Aventura completada!' : 'Adventure Completed!'}
            </h2>
            <p className="text-amber-100 text-xs mt-1 leading-relaxed">
              {lang === 'es'
                ? `¡Felicidades! Has descubierto los ${totalPoints} puntos de interés de la biodiversidad de Arenal Mundo Aventura.`
                : `Congratulations! You have discovered all ${totalPoints} interest points of Arenal Mundo Aventura's biodiversity.`}
            </p>
            <div className="mt-4 bg-amber-950/40 py-2 rounded-xl text-xs font-bold text-white max-w-xs mx-auto">
              {discoveredCount} / {totalPoints} {lang === 'es' ? 'Especies encontradas' : 'Species discovered'} (100%)
            </div>
          </div>
        )}

        {/* Progress Tracker Widget */}
        {!isAdventureCompleted && (
          <div className="bg-emerald-900/50 border border-emerald-800/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-emerald-200">
                {lang === 'es' ? 'Tu Progreso' : 'Your Progress'}
              </span>
              <span className="bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800 text-emerald-300 font-mono text-[10px]">
                {discoveredCount} / {totalPoints} {lang === 'es' ? 'descubrimientos' : 'discoveries'}
              </span>
            </div>
            
            <div className="w-full bg-emerald-950 rounded-full h-2.5 overflow-hidden mb-3 border border-emerald-800/30">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Micro progress indicator grid */}
            <div className="flex flex-wrap gap-1.5 justify-center max-h-16 overflow-y-auto pt-1">
              {points.map((pt) => {
                const discovered = discoveredPoints.includes(pt.number);
                const category = categories.find((c) => c.id === pt.category_id);
                return (
                  <Link
                    key={pt.id}
                    href={`/explore/${pt.number}`}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all border ${
                      discovered
                        ? 'bg-emerald-800/80 border-emerald-400 text-white shadow-sm'
                        : 'bg-emerald-950/40 border-emerald-900/80 text-emerald-700/60'
                    }`}
                    title={lang === 'es' ? pt.name_es : pt.name_en}
                  >
                    {discovered ? (category?.icon || '🌿') : '?'}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Numerical Backup / Code Search Form */}
        <form
          onSubmit={handleDiscoverNumber}
          className="bg-emerald-900/30 border border-emerald-800/20 rounded-2xl p-4 shadow-md flex flex-col gap-3"
        >
          <div className="text-center">
            <h3 className="text-xs font-bold text-emerald-200 uppercase tracking-wide">
              {lang === 'es' ? '¿Qué encontraste en el sendero?' : 'What did you find on the trail?'}
            </h3>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">
              {lang === 'es' ? 'Ingresa el número de tu rótulo físico' : 'Enter the number on your physical sign'}
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="#12"
              value={numInput}
              onChange={(e) => setNumInput(e.target.value)}
              className="bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-2.5 w-24 text-center font-bold text-emerald-300 placeholder-emerald-800/60 focus:outline-none focus:border-emerald-500 text-lg shadow-inner"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-extrabold px-6 rounded-xl shadow-md border border-emerald-400/20 transition-all cursor-pointer uppercase"
            >
              {lang === 'es' ? 'Descubrir' : 'Discover'}
            </button>
          </div>
          {numError && (
            <p className="text-red-400 text-[10px] text-center font-semibold animate-pulse">
              {numError}
            </p>
          )}
        </form>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder={lang === 'es' ? 'Buscar especie, tucán, rana...' : 'Search species, toucan, frog...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-emerald-950 border border-emerald-800/80 rounded-xl py-3 pl-10 pr-4 text-xs placeholder-emerald-700 text-emerald-100 focus:outline-none focus:border-emerald-600 shadow-inner"
          />
          <span className="absolute left-3 top-3.5 text-emerald-700 text-sm pointer-events-none">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-emerald-500 font-bold text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Horizontal Category Selectors */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                : 'bg-emerald-950 border-emerald-900 text-emerald-400'
            }`}
          >
            {lang === 'es' ? '🌿 Todos' : '🌿 All'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                  : 'bg-emerald-950 border-emerald-900 text-emerald-400'
              }`}
            >
              <span>{cat.icon}</span>{' '}
              <span>{lang === 'es' ? cat.name_es : cat.name_en}</span>
            </button>
          ))}
        </div>

        {/* Species Cards Grid */}
        <div className="flex flex-col gap-4 mt-2">
          {filteredPoints.length === 0 ? (
            <div className="text-center py-10 bg-emerald-900/20 border border-dashed border-emerald-800/40 rounded-2xl">
              <span className="text-2xl">🕵️</span>
              <p className="text-emerald-400 text-xs mt-2 font-medium">
                {lang === 'es' ? 'No se encontraron especies.' : 'No species found.'}
              </p>
            </div>
          ) : (
            filteredPoints.map((point) => {
              const discovered = discoveredPoints.includes(point.number);
              const category = categories.find((c) => c.id === point.category_id);
              
              return (
                <Link
                  key={point.id}
                  href={`/explore/${point.number}`}
                  className="bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-800/20 rounded-2xl overflow-hidden shadow-lg flex transition-all active:scale-[0.98] duration-200"
                >
                  {/* Card Thumbnail */}
                  <div className="w-28 h-28 relative bg-emerald-950 flex-shrink-0">
                    <img
                      src={point.main_image_url || '/icon.svg'}
                      alt={lang === 'es' ? point.name_es : point.name_en}
                      className={`w-full h-full object-cover transition-all ${
                        !discovered ? 'grayscale brightness-50 contrast-75' : ''
                      }`}
                      loading="lazy"
                    />
                    
                    {/* Category pill */}
                    <div className="absolute top-2 left-2 bg-emerald-950/80 border border-emerald-700/40 w-6 h-6 rounded-full flex items-center justify-center text-xs backdrop-blur-sm shadow-md">
                      {category?.icon || '🌿'}
                    </div>

                    {/* Point number indicator */}
                    <div className="absolute bottom-2 left-2 bg-emerald-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md border border-emerald-400/20">
                      #{point.number}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className={`font-black text-sm tracking-tight leading-snug ${
                          discovered ? 'text-white' : 'text-emerald-500/70'
                        }`}>
                          {discovered 
                            ? (lang === 'es' ? point.name_es : point.name_en)
                            : (lang === 'es' ? 'Especie Oculta' : 'Hidden Species')
                          }
                        </h4>
                        
                        {/* Status Check badge */}
                        {discovered && (
                          <span className="text-emerald-400 text-xs flex-shrink-0">✓</span>
                        )}
                      </div>
                      
                      <p className="text-[10px] italic text-emerald-400/80 mt-0.5">
                        {discovered ? point.scientific_name : '??'}
                      </p>
                      
                      {discovered ? (
                        <p className="text-[10px] text-emerald-200/70 line-clamp-2 mt-1 leading-relaxed">
                          {lang === 'es' ? point.description_es : point.description_en}
                        </p>
                      ) : (
                        <p className="text-[10px] text-emerald-600/70 italic mt-1.5">
                          {lang === 'es' 
                            ? 'Escanea el código QR o ingresa el número para desbloquear la ficha.' 
                            : 'Scan the QR code or enter the number to unlock this card.'}
                        </p>
                      )}
                    </div>

                    {/* Footer badge */}
                    <div className="flex justify-end pt-1">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        discovered 
                          ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
                          : 'bg-emerald-950/20 border-emerald-950/60 text-emerald-800'
                      }`}>
                        {discovered 
                          ? (lang === 'es' ? 'Descubierto' : 'Discovered') 
                          : (lang === 'es' ? 'Por Descubrir' : 'Undiscovered')}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
        
        {/* Reset progress option at bottom (simple utility) */}
        <div className="text-center pt-8 pb-4">
          <button
            onClick={() => {
              if (confirm(lang === 'es' ? '¿Seguro que deseas restablecer tu progreso de descubrimientos?' : 'Are you sure you want to reset your discovery progress?')) {
                resetProgress();
              }
            }}
            className="text-[10px] text-emerald-700 hover:text-emerald-500 font-bold underline cursor-pointer"
          >
            {lang === 'es' ? 'Restablecer mi progreso' : 'Reset my progress'}
          </button>
        </div>

      </div>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-emerald-950 border-t border-emerald-900 flex justify-around items-center h-16 px-4 z-30 shadow-2xl">
        <Link
          href="/explore"
          className="flex flex-col items-center justify-center w-1/3 h-full text-emerald-400 transition-all font-black text-[10px]"
        >
          <span className="text-lg">🌿</span>
          <span className="mt-0.5">{lang === 'es' ? 'Explorar' : 'Explore'}</span>
        </Link>
        <Link
          href="/map"
          className="flex flex-col items-center justify-center w-1/3 h-full text-emerald-700 hover:text-emerald-500 transition-all font-black text-[10px]"
        >
          <span className="text-lg">🗺️</span>
          <span className="mt-0.5">{lang === 'es' ? 'Mapa' : 'Map'}</span>
        </Link>
      </div>

    </div>
  );
}
