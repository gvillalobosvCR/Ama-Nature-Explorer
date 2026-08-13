'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useGuide, Point, Category } from '@/context/GuideContext';
import QRCode from 'qrcode';
import {
  Plus,
  QrCode,
  Edit3,
  Trash2,
  Search,
  Filter,
  Info,
  FileText,
  Image as ImageIcon,
  Sliders,
  UploadCloud,
  MapPin,
  HelpCircle,
  Play,
  Maximize,
  Volume2,
  ChevronRight,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminPoints() {
  const { isOnline, offlineData } = useGuide();
  const [points, setPoints] = useState<Point[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Layout State
  const [activeFormTab, setActiveFormTab] = useState<'info' | 'tabs' | 'media' | 'future'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // QR Dialog State
  const [selectedQRPoint, setSelectedQRPoint] = useState<Point | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Form Fields State
  const [number, setNumber] = useState<number>(0);
  const [categoryId, setCategoryId] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [habitatEs, setHabitatEs] = useState('');
  const [habitatEn, setHabitatEn] = useState('');
  const [dietEs, setDietEs] = useState('');
  const [dietEn, setDietEn] = useState('');
  const [sabiasQueEs, setSabiasQueEs] = useState('');
  const [sabiasQueEn, setSabiasQueEn] = useState('');
  const [conservationEs, setConservationEs] = useState('');
  const [conservationEn, setConservationEn] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [galleryUrlsText, setGalleryUrlsText] = useState('');
  const [active, setActive] = useState(true);
  const [mapX, setMapX] = useState<number>(50);
  const [mapY, setMapY] = useState<number>(50);
  const [arEnabled, setArEnabled] = useState(false);
  const [model3dUrl, setModel3dUrl] = useState('');
  const [model3dOfflineSize, setModel3dOfflineSize] = useState('');
  const [audioEsUrl, setAudioEsUrl] = useState('');
  const [audioEnUrl, setAudioEnUrl] = useState('');

  // Map settings ref (for plotting preview)
  const [mapImageUrl, setMapImageUrl] = useState('');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load points
      const { data: pts, error: ptsErr } = await supabase
        .from('points')
        .select('*')
        .order('number', { ascending: true });

      if (ptsErr) throw ptsErr;
      setPoints(pts || []);

      // Load categories
      const { data: cats, error: catsErr } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catsErr) throw catsErr;
      setCategories(cats || []);

      // Load map settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('key, value');

      const mapSetting = settingsData?.find(s => s.key === 'map_image_url');
      setMapImageUrl(mapSetting?.value || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200&auto=format&fit=crop');

    } catch (err: any) {
      console.warn('Fallback loading points CRUD:', err);
      if (offlineData) {
        setPoints(offlineData.points);
        setCategories(offlineData.categories);
        setMapImageUrl(offlineData.settings.map_image_url);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Check url actions
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new') {
        resetForm();
        setIsEditing(true);
        window.history.replaceState({}, '', '/admin/points');
      }
    }
  }, [offlineData]);

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setNumber(points.length > 0 ? Math.max(...points.map(p => p.number)) + 1 : 1);
    setCategoryId(categories.length > 0 ? categories[0].id || '' : '');
    setNameEs('');
    setNameEn('');
    setScientificName('');
    setDescriptionEs('');
    setDescriptionEn('');
    setHabitatEs('');
    setHabitatEn('');
    setDietEs('');
    setDietEn('');
    setSabiasQueEs('');
    setSabiasQueEn('');
    setConservationEs('');
    setConservationEn('');
    setMainImageUrl('');
    setGalleryUrlsText('');
    setActive(true);
    setMapX(50);
    setMapY(50);
    setArEnabled(false);
    setModel3dUrl('');
    setModel3dOfflineSize('');
    setAudioEsUrl('');
    setAudioEnUrl('');
    setError('');
    setSuccess('');
  };

  const handleEditClick = (pt: Point) => {
    setIsEditing(true);
    setEditId(pt.id || null);
    setNumber(pt.number);
    setCategoryId(pt.category_id || '');
    setNameEs(pt.name_es);
    setNameEn(pt.name_en);
    setScientificName(pt.scientific_name || '');
    setDescriptionEs(pt.description_es || '');
    setDescriptionEn(pt.description_en || '');
    setHabitatEs(pt.habitat_es || '');
    setHabitatEn(pt.habitat_en || '');
    setDietEs(pt.diet_es || '');
    setDietEn(pt.diet_en || '');
    setSabiasQueEs(pt.sabias_que_es || '');
    setSabiasQueEn(pt.sabias_que_en || '');
    setConservationEs(pt.conservation_es || '');
    setConservationEn(pt.conservation_en || '');
    setMainImageUrl(pt.main_image_url || '');
    setGalleryUrlsText(pt.gallery_urls ? pt.gallery_urls.join(', ') : '');
    setActive(pt.active);
    setMapX(Number(pt.map_x) || 50);
    setMapY(Number(pt.map_y) || 50);
    setArEnabled(pt.ar_enabled || false);
    setModel3dUrl(pt.model_3d_url || '');
    setModel3dOfflineSize(pt.model_3d_offline_size || '');
    setAudioEsUrl(pt.audio_es_url || '');
    setAudioEnUrl(pt.audio_en_url || '');
    setActiveFormTab('info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `points/${fileName}`;

    try {
      const { data, error: uploadErr } = await supabase.storage
        .from('media')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      if (isGallery) {
        const current = galleryUrlsText ? galleryUrlsText.trim() : '';
        setGalleryUrlsText(current ? `${current}, ${publicUrl}` : publicUrl);
      } else {
        setMainImageUrl(publicUrl);
      }
      setSuccess('Fotografía guardada con éxito.');
    } catch (err: any) {
      console.error(err);
      setError(`Subida fallida: ${err.message}. Revisa que el bucket 'media' exista en Supabase.`);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMapX(Math.round(x * 10) / 10);
    setMapY(Math.round(y * 10) / 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!number || !nameEs || !nameEn || !categoryId) {
      setError('Por favor completa todos los campos requeridos (*).');
      setSubmitting(false);
      return;
    }

    const galleryArray = galleryUrlsText
      ? galleryUrlsText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    try {
      const payload = {
        number: parseInt(number.toString(), 10),
        category_id: categoryId,
        name_es: nameEs,
        name_en: nameEn,
        scientific_name: scientificName,
        description_es: descriptionEs,
        description_en: descriptionEn,
        habitat_es: habitatEs,
        habitat_en: habitatEn,
        diet_es: dietEs,
        diet_en: dietEn,
        sabias_que_es: sabiasQueEs,
        sabias_que_en: sabiasQueEn,
        conservation_es: conservationEs,
        conservation_en: conservationEn,
        main_image_url: mainImageUrl,
        gallery_urls: galleryArray,
        active,
        map_x: mapX,
        map_y: mapY,
        ar_enabled: arEnabled,
        model_3d_url: model3dUrl,
        model_3d_offline_size: model3dOfflineSize,
        audio_es_url: audioEsUrl,
        audio_en_url: audioEnUrl,
      };

      if (isEditing && editId) {
        const { error: updErr } = await supabase
          .from('points')
          .update(payload)
          .eq('id', editId);
        if (updErr) throw updErr;
        setSuccess('Punto de interés actualizado.');
      } else {
        const { error: insErr } = await supabase
          .from('points')
          .insert([payload]);
        if (insErr) throw insErr;
        setSuccess('Punto de interés creado.');
      }

      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error al guardar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar permanentemente este punto?')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const { error: delErr } = await supabase
        .from('points')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;
      setSuccess('Punto eliminado.');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar.');
    }
  };

  const handleQRClick = async (pt: Point) => {
    setSelectedQRPoint(pt);
    let origin = 'https://arenalmundoaventura.com';
    if (typeof window !== 'undefined') {
      origin = window.location.origin;
    }
    const targetUrl = `${origin}/explore/${pt.number}`;

    try {
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#022c22',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintQR = () => {
    const win = window.open();
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Rótulo #${selectedQRPoint?.number} - ${selectedQRPoint?.name_es}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; color: #022c22; }
            .badge { font-size: 80px; font-weight: 900; margin-bottom: 5px; }
            .name { font-size: 32px; font-weight: bold; margin-bottom: 2px; }
            .sci { font-size: 20px; font-style: italic; color: #059669; margin-bottom: 30px; }
            img { width: 350px; height: 350px; border: 4px solid #022c22; padding: 10px; border-radius: 20px; }
            .url { font-family: monospace; font-size: 14px; color: #64748b; margin-top: 30px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="badge">#${selectedQRPoint?.number}</div>
          <div class="name">${selectedQRPoint?.name_es}</div>
          <div class="sci">${selectedQRPoint?.scientific_name || ''}</div>
          <img src="${qrCodeUrl}" />
          <div class="url">${window.location.origin}/explore/${selectedQRPoint?.number}</div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const filteredPoints = points.filter(pt => {
    const matchesCategory = filterCategory === 'all' || pt.category_id === filterCategory;
    const matchesSearch = 
      pt.name_es.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pt.scientific_name && pt.scientific_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pt.number.toString() === searchQuery.trim();
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 w-full">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1527] p-5 rounded-2xl border border-slate-800/60 shadow-md">
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            Puntos del Sendero
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Inserta y edita especies, carga fotos y genera códigos QR imprimibles.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => { resetForm(); setIsEditing(true); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer border border-emerald-400/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NUEVO PUNTO</span>
          </button>
        )}
      </div>

      {/* Forms Drawer editor (stacks inputs) */}
      {isEditing && (
        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xl animate-fade-in w-full">
          
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {editId ? `Editar Punto #${number} — ${nameEs}` : 'Crear Nuevo Punto de Interés'}
            </h2>
            <button
              onClick={resetForm}
              className="text-slate-500 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>✕</span>
              <span>Cerrar Editor</span>
            </button>
          </div>

          {/* Form Tabs control */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-slate-800/60 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveFormTab('info')}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold text-xs cursor-pointer transition-all ${
                activeFormTab === 'info' ? 'border-emerald-500 text-white font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>General</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('tabs')}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold text-xs cursor-pointer transition-all ${
                activeFormTab === 'tabs' ? 'border-emerald-500 text-white font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ficha Detalle (Bilingüe)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('media')}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold text-xs cursor-pointer transition-all ${
                activeFormTab === 'media' ? 'border-emerald-500 text-white font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Fotos y Coordenadas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('future')}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold text-xs cursor-pointer transition-all ${
                activeFormTab === 'future' ? 'border-emerald-500 text-white font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>AR / Audio (Futuro)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* General Info */}
            {activeFormTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Número del Rótulo (#) *</label>
                  <input
                    type="number"
                    required
                    value={number || ''}
                    onChange={(e) => setNumber(parseInt(e.target.value, 10) || 0)}
                    placeholder="Ej. 12"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Categoría *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name_es}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Nombre Común (Español) *</label>
                  <input
                    type="text"
                    required
                    value={nameEs}
                    onChange={(e) => setNameEs(e.target.value)}
                    placeholder="Ej. Perezoso de tres dedos"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Common Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Ej. Three-toed Sloth"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Nombre Científico (Latín)</label>
                  <input
                    type="text"
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    placeholder="Ej. Bradypus variegatus"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 font-mono italic focus:outline-none focus:border-emerald-600"
                  />
                </div>
                
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="pt_active"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded bg-[#090d16] border border-slate-800"
                  />
                  <label htmlFor="pt_active" className="text-xs font-bold text-slate-300 select-none cursor-pointer">
                    Punto de Interés Activo (Visible en senderos/mapa)
                  </label>
                </div>
              </div>
            )}

            {/* Bilingual content details */}
            {activeFormTab === 'tabs' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wide mb-1.5">Descripción Breve (Español)</label>
                    <textarea
                      rows={3}
                      value={descriptionEs}
                      onChange={(e) => setDescriptionEs(e.target.value)}
                      placeholder="Resumen del punto..."
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wide mb-1.5">Brief Description (English)</label>
                    <textarea
                      rows={3}
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      placeholder="Summary overview..."
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-800/40 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase mb-1.5">Hábitat (Español)</label>
                    <textarea
                      rows={2}
                      value={habitatEs}
                      onChange={(e) => setHabitatEs(e.target.value)}
                      placeholder="Árboles..."
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase mb-1.5">Habitat (English)</label>
                    <textarea
                      rows={2}
                      value={habitatEn}
                      onChange={(e) => setHabitatEn(e.target.value)}
                      placeholder="Trees..."
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-800/40 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase mb-1.5">Alimentación (Español)</label>
                    <textarea
                      rows={2}
                      value={dietEs}
                      onChange={(e) => setDietEs(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase mb-1.5">Diet (English)</label>
                    <textarea
                      rows={2}
                      value={dietEn}
                      onChange={(e) => setDietEn(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-800/40 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase mb-1.5">¿Sabías qué? (Español)</label>
                    <textarea
                      rows={2}
                      value={sabiasQueEs}
                      onChange={(e) => setSabiasQueEs(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase mb-1.5">Did you know? (English)</label>
                    <textarea
                      rows={2}
                      value={sabiasQueEn}
                      onChange={(e) => setSabiasQueEn(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-800/40 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase mb-1.5">Conservación (Español)</label>
                    <textarea
                      rows={2}
                      value={conservationEs}
                      onChange={(e) => setConservationEs(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wide uppercase mb-1.5">Conservation (English)</label>
                    <textarea
                      rows={2}
                      value={conservationEn}
                      onChange={(e) => setConservationEn(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Media & Coordinates selection */}
            {activeFormTab === 'media' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Fotografía Principal (URL)</label>
                    <input
                      type="text"
                      value={mainImageUrl}
                      onChange={(e) => setMainImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none mb-2"
                    />
                    <div className="flex items-center gap-2 bg-[#090d16] border border-slate-800 p-3 rounded-xl">
                      <UploadCloud className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e)}
                        className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:bg-slate-800 file:text-emerald-400 file:cursor-pointer hover:file:bg-slate-700"
                      />
                    </div>
                    {mainImageUrl && (
                      <div className="mt-2.5 relative w-28 h-20 rounded-xl overflow-hidden border border-slate-800 bg-[#090d16]/30">
                        <img
                          src={mainImageUrl}
                          alt="Previsualización principal"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Galería de Fotos Adicionales (URLs separadas por comas)</label>
                    <textarea
                      rows={3}
                      value={galleryUrlsText}
                      onChange={(e) => setGalleryUrlsText(e.target.value)}
                      placeholder="url1, url2..."
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none mb-2"
                    />
                    <div className="flex items-center gap-2 bg-[#090d16] border border-slate-800 p-3 rounded-xl">
                      <UploadCloud className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:bg-slate-800 file:text-emerald-400 file:cursor-pointer hover:file:bg-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ubicación del Pin en Mapa</label>
                    <p className="text-[9px] text-slate-500 mt-0.5">Haz clic sobre la imagen para asignar las coordenadas automáticamente.</p>
                  </div>

                  <div 
                    onClick={handleMapClick}
                    className="relative w-full aspect-square max-w-[200px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden cursor-crosshair mx-auto shadow-inner"
                  >
                    <img
                      src={mapImageUrl}
                      alt="Trail map preview"
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                    <div 
                      style={{ left: `${mapX}%`, top: `${mapY}%` }}
                      className="absolute w-5 h-5 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black text-slate-950 shadow-md select-none pointer-events-none -translate-x-1/2 -translate-y-1/2"
                    >
                      {number || '?'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono text-center max-w-[200px] mx-auto">
                    <div className="bg-[#090d16] p-2 border border-slate-800 rounded-xl">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Eje X (%)</span>
                      <span className="text-white font-bold">{mapX}%</span>
                    </div>
                    <div className="bg-[#090d16] p-2 border border-slate-800 rounded-xl">
                      <span className="text-[9px] text-slate-500 uppercase block font-sans">Eje Y (%)</span>
                      <span className="text-white font-bold">{mapY}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Future Features */}
            {activeFormTab === 'future' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#090d16]/60 p-4 border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wide border-b border-slate-800/40 pb-1.5 flex items-center gap-1">
                    <Volume2 className="w-4 h-4" />
                    <span>Audio Guía (Futuro)</span>
                  </h3>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Audio narrado (Español URL)</label>
                    <input
                      type="text"
                      value={audioEsUrl}
                      onChange={(e) => setAudioEsUrl(e.target.value)}
                      placeholder="https://...mp3"
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Audio narrated (English URL)</label>
                    <input
                      type="text"
                      value={audioEnUrl}
                      onChange={(e) => setAudioEnUrl(e.target.value)}
                      placeholder="https://...mp3"
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#090d16]/60 p-4 border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide border-b border-slate-800/40 pb-1.5 flex items-center gap-1">
                    <Maximize className="w-4 h-4" />
                    <span>Realidad Aumentada (Futuro)</span>
                  </h3>
                  
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="ar_toggle"
                      checked={arEnabled}
                      onChange={(e) => setArEnabled(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded bg-[#090d16] border border-slate-800"
                    />
                    <label htmlFor="ar_toggle" className="text-xs font-bold text-slate-300 select-none cursor-pointer">
                      AR Activado (Permitir proyectar modelo 3D)
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Modelo 3D (URL .GLTF/.USDZ)</label>
                    <input
                      type="text"
                      value={model3dUrl}
                      onChange={(e) => setModel3dUrl(e.target.value)}
                      placeholder="https://...gltf"
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Tamaño Estimado Descarga</label>
                    <input
                      type="text"
                      value={model3dOfflineSize}
                      onChange={(e) => setModel3dOfflineSize(e.target.value)}
                      placeholder="Ej. 4.8 MB"
                      className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {error && <div className="bg-red-950/40 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs text-center font-medium">⚠️ {error}</div>}
            {success && <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl text-xs text-center font-medium">✓ {success}</div>}

            <div className="flex gap-3 border-t border-slate-800 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase cursor-pointer disabled:opacity-50 transition-all shadow-md active:scale-98"
              >
                {submitting ? 'Guardando en Base de datos...' : 'GUARDAR PUNTO DE INTERÉS'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold py-3 px-5 rounded-xl text-xs cursor-pointer border border-slate-800"
              >
                Cancelar
              </button>
            </div>

          </form>

        </div>
      )}

      {/* Points Data Table (responsive, prevents breaking out) */}
      <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-md w-full overflow-hidden">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/60 pb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Listado de Puntos del Sendero ({filteredPoints.length})
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Buscar especie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-600"
              />
              <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl px-8 py-2 text-xs text-slate-100 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name_es}</option>
                ))}
              </select>
              <Filter className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          </div>
        ) : filteredPoints.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">No se encontraron puntos con los filtros actuales.</p>
        ) : (
          /* Table horizontal scrolling container wrapper */
          <div className="w-full overflow-x-auto rounded-xl border border-slate-800/60 shadow-inner">
            <table className="w-full text-left text-xs border-collapse min-w-[600px] lg:min-w-0">
              <thead>
                <tr className="border-b border-slate-800 bg-[#090d16]/40 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16">Código</th>
                  <th className="py-3.5 px-2 w-14">Foto</th>
                  <th className="py-3.5 px-3">Especie</th>
                  <th className="py-3.5 px-3 hidden md:table-cell">Nombre Científico</th>
                  <th className="py-3.5 px-3 hidden sm:table-cell">Categoría</th>
                  <th className="py-3.5 px-3 hidden lg:table-cell">Ubicación Pin</th>
                  <th className="py-3.5 px-3 w-20 hidden sm:table-cell">Estado</th>
                  <th className="py-3.5 px-4 text-right w-44">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredPoints.map((pt) => {
                  const cat = categories.find(c => c.id === pt.category_id);
                  return (
                    <tr key={pt.id} className="hover:bg-slate-800/10 text-slate-200 transition-colors">
                      <td className="py-4 px-4 font-black text-emerald-400 text-sm">#{pt.number}</td>
                      <td className="py-4 px-2">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0">
                          <img
                            src={pt.main_image_url || '/icon.svg'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="font-bold text-white leading-snug">{pt.name_es}</div>
                        <div className="text-slate-500 text-[10px] leading-snug">{pt.name_en}</div>
                      </td>
                      <td className="py-4 px-3 font-mono italic text-slate-400 hidden md:table-cell">{pt.scientific_name || '-'}</td>
                      <td className="py-4 px-3 hidden sm:table-cell">
                        {cat ? (
                          <span className="flex items-center gap-1.5">
                            <span>{cat.icon}</span>
                            <span>{cat.name_es}</span>
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-4 px-3 font-mono text-slate-500 hidden lg:table-cell">({pt.map_x}%, {pt.map_y}%)</td>
                      <td className="py-4 px-3 hidden sm:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          pt.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {pt.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleQRClick(pt)}
                          className="bg-[#090d16] hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-800/80 px-2 py-1.5 rounded-lg font-bold cursor-pointer text-[10px]"
                        >
                          QR
                        </button>
                        <button
                          onClick={() => handleEditClick(pt)}
                          className="bg-[#090d16] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 px-2 py-1.5 rounded-lg font-bold cursor-pointer text-[10px]"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => pt.id && handleDelete(pt.id)}
                          className="bg-red-950/20 hover:bg-red-950/80 text-red-400 hover:text-white px-2 py-1.5 rounded-lg font-bold cursor-pointer transition-all border border-red-950/40 text-[10px]"
                        >
                          Borrar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Dialog Modal */}
      {selectedQRPoint && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in w-full max-w-none">
          <div className="bg-[#0d1527] border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-6 text-center relative shadow-2xl">
            <button
              onClick={() => setSelectedQRPoint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              ✕
            </button>

            <div>
              <span className="bg-emerald-950 text-emerald-400 font-black px-3 py-1.5 rounded-xl text-[10px] border border-emerald-800/50">
                Rótulo #{selectedQRPoint.number}
              </span>
              <h3 className="text-white font-black text-base mt-4 uppercase leading-none">{selectedQRPoint.name_es}</h3>
              <p className="text-slate-500 italic text-[11px] font-mono mt-1">{selectedQRPoint.scientific_name || ''}</p>
            </div>

            <div className="bg-white p-3 rounded-2xl inline-block border-4 border-emerald-950 shadow-inner">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <div className="text-[9px] text-slate-500 font-mono break-all bg-[#090d16] p-2.5 rounded-xl border border-slate-800/60 shadow-inner">
              {window.location.origin}/explore/{selectedQRPoint.number}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrintQR}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase cursor-pointer transition-all active:scale-95"
              >
                Imprimir
              </button>
              <a
                href={qrCodeUrl}
                download={`qr-label-${selectedQRPoint.number}.png`}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase block text-center border border-slate-700/50"
              >
                Descargar
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
