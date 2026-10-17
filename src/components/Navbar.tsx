import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Upload, ArrowUpRight, LogOut, Check, KeyRound, FileText, Sparkles, Camera, Film, Eye } from 'lucide-react';

interface NavbarProps {
  onOpenResume: () => void;
  onOpenResumeEdit?: () => void;
  onOpenAdminCvModal?: () => void;
  onOpenMediaManager?: () => void;
  onOpenVisualLabEdit?: () => void;
  onOpenVideoEdit?: () => void;
  activeSection: 'home' | 'work' | 'contact';
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenResume,
  onOpenResumeEdit,
  onOpenAdminCvModal,
  onOpenMediaManager,
  onOpenVisualLabEdit,
  onOpenVideoEdit,
  activeSection,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Admin login state stored in localStorage
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('samuel_admin_auth') === 'true';
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setPinError(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    // PIN de administrador de Samuel: 7374
    if (cleanPin === '7374') {
      setIsAdmin(true);
      localStorage.setItem('samuel_admin_auth', 'true');
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('samuel_admin_auth');
    setIsDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none">
      <div
        className={`relative pointer-events-auto inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface/90 px-2 py-2 transition-all duration-300 ${
          scrolled ? 'shadow-md shadow-black/40 border-white/15 bg-surface/95' : ''
        }`}
      >
        {/* Logo: Monograma SR con menú secreto de administrador */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            aria-label="Panel Samuel Restrepo"
            className="relative w-9 h-9 rounded-full p-[1.5px] cursor-pointer transition-transform duration-300 hover:scale-110 flex items-center justify-center shrink-0 overflow-hidden"
            title="Samuel Restrepo • Clic para opciones y administración"
          >
            {/* Accent gradient border background, reverses direction on hover */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                logoHovered ? 'accent-gradient-rev' : 'accent-gradient'
              }`}
            />
            {/* Inner circle */}
            <div className="relative w-full h-full rounded-full bg-bg flex items-center justify-center">
              <span className="font-display italic text-[13px] text-text-primary font-normal leading-none select-none tracking-wider">
                SR
              </span>
            </div>

            {/* Tiny admin status indicator if logged in */}
            {isAdmin && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black" />
            )}
          </button>

          {/* Secret Admin Dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-12 left-0 w-72 sm:w-80 rounded-2xl bg-surface/95 backdrop-blur-xl border border-stroke p-4 shadow-2xl z-50 flex flex-col gap-3 text-left"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-stroke/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full accent-gradient" />
                    <span className="text-xs font-medium text-text-primary">
                      Samuel Restrepo
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                    EAFIT &apos;26
                  </span>
                </div>

                {/* State 1: Logged In as Admin */}
                {isAdmin ? (
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Sesión activa de Administrador</span>
                    </div>

                    {/* Action 1: Modify Projects & Media */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onOpenMediaManager) onOpenMediaManager();
                      }}
                      className="w-full relative group rounded-xl p-[1px] cursor-pointer"
                    >
                      <span className="absolute inset-0 rounded-xl accent-gradient" />
                      <span className="relative z-10 flex items-center justify-center gap-2 rounded-xl text-xs font-medium px-4 py-2.5 bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Modificar Proyectos &amp; Archivos</span>
                      </span>
                    </button>

                    {/* Action 2: Modify Visual Laboratory & Photos */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onOpenVisualLabEdit) onOpenVisualLabEdit();
                      }}
                      className="w-full relative group rounded-xl p-[1px] cursor-pointer"
                    >
                      <span className="absolute inset-0 rounded-xl accent-gradient opacity-90 group-hover:opacity-100 transition-opacity" />
                      <span className="relative z-10 flex items-center justify-center gap-2 rounded-xl text-xs font-medium px-4 py-2.5 bg-surface text-white border border-[#89AACC]/40 group-hover:bg-[#89AACC]/20 transition-all">
                        <Sparkles className="w-3.5 h-3.5 text-[#89AACC]" />
                        <span>Modificar Laboratorio Visual &amp; Fotos</span>
                      </span>
                    </button>

                    {/* Action 3: Cargar / Actualizar PDF del CV (Admin only) */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onOpenAdminCvModal) {
                          onOpenAdminCvModal();
                        } else {
                          onOpenResume();
                        }
                      }}
                      className="w-full relative group rounded-xl p-[1px] cursor-pointer"
                    >
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#89AACC] to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                      <span className="relative z-10 flex items-center justify-center gap-2 rounded-xl text-xs font-medium px-4 py-2.5 bg-surface text-white border border-[#89AACC]/40 group-hover:bg-[#89AACC]/20 transition-all">
                        <FileText className="w-3.5 h-3.5 text-[#89AACC]" />
                        <span>Cargar / Actualizar PDF del CV</span>
                      </span>
                    </button>

                    {/* Action 4: Modify Hero / Portada (Texts, Words & Background Video) */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onOpenVideoEdit) onOpenVideoEdit();
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl text-xs font-medium px-4 py-2.5 border border-[#89AACC]/30 bg-[#89AACC]/10 hover:bg-[#89AACC]/20 text-white transition-colors cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5 text-[#89AACC]" />
                      <span>Modificar Inicio (Textos, Palabras &amp; Video)</span>
                    </button>

                    {/* Quick Preview Link for Admin */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenResume();
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl text-xs font-medium px-3 py-2 border border-stroke/70 bg-bg/50 hover:bg-white/10 text-muted hover:text-white transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#89AACC]" />
                      <span>Ver Perfil / CV como visitante</span>
                    </button>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          scrollTo('hero');
                        }}
                        className="text-muted hover:text-white transition-colors cursor-pointer"
                      >
                        Ir al inicio
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* State 2: Not Logged In -> Perfil / CV button + Admin Access */
                  <div className="space-y-3">
                    {/* Perfil / CV button in dropdown */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenResume();
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl text-xs font-medium px-4 py-2.5 border border-[#89AACC]/40 bg-[#89AACC]/15 hover:bg-[#89AACC]/25 text-white transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#89AACC]" />
                      <span>Perfil / CV (PDF)</span>
                    </button>

                    <div className="w-full h-px bg-stroke/60 my-1" />

                    <form onSubmit={handleLogin} className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-[#89AACC]">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Acceso Administrador (Samuel)</span>
                      </div>

                      <p className="text-[11px] text-muted leading-relaxed">
                        Inicia sesión para subir fotos, videos (.MOV), documentos PDF y modificar proyectos.
                      </p>

                    <div>
                      <input
                        type="password"
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          setPinError(false);
                        }}
                        placeholder="Ingresa PIN..."
                        className="w-full bg-bg border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                        autoFocus
                      />
                      {pinError && (
                        <span className="text-[10px] text-red-400 mt-1 block font-medium">
                          PIN incorrecto
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full relative group rounded-xl p-[1px] cursor-pointer"
                    >
                      <span className="absolute inset-0 rounded-xl accent-gradient" />
                      <span className="relative z-10 flex items-center justify-center gap-2 rounded-xl text-xs font-medium px-3 py-2 bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary transition-colors">
                        <Lock className="w-3 h-3" />
                        <span>Ingresar al Panel</span>
                      </span>
                    </button>

                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          scrollTo('hero');
                        }}
                        className="text-[11px] text-muted hover:text-white transition-colors cursor-pointer"
                      >
                        Ir al inicio de la página
                      </button>
                    </div>
                  </form>
                </div>
              )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider (hidden on mobile) */}
        <div className="w-px h-5 bg-stroke mx-1 hidden sm:block" />

        {/* Clean Public Nav links */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scrollTo('hero')}
            className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 cursor-pointer ${
              activeSection === 'home'
                ? 'text-text-primary bg-stroke/50 font-medium'
                : 'text-muted hover:text-text-primary hover:bg-stroke/50'
            }`}
          >
            Inicio
          </button>

          <button
            onClick={() => scrollTo('work')}
            className={`text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 cursor-pointer ${
              activeSection === 'work'
                ? 'text-text-primary bg-stroke/50 font-medium'
                : 'text-muted hover:text-text-primary hover:bg-stroke/50'
            }`}
          >
            Proyectos
          </button>

          <button
            onClick={onOpenResume}
            className="text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 cursor-pointer text-muted hover:text-text-primary hover:bg-stroke/50"
          >
            Perfil / CV
          </button>
        </div>

        {/* Divider (hidden on mobile) */}
        <div className="w-px h-5 bg-stroke mx-1 hidden sm:block" />

        {/* "Contactar" button */}
        <button
          onClick={() => scrollTo('contact')}
          className="relative group text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-300 cursor-pointer overflow-visible ml-1"
        >
          {/* Border highlight behind on hover */}
          <span className="absolute -inset-[1.5px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          
          <span className="relative z-10 flex items-center gap-1 text-text-primary font-medium">
            <span>Contactar</span>
            <span className="text-xs transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </span>
        </button>
      </div>
    </nav>
  );
};
