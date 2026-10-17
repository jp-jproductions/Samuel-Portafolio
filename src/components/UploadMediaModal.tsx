import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Check,
  Plus,
  RefreshCw,
  Sparkles,
  Play,
  Calendar,
  Tag,
  Smartphone,
  Tv,
  Film
} from 'lucide-react';
import { Project, ProjectMedia } from '../types';
import { storeMediaFile } from '../utils/mediaStorage';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSaveProjects: (updatedProjects: Project[]) => void;
  onResetProjects: () => void;
}

const COMMON_VIDEO_FORMATS = [
  { id: 'reels', label: 'Reels (9:16)', icon: Smartphone },
  { id: 'tiktok', label: 'TikTok (9:16)', icon: Smartphone },
  { id: 'historia', label: 'Historia (9:16)', icon: Smartphone },
  { id: 'horizontal', label: 'Horizontal (16:9)', icon: Tv },
  { id: 'cuadrado', label: 'Post Cuadrado (1:1)', icon: Film },
];

export const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSaveProjects,
  onResetProjects,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'media' | 'info' | 'instructions'>('media');
  const [newTagInput, setNewTagInput] = useState<string>('');

  // Local draft of projects being edited
  const [draftProjects, setDraftProjects] = useState<Project[]>(projects);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Sync draft when opened or external projects change
  React.useEffect(() => {
    setDraftProjects(projects);
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, isOpen]);

  if (!isOpen) return null;

  const currentProject = draftProjects.find((p) => p.id === selectedProjectId) || draftProjects[0];

  const updateCurrentProject = (updates: Partial<Project>) => {
    setDraftProjects((prev) =>
      prev.map((p) => (p.id === currentProject?.id ? { ...p, ...updates } : p))
    );
  };

  // Handle Cover Photo or Video upload (supports .MOV, .MP4, .JPEG, .PNG, etc.)
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    try {
      const stored = await storeMediaFile(file);
      let updatedDraft: Project[] = [];

      if (stored.type === 'video') {
        setDraftProjects((prev) => {
          const next = prev.map((p) =>
            p.id === currentProject?.id
              ? {
                  ...p,
                  videoUrl: stored.url,
                  mediaType: 'video' as const,
                  videoFormat: currentProject.videoFormat || 'reels',
                }
              : p
          );
          updatedDraft = next;
          return next;
        });
      } else {
        setDraftProjects((prev) => {
          const next = prev.map((p) =>
            p.id === currentProject?.id
              ? {
                  ...p,
                  image: stored.url,
                  mediaType: 'image' as const,
                  videoUrl: undefined,
                }
              : p
          );
          updatedDraft = next;
          return next;
        });
      }

      // Auto-save immediately to storage so file is permanently saved
      if (updatedDraft.length > 0) {
        onSaveProjects(updatedDraft);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error subiendo portada:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Gallery (multiple photos & videos, including .MOV and .JPEG)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newItems: ProjectMedia[] = [];
      const defaultDate = currentProject.year
        ? currentProject.year.includes('-')
          ? currentProject.year
          : `${currentProject.year}-1`
        : '2026-1';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const stored = await storeMediaFile(file);
        newItems.push({
          id: stored.id,
          type: stored.type,
          url: stored.url,
          name: stored.name,
          size: stored.size,
          videoFormat: stored.type === 'video' ? 'reels' : undefined,
          date: defaultDate,
        });
      }

      let updatedDraft: Project[] = [];
      setDraftProjects((prev) => {
        const next = prev.map((p) =>
          p.id === currentProject?.id
            ? {
                ...p,
                gallery: [...(p.gallery || []), ...newItems],
              }
            : p
        );
        updatedDraft = next;
        return next;
      });

      // Auto-save immediately to persistent storage
      if (updatedDraft.length > 0) {
        onSaveProjects(updatedDraft);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error subiendo galería:', err);
    } finally {
      setIsUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const updateGalleryItemFormat = (itemId: string, format: string) => {
    const existing = currentProject.gallery || [];
    const updatedGallery = existing.map((item) =>
      item.id === itemId ? { ...item, videoFormat: format } : item
    );
    updateCurrentProject({ gallery: updatedGallery });
    const nextList = draftProjects.map((p) =>
      p.id === currentProject?.id ? { ...p, gallery: updatedGallery } : p
    );
    onSaveProjects(nextList);
  };

  const updateGalleryItemDate = (itemId: string, date: string) => {
    const existing = currentProject.gallery || [];
    const updatedGallery = existing.map((item) =>
      item.id === itemId ? { ...item, date } : item
    );
    updateCurrentProject({ gallery: updatedGallery });
    const nextList = draftProjects.map((p) =>
      p.id === currentProject?.id ? { ...p, gallery: updatedGallery } : p
    );
    onSaveProjects(nextList);
  };

  const removeGalleryItem = (itemId: string) => {
    const existing = currentProject.gallery || [];
    const updatedGallery = existing.filter((item) => item.id !== itemId);
    updateCurrentProject({ gallery: updatedGallery });
    const nextList = draftProjects.map((p) =>
      p.id === currentProject?.id ? { ...p, gallery: updatedGallery } : p
    );
    onSaveProjects(nextList);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddTag = () => {
    const clean = newTagInput.trim();
    if (!clean) return;
    if (!currentProject.tags.includes(clean)) {
      updateCurrentProject({
        tags: [...currentProject.tags, clean],
      });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateCurrentProject({
      tags: currentProject.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleCloseSafe = () => {
    onSaveProjects(draftProjects);
    onClose();
  };

  const handleSave = () => {
    onSaveProjects(draftProjects);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (window.confirm('¿Seguro que deseas restablecer todos los proyectos a los valores iniciales?')) {
      onResetProjects();
      setDraftProjects(projects);
    }
  };

  const handleCreateNewProject = () => {
    const newId = `proyecto-eafit-${Date.now()}`;
    const newProj: Project = {
      id: newId,
      title: 'Nuevo Proyecto',
      year: '2026',
      tags: ['Creatividad', 'Mercadeo', 'Reels'],
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
      videoFormat: 'reels',
      span: 'col-span-1 md:col-span-7',
    };

    const next = [...draftProjects, newProj];
    setDraftProjects(next);
    setSelectedProjectId(newId);
    onSaveProjects(next);
  };

  const handleDeleteProject = (id: string) => {
    if (draftProjects.length <= 1) {
      alert('Debes mantener al menos un proyecto en el portafolio.');
      return;
    }
    if (window.confirm('¿Eliminar este proyecto del portafolio?')) {
      const remaining = draftProjects.filter((p) => p.id !== id);
      setDraftProjects(remaining);
      setSelectedProjectId(remaining[0].id);
      onSaveProjects(remaining);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseSafe}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full max-w-5xl max-h-[92vh] bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stroke/70 bg-surface/90 shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full accent-gradient" />
              <div>
                <span className="text-xs uppercase tracking-widest text-muted font-medium block">
                  Panel Administrador • Gestión de Proyectos
                </span>
                <span className="text-xs text-[#89AACC]">
                  Título, Fecha, Etiquetas y Videos (Reels, TikTok, Historia...)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Guardado!</span>
                </span>
              )}

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full accent-gradient text-bg font-semibold text-xs cursor-pointer shadow-md hover:opacity-95 transition-opacity"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>

              <button
                onClick={handleCloseSafe}
                className="w-9 h-9 rounded-full bg-stroke/50 border border-stroke flex items-center justify-center text-text-primary hover:bg-white hover:text-black transition-colors cursor-pointer"
                title="Cerrar y guardar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader: Project Selector & Tabs */}
          <div className="bg-bg/40 border-b border-stroke/70 px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Project Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full sm:max-w-xl scrollbar-none">
              <span className="text-xs text-muted font-medium uppercase tracking-wider shrink-0 mr-1">
                Proyecto:
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {draftProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      selectedProjectId === proj.id
                        ? 'bg-[#89AACC] text-bg font-semibold shadow-sm'
                        : 'bg-surface border border-stroke text-muted hover:text-text-primary'
                    }`}
                  >
                    {proj.title}
                  </button>
                ))}

                <button
                  onClick={handleCreateNewProject}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-surface/50 border border-dashed border-stroke hover:border-[#89AACC] text-[#89AACC] transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Proyecto</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 shrink-0 bg-surface p-1 rounded-xl border border-stroke/60 text-xs">
              <button
                onClick={() => setActiveTab('media')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'media' ? 'bg-stroke/80 text-text-primary font-medium' : 'text-muted hover:text-text-primary'
                }`}
              >
                Fotos &amp; Videos (Reels / TikTok)
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'info' ? 'bg-stroke/80 text-text-primary font-medium' : 'text-muted hover:text-text-primary'
                }`}
              >
                Título, Fecha &amp; Etiquetas
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'instructions' ? 'bg-stroke/80 text-text-primary font-medium' : 'text-muted hover:text-text-primary'
                }`}
              >
                Guía de Formatos
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto p-5 sm:p-8 flex-1 space-y-6">
            {/* TAB 1: MEDIA UPLOAD (PORTADA + GALERIA CON FORMATOS DE VIDEO) */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                {/* 1. PORTADA PRINCIPAL (FOTO O VIDEO) */}
                <div className="p-6 rounded-2xl bg-bg/50 border border-stroke space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#89AACC] font-medium block">
                        Medio Principal de Portada
                      </span>
                      <h3 className="text-lg font-medium text-text-primary">
                        {currentProject.title}
                      </h3>
                      <p className="text-xs text-muted">
                        Formatos soportados: Videos (.MOV, .mp4, .webm) y Fotos (.jpeg, .png, .webp).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/quicktime,video/mp4,video/webm,.mov,.mp4,.webm,.jpeg,.jpg,.png"
                        className="hidden"
                        onChange={handleCoverUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 rounded-full px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-medium cursor-pointer transition-colors shadow-md disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Subiendo...' : 'Subir Portada (.MOV o Foto)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Preview of Current Cover */}
                  <div className="relative aspect-[16/9] max-h-72 w-full rounded-xl overflow-hidden border border-stroke/70 bg-black flex items-center justify-center group">
                    {currentProject.videoUrl ? (
                      <video
                        src={currentProject.videoUrl}
                        controls
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={currentProject.image}
                        alt={currentProject.title}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                      {currentProject.videoUrl ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-[#89AACC]" />
                          <span>Video de Portada: <strong className="capitalize text-white">{currentProject.videoFormat || 'Video'}</strong></span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5 text-[#89AACC]" />
                          <span>Foto de Portada</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ESPECIFICAR FORMATO DEL VIDEO DE PORTADA */}
                  {currentProject.videoUrl && (
                    <div className="p-4 rounded-xl bg-surface/70 border border-[#89AACC]/30 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-[#89AACC] font-medium flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5" />
                          <span>Especificar tipo / formato de este video:</span>
                        </span>
                        <span className="text-[11px] text-muted">
                          Actual: <strong className="text-white capitalize">{currentProject.videoFormat || 'Video general'}</strong>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {COMMON_VIDEO_FORMATS.map((fmt) => {
                          const isSelected = (currentProject.videoFormat?.toLowerCase() || '') === fmt.id;
                          const IconComp = fmt.icon;
                          return (
                            <button
                              key={fmt.id}
                              type="button"
                              onClick={() => updateCurrentProject({ videoFormat: fmt.id })}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#89AACC] text-bg font-semibold shadow-md scale-105'
                                  : 'bg-bg border border-stroke text-muted hover:text-white'
                              }`}
                            >
                              <IconComp className="w-3 h-3" />
                              <span>{fmt.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="text-muted">O escribe otro formato:</span>
                        <input
                          type="text"
                          value={currentProject.videoFormat || ''}
                          onChange={(e) => updateCurrentProject({ videoFormat: e.target.value })}
                          placeholder="ej: Reels, TikTok, Historia, Spot..."
                          className="flex-1 bg-bg border border-stroke rounded-lg px-3 py-1 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Manual URL Input */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs">
                    <span className="text-muted shrink-0">URL directa de portada:</span>
                    <input
                      type="text"
                      value={currentProject.videoUrl || currentProject.image}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.match(/\.(mov|mp4|webm|m3u8)(\?.*)?$/i)) {
                          updateCurrentProject({ videoUrl: val, mediaType: 'video', videoFormat: currentProject.videoFormat || 'reels' });
                        } else {
                          updateCurrentProject({ image: val, videoUrl: undefined, mediaType: 'image' });
                        }
                      }}
                      placeholder="https://... o /uploads/mi-video.mov"
                      className="flex-1 bg-surface border border-stroke rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-[#89AACC]"
                    />
                  </div>
                </div>

                {/* 2. GALERÍA ADICIONAL (FOTOS Y VIDEOS) */}
                <div className="p-6 rounded-2xl bg-bg/50 border border-stroke space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-emerald-400 font-medium block">
                        Material del Proyecto (Fotos y Videos)
                      </span>
                      <h3 className="text-lg font-medium text-text-primary">
                        Archivos Complementarios ({
                          (currentProject.gallery || []).filter(
                            (item) => item.url !== currentProject.videoUrl && item.url !== currentProject.image
                          ).length
                        })
                      </h3>
                      <p className="text-xs text-muted">
                        La portada se administra arriba. Aquí agregas el material complementario (Reels, TikTok, Historias o Fotos con fecha como 2026-1, 2025-2).
                      </p>
                    </div>

                    <div>
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/quicktime,video/mp4,video/webm,.mov,.mp4,.webm,.jpeg,.jpg,.png"
                        multiple
                        className="hidden"
                        onChange={handleGalleryUpload}
                      />
                      <button
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 rounded-full px-4 py-2 border border-stroke bg-surface hover:bg-stroke/60 text-text-primary text-xs font-medium cursor-pointer transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#89AACC]" />
                        <span>Añadir Fotos / Videos (.MOV / .JPEG)</span>
                      </button>
                    </div>
                  </div>

                  {/* Gallery Grid with format selection per video */}
                  {(() => {
                    const materialList = (currentProject.gallery || []).filter(
                      (item) => item.url !== currentProject.videoUrl && item.url !== currentProject.image
                    );
                    return materialList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 max-h-[540px] overflow-y-auto p-1 scrollbar-thin">
                        {materialList.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl overflow-hidden border border-stroke/70 bg-bg/80 flex flex-col"
                          >
                            {/* Media Preview Box */}
                            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                              {item.type === 'video' ? (
                                <div className="w-full h-full relative">
                                <video
                                  src={item.url}
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Play className="w-6 h-6 text-white opacity-90" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={item.url}
                                alt={item.name || 'Galería'}
                                className="w-full h-full object-cover"
                              />
                            )}

                            {/* Badges: Format and Date */}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                              <span className="bg-black/85 text-[10px] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                {item.type === 'video' ? (
                                  <Video className="w-3 h-3 text-[#89AACC]" />
                                ) : (
                                  <ImageIcon className="w-3 h-3 text-emerald-400" />
                                )}
                                <span className="capitalize">{item.type === 'video' ? (item.videoFormat || 'Video') : 'Foto'}</span>
                              </span>

                              {item.date && (
                                <span className="bg-black/85 text-[10px] text-[#89AACC] font-mono px-2 py-0.5 rounded-full border border-[#89AACC]/40 font-semibold shadow">
                                  {item.date}
                                </span>
                              )}
                            </div>

                            {/* Delete Action */}
                            <button
                              onClick={() => removeGalleryItem(item.id)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                              title="Eliminar de la galería"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Video Format Selector (for Videos) */}
                          {item.type === 'video' && (
                            <div className="p-2.5 bg-surface/90 border-t border-stroke/70 space-y-1.5">
                              <span className="text-[10px] uppercase tracking-wider text-muted font-medium block">
                                Formato de este video:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {['reels', 'tiktok', 'historia', 'horizontal', 'cuadrado'].map((fmt) => (
                                  <button
                                    key={fmt}
                                    type="button"
                                    onClick={() => updateGalleryItemFormat(item.id, fmt)}
                                    className={`px-2 py-0.5 rounded text-[10px] capitalize font-medium cursor-pointer transition-colors ${
                                      (item.videoFormat?.toLowerCase() || 'reels') === fmt
                                        ? 'bg-[#89AACC] text-bg font-semibold'
                                        : 'bg-bg text-muted hover:text-white border border-stroke/60'
                                    }`}
                                  >
                                    {fmt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Semester Date Selector (for Photos and Videos) */}
                          <div className="p-2.5 bg-surface/90 border-t border-stroke/70 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-wider text-muted font-medium flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#89AACC]" />
                                <span>Fecha (Semestre):</span>
                              </span>
                              <span className="text-[10px] font-mono text-[#89AACC] font-bold bg-black/60 px-2 py-0.5 rounded border border-[#89AACC]/40">
                                {item.date || currentProject.year || '2026-1'}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {['2026-1', '2026-2', '2025-1', '2025-2', '2024-1', '2024-2'].map((sem) => (
                                <button
                                  key={sem}
                                  type="button"
                                  onClick={() => updateGalleryItemDate(item.id, sem)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium cursor-pointer transition-colors ${
                                    (item.date || '') === sem
                                      ? 'bg-[#89AACC] text-bg font-bold shadow-sm'
                                      : 'bg-bg text-muted hover:text-white border border-stroke/60'
                                  }`}
                                >
                                  {sem}
                                </button>
                              ))}
                            </div>

                            <input
                              type="text"
                              value={item.date || ''}
                              onChange={(e) => updateGalleryItemDate(item.id, e.target.value)}
                              placeholder="O escribe: 2026-1, 2025-2..."
                              className="w-full bg-bg border border-stroke rounded px-2.5 py-1 text-[11px] text-text-primary font-mono focus:outline-none focus:border-[#89AACC]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-stroke rounded-xl text-center flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-8 h-8 text-muted/60" />
                      <p className="text-xs text-muted">
                        Aún no has añadido fotos o videos adicionales a este proyecto.
                      </p>
                      <button
                        onClick={() => galleryInputRef.current?.click()}
                        className="text-xs text-[#89AACC] hover:underline cursor-pointer"
                      >
                        Haz clic aquí para seleccionar videos o fotos
                      </button>
                    </div>
                  );
                })()}
                </div>
              </div>
            )}

            {/* TAB 2: ONLY TÍTULO, FECHA Y ETIQUETAS */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg/50 border border-stroke space-y-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#89AACC] font-medium border-b border-stroke/60 pb-3">
                    <Sparkles className="w-4 h-4 text-[#89AACC]" />
                    <span>Datos Principales del Proyecto</span>
                  </div>

                  {/* 1. TÍTULO */}
                  <div>
                    <label className="text-xs text-muted block mb-1 font-medium">
                      Título del Proyecto
                    </label>
                    <input
                      type="text"
                      value={currentProject.title}
                      onChange={(e) => updateCurrentProject({ title: e.target.value })}
                      placeholder="Nombre del proyecto..."
                      className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:border-[#89AACC] font-display italic text-lg"
                    />
                  </div>

                  {/* 2. FECHA */}
                  <div>
                    <label className="text-xs text-muted block mb-1 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#89AACC]" />
                      <span>Fecha / Año</span>
                    </label>
                    <input
                      type="text"
                      value={currentProject.year}
                      onChange={(e) => updateCurrentProject({ year: e.target.value })}
                      placeholder="ej: 2026, OCT 2026, 2025 — 2026..."
                      className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:border-[#89AACC] font-mono"
                    />
                  </div>

                  {/* 3. ETIQUETAS */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted block font-medium flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#89AACC]" />
                      <span>Etiquetas del Proyecto ({currentProject.tags.length})</span>
                    </label>

                    {/* Chips Display */}
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-surface border border-stroke/70 min-h-[44px]">
                      {currentProject.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-bg border border-stroke text-white"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-muted hover:text-red-400 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      {currentProject.tags.length === 0 && (
                        <span className="text-xs text-muted italic">No hay etiquetas agregadas</span>
                      )}
                    </div>

                    {/* Add Tag Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Escribe una etiqueta y presiona Enter o Añadir..."
                        className="flex-1 bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 rounded-xl accent-gradient text-bg text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                      >
                        Añadir
                      </button>
                    </div>

                    {/* Quick suggestions */}
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted flex-wrap">
                      <span>Sugerencias rápidas:</span>
                      {['Reels', 'TikTok', 'Historia', 'Creatividad', 'Mercadeo', 'Carros', 'EAFIT', 'Branding'].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            if (!currentProject.tags.includes(sug)) {
                              updateCurrentProject({ tags: [...currentProject.tags, sug] });
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-surface border border-stroke/60 hover:border-[#89AACC] text-muted hover:text-white transition-colors cursor-pointer"
                        >
                          +{sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delete Project Action */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleDeleteProject(currentProject.id)}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 cursor-pointer p-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar este proyecto</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: INSTRUCTIONS & FORMAT GUIDANCE */}
            {activeTab === 'instructions' && (
              <div className="space-y-6 text-sm">
                <div className="p-5 rounded-2xl bg-bg/50 border border-stroke space-y-3">
                  <h4 className="font-medium text-text-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#89AACC]" />
                    <span>Formatos de Video Inteligentes</span>
                  </h4>
                  <ul className="text-xs text-muted space-y-2.5 list-disc pl-5 leading-relaxed">
                    <li>
                      <strong className="text-white">Reels, TikTok e Historias:</strong> Al especificar cualquiera de estos formatos, el reproductor de video se adaptará automáticamente a una visualización vertical estilizada <code className="text-[#89AACC] bg-black/40 px-1 py-0.5 rounded">9:16</code>, ideal para contenido de redes sociales.
                    </li>
                    <li>
                      <strong className="text-white">Horizontal (16:9):</strong> Diseñado para spots publicitarios, videos de YouTube o producciones panorámicas cinematográficas.
                    </li>
                    <li>
                      <strong className="text-white">Post Cuadrado (1:1):</strong> Ideal para carruseles o publicaciones tradicionales de feed.
                    </li>
                    <li>
                      <strong className="text-white">Formatos de archivo admitidos:</strong> Puedes subir directamente videos en <code className="text-[#89AACC] bg-black/40 px-1 py-0.5 rounded">.MOV</code> (iPhone), <code className="text-[#89AACC] bg-black/40 px-1 py-0.5 rounded">.MP4</code> o fotos en <code className="text-[#89AACC] bg-black/40 px-1 py-0.5 rounded">.JPEG / .PNG</code>.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 px-6 border-t border-stroke/70 bg-surface/95 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-red-400 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer proyectos iniciales</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCloseSafe}
                className="px-5 py-2 rounded-full border border-stroke bg-bg/70 hover:bg-bg text-text-primary text-xs font-medium cursor-pointer transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={handleSave}
                className="relative group rounded-full p-[1.5px] cursor-pointer"
              >
                <span className="absolute inset-0 rounded-full accent-gradient" />
                <span className="relative z-10 flex items-center gap-2 rounded-full text-xs font-semibold px-6 py-2.5 bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary transition-all">
                  <Check className="w-4 h-4" />
                  <span>Guardar y Aplicar Cambios</span>
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
