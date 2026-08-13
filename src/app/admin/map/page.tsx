'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useGuide, Point } from '@/context/GuideContext';
import {
  Map,
  Settings,
  UploadCloud,
  FileText,
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminMapConfig() {
  const { isOnline, offlineData } = useGuide();
  const [points, setPoints] = useState<Point[]>([]);
  const [mapImageUrl, setMapImageUrl] = useState('');
  
  // Settings details
  const [welcomeEs, setWelcomeEs] = useState('');
  const [welcomeEn, setWelcomeEn] = useState('');
  const [subEs, setSubEs] = useState('');
  const [subEn, setSubEn] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSettingsAndPoints = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Points
      const { data: pts, error: ptsErr } = await supabase
        .from('points')
        .select('*')
        .order('number', { ascending: true });
      if (ptsErr) throw ptsErr;
      setPoints(pts || []);

      // 2. Fetch Settings
      const { data: sett, error: settErr } = await supabase
        .from('app_settings')
        .select('*');
      if (settErr) throw settErr;

      const mapSetting = sett?.find(s => s.key === 'map_image_url');
      const wEsSetting = sett?.find(s => s.key === 'welcome_title_es');
      const wEnSetting = sett?.find(s => s.key === 'welcome_title_en');
      const sEsSetting = sett?.find(s => s.key === 'welcome_subtitle_es');
      const sEnSetting = sett?.find(s => s.key === 'welcome_subtitle_en');

      setMapImageUrl(mapSetting?.value || '');
      setWelcomeEs(wEsSetting?.value || '');
      setWelcomeEn(wEnSetting?.value || '');
      setSubEs(sEsSetting?.value || '');
      setSubEn(sEnSetting?.value || '');

    } catch (err: any) {
      console.warn('Fallback loading map settings CRUD:', err);
      if (offlineData) {
        setPoints(offlineData.points);
        setMapImageUrl(offlineData.settings.map_image_url);
        setWelcomeEs(offlineData.settings.welcome_title_es || '');
        setWelcomeEn(offlineData.settings.welcome_title_en || '');
        setSubEs(offlineData.settings.welcome_subtitle_es || '');
        setSubEn(offlineData.settings.welcome_subtitle_en || '');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndPoints();
  }, [offlineData]);

  // Handle map upload to Supabase Storage
  const handleMapImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    const fileExt = file.name.split('.').pop();
    const filePath = `settings/map-${Date.now()}.${fileExt}`;

    try {
      const { data, error: uploadErr } = await supabase.storage
        .from('media')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setMapImageUrl(publicUrl);
      setSuccess('Nueva ilustración del mapa cargada.');
    } catch (err: any) {
      console.error(err);
      setError(`Error al subir mapa: ${err.message}`);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const settingsToSave = [
        { key: 'map_image_url', value: mapImageUrl },
        { key: 'welcome_title_es', value: welcomeEs },
        { key: 'welcome_title_en', value: welcomeEn },
        { key: 'welcome_subtitle_es', value: subEs },
        { key: 'welcome_subtitle_en', value: subEn },
      ];

      for (const item of settingsToSave) {
        const { error: upsertErr } = await supabase
          .from('app_settings')
          .upsert(item);
        if (upsertErr) throw upsertErr;
      }

      setSuccess('Configuración general y mapa guardados.');
    } catch (err: any) {
      setError(err.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleCoordChange = (index: number, field: 'map_x' | 'map_y', value: number) => {
    const updated = [...points];
    updated[index] = { ...updated[index], [field]: value };
    setPoints(updated);
  };

  const handleSaveCoordinates = async (pt: Point) => {
    setError('');
    setSuccess('');
    try {
      const { error: updErr } = await supabase
        .from('points')
        .update({
          map_x: pt.map_x,
          map_y: pt.map_y,
        })
        .eq('id', pt.id);

      if (updErr) throw updErr;
      setSuccess(`Coordenadas del punto #${pt.number} actualizadas.`);
      await loadSettingsAndPoints();
    } catch (err: any) {
      setError(err.message || 'Error al guardar.');
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1527] p-5 rounded-2xl border border-slate-800/60 shadow-md">
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-tight">Configurar Mapa y Textos</h1>
          <p className="text-xs text-slate-400 mt-0.5">Carga la ilustración del mapa, edita las pantallas de bienvenida y ajusta coordenadas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Settings Panel */}
        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-5 h-fit shadow-md w-full">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800/65 pb-3">
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Configuración General</span>
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            {/* Map image url */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Imagen del Mapa Ilustrado</label>
              <input
                type="text"
                value={mapImageUrl}
                onChange={(e) => setMapImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none mb-2"
              />
              <div className="flex items-center gap-2 bg-[#090d16] border border-slate-800 p-3 rounded-xl">
                <UploadCloud className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMapImageUpload}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:bg-slate-800 file:text-emerald-400 file:cursor-pointer hover:file:bg-slate-700"
                />
              </div>
            </div>

            {/* Welcome titles */}
            <div className="border-t border-slate-800/40 pt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Título de Bienvenida (Español)</label>
                <input
                  type="text"
                  value={welcomeEs}
                  onChange={(e) => setWelcomeEs(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Welcome Title (English)</label>
                <input
                  type="text"
                  value={welcomeEn}
                  onChange={(e) => setWelcomeEn(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Subtitles */}
            <div className="border-t border-slate-800/40 pt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Subtítulo de Bienvenida (Español)</label>
                <textarea
                  rows={2}
                  value={subEs}
                  onChange={(e) => setSubEs(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Welcome Subtitle (English)</label>
                <textarea
                  rows={2}
                  value={subEn}
                  onChange={(e) => setSubEn(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {error && <div className="bg-red-950/40 border border-red-500/20 text-red-300 p-2.5 rounded-xl text-[10px] text-center font-medium">⚠️ {error}</div>}
            {success && <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 p-2.5 rounded-xl text-[10px] text-center font-medium">✓ {success}</div>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase cursor-pointer disabled:opacity-50 transition-all shadow-md active:scale-98"
            >
              {saving ? 'Guardando...' : 'GUARDAR CONFIGURACIÓN'}
            </button>
          </form>
        </div>

        {/* Right Map Preview & coordinate adjustment panel */}
        <div className="lg:col-span-2 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-6 shadow-md w-full overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800/65 pb-3 mb-5">
              <Map className="w-4 h-4 text-emerald-400" />
              <span>Vista Previa del Mapa Ilustrado</span>
            </h2>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 md:flex-row">
                
                {/* Visual Map graphic Card */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="relative w-full aspect-square max-w-[240px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                    {mapImageUrl ? (
                      <img
                        src={mapImageUrl}
                        alt="Illustrated map"
                        className="w-full h-full object-contain pointer-events-none select-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-bold">No hay mapa guardado</div>
                    )}

                    {/* Coordinates Plotter */}
                    {mapImageUrl && points.map((pt) => (
                      <div
                        key={pt.id}
                        style={{ left: `${pt.map_x}%`, top: `${pt.map_y}%` }}
                        className="absolute w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-md select-none pointer-events-none -translate-x-1/2 -translate-y-1/2"
                      >
                        {pt.number}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pins Coordinates list adjust */}
                <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto pr-2 w-full">
                  <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wide">Ajuste Rápido de Coordenadas</h3>
                  {points.length === 0 ? (
                    <p className="text-[10px] text-slate-500">Crea puntos de interés para ajustar sus pines.</p>
                  ) : (
                    <div className="space-y-2">
                      {points.map((pt, idx) => (
                        <div 
                          key={pt.id} 
                          className="bg-[#090d16] border border-slate-800/60 p-2.5 rounded-xl flex items-center justify-between gap-3 shadow-inner"
                        >
                          <div className="min-w-[60px] truncate pr-1">
                            <span className="bg-[#0d1527] border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400">
                              #{pt.number}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 ml-1.5 truncate hidden sm:inline-block align-middle max-w-[80px]">
                              {pt.name_es}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 font-mono text-[10px]">
                              <span className="text-slate-600">X:</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={pt.map_x}
                                onChange={(e) => handleCoordChange(idx, 'map_x', parseFloat(e.target.value) || 0)}
                                className="bg-[#0d1527] border border-slate-800 rounded w-10 text-center py-0.5 text-white font-bold text-[10px]"
                              />
                              <span className="text-slate-650">%</span>
                            </div>

                            <div className="flex items-center gap-1 font-mono text-[10px]">
                              <span className="text-slate-600">Y:</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={pt.map_y}
                                onChange={(e) => handleCoordChange(idx, 'map_y', parseFloat(e.target.value) || 0)}
                                className="bg-[#0d1527] border border-slate-800 rounded w-10 text-center py-0.5 text-white font-bold text-[10px]"
                              />
                              <span className="text-slate-650">%</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveCoordinates(pt)}
                            className="bg-emerald-800/70 hover:bg-emerald-600 text-emerald-350 hover:text-white px-2 py-1 rounded text-[9px] font-extrabold cursor-pointer border border-emerald-700/20 transition-all active:scale-95"
                          >
                            Guardar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
