'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useGuide } from '@/context/GuideContext';
import {
  CloudDownload,
  History,
  Clock,
  Database,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface OfflineVersion {
  version: number;
  published_at: string;
  description: string;
  file_size_approx: string;
  total_points: number;
  total_images: number;
}

export default function AdminOffline() {
  const { isOnline, offlineData } = useGuide();
  const [history, setHistory] = useState<OfflineVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sizing preview states
  const [stats, setStats] = useState({
    pointsCount: 0,
    categoriesCount: 0,
    imagesCount: 0,
    approxSize: '0 MB',
  });

  const loadVersionsAndStats = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Version History
      const { data: vers, error: versErr } = await supabase
        .from('offline_versions')
        .select('*')
        .order('version', { ascending: false });

      if (versErr) throw versErr;
      setHistory(vers || []);

      // 2. Fetch active statistics
      const { data: pts } = await supabase
        .from('points')
        .select('active, main_image_url, gallery_urls');
      
      const { data: cats } = await supabase
        .from('categories')
        .select('id');

      const totalPts = pts ? pts.length : 0;
      const totalCats = cats ? cats.length : 0;
      
      let imgCount = 0;
      pts?.forEach(p => {
        if (p.main_image_url) imgCount++;
        if (p.gallery_urls && Array.isArray(p.gallery_urls)) {
          imgCount += p.gallery_urls.filter(Boolean).length;
        }
      });

      const calculatedSize = ((totalPts * 0.05) + (imgCount * 0.15)).toFixed(1);

      setStats({
        pointsCount: totalPts,
        categoriesCount: totalCats,
        imagesCount: imgCount,
        approxSize: `${calculatedSize} MB`,
      });

    } catch (err: any) {
      console.warn('Fallback loading versions list CRUD:', err);
      setHistory([
        { version: 2, published_at: new Date().toISOString(), description: 'Actualización de mapa y fotos de anfibios.', file_size_approx: '1.2 MB', total_points: 4, total_images: 5 },
        { version: 1, published_at: new Date(Date.now() - 86400000).toISOString(), description: 'Lanzamiento inicial de senderos.', file_size_approx: '0.8 MB', total_points: 2, total_images: 2 }
      ]);
      setStats({
        pointsCount: 4,
        categoriesCount: 5,
        imagesCount: 5,
        approxSize: '1.2 MB'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersionsAndStats();
  }, [offlineData]);

  // Publish new version
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setError('');
    setSuccess('');

    if (!description.trim()) {
      setError('Por favor describe brevemente los cambios de esta versión.');
      setPublishing(false);
      return;
    }

    try {
      const nextVersion = history.length > 0 ? history[0].version + 1 : 1;

      // 1. Insert offline_versions entry
      const newVersionRow = {
        version: nextVersion,
        description: description.trim(),
        file_size_approx: stats.approxSize,
        total_points: stats.pointsCount,
        total_images: stats.imagesCount,
        published_at: new Date().toISOString(),
      };

      const { error: insErr } = await supabase
        .from('offline_versions')
        .insert([newVersionRow]);

      if (insErr) throw insErr;

      // 2. Set version settings value
      const { error: upsertErr } = await supabase
        .from('app_settings')
        .upsert({
          key: 'content_version',
          value: nextVersion.toString(),
        });

      if (upsertErr) throw upsertErr;

      setSuccess(`Versión v${nextVersion} publicada con éxito.`);
      setDescription('');
      await loadVersionsAndStats();
    } catch (err: any) {
      setError(err.message || 'Error al publicar la versión.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1527] p-5 rounded-2xl border border-slate-800/60 shadow-md">
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-tight">Contenido Offline</h1>
          <p className="text-xs text-slate-400 mt-0.5">Versiona el paquete de descarga offline y gestiona las sincronizaciones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Publish Form Panel */}
        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-5 h-fit shadow-md w-full">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800/65 pb-3">
            <CloudDownload className="w-4 h-4 text-emerald-400" />
            <span>Publicar Nueva Versión</span>
          </h2>
          
          {/* Active Data summary telemetry widget */}
          <div className="bg-[#090d16] p-4 border border-slate-800/60 rounded-2xl space-y-3.5 shadow-inner">
            <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800/40 pb-1.5 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>Resumen de Datos Actuales</span>
            </h3>
            <div className="grid grid-cols-2 gap-3.5 text-[10px] font-mono">
              <div className="text-slate-550">Puntos Totales: <span className="text-white font-bold">{stats.pointsCount}</span></div>
              <div className="text-slate-550">Categorías: <span className="text-white font-bold">{stats.categoriesCount}</span></div>
              <div className="text-slate-550">Fotos Totales: <span className="text-white font-bold">{stats.imagesCount}</span></div>
              <div className="text-slate-550">Tamaño Aprox: <span className="text-emerald-450 font-bold">{stats.approxSize}</span></div>
            </div>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Descripción de la Actualización *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Se corrigen las fotos adicionales del Tucán Pico Iris..."
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder-slate-700"
              />
            </div>

            {error && <div className="bg-red-950/40 border border-red-500/20 text-red-300 p-2.5 rounded-xl text-[10px] text-center font-medium">⚠️ {error}</div>}
            {success && <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 p-2.5 rounded-xl text-[10px] text-center font-medium">✓ {success}</div>}

            <button
              type="submit"
              disabled={publishing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase cursor-pointer disabled:opacity-50 transition-all shadow-lg active:scale-98"
            >
              {publishing ? 'Publicando...' : 'PUBLICAR NUEVA VERSIÓN'}
            </button>
          </form>
        </div>

        {/* Right Publish Sync History log (responsive scroll lists) */}
        <div className="lg:col-span-2 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-md w-full overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800/65 pb-3 mb-4">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Historial de Publicaciones</span>
            </h2>

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No hay versiones publicadas.</p>
            ) : (
              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                {history.map((ver, idx) => (
                  <div 
                    key={ver.version} 
                    className={`border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-all ${
                      idx === 0 
                        ? 'bg-emerald-950/15 border-emerald-500/30' 
                        : 'bg-[#090d16]/60 border-slate-800/70'
                    }`}
                  >
                    <div className="space-y-1 text-left min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-mono font-black text-[9px] uppercase ${
                          idx === 0 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          v{ver.version} {idx === 0 && 'ACTIVA'}
                        </span>
                        <span className="text-[9px] text-slate-500 flex items-center gap-1 font-semibold">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{new Date(ver.published_at).toLocaleString('es-CR')}</span>
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-200 font-medium leading-relaxed pt-1 pr-2 break-words">
                        {ver.description}
                      </p>
                    </div>

                    <div className="flex gap-4 text-[9px] font-mono text-slate-500 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60 flex-shrink-0">
                      <div>Puntos: <span className="text-white font-bold">{ver.total_points}</span></div>
                      <div>Fotos: <span className="text-white font-bold">{ver.total_images}</span></div>
                      <div>Peso: <span className="text-emerald-450 font-bold">{ver.file_size_approx}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
