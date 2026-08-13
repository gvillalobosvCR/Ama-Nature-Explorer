'use client';

import { useGuide } from '@/context/GuideContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function WelcomePage() {
  const { lang, changeLanguage, offlineData } = useGuide();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Check if already downloaded to redirect
  useEffect(() => {
    const isDownloaded = localStorage.getItem('ama_guide_downloaded') === 'true';
    if (isDownloaded && offlineData) {
      router.replace('/explore');
    } else {
      setLoading(false);
    }
  }, [offlineData, router]);

  const selectLanguage = (selectedLang: 'es' | 'en') => {
    changeLanguage(selectedLang);
    router.push('/prepare');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-emerald-950 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
        <p className="mt-4 text-emerald-300 text-sm">Cargando aventura...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between relative p-6 overflow-hidden min-h-screen">
      {/* Background Image with elegant overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop"
          alt="Arenal Mundo Aventura Canopy"
          className="w-full h-full object-cover scale-105 animate-pulse-slow"
          style={{ animationDuration: '20s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/80 to-emerald-900/40"></div>
      </div>

      {/* Top Section - Brand */}
      <div className="relative z-10 text-center pt-8">
        <div className="w-20 h-20 mx-auto bg-emerald-800/80 rounded-full flex items-center justify-center border border-emerald-500/30 backdrop-blur-md mb-4 shadow-lg animate-bounce-slow">
          <svg className="w-12 h-12 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m1.414 7.071c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l3.5-2 3.5 2-.813-5.096" />
          </svg>
        </div>
        <h2 className="text-xs uppercase tracking-widest text-emerald-300 font-medium">Arenal Mundo Aventura</h2>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">NATURE EXPLORER</h1>
      </div>

      {/* Middle Section - Slogan */}
      <div className="relative z-10 text-center my-auto py-12 px-2">
        <h3 className="text-4xl font-extrabold text-white tracking-tight leading-tight uppercase font-sans">
          {lang === 'es' ? 'Descubre la' : 'Explore the'}
          <span className="block text-emerald-400 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
            {lang === 'es' ? 'Naturaleza' : 'Wild'}
          </span>
        </h3>
        <p className="mt-4 text-emerald-100/90 text-sm max-w-xs mx-auto">
          {lang === 'es' 
            ? 'Cada paso en el sendero es un nuevo descubrimiento ecológico.' 
            : 'Every step on the trail is a new ecological discovery.'}
        </p>
      </div>

      {/* Bottom Section - Language Selector */}
      <div className="relative z-10 w-full pb-8 flex flex-col gap-4">
        <div className="bg-emerald-900/60 border border-emerald-800/40 rounded-2xl p-4 backdrop-blur-md shadow-xl text-center">
          <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
            Selecciona tu idioma / Select Language
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => selectLanguage('es')}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 border border-emerald-400/20 cursor-pointer"
            >
              <span className="text-xl">🇨🇷</span>
              <span>ESPAÑOL</span>
            </button>
            <button
              onClick={() => selectLanguage('en')}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all active:scale-95 border border-emerald-400/20 cursor-pointer"
            >
              <span className="text-xl">🇺🇸</span>
              <span>ENGLISH</span>
            </button>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-emerald-400/70">
          La Fortuna, San Carlos, Costa Rica
        </p>
      </div>
    </div>
  );
}
