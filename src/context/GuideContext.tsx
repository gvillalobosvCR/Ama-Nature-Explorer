'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Type Definitions
export interface Category {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  icon: string;
  active: boolean;
  sort_order: number;
}

export interface Point {
  id: string;
  number: number;
  category_id: string;
  name_es: string;
  name_en: string;
  scientific_name: string;
  description_es: string;
  description_en: string;
  habitat_es: string;
  habitat_en: string;
  diet_es: string;
  diet_en: string;
  sabias_que_es: string;
  sabias_que_en: string;
  conservation_es: string;
  conservation_en: string;
  main_image_url: string;
  gallery_urls: string[];
  active: boolean;
  map_x: number;
  map_y: number;
  ar_enabled: boolean;
  model_3d_url?: string;
  model_3d_offline_size?: string;
  audio_es_url?: string;
  audio_en_url?: string;
}

export interface AppSettings {
  welcome_title_es: string;
  welcome_title_en: string;
  welcome_subtitle_es: string;
  welcome_subtitle_en: string;
  map_image_url: string;
  [key: string]: string;
}

export interface OfflineDataPayload {
  version: number;
  categories: Category[];
  points: Point[];
  settings: AppSettings;
}

interface GuideContextType {
  lang: 'es' | 'en';
  isOnline: boolean;
  downloadStatus: 'idle' | 'downloading' | 'completed' | 'error';
  downloadProgress: number;
  downloadDetails: string;
  offlineData: OfflineDataPayload | null;
  discoveredPoints: number[];
  updateAvailable: boolean;
  latestOnlineVersion: number | null;
  changeLanguage: (newLang: 'es' | 'en') => void;
  startDownload: () => Promise<void>;
  discoverPoint: (number: number) => { isNew: boolean; point: Point | null };
  isPointDiscovered: (number: number) => boolean;
  resetProgress: () => void;
  checkUpdates: () => Promise<void>;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export function GuideProvider({ children }: { children: React.ReactNode }) {
  // 1. Language State
  const [lang, setLang] = useState<'es' | 'en'>('es');

  // 2. Connectivity State
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // 3. Download / Cache State
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadDetails, setDownloadDetails] = useState<string>('');
  const [offlineData, setOfflineData] = useState<OfflineDataPayload | null>(null);

  // 4. Discovery Progress
  const [discoveredPoints, setDiscoveredPoints] = useState<number[]>([]);

  // 5. Update Management
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [latestOnlineVersion, setLatestOnlineVersion] = useState<number | null>(null);

