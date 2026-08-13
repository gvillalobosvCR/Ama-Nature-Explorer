'use client';

import { useGuide, Point } from '@/context/GuideContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function SpeciesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang, offlineData, discoverPoint, isOnline } = useGuide();
  const [point, setPoint] = useState<Point | null>(null);
  const [activeTab, setActiveTab] = useState<'habitat' | 'diet' | 'sabias' | 'conservation'>('habitat');
  const [showDiscoveryAlert, setShowDiscoveryAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  const idParam = params.id as string;
  const pointNumber = parseInt(idParam, 10);

  useEffect(() => {
    if (!offlineData) {
      // If offline data is loading, wait
      return;
    }

    const foundPoint = offlineData.points.find((p) => p.number === pointNumber);
    if (!foundPoint) {
      setLoading(false);
      return;
    }

    setPoint(foundPoint);
    setLoading(false);

    // Trigger discovery logic
    const { isNew } = discoverPoint(foundPoint.number);
    if (isNew) {
      // Trigger confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24', '#ffffff'],
      });

      // Show alert overlay
      setShowDiscoveryAlert(true);
      const timer = setTimeout(() => {
        setShowDiscoveryAlert(false);
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [offlineData, pointNumber, discoverPoint]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-emerald-950 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="mt-4 text-emerald-300 text-sm">Buscando especie...</p>
      </div>
    );
  }

  if (!point) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-emerald-950 p-6 text-center">
        <span className="text-5xl">🧭</span>
        <h2 className="text-white font-black text-lg mt-4">
          {lang === 'es' ? 'Rótulo no encontrado' : 'Sign Not Found'}
        </h2>
        <p className="text-emerald-400 text-xs mt-2 max-w-xs leading-relaxed">
          {lang === 'es'
            ? `El punto #${pointNumber} no está registrado en esta versión de la guía.`
            : `Point #${pointNumber} is not registered in this version of the guide.`}
        </p>
        <button
          onClick={() => router.push('/explore')}
          className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-lg"
        >
          {lang === 'es' ? 'VOLVER A EXPLORAR' : 'BACK TO EXPLORE'}
        </button>
      </div>
    );
  }

  // Get active category icon
  const category = offlineData?.categories.find((c) => c.id === point.category_id);

  // Dynamic Tabs filtering (only show tabs if there is content)
  const tabsList: { id: typeof activeTab; icon: string; title: string }[] = [];
  
  if (lang === 'es' ? point.habitat_es : point.habitat_en) {
    tabsList.push({ id: 'habitat', icon: '🌎', title: lang === 'es' ? 'Hábitat' : 'Habitat' });
  }
  if (lang === 'es' ? point.diet_es : point.diet_en) {
    tabsList.push({ id: 'diet', icon: '🍃', title: lang === 'es' ? 'Alimentación' : 'Diet' });
  }
  if (lang === 'es' ? point.sabias_que_es : point.sabias_que_en) {
    tabsList.push({ id: 'sabias', icon: '👀', title: lang === 'es' ? '¿Sabías que?' : 'Did you know?' });
  }
  if (lang === 'es' ? point.conservation_es : point.conservation_en) {
    tabsList.push({ id: 'conservation', icon: '🌿', title: lang === 'es' ? 'Conservación' : 'Conservation' });
  }

  return (
    <div className="flex-1 flex flex-col justify-between bg-emerald-950 min-h-screen text-slate-100 pb-20 relative">
      
      {/* Discovery Success Overlay Alert */}
      {showDiscoveryAlert && (
        <div className="fixed inset-x-4 top-20 max-w-sm mx-auto bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-4 rounded-2xl shadow-2xl border border-emerald-400/40 z-50 flex items-center gap-4 animate-bounce-slow">
          <div className="text-3xl">🎉</div>
          <div>
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              {lang === 'es' ? '¡Nuevo Descubrimiento!' : 'New Discovery!'}
            </h4>
            <p className="text-emerald-100 font-bold text-sm">
              {lang === 'es' ? `Encontraste: ${point.name_es}` : `You found: ${point.name_en}`}
            </p>
          </div>
        </div>
      )}

      {/* Hero Header Photo Section */}
      <div className="relative h-72 w-full bg-emerald-900 overflow-hidden flex-shrink-0">
        <img
          src={point.main_image_url || '/icon.svg'}
          alt={lang === 'es' ? point.name_es : point.name_en}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-black/40"></div>

        {/* Back navigation button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 hover:text-white w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-md transition-all active:scale-90 cursor-pointer text-xl"
        >
          ‹
        </button>

        {/* Category & Number badge */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-emerald-950/80 border border-emerald-700/40 text-emerald-300 font-black text-[10px] uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
            <span>{category?.icon || '🌿'}</span>
            <span>{category ? (lang === 'es' ? category.name_es : category.name_en) : 'Especie'}</span>
          </span>
          <span className="bg-emerald-600 border border-emerald-400/20 text-white font-black text-[10px] px-3 py-1.5 rounded-xl shadow-lg">
            #{point.number}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 flex flex-col p-5 gap-5">
        
        {/* Title Block */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            {lang === 'es' ? point.name_es : point.name_en}
          </h1>
          {lang === 'es' && point.name_en && (
            <h2 className="text-xs text-emerald-400/80 font-bold uppercase mt-0.5">
              {point.name_en}
            </h2>
          )}
          {lang === 'en' && point.name_es && (
            <h2 className="text-xs text-emerald-400/80 font-bold uppercase mt-0.5">
              {point.name_es}
            </h2>
          )}
          {point.scientific_name && (
            <p className="text-sm italic text-emerald-300 font-mono mt-1">
              {point.scientific_name}
            </p>
          )}
        </div>

        {/* Overview Description (Not a wall of text) */}
        <div className="bg-emerald-900/25 border border-emerald-800/10 rounded-2xl p-4 shadow-sm backdrop-blur-xs">
          <p className="text-xs leading-relaxed text-emerald-100/90 font-medium">
            {lang === 'es' ? point.description_es : point.description_en}
          </p>
        </div>

        {/* Tabs Controls */}
        {tabsList.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide border-b border-emerald-900/60">
              {tabsList.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-emerald-400 text-white font-extrabold'
                      : 'border-transparent text-emerald-500 hover:text-emerald-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.title}</span>
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="bg-emerald-900/35 border border-emerald-800/20 rounded-2xl p-4 shadow-inner min-h-24 animate-fade-in">
              {activeTab === 'habitat' && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-1">🌎 {lang === 'es' ? 'Hábitat Natural' : 'Natural Habitat'}</h4>
                  <p className="text-xs leading-relaxed text-emerald-100">
                    {lang === 'es' ? point.habitat_es : point.habitat_en}
                  </p>
                </div>
              )}
              {activeTab === 'diet' && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-1">🍃 {lang === 'es' ? 'Alimentación / Dieta' : 'Diet & Nutrition'}</h4>
                  <p className="text-xs leading-relaxed text-emerald-100">
                    {lang === 'es' ? point.diet_es : point.diet_en}
                  </p>
                </div>
              )}
              {activeTab === 'sabias' && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-1">👀 {lang === 'es' ? '¿Sabías qué?' : 'Did you know?'}</h4>
                  <p className="text-xs leading-relaxed text-emerald-100 font-medium italic">
                    "{lang === 'es' ? point.sabias_que_es : point.sabias_que_en}"
                  </p>
                </div>
              )}
              {activeTab === 'conservation' && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-1">🌿 {lang === 'es' ? 'Estado de Conservación' : 'Conservation Status'}</h4>
                  <p className="text-xs leading-relaxed text-emerald-100">
                    {lang === 'es' ? point.conservation_es : point.conservation_en}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Future Proofing: Audio Player & AR elements */}
        <div className="flex flex-col gap-3 mt-2 border-t border-emerald-900/40 pt-4">
          
          {/* Audio section layout */}
          {(point.audio_es_url || point.audio_en_url) ? (
            <div className="bg-emerald-900/20 border border-emerald-800/10 rounded-2xl p-3 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔊</span>
                <div>
                  <h4 className="text-[10px] uppercase tracking-wide text-emerald-300 font-bold">
                    {lang === 'es' ? 'Audio Guía Disponible' : 'Audio Guide Available'}
                  </h4>
                  <p className="text-[9px] text-emerald-500">
                    {lang === 'es' ? 'Escucha la narración educativa' : 'Listen to the educational narration'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => alert(lang === 'es' ? 'Reproduciendo audio...' : 'Playing audio...')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-lg cursor-pointer border border-emerald-400/25 transition-all shadow-md active:scale-95"
              >
                {lang === 'es' ? 'ESCUCHAR' : 'LISTEN'}
              </button>
            </div>
          ) : (
            // Prepared for future notice if we want to show it, or keep it hidden.
            // Let's keep a silent future preparation block or not show it.
            null
          )}

          {/* AR View section layout */}
          {point.ar_enabled ? (
            <button
              onClick={() => alert(lang === 'es' ? 'Visualizando modelo 3D en Realidad Aumentada...' : 'Viewing 3D model in Augmented Reality...')}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-amber-400/30 transition-all shadow-lg shadow-amber-950/45 cursor-pointer uppercase active:scale-98 animate-pulse-slow"
            >
              <span>🕶️</span>
              <span>{lang === 'es' ? 'Ver en Realidad Aumentada' : 'View in Augmented Reality'}</span>
            </button>
          ) : (
            null
          )}

        </div>

      </div>

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
          className="flex flex-col items-center justify-center w-1/3 h-full text-emerald-700 hover:text-emerald-500 transition-all font-black text-[10px]"
        >
          <span className="text-lg">🗺️</span>
          <span className="mt-0.5">{lang === 'es' ? 'Mapa' : 'Map'}</span>
        </Link>
      </div>

    </div>
  );
}
