import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Play,
  Video,
  Image as ImageIcon,
  Tag,
  Star,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Film
} from 'lucide-react';
import { Project, ProjectMedia } from '../types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

interface ActiveMediaItem {
  type: 'image' | 'video' | 'pdf';
  url: string;
  videoFormat?: string;
  date?: string;
  name?: string;
  isCover?: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeMedia, setActiveMedia] = useState<ActiveMediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

  // When project opens, start by showing the PORTADA (cover is simply the cover, not in material)
  useEffect(() => {
    if (project) {
      if (project.videoUrl) {
        setActiveMedia({
          type: 'video',
          url: project.videoUrl,
          videoFormat: project.videoFormat || 'reels',
          date: project.year,
          name: 'Portada de Video',
          isCover: true,
        });
      } else {
        setActiveMedia({
          type: 'image',
          url: project.image,
          date: project.year,
          name: 'Portada Fotográfica',
          isCover: true,
        });
      }
    } else {
      setActiveMedia(null);
    }
  }, [project]);

  // Check scroll positions to show/hide left and right arrows
  const checkScrollState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    checkScrollState();
    const el = sliderRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollState, { passive: true });
      window.addEventListener('resize', checkScrollState);
      return () => {
        el.removeEventListener('scroll', checkScrollState);
        window.removeEventListener('resize', checkScrollState);
      };
    }
  }, [checkScrollState, project]);

  if (!project) return null;

  // Filter out any item whose url matches the project's cover (image or video)
  const materialItems = (project.gallery || []).filter(
    (item) => item.url !== project.videoUrl && item.url !== project.image
  );

  const currentView: ActiveMediaItem = activeMedia || {
    type: project.videoUrl ? 'video' : 'image',
    url: project.videoUrl || project.image,
    videoFormat: project.videoFormat,
    date: project.year,
    isCover: true,
  };

  const isVerticalVideo = (format?: string) => {
    if (!format) return false;
    const f = format.toLowerCase();
    return (
      f.includes('reel') ||
      f.includes('tiktok') ||
      f.includes('historia') ||
      f.includes('story') ||
      f.includes('short') ||
      f.includes('9:16') ||
      f.includes('vertical')
    );
  };

  const isSquareVideo = (format?: string) => {
    if (!format) return false;
    const f = format.toLowerCase();
    return f.includes('cuadrad') || f.includes('1:1') || f.includes('post');
  };

  const currentFormat = currentView.videoFormat;
  const isVertical = currentView.type === 'video' && isVerticalVideo(currentFormat);
  const isSquare = currentView.type === 'video' && isSquareVideo(currentFormat);

  const handleSelectCover = () => {
    if (project.videoUrl) {
      setActiveMedia({
        type: 'video',
        url: project.videoUrl,
        videoFormat: project.videoFormat || 'reels',
        date: project.year,
        name: 'Portada de Video',
        isCover: true,
      });
    } else {
      setActiveMedia({
        type: 'image',
        url: project.image,
        date: project.year,
        name: 'Portada Fotográfica',
        isCover: true,
      });
    }
  };

  const handleSelectMaterial = (item: ProjectMedia) => {
    setActiveMedia({
      type: item.type,
      url: item.url,
      videoFormat: item.videoFormat,
      date: item.date || project.year,
      name: item.name,
      isCover: false,
    });
  };

  // Slider buttons navigation
  const scrollSlider = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScrollState, 350);
  };

  // Allow horizontal scrolling on mouse wheel hover
  const handleSliderWheel = (e: React.WheelEvent) => {
    if (!sliderRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      sliderRef.current.scrollLeft += e.deltaY * 0.9;
      checkScrollState();
    }
  };

  // Mouse Drag-to-Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkScrollState();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full max-w-5xl max-h-[92vh] bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stroke/70 bg-surface/95 shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full accent-gradient" />
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#89AACC] font-mono font-medium">
                  {project.year}
                </span>
                <span className="text-muted/60 text-xs">•</span>
                <span className="text-xs text-text-primary font-medium truncate max-w-[200px] sm:max-w-md">
                  {project.title}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-9 h-9 rounded-full bg-stroke/50 border border-stroke flex items-center justify-center text-text-primary hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-5 sm:p-8 space-y-6 flex-1">
            {/* Main Media Player / Viewer */}
            <div className="w-full flex justify-center bg-black/60 rounded-3xl p-3 sm:p-4 border border-stroke/60">
              {currentView.type === 'video' ? (
                <div
                  className={`relative rounded-2xl overflow-hidden border border-white/20 bg-black flex items-center justify-center shadow-2xl ${
                    isVertical
                      ? 'w-full max-w-[320px] sm:max-w-[350px] aspect-[9/16]'
                      : isSquare
                      ? 'w-full max-w-md aspect-square'
                      : 'w-full aspect-[16/9]'
                  }`}
                >
                  <video
                    key={currentView.url}
                    src={currentView.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none flex-wrap">
                    {/* Cover vs Material indicator */}
                    {currentView.isCover ? (
                      <span className="bg-[#89AACC] text-bg text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Portada Principal</span>
                      </span>
                    ) : (
                      <span className="bg-black/85 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <span>Material</span>
                      </span>
                    )}

                    {/* Format Badge (Reels, TikTok, Historia...) */}
                    {currentFormat && (
                      <span className="bg-black/85 backdrop-blur-md border border-[#89AACC]/50 text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Video className="w-3 h-3 text-[#89AACC]" />
                        <span className="capitalize font-semibold tracking-wide">
                          {currentFormat}
                        </span>
                      </span>
                    )}

                    {/* Semester Date Badge (e.g. 2026-1, 2025-2) */}
                    {currentView.date && (
                      <span className="bg-black/85 backdrop-blur-md border border-white/20 text-[#89AACC] text-[11px] font-mono font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Calendar className="w-3 h-3 text-[#89AACC]" />
                        <span>{currentView.date}</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-stroke/70 bg-black flex items-center justify-center shadow-lg">
                  <img
                    key={currentView.url}
                    src={currentView.url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="halftone-overlay absolute inset-0 opacity-15 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none flex-wrap">
                    {currentView.isCover ? (
                      <span className="bg-[#89AACC] text-bg text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Portada Principal</span>
                      </span>
                    ) : (
                      <span className="bg-black/85 backdrop-blur-md border border-emerald-500/40 text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <ImageIcon className="w-3 h-3 text-emerald-400" />
                        <span className="font-semibold tracking-wide">Foto</span>
                      </span>
                    )}

                    {/* Semester Date Badge */}
                    {currentView.date && (
                      <span className="bg-black/85 backdrop-blur-md border border-white/20 text-[#89AACC] text-[11px] font-mono font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Calendar className="w-3 h-3 text-[#89AACC]" />
                        <span>{currentView.date}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN DESLIZABLE DE MATERIAL DEL PROYECTO */}
            {materialItems.length > 0 && (
              <div className="space-y-3 pt-1">
                {/* Header of Material with Slide Controls and View Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stroke/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#89AACC] font-semibold block">
                      Material del Proyecto ({materialItems.length} {materialItems.length === 1 ? 'archivo' : 'archivos'})
                    </span>
                    <span className="text-[11px] text-muted hidden md:inline">
                      • Deslizable horizontalmente
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Return to Cover action if viewing a material item */}
                    {!currentView.isCover && (
                      <button
                        type="button"
                        onClick={handleSelectCover}
                        className="text-xs text-[#89AACC] hover:text-white underline cursor-pointer flex items-center gap-1 transition-colors font-medium mr-1"
                        title="Volver a la portada del proyecto"
                      >
                        <span>← Volver a Portada</span>
                      </button>
                    )}

                    {/* View Switcher: Carrusel Deslizable vs Cuadrícula */}
                    <div className="flex items-center bg-bg/70 p-0.5 rounded-lg border border-stroke/60 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setViewMode('slider')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          viewMode === 'slider'
                            ? 'bg-[#89AACC] text-bg font-semibold'
                            : 'text-muted hover:text-white'
                        }`}
                        title="Ver carrusel deslizable con flechas"
                      >
                        <Film className="w-3 h-3" />
                        <span>Deslizable</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          viewMode === 'grid'
                            ? 'bg-[#89AACC] text-bg font-semibold'
                            : 'text-muted hover:text-white'
                        }`}
                        title="Ver todo en cuadrícula completa"
                      >
                        <LayoutGrid className="w-3 h-3" />
                        <span>Cuadrícula</span>
                      </button>
                    </div>

                    {/* Slider Navigation Buttons (Anterior / Siguiente) */}
                    {viewMode === 'slider' && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => scrollSlider('left')}
                          disabled={!canScrollLeft}
                          aria-label="Deslizar hacia la izquierda"
                          className="w-7 h-7 rounded-full bg-surface border border-stroke flex items-center justify-center text-text-primary hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollSlider('right')}
                          disabled={!canScrollRight}
                          aria-label="Deslizar hacia la derecha"
                          className="w-7 h-7 rounded-full bg-surface border border-stroke flex items-center justify-center text-text-primary hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* VISTA 1: CARRUSEL DESLIZABLE FLUIDO (CON FLECHAS, RUEDA DEL RATÓN Y ARRASTRE) */}
                {viewMode === 'slider' ? (
                  <div className="relative group">
                    {/* Left Floating Arrow overlay for fast click */}
                    {canScrollLeft && (
                      <button
                        type="button"
                        onClick={() => scrollSlider('left')}
                        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#89AACC] hover:text-black transition-all shadow-xl cursor-pointer"
                        title="Deslizar a la izquierda"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}

                    {/* Right Floating Arrow overlay for fast click */}
                    {canScrollRight && (
                      <button
                        type="button"
                        onClick={() => scrollSlider('right')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#89AACC] hover:text-black transition-all shadow-xl cursor-pointer"
                        title="Deslizar a la derecha"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Scroll Track container */}
                    <div
                      ref={sliderRef}
                      onWheel={handleSliderWheel}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUpOrLeave}
                      onMouseLeave={handleMouseUpOrLeave}
                      className="flex items-center gap-3.5 overflow-x-auto pb-3 pt-1 px-1 scroll-smooth cursor-grab active:cursor-grabbing select-none scrollbar-thin scrollbar-thumb-[#89AACC]/40 hover:scrollbar-thumb-[#89AACC]/80 scrollbar-track-black/30"
                      style={{ scrollSnapType: 'x proximity' }}
                    >
                      {materialItems.map((item, idx) => {
                        const isSelected = !currentView.isCover && currentView.url === item.url;
                        return (
                          <div
                            key={item.id || `mat-${idx}`}
                            onClick={() => {
                              if (!hasDraggedRef.current) {
                                if (isSelected) {
                                  handleSelectCover();
                                } else {
                                  handleSelectMaterial(item);
                                }
                              }
                            }}
                            style={{ scrollSnapAlign: 'start' }}
                            className={`relative w-40 sm:w-48 h-28 rounded-2xl overflow-hidden border shrink-0 cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'border-[#89AACC] ring-2 ring-[#89AACC] scale-105 shadow-2xl z-10'
                                : 'border-stroke opacity-80 hover:opacity-100 hover:border-stroke/90 hover:scale-[1.02]'
                            }`}
                          >
                            {item.type === 'video' ? (
                              <div className="w-full h-full bg-neutral-900 flex items-center justify-center relative">
                                <video
                                  src={item.url}
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover pointer-events-none"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Play className="w-5 h-5 text-white/90" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={item.url}
                                alt={item.name || 'Material'}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                            )}

                            {/* Top-left format badge (Reels, TikTok, Historia...) */}
                            <span className="absolute top-1.5 left-1.5 bg-black/85 text-[9px] text-white px-2 py-0.5 rounded-full capitalize font-semibold shadow-sm flex items-center gap-1 pointer-events-none">
                              {item.type === 'video' ? (
                                <Video className="w-2.5 h-2.5 text-[#89AACC]" />
                              ) : (
                                <ImageIcon className="w-2.5 h-2.5 text-emerald-400" />
                              )}
                              <span>{item.type === 'video' ? (item.videoFormat || 'Video') : 'Foto'}</span>
                            </span>

                            {/* Bottom banner: Semester Date (ej: 2026-1, 2025-2) */}
                            <div className="absolute inset-x-0 bottom-0 bg-black/85 backdrop-blur-sm p-1.5 flex items-center justify-between pointer-events-none">
                              <span className="text-[10px] text-white/90 font-medium truncate max-w-[90px]">
                                {item.name || (item.type === 'video' ? 'Video' : 'Fotografía')}
                              </span>
                              <span className="text-[9px] text-[#89AACC] font-mono font-bold bg-[#89AACC]/15 px-1.5 py-0.5 rounded border border-[#89AACC]/30">
                                {item.date || project.year}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted pt-1 px-1">
                      <span>Arrastra o utiliza las flechas para explorar los {materialItems.length} archivos</span>
                      <span className="font-mono text-[#89AACC]">Deslizable activo</span>
                    </div>
                  </div>
                ) : (
                  /* VISTA 2: CUADRÍCULA COMPLETA (SI HAY MUCHO MATERIAL Y QUIEREN VER TODO A LA VEZ) */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                    {materialItems.map((item, idx) => {
                      const isSelected = !currentView.isCover && currentView.url === item.url;
                      return (
                        <div
                          key={item.id || `grid-mat-${idx}`}
                          onClick={() => {
                            if (isSelected) {
                              handleSelectCover();
                            } else {
                              handleSelectMaterial(item);
                            }
                          }}
                          className={`relative aspect-video rounded-xl overflow-hidden border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#89AACC] ring-2 ring-[#89AACC] shadow-lg'
                              : 'border-stroke opacity-80 hover:opacity-100 hover:border-stroke/90'
                          }`}
                        >
                          {item.type === 'video' ? (
                            <div className="w-full h-full bg-neutral-900 flex items-center justify-center relative">
                              <video
                                src={item.url}
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.name || 'Material'}
                              className="w-full h-full object-cover"
                            />
                          )}

                          <span className="absolute top-1 left-1 bg-black/85 text-[8px] text-white px-1.5 py-0.5 rounded capitalize">
                            {item.type === 'video' ? (item.videoFormat || 'Video') : 'Foto'}
                          </span>

                          <span className="absolute bottom-1 right-1 bg-black/90 text-[8px] text-[#89AACC] font-mono px-1.5 py-0.5 rounded">
                            {item.date || project.year}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ONLY: Fecha, Título y Etiquetas */}
            <div className="space-y-4 pt-4 border-t border-stroke/70">
              {/* Fecha */}
              <div className="flex items-center gap-2 text-xs text-[#89AACC] font-mono font-medium">
                <Calendar className="w-4 h-4 text-[#89AACC]" />
                <span className="tracking-wider">{project.year}</span>
              </div>

              {/* Título */}
              <h2 className="text-3xl sm:text-5xl font-display italic text-text-primary leading-tight">
                {project.title}
              </h2>

              {/* Etiquetas */}
              <div className="pt-2">
                <span className="text-[11px] uppercase tracking-wider text-muted font-medium block mb-2">
                  Etiquetas del Proyecto
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-surface border border-stroke text-text-primary/90 font-medium shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