  // Initialize: Load settings on mount
  useEffect(() => {
    // Check browser online status
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load selected language
    const savedLang = localStorage.getItem('ama_lang');
    if (savedLang === 'es' || savedLang === 'en') {
      setLang(savedLang);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.slice(0, 2);
      if (browserLang === 'es') setLang('es');
      else setLang('en');
    }

    // Load local offline data
    const localData = localStorage.getItem('ama_offline_data');
    if (localData) {
      try {
        const parsed = JSON.parse(localData) as OfflineDataPayload;
        setOfflineData(parsed);
        setDownloadStatus('completed');
        setDownloadProgress(100);
      } catch (e) {
        console.error('Error parsing local offline data:', e);
      }
    }

    // Load discovery progress
    const savedProgress = localStorage.getItem('ama_discovered_points');
    if (savedProgress) {
      try {
        setDiscoveredPoints(JSON.parse(savedProgress) as number[]);
      } catch (e) {
        console.error('Error loading discovery progress:', e);
      }
    }

    // Clean up connectivity listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for updates when online & guide is cached
  useEffect(() => {
    if (isOnline && offlineData) {
      checkUpdates();
    }
  }, [isOnline, offlineData]);

  // Language changer
  const changeLanguage = (newLang: 'es' | 'en') => {
    setLang(newLang);
    localStorage.setItem('ama_lang', newLang);
  };

  // Check updates
  const checkUpdates = async () => {
    if (!isOnline) return;
    try {
      const res = await fetch('/api/offline-data');
      if (res.ok) {
        const onlinePayload = (await res.json()) as OfflineDataPayload;
        setLatestOnlineVersion(onlinePayload.version);
        if (offlineData && onlinePayload.version > offlineData.version) {
          setUpdateAvailable(true);
        }
      }
    } catch (e) {
      console.warn('Could not check for online updates:', e);
    }
  };

  // Trigger content download and asset pre-caching
  const startDownload = async () => {
    setDownloadStatus('downloading');
    setDownloadProgress(5);
    setDownloadDetails(lang === 'es' ? 'Descargando datos del parque...' : 'Downloading park data...');

    try {
      // 1. Fetch JSON Package
      const response = await fetch('/api/offline-data');
      if (!response.ok) throw new Error('API fetch failed');
      const payload = (await response.json()) as OfflineDataPayload;

      setDownloadProgress(15);
      setDownloadDetails(lang === 'es' ? 'Preparando imágenes para caché...' : 'Preparing images for cache...');

      // 2. Aggregate all Image URLs
      const imageUrlsToCache = new Set<string>();
      
      if (payload.settings?.map_image_url) {
        imageUrlsToCache.add(payload.settings.map_image_url);
      }

      payload.points.forEach((point) => {
        if (point.main_image_url) imageUrlsToCache.add(point.main_image_url);
        if (point.gallery_urls && Array.isArray(point.gallery_urls)) {
          point.gallery_urls.forEach((url) => {
            if (url) imageUrlsToCache.add(url);
          });
        }
      });

      const urlsArray = Array.from(imageUrlsToCache).filter(url => url.startsWith('http') || url.startsWith('/'));
      const totalAssets = urlsArray.length;
      
      console.log(`[Offline Sync] Found ${totalAssets} image assets to pre-cache.`);

      // 3. Cache media files using Browser Cache Storage API
      const mediaCache = await caches.open('ama-media-cache');

      // Download images sequentially and report progress
      for (let i = 0; i < totalAssets; i++) {
        const url = urlsArray[i];
        const displayIndex = i + 1;
        const percent = 15 + Math.round((displayIndex / totalAssets) * 80); // Scales 15% -> 95%
        
        setDownloadProgress(percent);
        setDownloadDetails(
          lang === 'es' 
            ? `Descargando imagen ${displayIndex} de ${totalAssets}...` 
            : `Downloading image ${displayIndex} of ${totalAssets}...`
        );

        try {
          // Fetch with cors mode to allow cross-origin images caching (e.g. Unsplash, Supabase storage)
          const imgRequest = new Request(url, { mode: 'cors' });
          const imgResponse = await fetch(imgRequest);
          if (imgResponse.ok) {
            await mediaCache.put(imgRequest, imgResponse);
          }
        } catch (err) {
          console.error(`Failed to pre-cache image asset: ${url}`, err);
          // Don't halt the entire download if one image fails
        }
      }

      // 4. Save JSON database in LocalStorage
      localStorage.setItem('ama_offline_data', JSON.stringify(payload));
      localStorage.setItem('ama_guide_downloaded', 'true');
      localStorage.setItem('ama_downloaded_version', payload.version.toString());

      setOfflineData(payload);
      setDownloadProgress(100);
      setDownloadStatus('completed');
      setUpdateAvailable(false);
      setDownloadDetails(lang === 'es' ? '🌿 ¡Todo listo!' : '🌿 All set!');

    } catch (error) {
      console.error('[Offline Sync] Sync failed:', error);
      setDownloadStatus('error');
      setDownloadDetails(
        lang === 'es' 
          ? 'Error al descargar la guía. Verifica tu conexión Wi-Fi e intenta de nuevo.' 
          : 'Failed to download the guide. Check your Wi-Fi and try again.'
      );
    }
  };

  // Discover a point of interest (based on its number: e.g. #12)
  const discoverPoint = (number: number) => {
    if (!offlineData) return { isNew: false, point: null };

    const point = offlineData.points.find((p) => p.number === number);
    if (!point) return { isNew: false, point: null };

    const isAlreadyDiscovered = discoveredPoints.includes(number);

    if (!isAlreadyDiscovered) {
      const updated = [...discoveredPoints, number];
      setDiscoveredPoints(updated);
      localStorage.setItem('ama_discovered_points', JSON.stringify(updated));
      return { isNew: true, point };
    }

    return { isNew: false, point };
  };

  const isPointDiscovered = (number: number) => {
    return discoveredPoints.includes(number);
  };

  // Reset progress
  const resetProgress = () => {
    setDiscoveredPoints([]);
    localStorage.removeItem('ama_discovered_points');
  };

  return (
    <GuideContext.Provider
      value={{
        lang,
        isOnline,
        downloadStatus,
        downloadProgress,
        downloadDetails,
        offlineData,
        discoveredPoints,
        updateAvailable,
        latestOnlineVersion,
        changeLanguage,
        startDownload,
        discoverPoint,
        isPointDiscovered,
        resetProgress,
        checkUpdates,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
}

export function useGuide() {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
}
