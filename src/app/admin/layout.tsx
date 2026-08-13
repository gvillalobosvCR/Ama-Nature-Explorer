'use client';

import { useGuide } from '@/context/GuideContext';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  MapPin,
  FolderKanban,
  Map,
  CloudDownload,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Bell,
  Lock,
  Globe
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isOnline } = useGuide();
  
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Mobile / Tablet Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close mobile drawer when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError(error.message);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Ocurrió un error al iniciar sesión.');
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b12] flex flex-col items-center justify-center text-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="mt-4 text-emerald-400 text-xs font-bold uppercase tracking-widest">Cargando panel...</p>
      </div>
    );
  }

  // Gatekeeper: Render Login Screen if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-[#070b12] flex items-center justify-center px-4 py-12 text-slate-100 relative overflow-hidden w-full max-w-none">
        
        {/* Visual Nature Accents */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-emerald-900/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-md w-full space-y-8 bg-[#0d1527] border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
              AMA EXPLORER
            </h2>
            <p className="mt-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              Control Administrativo
            </p>
          </div>
          
          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@arenalmundoaventura.com"
                className="w-full bg-[#070b12] border border-slate-800/80 rounded-xl py-3 px-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder-slate-700 shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070b12] border border-slate-800/80 rounded-xl py-3 px-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder-slate-700 shadow-inner"
              />
            </div>

            {loginError && (
              <div className="bg-red-950/40 border border-red-500/20 text-red-300 px-4 py-2.5 rounded-xl text-[10px] text-center font-medium">
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg border border-emerald-400/25 transition-all cursor-pointer active:scale-98 disabled:opacity-50 text-xs uppercase tracking-wide"
            >
              {loggingIn ? 'Autenticando...' : 'INICIAR SESIÓN'}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-[9px] text-slate-500 hover:text-emerald-400 font-bold uppercase transition-all flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Volver al Portal Público</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Links Configurations with Lucide components
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Puntos de Interés', path: '/admin/points', icon: MapPin },
    { name: 'Categorías', path: '/admin/categories', icon: FolderKanban },
    { name: 'Configurar Mapa', path: '/admin/map', icon: Map },
    { name: 'Contenido Offline', path: '/admin/offline', icon: CloudDownload },
  ];

  // Helper menu active checker
  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  // Reusable Sidebar menu list component to prevent duplications
  const SidebarMenu = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col justify-between h-full">
      <div className="flex-1">
        {/* Brand Header */}
        <div className={`p-5 border-b border-slate-800/60 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <div>
              <h1 className="text-sm font-black text-white tracking-widest font-sans flex items-center gap-1.5">
                <span className="text-emerald-400 text-base">🌿</span> AMA EXPLORER
              </h1>
              <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">ADMIN PANEL</p>
            </div>
          ) : (
            <span className="text-emerald-400 text-xl font-bold">🌿</span>
          )}
        </div>

        {/* Links Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                title={collapsed ? item.name : ''}
                className={`w-full flex items-center rounded-xl text-xs font-bold transition-all border ${
                  collapsed ? 'justify-center p-3' : 'gap-3 px-4.5 py-3'
                } ${
                  active
                    ? 'bg-emerald-600 text-white border-emerald-400/20 shadow-lg shadow-emerald-950/50'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout & Footer */}
      <div className="p-4 border-t border-slate-800/60 space-y-3">
        {!collapsed && (
          <div className="text-[9px] text-slate-500 font-mono truncate px-2">
            Sesión: {session.user?.email}
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Cerrar Sesión' : ''}
          className={`w-full flex items-center rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all border border-transparent hover:border-red-900/30 cursor-pointer ${
            collapsed ? 'justify-center p-3' : 'gap-3 px-4.5 py-2.5'
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col lg:flex-row w-full max-w-none">
      
      {/* 1. Mobile Header (Only visible on screens < 1024px) */}
      <header className="lg:hidden bg-[#0d1527] border-b border-slate-800/60 h-16 px-4 flex items-center justify-between sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-slate-400 hover:text-white p-2 rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xs font-black text-white tracking-widest">AMA EXPLORER</h1>
            <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isOnline && (
            <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[9px] uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>Offline</span>
            </span>
          )}
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
        </div>
      </header>

      {/* 2. Mobile Drawer Backdrop & Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer Sidebar menu */}
          <aside className="relative w-64 max-w-xs bg-[#0d1527] h-full flex flex-col justify-between shadow-2xl z-10 border-r border-slate-800/80 animate-slide-right overflow-hidden">
            {/* Dark Jungle Leaves texture background */}
            <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay">
              <img
                src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=400&auto=format&fit=crop"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Close Drawer button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarMenu />
            </div>
          </aside>
        </div>
      )}

      {/* 3. Tablet Left Sidebar (Fixed column, 768px - 1023px, collapsed to icons only) */}
      <aside className="hidden md:flex lg:hidden w-20 bg-[#0d1527] border-r border-slate-800/60 flex-col justify-between flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
        <SidebarMenu collapsed={true} />
      </aside>

      {/* 4. Desktop Left Sidebar (Fixed column, >= 1024px, full size) */}
      <aside className="hidden lg:flex w-[260px] bg-[#0d1527] border-r border-slate-800/60 flex-col justify-between flex-shrink-0 h-screen sticky top-0 overflow-hidden">
        {/* Dark Leaves texture background overlay */}
        <div className="absolute inset-0 z-0 opacity-12 mix-blend-overlay pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=400&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-between">
          <SidebarMenu />
        </div>
      </aside>

      {/* 5. Main Responsive Scrollable Viewport */}
      <main className="flex-1 flex flex-col min-h-0 w-full overflow-x-hidden relative">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>

    </div>
  );
}
