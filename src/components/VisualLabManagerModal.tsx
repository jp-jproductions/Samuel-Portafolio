import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Edit2,
  Eye,
  Camera,
  Layers,
  FileText,
  Sliders,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { Exploration, VisualLabConfig } from '../types';
import { EXPLORATIONS as DEFAULT_EXPLORATIONS, DEFAULT_VISUAL_LAB_CONFIG } from '../data/portfolioData';
import { storeMediaFile } from '../utils/mediaStorage';

interface VisualLabManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  explorations: Exploration[];
  visualLabConfig: VisualLabConfig;
  onSaveExplorations: (updated: Exploration[]) => void;
  onSaveConfig: (updated: VisualLabConfig) => void;
  onResetAll?: () => void;
  onOpenPublicGallery?: () => void;
}

export const VisualLabManagerModal: React.FC<VisualLabManagerModalProps> = ({
  isOpen,
  onClose,
  explorations = DEFAULT_EXPLORATIONS,
  visualLabConfig = DEFAULT_VISUAL_LAB_CONFIG,
  onSaveExplorations,
  onSaveConfig,
  onResetAll,
  onOpenPublicGallery,
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'config'>('photos');
  const [draftExplorations, setDraftExplorations] = useState<Exploration[]>(explorations);
  const [draftConfig, setDraftConfig] = useState<VisualLabConfig>(visualLabConfig);

  // States for adding / editing
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Add draft state
  const [newTitle, setNewTitle] = useState('');
  const [newMedium, setNewMedium] = useState('');
  const [newCategory, setNewCategory] = useState('Automotriz');
  const [newYear, setNewYear] = useState('2026');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newRotation, setNewRotation] = useState('rotate-0');

  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  // Sync draft on open or prop change
  useEffect(() => {
    setDraftExplorations(explorations);
    setDraftConfig(visualLabConfig);
  }, [explorations, visualLabConfig, isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (editingItemId) {
          setEditingItemId(null);
        } else if (showAddForm) {
          setShowAddForm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, editingItemId, showAddForm, onClose]);

  if (!isOpen) return null;

  // Handle uploading new image from computer
  const handleUploadNewFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (addFileInputRef.current) addFileInputRef.current.value = '';
    }
  };

  // Handle replacing existing image with a new local file
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTargetId) return;

    try {
      setIsUploading(true);
      const stored = await storeMediaFile(file);
      setDraftExplorations((prev) =>
        prev.map((item) => (item.id === replaceTargetId ? { ...item, image: stored.url } : item))
      );
    } catch (err) {
      console.error('Error reemplazando imagen:', err);
    } finally {
      setIsUploading(false);
      setReplaceTargetId(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // Submit new exploration
  const handleCreateExploration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim() || !newTitle.trim()) return;

    const newItem: Exploration = {
      id: `exp-${Date.now()}`,
      title: newTitle.trim(),
      medium: newMedium.trim() || 'Fotografía & Dirección Creativa',
      category: newCategory,
      year: newYear.trim() || '2026',
      image: newImageUrl.trim(),
      rotation: newRotation,
      description:
        newDescription.trim() ||
        'Obra visual del laboratorio creativo y experimental de Samuel Restrepo.',
    };

    setDraftExplorations([newItem, ...draftExplorations]);

    // Reset draft form
    setNewTitle('');
    setNewMedium('');
    setNewCategory('Automotriz');
    setNewYear('2026');
    setNewDescription('');
    setNewImageUrl('');
    setNewRotation('rotate-0');
    setShowAddForm(false);
  };

  // Reorder explorations
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...draftExplorations];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);
    setDraftExplorations(newItems);
  };

  // Delete exploration
  const handleDeleteItem = (id: string) => {
    setDraftExplorations((prev) => prev.filter((item) => item.id !== id));
    if (editingItemId === id) setEditingItemId(null);
  };

  // Update item in draft
  const updateItem = (id: string, updates: Partial<Exploration>) => {
    setDraftExplorations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Save all changes
  const handleSaveAll = () => {
    onSaveExplorations(draftExplorations);
    onSaveConfig(draftConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Reset to original defaults
  const handleResetToDefaults = () => {
    if (onResetAll) {
      onResetAll();
    } else {
      setDraftExplorations(DEFAULT_EXPLORATIONS);
      setDraftConfig(DEFAULT_VISUAL_LAB_CONFIG);
      onSaveExplorations(DEFAULT_EXPLORATIONS);
      onSaveConfig(DEFAULT_VISUAL_LAB_CONFIG);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Filtered list for display
  const filteredExplorations =
    categoryFilter === 'all'
      ? draftExplorations
      : draftExplorations.filter((i) =>
          i.category?.toLowerCase().includes(categoryFilter.toLowerCase())
        );

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'automotriz', label: 'Automotriz' },
    { id: 'fotografía', label: 'Fotografía & Viajes' },
    { id: 'branding', label: 'Branding & EAFIT' },
    { id: '3d', label: '3D & Experimentos' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={addFileInputRef}
          onChange={handleUploadNewFile}
          accept="image/*,video/quicktime,video/mp4"
          className="hidden"
        />
        <input
          type="file"
          ref={replaceFileInputRef}
          onChange={handleReplaceFile}
          accept="image/*,video/quicktime,video/mp4"
          className="hidden"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-5xl h-[92vh] max-h-[92vh] bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col shadow-2xl my-auto"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-stroke/70 bg-surface/95 backdrop-blur-md shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#89AACC] animate-pulse" />
                <span className="text-[11px] uppercase tracking-widest text-[#89AACC] font-semibold">
                  Panel de Administrador • Samuel Restrepo
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stroke/60 text-muted">
                  {draftExplorations.length} fotos
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display italic text-text-primary flex items-center gap-2">
                <span>Modificar Laboratorio Visual &amp; Fotos</span>
              </h2>
              <p className="text-xs text-muted mt-0.5 max-w-xl">
                Personaliza los textos del apartado, sube nuevas fotos, edita títulos, categorías y el orden de aparición.
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
              {/* Direct Add Photo Button in Header */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('photos');
                  setShowAddForm(true);
                  setTimeout(() => {
                    document.getElementById('add-photo-form')?.scrollIntoView({ behavior: 'smooth' });
                  }, 120);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#89AACC] border border-[#89AACC]/40 bg-[#89AACC]/15 hover:bg-[#89AACC]/25 transition-colors cursor-pointer shadow-sm"
                title="Agregar una nueva foto al Laboratorio Visual"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Subir Foto</span>
              </button>

              {/* Preview Public Gallery */}
              {onOpenPublicGallery && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPublicGallery();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-text-primary border border-stroke bg-bg/50 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Abrir galería pública para previsualizar"
                >
                  <Eye className="w-3.5 h-3.5 text-[#89AACC]" />
                  <span className="hidden sm:inline">Ver Galería</span>
                </button>
              )}

              {/* Reset Defaults */}
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted hover:text-white border border-stroke/60 bg-bg/40 hover:bg-white/10 transition-colors cursor-pointer"
                title="Restablecer a valores iniciales"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Restablecer</span>
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveAll}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white accent-gradient hover:opacity-90 transition-opacity cursor-pointer shadow-md"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>¡Guardado!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="w-8 h-8 rounded-full bg-stroke/60 border border-stroke flex items-center justify-center text-text-primary hover:bg-white hover:text-black transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-stroke/50 bg-bg/40 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-[#89AACC]/20 text-white border border-[#89AACC]/40 shadow-sm'
                  : 'text-muted hover:text-text-primary hover:bg-stroke/40'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-[#89AACC]" />
              <span>Fotos &amp; Exploraciones ({draftExplorations.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-[#89AACC]/20 text-white border border-[#89AACC]/40 shadow-sm'
                  : 'text-muted hover:text-text-primary hover:bg-stroke/40'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#89AACC]" />
              <span>Textos &amp; Configuración del Apartado</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 overscroll-contain scrollbar-thin scrollbar-thumb-[#89AACC]/40 hover:scrollbar-thumb-[#89AACC]/70 scrollbar-track-black/40">
            {activeTab === 'photos' ? (
              <div className="space-y-6">
                {/* Parallax Info Banner */}
                <div className="p-3.5 rounded-2xl bg-[#89AACC]/10 border border-[#89AACC]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-text-primary">
                    <Layers className="w-4 h-4 text-[#89AACC] shrink-0" />
                    <div>
                      <span className="font-semibold text-white">Efecto Parallax en Página Principal:</span>{' '}
                      <span className="text-muted">
                        Las fotos <strong className="text-white">#01 a #03</strong> flotan en la columna izquierda y las fotos <strong className="text-white">#04 a #06</strong> en la derecha. Todas están disponibles en la galería extendida.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !showAddForm;
                      setShowAddForm(next);
                      if (next) {
                        setTimeout(() => {
                          document.getElementById('add-photo-form')?.scrollIntoView({ behavior: 'smooth' });
                        }, 120);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white accent-gradient hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddForm ? 'Cerrar Formulario' : 'Subir Nueva Foto'}</span>
                  </button>
                </div>

                {/* Form to Add New Exploration */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.form
                      id="add-photo-form"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      onSubmit={handleCreateExploration}
                      className="p-5 sm:p-6 rounded-2xl bg-bg border border-[#89AACC]/40 space-y-4 shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-stroke pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#89AACC]" />
                          <h4 className="text-sm font-semibold text-white">
                            Subir Nueva Foto al Laboratorio Visual
                          </h4>
                        </div>
                        <span className="text-[11px] text-[#89AACC] font-medium bg-[#89AACC]/15 px-2.5 py-0.5 rounded-full border border-[#89AACC]/30">
                          Aparecerá en la posición #01
                        </span>
                      </div>

                      {/* Big Clickable Upload Dropzone */}
                      <div
                        onClick={() => addFileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#89AACC]/50 hover:border-[#89AACC] rounded-2xl p-6 text-center cursor-pointer bg-surface/60 hover:bg-[#89AACC]/10 transition-all flex flex-col items-center justify-center gap-2.5 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#89AACC]/15 border border-[#89AACC]/30 flex items-center justify-center text-[#89AACC] group-hover:scale-110 transition-transform shadow-md">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            {isUploading ? 'Subiendo archivo...' : 'Haz clic aquí para seleccionar y subir tu foto (.JPEG, .PNG, .WEBP) o video'}
                          </span>
                          <span className="text-[11px] text-muted">
                            Formatos soportados: JPG, PNG, WEBP, MOV, MP4
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* Title */}
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                            Título de la Obra *
                          </label>
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Ej. Render Bólido GT 2026..."
                            required
                            className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                          />
                        </div>

                        {/* Medium / Technique */}
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                            Medio / Técnica
                          </label>
                          <input
                            type="text"
                            value={newMedium}
                            onChange={(e) => setNewMedium(e.target.value)}
                            placeholder="Ej. Bocetos & CGI Automotriz..."
                            className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                            Categoría
                          </label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                          >
                            <option value="Automotriz">Automotriz</option>
                            <option value="Fotografía & Viajes">Fotografía &amp; Viajes</option>
                            <option value="Branding & EAFIT">Branding &amp; EAFIT</option>
                            <option value="3D & Experimentos">3D &amp; Experimentos</option>
                          </select>
                        </div>

                        {/* Year & Rotation */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                              Año
                            </label>
                            <input
                              type="text"
                              value={newYear}
                              onChange={(e) => setNewYear(e.target.value)}
                              placeholder="2026"
                              className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                              Inclinación Parallax
                            </label>
                            <select
                              value={newRotation}
                              onChange={(e) => setNewRotation(e.target.value)}
                              className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                            >
                              <option value="rotate-0">Recto (0°)</option>
                              <option value="-rotate-1">Inclinado Izquierda (-1°)</option>
                              <option value="-rotate-2">Inclinado Izquierda (-2°)</option>
                              <option value="rotate-1">Inclinado Derecha (1°)</option>
                              <option value="rotate-2">Inclinado Derecha (2°)</option>
                            </select>
                          </div>
                        </div>

                        {/* Direct URL Input */}
                        <div className="md:col-span-2">
                          <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                            Enlace o Archivo de la Imagen *
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/... o usa el botón de subir"
                              required
                              className="flex-1 bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                            />
                            <button
                              type="button"
                              onClick={() => addFileInputRef.current?.click()}
                              disabled={isUploading}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-stroke bg-surface hover:bg-white/10 text-white transition-colors cursor-pointer shrink-0"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#89AACC]" />
                              <span>{isUploading ? 'Subiendo...' : 'Seleccionar Archivo'}</span>
                            </button>
                          </div>
                          {newImageUrl && (
                            <div className="mt-2.5 flex items-center gap-3 p-2.5 rounded-xl bg-surface/60 border border-stroke/60">
                              <img
                                src={newImageUrl}
                                alt="Previsualización"
                                className="w-14 h-14 object-cover rounded-lg border border-stroke shrink-0"
                              />
                              <div className="text-[11px] text-muted overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                                <span className="text-white font-medium block">Imagen lista para agregar</span>
                                <span className="text-[10px] text-emerald-400">✓ Archivo cargado correctamente</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                          <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                            Descripción de la Exploración
                          </label>
                          <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Detalles del proceso creativo, render o captura..."
                            rows={2}
                            className="w-full bg-surface border border-stroke rounded-xl p-3 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-stroke/60">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-4 py-2 rounded-xl text-xs text-muted hover:text-white transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold text-white accent-gradient hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar a la Galería</span>
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Categories Filter Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors shrink-0 cursor-pointer ${
                        categoryFilter === cat.id
                          ? 'bg-text-primary text-bg font-semibold'
                          : 'bg-bg text-muted border border-stroke hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Photos List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExplorations.map((item, index) => {
                    const originalIndex = draftExplorations.findIndex((x) => x.id === item.id);
                    const isParallaxCol1 = originalIndex >= 0 && originalIndex < 3;
                    const isParallaxCol2 = originalIndex >= 3 && originalIndex < 6;
                    const isEditing = editingItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isEditing
                            ? 'bg-bg border-[#89AACC] shadow-lg shadow-[#89AACC]/5'
                            : 'bg-surface/80 border-stroke hover:border-stroke/80'
                        }`}
                      >
                        <div className="p-3.5 flex gap-3.5 items-start">
                          {/* Image preview & change trigger */}
                          <div className="relative group shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-stroke bg-bg">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setReplaceTargetId(item.id);
                                replaceFileInputRef.current?.click();
                              }}
                              title="Reemplazar con archivo local"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[9px] text-white font-medium cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#89AACC]" />
                              <span>Cambiar</span>
                            </button>
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/70 text-white">
                              #{String(originalIndex + 1).padStart(2, '0')}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {isParallaxCol1 && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-[#89AACC]/20 text-[#89AACC] border border-[#89AACC]/30">
                                  Columna Izquierda (Parallax)
                                </span>
                              )}
                              {isParallaxCol2 && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  Columna Derecha (Parallax)
                                </span>
                              )}
                              {!isParallaxCol1 && !isParallaxCol2 && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-stroke/60 text-muted">
                                  Galería Extendida
                                </span>
                              )}
                              {item.category && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-bg border border-stroke text-muted">
                                  {item.category}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-semibold text-text-primary truncate">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-muted truncate mt-0.5">
                              {item.medium} • {item.year}
                            </p>
                            <p className="text-[11px] text-text-secondary line-clamp-1 mt-1">
                              {item.description}
                            </p>
                          </div>

                          {/* Order & action buttons */}
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveItem(originalIndex, 'up')}
                              disabled={originalIndex === 0}
                              title="Mover antes en la galería"
                              className="w-7 h-7 rounded-lg border border-stroke/60 bg-bg/40 flex items-center justify-center text-muted hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(originalIndex, 'down')}
                              disabled={originalIndex === draftExplorations.length - 1}
                              title="Mover después en la galería"
                              className="w-7 h-7 rounded-lg border border-stroke/60 bg-bg/40 flex items-center justify-center text-muted hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingItemId(isEditing ? null : item.id)}
                              title={isEditing ? 'Cerrar edición' : 'Editar datos'}
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                                isEditing
                                  ? 'bg-[#89AACC] text-black border-[#89AACC]'
                                  : 'border-stroke/60 bg-bg/40 text-muted hover:text-white'
                              }`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              title="Eliminar de la galería"
                              className="w-7 h-7 rounded-lg border border-red-500/20 bg-red-500/10 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Item Editor */}
                        <AnimatePresence>
                          {isEditing && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-4 border-t border-stroke/70 bg-bg/70 space-y-3"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
                                    Título
                                  </label>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                    className="w-full bg-surface border border-stroke rounded-xl px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
                                    Medio / Técnica
                                  </label>
                                  <input
                                    type="text"
                                    value={item.medium}
                                    onChange={(e) => updateItem(item.id, { medium: e.target.value })}
                                    className="w-full bg-surface border border-stroke rounded-xl px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
                                    Categoría
                                  </label>
                                  <input
                                    type="text"
                                    value={item.category || ''}
                                    onChange={(e) => updateItem(item.id, { category: e.target.value })}
                                    placeholder="Automotriz, Fotografía, Branding, 3D..."
                                    className="w-full bg-surface border border-stroke rounded-xl px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
                                      Año
                                    </label>
                                    <input
                                      type="text"
                                      value={item.year}
                                      onChange={(e) => updateItem(item.id, { year: e.target.value })}
                                      className="w-full bg-surface border border-stroke rounded-xl px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
                                      Inclinación
                                    </label>
                                    <select
                                      value={item.rotation}
                                      onChange={(e) => updateItem(item.id, { rotation: e.target.value })}
                                      className="w-full bg-surface border border-stroke rounded-xl px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                                    >
                                      <option value="rotate-0">Recto (0°)</option>
                                      <option value="-rotate-1">-1°</option>
                                      <option value="-rotate-2">-2°</option>
                                      <option value="rotate-1">+1°</option>
                                      <option value="rotate-2">+2°</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
                                    URL de Imagen o Reemplazar
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={item.image}
                                      onChange={(e) => updateItem(item.id, { image: e.target.value })}
                                      className="flex-1 bg-surface border border-stroke rounded-xl px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplaceTargetId(item.id);
                                        replaceFileInputRef.current?.click();
                                      }}
                                      className="px-3 py-1.5 rounded-xl text-xs font-medium border border-stroke bg-surface hover:bg-white/10 text-white transition-colors cursor-pointer shrink-0"
                                    >
                                      Subir Archivo
                                    </button>
                                  </div>
                                </div>

                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">
                                    Descripción Detallada
                                  </label>
                                  <textarea
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                    rows={2}
                                    className="w-full bg-surface border border-stroke rounded-xl px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="px-3 py-1 rounded-lg text-xs font-medium bg-[#89AACC]/20 text-white border border-[#89AACC]/40 hover:bg-[#89AACC]/30 transition-colors cursor-pointer"
                                >
                                  Listo
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TAB 2: TEXTOS Y CONFIGURACIÓN DEL APARTADO */
              <div className="space-y-6 max-w-3xl mx-auto">
                {/* Live Section Header Preview */}
                <div className="p-6 rounded-3xl bg-bg border border-stroke/80 text-center relative overflow-hidden shadow-inner">
                  <div className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#89AACC]">
                    Vista Previa en Vivo
                  </div>

                  <div className="max-w-md mx-auto flex flex-col items-center">
                    {/* Eyebrow preview */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-6 h-px bg-stroke" />
                      <span className="text-[10px] text-muted uppercase tracking-[0.3em] font-medium">
                        {draftConfig.eyebrow || 'Exploraciones'}
                      </span>
                      <span className="w-6 h-px bg-stroke" />
                    </div>

                    {/* Heading preview */}
                    <h3 className="text-3xl sm:text-4xl font-light text-text-primary tracking-tight leading-none mb-3">
                      {draftConfig.titleMain || 'Laboratorio'}{' '}
                      <span className="font-display italic font-normal">
                        {draftConfig.titleItalic || 'visual'}
                      </span>
                    </h3>

                    {/* Subtext preview */}
                    <p className="text-xs text-muted max-w-sm leading-relaxed mb-4">
                      {draftConfig.description ||
                        'Bocetos automotrices, diarios de viaje fotográficos, activaciones de marca y experimentos gráficos en EAFIT.'}
                    </p>

                    {/* Button preview */}
                    <div className="inline-flex rounded-full p-[1px] accent-gradient shadow-md">
                      <div className="flex items-center gap-2 rounded-full text-[11px] font-semibold uppercase tracking-wider px-5 py-2 bg-surface text-text-primary border border-stroke">
                        <span>{draftConfig.buttonText || 'VER MÁS'}</span>
                        <span className="text-[#89AACC]">→</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="p-5 rounded-2xl bg-surface/60 border border-stroke space-y-4">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#89AACC]" />
                    <span>Personalizar Textos del Laboratorio Visual</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Eyebrow */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                        Subtítulo Superior (Eyebrow)
                      </label>
                      <input
                        type="text"
                        value={draftConfig.eyebrow}
                        onChange={(e) => setDraftConfig({ ...draftConfig, eyebrow: e.target.value })}
                        placeholder="Exploraciones"
                        className="w-full bg-bg border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                    </div>

                    {/* Button Text */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                        Texto del Botón Principal
                      </label>
                      <input
                        type="text"
                        value={draftConfig.buttonText}
                        onChange={(e) => setDraftConfig({ ...draftConfig, buttonText: e.target.value })}
                        placeholder="VER MÁS"
                        className="w-full bg-bg border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                    </div>

                    {/* Title Main */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                        Título Principal (Palabra Normal)
                      </label>
                      <input
                        type="text"
                        value={draftConfig.titleMain}
                        onChange={(e) => setDraftConfig({ ...draftConfig, titleMain: e.target.value })}
                        placeholder="Laboratorio"
                        className="w-full bg-bg border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                    </div>

                    {/* Title Italic */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                        Palabra Destacada (En Cursiva / Display)
                      </label>
                      <input
                        type="text"
                        value={draftConfig.titleItalic}
                        onChange={(e) => setDraftConfig({ ...draftConfig, titleItalic: e.target.value })}
                        placeholder="visual"
                        className="w-full bg-bg border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                    </div>

                    {/* Instagram Link */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                        Enlace de Instagram Vinculado
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={draftConfig.instagramUrl || ''}
                          onChange={(e) =>
                            setDraftConfig({ ...draftConfig, instagramUrl: e.target.value })
                          }
                          placeholder="https://www.instagram.com/rr14samuel"
                          className="flex-1 bg-bg border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                        />
                        {draftConfig.instagramUrl && (
                          <a
                            href={draftConfig.instagramUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-xl border border-stroke bg-bg hover:bg-white/10 text-muted hover:text-white flex items-center gap-1 text-xs"
                          >
                            <span>Probar</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider text-muted mb-1 font-medium">
                        Descripción / Subtexto de la Sección
                      </label>
                      <textarea
                        value={draftConfig.description}
                        onChange={(e) =>
                          setDraftConfig({ ...draftConfig, description: e.target.value })
                        }
                        rows={3}
                        placeholder="Bocetos automotrices, diarios de viaje fotográficos, activaciones de marca y experimentos gráficos en EAFIT."
                        className="w-full bg-bg border border-stroke rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:p-5 border-t border-stroke/70 bg-surface/95 backdrop-blur-md flex items-center justify-between gap-3 text-xs">
            <span className="text-muted text-[11px]">
              Tus fotos y textos se guardan de forma permanente en tu navegador para que los veas siempre actualizados.
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs text-muted hover:text-white transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold text-white accent-gradient hover:opacity-90 transition-opacity cursor-pointer shadow-md"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>¡Guardado con Éxito!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Guardar Todo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
