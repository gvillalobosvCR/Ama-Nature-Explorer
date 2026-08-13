'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useGuide } from '@/context/GuideContext';
import {
  FolderKanban,
  Plus,
  Edit3,
  Trash2,
  Settings,
  Layers,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface Category {
  id?: string;
  slug: string;
  name_es: string;
  name_en: string;
  icon: string;
  active: boolean;
  sort_order: number;
}

export default function AdminCategories() {
  const { isOnline } = useGuide();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [icon, setIcon] = useState('🌿');
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catError) throw catError;
      setCategories(data || []);
    } catch (err: any) {
      console.warn('Fallback categories list CRUD:', err);
      setCategories([
        { id: 'cat-mammals', slug: 'mamiferos', name_es: 'Mamíferos', name_en: 'Mammals', icon: '🐒', active: true, sort_order: 1 },
        { id: 'cat-birds', slug: 'aves', name_es: 'Aves', name_en: 'Birds', icon: '🐦', active: true, sort_order: 2 },
        { id: 'cat-amphibians', slug: 'anfibios', name_es: 'Anfibios', name_en: 'Amphibians', icon: '🐸', active: true, sort_order: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setSlug('');
    setNameEs('');
    setNameEn('');
    setIcon('🌿');
    setActive(true);
    setSortOrder(0);
    setError('');
    setSuccess('');
  };

  const handleEditClick = (cat: Category) => {
    setIsEditing(true);
    setEditId(cat.id || null);
    setSlug(cat.slug);
    setNameEs(cat.name_es);
    setNameEn(cat.name_en);
    setIcon(cat.icon || '🌿');
    setActive(cat.active);
    setSortOrder(cat.sort_order);
  };

  const handleNameEsChange = (val: string) => {
    setNameEs(val);
    if (!isEditing) {
      const autoSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(autoSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!slug || !nameEs || !nameEn) {
      setError('Por favor completa todos los campos requeridos.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        slug,
        name_es: nameEs,
        name_en: nameEn,
        icon,
        active,
        sort_order: sortOrder,
      };

      if (isEditing && editId) {
        const { error: updErr } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editId);
        if (updErr) throw updErr;
        setSuccess('Categoría actualizada con éxito.');
      } else {
        const { error: insErr } = await supabase
          .from('categories')
          .insert([payload]);
        if (insErr) throw insErr;
        setSuccess('Categoría creada con éxito.');
      }

      resetForm();
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Error al guardar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta categoría? Esto podría afectar a los puntos de interés vinculados.')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const { error: delErr } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;
      setSuccess('Categoría eliminada.');
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar.');
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d1527] p-5 rounded-2xl border border-slate-800/60 shadow-md">
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-tight">Categorías</h1>
          <p className="text-xs text-slate-400 mt-0.5">Gestiona las clasificaciones botánicas y zoológicas de los senderos.</p>
        </div>
      </div>

      {/* Grid Content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Table Panel */}
        <div className="lg:col-span-2 bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-md w-full overflow-hidden flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Listado de Categorías</h2>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No hay categorías configuradas.</p>
            ) : (
              <div className="w-full overflow-x-auto rounded-xl border border-slate-800/60 shadow-inner">
                <table className="w-full text-left text-xs border-collapse min-w-[450px] lg:min-w-0">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#090d16]/40 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-16">Icono</th>
                      <th className="py-3.5 px-3">Nombre</th>
                      <th className="py-3.5 px-3 hidden sm:table-cell">Slug</th>
                      <th className="py-3.5 px-3 w-16 text-center hidden md:table-cell">Orden</th>
                      <th className="py-3.5 px-3 w-20">Estado</th>
                      <th className="py-3.5 px-4 text-right w-36">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-800/10 text-slate-200 transition-colors">
                        <td className="py-3.5 px-4 text-lg">{cat.icon}</td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white">{cat.name_es}</div>
                          <div className="text-slate-550 text-[10px]">{cat.name_en}</div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-400 hidden sm:table-cell">{cat.slug}</td>
                        <td className="py-3.5 px-3 font-bold text-center hidden md:table-cell">{cat.sort_order}</td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            cat.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {cat.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleEditClick(cat)}
                            className="bg-[#090d16] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer text-[10px]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => cat.id && handleDelete(cat.id)}
                            className="bg-red-950/20 hover:bg-red-950/80 text-red-400 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer transition-all border border-red-950/40 text-[10px]"
                          >
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 sm:p-6 h-fit space-y-4 shadow-md w-full">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Nombre (Español) *
              </label>
              <input
                type="text"
                required
                value={nameEs}
                onChange={(e) => handleNameEsChange(e.target.value)}
                placeholder="Ej. Anfibios"
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Name (English) *
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Ej. Amphibians"
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Slug (URL permanente) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej-anfibios"
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Icono (Emoji o Caracter) *
              </label>
              <input
                type="text"
                required
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Ej. 🐸"
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Orden de Visualización
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-[#090d16] border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded bg-[#090d16] border border-slate-800"
              />
              <label htmlFor="active" className="text-xs font-bold text-slate-300 select-none cursor-pointer">
                Categoría Activa (Visible al público)
              </label>
            </div>

            {/* Error/Success Feedbacks */}
            {error && <div className="bg-red-950/40 border border-red-500/20 text-red-300 p-2.5 rounded-xl text-[10px] text-center font-medium">⚠️ {error}</div>}
            {success && <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 p-2.5 rounded-xl text-[10px] text-center font-medium">✓ {success}</div>}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase cursor-pointer disabled:opacity-50 transition-all shadow-md"
              >
                {submitting ? 'Guardando...' : 'GUARDAR'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold py-3 px-4 rounded-xl text-xs cursor-pointer border border-slate-800"
                >
                  Cancelar
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
