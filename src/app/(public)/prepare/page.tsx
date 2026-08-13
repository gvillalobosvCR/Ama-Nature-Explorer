'use client';

import { useGuide } from '@/context/GuideContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PreparePage() {
  const {
    lang,
    downloadStatus,
    downloadProgress,
    downloadDetails,
    startDownload,
    offlineData,
  } = useGuide();
  
  const router = useRouter();

  // If already completed and user visits this page, let them click start.
  // But don't auto-redirect without showing the ready state first.
  const handleStart = () => {
    router.replace('/explore');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-emerald-950 to-emerald-900 min-h-screen">
      
      {/* Header Info */}
      <div className="text-center pt-6">
        <span className="text-emerald-400 text-3xl">🌿</span>
        <h1 className="text-2xl font-extrabold text-white mt-2 tracking-tight uppercase">
          {lang === 'es' ? 'Prepárate para explorar' : 'Get Ready to Explore'}
        </h1>
        <p className="text-sm text-emerald-200/90 mt-3 leading-relaxed max-w-xs mx-auto">
          {lang === 'es'
            ? 'Dentro de los senderos del parque NO existe cobertura celular ni conexión a Internet.'
            : 'Inside the park trails there is NO cellular coverage or Internet connection.'}
        </p>
      </div>

      {/* Preparation Box / Status Area */}
      <div className="my-auto py-8">
        <div className="bg-emerald-950/70 border border-emerald-800/60 rounded-2xl p-5 backdrop-blur-md shadow-2xl relative overflow-hidden">
          
          {/* Card background glowing leaf icon */}
          <div className="absolute -right-8 -bottom-8 text-emerald-800/10 text-9xl pointer-events-none font-bold">
            🍃
          </div>

          {downloadStatus === 'idle' && (
            <div className="text-center py-4 relative z-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-800/40 border border-emerald-500/20 flex items-center justify-center text-2xl mb-4">
                📡
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                {lang === 'es' ? 'Descarga la Guía Digital' : 'Download Digital Guide'}
              </h3>
              <p className="text-emerald-300 text-xs leading-relaxed max-w-xs mx-auto mb-6">
                {lang === 'es'
                  ? 'Guarda la información de las especies, mapas y fotos en tu teléfono para navegar 100% offline.'
                  : 'Save species information, maps, and photos on your phone to navigate 100% offline.'}
              </p>
              <button
                onClick={startDownload}
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-900/40 transition-all border border-emerald-400/20 cursor-pointer"
              >
                {lang === 'es' ? 'DESCARGAR GUÍA' : 'DOWNLOAD GUIDE'}
              </button>
            </div>
          )}

          {downloadStatus === 'downloading' && (
            <div className="relative z-10">
              <h3 className="text-white font-bold text-center text-sm mb-4 animate-pulse">
                {lang === 'es' ? 'Preparando tu aventura...' : 'Preparing your adventure...'}
              </h3>

              {/* Progress Steps Checklist */}
              <div className="flex flex-col gap-3.5 mb-6 text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{downloadProgress >= 15 ? '✓' : '●'}</span>
                  <span className={downloadProgress >= 15 ? 'line-through text-emerald-400/70' : 'font-medium'}>
                    {lang === 'es' ? 'Categorías y Textos' : 'Categories and Texts'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{downloadProgress >= 40 ? '✓' : '●'}</span>
                  <span className={downloadProgress >= 40 ? 'line-through text-emerald-400/70' : downloadProgress >= 15 ? 'text-white font-medium' : ''}>
                    {lang === 'es' ? 'Mapa e Ilustraciones' : 'Map and Illustrations'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{downloadProgress >= 95 ? '✓' : '●'}</span>
                  <span className={downloadProgress >= 95 ? 'line-through text-emerald-400/70' : downloadProgress >= 40 ? 'text-white font-medium' : ''}>
                    {lang === 'es' ? 'Fotografías de Especies' : 'Species Photographs'}
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-emerald-900/60 rounded-full h-3 border border-emerald-800/40 overflow-hidden mb-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-emerald-300 font-medium">
                <span className="truncate max-w-[70%]">{downloadDetails}</span>
                <span className="bg-emerald-800/60 px-2 py-0.5 rounded-md border border-emerald-700/30 text-white font-bold font-mono">
                  {downloadProgress}%
                </span>
              </div>
            </div>
          )}

          {downloadStatus === 'completed' && (
            <div className="text-center py-4 relative z-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mb-4 animate-scale-up">
                🌿
              </div>
              <h3 className="text-white font-black text-xl mb-2">
                {lang === 'es' ? '¡Todo listo!' : 'All Set!'}
              </h3>
              <p className="text-emerald-200 text-xs leading-relaxed max-w-xs mx-auto mb-6">
                {lang === 'es'
                  ? 'Ya puedes explorar Arenal Mundo Aventura sin conexión a Internet. Puedes poner tu celular en modo avión si lo deseas.'
                  : 'You can now explore Arenal Mundo Aventura without internet. Feel free to set your phone to airplane mode.'}
              </p>
              <button
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-white font-black py-4 px-6 rounded-xl shadow-lg shadow-emerald-950/60 transition-all animate-pulse-glow cursor-pointer"
              >
                {lang === 'es' ? 'COMENZAR A EXPLORAR' : 'START EXPLORING'}
              </button>
            </div>
          )}

          {downloadStatus === 'error' && (
            <div className="text-center py-4 relative z-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center text-2xl mb-4">
                ⚠️
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                {lang === 'es' ? 'Ocurrió un error' : 'An error occurred'}
              </h3>
              <p className="text-red-200 text-xs leading-relaxed max-w-xs mx-auto mb-6">
                {downloadDetails}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={startDownload}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {lang === 'es' ? 'REINTENTAR DESCARGA' : 'RETRY DOWNLOAD'}
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-transparent hover:bg-emerald-950/40 text-emerald-300 font-semibold py-2 px-4 rounded-xl transition-all cursor-pointer text-xs"
                >
                  {lang === 'es' ? 'Volver al Inicio' : 'Back to Home'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Info */}
      <div className="pb-4 text-center">
        <p className="text-[10px] text-emerald-400/80">
          {lang === 'es' 
            ? 'Guía Offline v' + (offlineData?.version || '1.0')
            : 'Offline Guide v' + (offlineData?.version || '1.0')}
        </p>
      </div>

    </div>
  );
}
