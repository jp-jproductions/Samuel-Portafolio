import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Camera,
  Plus,
  Trash2,
  Upload,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { Exploration, VisualLabConfig } from '../types';
import { EXPLORATIONS as DEFAULT_EXPLORATIONS } from '../data/portfolioData';
import { storeMediaFile } from '../utils/mediaStorage';

interface ExplorationsGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  explorations: Exploration[];
  config?: VisualLabConfig;
  onSaveExplorations?: (updated: Exploration[]) => void;
  onResetExplorations?: () => void;
  onOpenEdit?: () => void;
  isAdmin?: boolean;
}

export const ExplorationsGalleryModal: React.FC<ExplorationsGalleryModalProps> = ({
  isOpen,
  onClose,
  explorations = DEFAULT_EXPLORATIONS,
  config,
  onSaveExplorations,
  onResetExplorations,
  onOpenEdit,
  isAdmin = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedExplorationIndex, setSelectedExplorationIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New item draft
  const [newTitle, setNewTitle] = useState('');
  const [newMedium, setNewMedium] = useState('');
  const [newCategory, setNewCategory] = useState('Automotriz');
  const [newYear, setNewYear] = useState('2026');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedExplorationIndex !== null) {
        if (e.key === 'Escape') {
          setSelectedExplorationIndex(null);
        } else if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          handlePrev();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedExplorationIndex]);

  if (!isOpen) return null;

  // Filter items
  const filteredItems =
    activeCategory === 'all'
      ? explorations
      : explorations.filter((item) => {
          if (!item.category) return false;
          return item.category.toLowerCase().includes(activeCategory.toLowerCase());
        });

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'automotriz', label: 'Automotriz' },
    { id: 'fotografía', label: 'Fotografía & Viajes' },
    { id: 'branding', label: 'Branding & EAFIT' },
    { id: '3d', label: '3D & Experimentos' },
  ];

  const handleNext = () => {
    if (selectedExplorationIndex === null) return;
    const nextIdx = (selectedExplorationIndex + 1) % filteredItems.length;
    setSelectedExplorationIndex(nextIdx);
  };

  const handlePrev = () => {
    if (selectedExplorationIndex === null) return;
    const prevIdx =
      (selectedExplorationIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedExplorationIndex(prevIdx);
  };

  // Upload file for new exploration
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const stored = await storeMediaFile(file);
      setNewImageUrl(stored.url);
      if (!newTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewTitle(cleanName);
      }
    } catch (err) {
      console.error('Error subiendo imagen:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Add new exploration
  const handleAddExploration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl || !newTitle.trim()) return;

    const newItem: Exploration = {
      id: `exp-${Date.now()}`,
      title: newTitle.trim(),
      medium: newMedium.trim() || 'Fotografía & Dirección de Arte',
      category: newCategory,
      year: newYear.trim() || '2026',
      image: newImageUrl,
      rotation: 'rotate-0',
      description:
        newDescription.trim() ||
        'Exploración visual desarrollada para el laboratorio creativo de Samuel Restrepo.',
    };

    const updated = [newItem, ...explorations];
    if (onSaveExplorations) {
      onSaveExplorations(updated);
    }

    // Reset draft
    setNewTitle('');
    setNewMedium('');
    setNewDescription('');
    setNewImageUrl('');
    setShowAddForm(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Delete exploration (admin only)
  const handleDeleteExploration = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Deseas eliminar esta exploración de la galería?')) return;
    const updated = explorations.filter((item) => item.id !== id);
    if (onSaveExplorations) {
      onSaveExplorations(updated);
    }
  };

  const activeLightboxItem =
    selectedExplorationIndex !== null ? filteredItems[selectedExplorationIndex] : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Main Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 18 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full max-w-6xl max-h-[92vh] bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-stroke/70 bg-surface/95 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full accent-gradient animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-[#89AACC] font-medium">
                  Laboratorio Visual • Galería & Archivo Fotográfico
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stroke/60 text-muted">
                  {filteredItems.length} {filteredItems.length === 1 ? 'foto' : 'fotos'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display italic text-text-primary">
                Galería de Exploraciones
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-0.5 max-w-xl">
                Bocetos automotrices, crónicas fotográficas de viaje, activaciones de marca y experimentos visuales.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {/* Instagram link */}
              <a
                href={config?.instagramUrl || "https://www.instagram.com/rr14samuel"}
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs text-text-primary border border-stroke bg-bg/50 hover:bg-white/10 transition-colors"
                title="Visitar perfil de Instagram"
              >
                <span>Instagram @rr14samuel</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
              </a>

              {/* Admin: Modify entire Visual Lab & Photos */}
              {isAdmin && onOpenEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEdit();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white border border-[#89AACC]/50 bg-[#89AACC]/20 hover:bg-[#89AACC]/30 transition-colors cursor-pointer shadow-sm"
                  title="Modificar fotos, orden y textos del Laboratorio Visual"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#89AACC]" />
                  <span>Modificar Apartado</span>
                </button>
              )}

              {/* Admin: Add photo button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white accent-gradient hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Subir Foto</span>
                </button>
              )}

              {/* Reset to defaults (admin only) */}
              {isAdmin && onResetExplorations && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Restablecer la galería a las fotos originales?')) {
                      onResetExplorations();
                    }
                  }}
                  title="Restablecer galería original"
                  className="w-8 h-8 rounded-full border border-stroke bg-bg/50 hover:bg-white/10 flex items-center justify-center text-muted hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar galería"
                className="w-9 h-9 rounded-full bg-stroke/60 border border-stroke flex items-center justify-center text-text-primary hover:bg-white hover:text-black transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admin Upload / Add Exploration Drawer */}
          <AnimatePresence>
            {isAdmin && showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-stroke/80 bg-bg/95 p-5 overflow-hidden"
              >
                <form onSubmit={handleAddExploration} className="max-w-4xl mx-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#89AACC] uppercase tracking-wider flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Agregar Nueva Foto al Laboratorio Visual
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-muted hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">
                        Título de la foto *
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ej. Estudio de Alerón GT"
                        className="w-full bg-surface border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">
                        Técnica / Medio
                      </label>
                      <input
                        type="text"
                        value={newMedium}
                        onChange={(e) => setNewMedium(e.target.value)}
                        placeholder="Ej. Render 3D & Fotografía"
                        className="w-full bg-surface border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">
                          Categoría
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full bg-surface border border-stroke rounded-xl px-2.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                        >
                          <option value="Automotriz">Automotriz</option>
                          <option value="Fotografía & Viajes">Fotografía & Viajes</option>
                          <option value="Branding & EAFIT">Branding & EAFIT</option>
                          <option value="3D & Experimentos">3D & Experimentos</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">
                          Año
                        </label>
                        <input
                          type="text"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          placeholder="2026"
                          className="w-full bg-surface border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-muted uppercase tracking-wider mb-1">
                      Descripción breve
                    </label>
                    <textarea
                      rows={2}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Explica el contexto visual, detalles técnicos o anécdota..."
                      className="w-full bg-surface border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC] resize-none"
                    />
                  </div>

                  {/* Image source: File upload or URL */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/quicktime,video/mp4"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-stroke bg-surface hover:bg-stroke/60 text-xs text-text-primary transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#89AACC]" />
                      <span>{isUploading ? 'Subiendo archivo...' : 'Seleccionar archivo local (.jpg, .mov, etc.)'}</span>
                    </button>

                    <span className="text-xs text-muted">o ingresa URL:</span>

                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 w-full bg-surface border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                    />

                    <button
                      type="submit"
                      disabled={!newImageUrl || !newTitle.trim()}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-medium text-white accent-gradient disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Publicar en Laboratorio</span>
                    </button>
                  </div>

                  {/* Preview if image selected */}
                  {newImageUrl && (
                    <div className="flex items-center gap-3 p-2 bg-surface rounded-xl border border-stroke/70">
                      <img
                        src={newImageUrl}
                        alt="Vista previa"
                        className="w-12 h-12 rounded-lg object-cover border border-stroke"
                      />
                      <span className="text-xs text-text-primary truncate">{newTitle || 'Imagen cargada con éxito'}</span>
                    </div>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Pills */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-stroke/40 bg-surface/50 overflow-x-auto text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted shrink-0 mr-1" />
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'accent-gradient text-white shadow-sm'
                        : 'bg-stroke/40 text-muted hover:text-text-primary hover:bg-stroke/70'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 shrink-0 ml-4 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Guardado
              </span>
            )}
          </div>

          {/* Gallery Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {filteredItems.length === 0 ? (
              <div className="py-20 text-center text-muted text-sm">
                No hay fotos en esta categoría actualmente.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    onClick={() => setSelectedExplorationIndex(idx)}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-bg border border-stroke/80 cursor-pointer shadow-lg hover:border-[#89AACC]/60 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  >
                    {/* Image */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#89AACC] border border-white/10">
                        {item.category || 'Visual'}
                      </span>

                      <span className="text-[10px] font-mono text-white/70 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                        {item.year}
                      </span>
                    </div>

                    {/* Delete button (Admin only) */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteExploration(item.id, e)}
                        title="Eliminar de la galería"
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md z-20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Bottom Caption */}
                    <div className="absolute bottom-0 inset-x-0 p-4 transition-transform duration-300">
                      <div className="text-[10px] text-muted uppercase tracking-wider mb-0.5 line-clamp-1">
                        {item.medium}
                      </div>
                      <h4 className="font-display italic text-lg sm:text-xl text-white leading-tight mb-1 group-hover:text-[#89AACC] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-gray-300 line-clamp-2 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.description}
                      </p>
                    </div>

                    {/* Hover expand hint icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                        <Eye className="w-5 h-5 text-[#89AACC]" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 px-6 border-t border-stroke/70 bg-surface/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#89AACC]" />
              <span>Haz clic en cualquier imagen para verla en pantalla completa con sus detalles.</span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/rr14samuel"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary transition-colors flex items-center gap-1"
              >
                <span>Instagram: @rr14samuel</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <span className="text-stroke">•</span>
              <span>Medellín, Colombia</span>
            </div>
          </div>
        </motion.div>

        {/* Lightbox / Full-screen Image Inspector */}
        <AnimatePresence>
          {activeLightboxItem && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 select-none">
              {/* Darker backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedExplorationIndex(null)}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedExplorationIndex(null)}
                aria-label="Cerrar vista ampliada"
                className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-2xl"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev Button */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Foto anterior"
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer backdrop-blur-md shadow-2xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Siguiente foto"
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer backdrop-blur-md shadow-2xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Lightbox Content Container */}
              <motion.div
                key={activeLightboxItem.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.25 }}
                className="relative z-10 max-w-4xl w-full max-h-[90vh] flex flex-col bg-surface border border-stroke rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Photo Header */}
                <div className="flex items-center justify-between p-4 px-6 border-b border-stroke/70 bg-surface/90">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] uppercase tracking-widest text-[#89AACC] font-semibold">
                      {activeLightboxItem.category || 'Laboratorio'} • {activeLightboxItem.year}
                    </span>
                    <span className="text-stroke">•</span>
                    <span className="text-xs text-muted font-medium">
                      {activeLightboxItem.medium}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-muted bg-stroke/50 px-2.5 py-1 rounded-full">
                    {String((selectedExplorationIndex ?? 0) + 1).padStart(2, '0')} /{' '}
                    {String(filteredItems.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Main Large Visual */}
                <div className="relative flex-1 min-h-[350px] max-h-[58vh] bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={activeLightboxItem.image}
                    alt={activeLightboxItem.title}
                    className="max-h-[58vh] w-auto max-w-full object-contain mx-auto"
                  />
                  <div className="halftone-overlay absolute inset-0 opacity-15 pointer-events-none" />
                </div>

                {/* Photo Description Footer */}
                <div className="p-5 sm:p-6 bg-surface border-t border-stroke/70">
                  <h3 className="font-display italic text-2xl sm:text-3xl text-text-primary mb-2">
                    {activeLightboxItem.title}
                  </h3>
                  <p className="text-sm text-muted font-light leading-relaxed max-w-2xl">
                    {activeLightboxItem.description}
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
