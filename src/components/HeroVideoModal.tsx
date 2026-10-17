import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Video,
  Play,
  RotateCcw,
  Check,
  Sparkles,
  Link as LinkIcon,
  Film,
  Plus,
  Trash2,
  Type,
  Eye,
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { HLS_VIDEO_URL, DEFAULT_HERO_CONFIG } from '../data/portfolioData';
import { HeroConfig } from '../types';
import { storeMediaFile } from '../utils/mediaStorage';

interface HeroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: HeroConfig;
  onSaveConfig?: (updated: HeroConfig) => void;
  onResetConfig?: () => void;
  // Backward compatibility
  currentVideoUrl?: string;
  onSaveVideo?: (url: string) => void;
  onResetVideo?: () => void;
}

// Recommended preset videos that work beautifully as dark cinematic background loops
const PRESET_VIDEOS = [
  {
    id: 'original-mux',
    title: 'Original Mux Cinemático',
    tag: 'Actual por defecto',
    description: 'Video HLS adaptativo en alta definición optimizado para el portafolio.',
    url: HLS_VIDEO_URL,
    type: 'hls'
  },
  {
    id: 'automotive-supercar',
    title: 'Velocidad & Superdeportivos',
    tag: 'Carros & Mercadeo',
    description: 'Video cinemático nocturno de vehículos deportivos y luces urbanas.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-the-city-at-night-4158-large.mp4',
    type: 'mp4'
  },
  {
    id: 'urban-lights',
    title: 'Luces Urbanas & Creatividad',
    tag: 'Creatividad & Nocturno',
    description: 'Luces de neón y movimiento urbano acelerado con estética contemporánea.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-in-time-lapse-43187-large.mp4',
    type: 'mp4'
  },
  {
    id: 'aerial-travel',
    title: 'Expedición Aérea & Rutas',
    tag: 'Viajar & Explorar',
    description: 'Tomas aéreas panorámicas de carreteras y paisajes cinematográficos.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-highway-surrounded-by-forest-42828-large.mp4',
    type: 'mp4'
  }
];

const WORD_SUGGESTIONS = [
  'Creatividad',
  'Carros',
  'Mercadeo',
  'Locura',
  'Viajar',
  'Estrategia',
  'Innovación',
  'Adrenalina',
  'Branding',
  'Liderazgo',
  'Diseño',
  'Negocios',
];

export const HeroVideoModal: React.FC<HeroVideoModalProps> = ({
  isOpen,
  onClose,
  config: externalConfig,
  onSaveConfig,
  onResetConfig,
  currentVideoUrl,
  onSaveVideo,
  onResetVideo,
}) => {
  const initialConfig: HeroConfig = {
    ...DEFAULT_HERO_CONFIG,
    ...(externalConfig || {}),
    videoUrl: externalConfig?.videoUrl || currentVideoUrl || DEFAULT_HERO_CONFIG.videoUrl,
  };

  const [draftConfig, setDraftConfig] = useState<HeroConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'texts' | 'words' | 'video' | 'preview'>('texts');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [newWordInput, setNewWordInput] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync draft state on modal open
  useEffect(() => {
    if (isOpen) {
      setDraftConfig({
        ...DEFAULT_HERO_CONFIG,
        ...(externalConfig || {}),
        videoUrl: externalConfig?.videoUrl || currentVideoUrl || DEFAULT_HERO_CONFIG.videoUrl,
      });
    }
  }, [isOpen, externalConfig, currentVideoUrl]);

  if (!isOpen) return null;

  const updateDraft = (updates: Partial<HeroConfig>) => {
    setDraftConfig((prev) => ({ ...prev, ...updates }));
  };

  // Save all changes
  const handleSave = () => {
    if (onSaveConfig) {
      onSaveConfig(draftConfig);
    }
    if (onSaveVideo && draftConfig.videoUrl) {
      onSaveVideo(draftConfig.videoUrl);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleCloseSafe = () => {
    if (onSaveConfig) {
      onSaveConfig(draftConfig);
    }
    if (onSaveVideo && draftConfig.videoUrl) {
      onSaveVideo(draftConfig.videoUrl);
    }
    onClose();
  };

  // Reset to original defaults
  const handleReset = () => {
    if (
      window.confirm(
        '¿Deseas restaurar todos los textos, palabras rotativas y video de fondo del Inicio a los valores originales?'
      )
    ) {
      setDraftConfig(DEFAULT_HERO_CONFIG);
      if (onResetConfig) {
        onResetConfig();
      } else if (onSaveConfig) {
        onSaveConfig(DEFAULT_HERO_CONFIG);
      }
      if (onResetVideo) {
        onResetVideo();
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Add new word to rotating words list
  const handleAddWord = (wordToAdd?: string) => {
    const val = (wordToAdd || newWordInput).trim();
    if (!val) return;
    if (!draftConfig.roles.includes(val)) {
      const nextRoles = [...draftConfig.roles, val];
      updateDraft({ roles: nextRoles });
    }
    setNewWordInput('');
  };

  // Remove word from list
  const handleRemoveWord = (wordToRemove: string) => {
    if (draftConfig.roles.length <= 1) {
      alert('Debes mantener al menos una palabra interactiva para el inicio.');
      return;
    }
    updateDraft({
      roles: draftConfig.roles.filter((w) => w !== wordToRemove),
    });
  };

  // Handle local video upload (.mov, .mp4, .webm)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setVideoError(null);
    try {
      const stored = await storeMediaFile(file);
      const nextConfig = { ...draftConfig, videoUrl: stored.url };
      setDraftConfig(nextConfig);

      // Auto-save immediately to persistent storage
      if (onSaveConfig) onSaveConfig(nextConfig);
      if (onSaveVideo) onSaveVideo(stored.url);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error al subir video:', err);
      setVideoError('No se pudo procesar el archivo de video. Prueba con un archivo .mp4 o .mov menor a 200MB.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectPreset = (url: string) => {
    updateDraft({ videoUrl: url });
    setVideoError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
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
          className="relative z-10 w-full max-w-5xl h-[92vh] max-h-[92vh] bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col shadow-2xl my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stroke/70 bg-surface/90 shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full accent-gradient" />
              <div>
                <span className="text-xs uppercase tracking-widest text-muted font-medium block">
                  Panel Administrador • Inicio &amp; Portada
                </span>
                <span className="text-xs text-[#89AACC]">
                  Modificar Textos, Palabras Rotativas y Video de Fondo en Bucle
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Cambios Guardados!</span>
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

          {/* Subheader: Tabs */}
          <div className="bg-bg/40 border-b border-stroke/70 px-5 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-stroke/60 text-xs">
              <button
                onClick={() => setActiveTab('texts')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'texts'
                    ? 'bg-stroke/80 text-text-primary font-semibold'
                    : 'text-muted hover:text-text-primary'
                }`}
              >
                <Type className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>1. Textos del Inicio</span>
              </button>

              <button
                onClick={() => setActiveTab('words')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'words'
                    ? 'bg-stroke/80 text-text-primary font-semibold'
                    : 'text-muted hover:text-text-primary'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Palabras Rotativas ({draftConfig.roles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-stroke/80 text-text-primary font-semibold'
                    : 'text-muted hover:text-text-primary'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Video de Fondo (Bucle)</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-stroke/80 text-text-primary font-semibold'
                    : 'text-muted hover:text-text-primary'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>4. Vista Previa en Vivo</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-8 space-y-6 overscroll-contain scrollbar-thin scrollbar-thumb-[#89AACC]/40 hover:scrollbar-thumb-[#89AACC]/70 scrollbar-track-black/40">
            {/* TAB 1: TEXTOS DEL INICIO */}
            {activeTab === 'texts' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="p-6 rounded-2xl bg-bg/50 border border-stroke space-y-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#89AACC] font-medium border-b border-stroke/60 pb-3">
                    <Type className="w-4 h-4 text-[#89AACC]" />
                    <span>Títulos, Subtítulos y Botones del Inicio</span>
                  </div>

                  {/* Ceja superior */}
                  <div>
                    <label className="text-xs text-muted block mb-1 font-medium">
                      Ceja Superior (Eyebrow / Universidad)
                    </label>
                    <input
                      type="text"
                      value={draftConfig.eyebrow}
                      onChange={(e) => updateDraft({ eyebrow: e.target.value })}
                      placeholder="UNIVERSIDAD EAFIT • MEDELLÍN '26"
                      className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC] font-mono tracking-widest uppercase"
                    />
                  </div>

                  {/* Nombre / Título */}
                  <div>
                    <label className="text-xs text-muted block mb-1 font-medium">
                      Nombre / Título Principal
                    </label>
                    <input
                      type="text"
                      value={draftConfig.name}
                      onChange={(e) => updateDraft({ name: e.target.value })}
                      placeholder="Samuel Restrepo"
                      className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-text-primary focus:outline-none focus:border-[#89AACC] font-display italic text-2xl"
                    />
                  </div>

                  {/* Frase acompañante de las palabras */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted block mb-1 font-medium">
                        Prefijo antes de las palabras rotativas
                      </label>
                      <input
                        type="text"
                        value={draftConfig.rolesPrefix}
                        onChange={(e) => updateDraft({ rolesPrefix: e.target.value })}
                        placeholder="Impulsado por"
                        className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted block mb-1 font-medium">
                        Sufijo después de las palabras rotativas
                      </label>
                      <input
                        type="text"
                        value={draftConfig.rolesSuffix}
                        onChange={(e) => updateDraft({ rolesSuffix: e.target.value })}
                        placeholder="en la Universidad EAFIT."
                        className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                    </div>
                  </div>

                  {/* Párrafo de descripción */}
                  <div>
                    <label className="text-xs text-muted block mb-1 font-medium">
                      Párrafo de Descripción / Presentación
                    </label>
                    <textarea
                      rows={3}
                      value={draftConfig.description}
                      onChange={(e) => updateDraft({ description: e.target.value })}
                      placeholder="Portafolio de proyectos universitarios en EAFIT..."
                      className="w-full bg-surface border border-stroke rounded-xl p-3.5 text-xs text-text-primary focus:outline-none focus:border-[#89AACC] leading-relaxed resize-none"
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stroke/60">
                    <div>
                      <label className="text-xs text-muted block mb-1 font-medium">
                        Texto del Botón Primario
                      </label>
                      <input
                        type="text"
                        value={draftConfig.primaryButtonText}
                        onChange={(e) => updateDraft({ primaryButtonText: e.target.value })}
                        placeholder="Ver Proyectos"
                        className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted block mb-1 font-medium">
                        Texto del Botón Secundario
                      </label>
                      <input
                        type="text"
                        value={draftConfig.secondaryButtonText}
                        onChange={(e) => updateDraft({ secondaryButtonText: e.target.value })}
                        placeholder="Contáctame..."
                        className="w-full bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PALABRAS ROTATIVAS DINÁMICAS */}
            {activeTab === 'words' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="p-6 rounded-2xl bg-bg/50 border border-stroke space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stroke/60 pb-3">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-amber-400 font-medium block">
                        Palabras Interactivas en Movimiento ({draftConfig.roles.length})
                      </span>
                      <p className="text-xs text-muted">
                        Estas palabras rotan cada 2 segundos en cursiva destacada en el centro del inicio. Puedes añadir tantas como quieras o dejar solo las que prefieras.
                      </p>
                    </div>
                  </div>

                  {/* Preview de la frase completa */}
                  <div className="p-4 rounded-xl bg-surface/80 border border-[#89AACC]/40 text-center space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted font-medium block">
                      Así se lee la frase en la portada:
                    </span>
                    <div className="text-sm sm:text-base text-text-primary">
                      <span className="text-muted">{draftConfig.rolesPrefix} </span>
                      <span className="font-display italic text-[#89AACC] font-semibold text-lg px-1">
                        &quot;{draftConfig.roles.join(' → ')}&quot;
                      </span>
                      <span className="text-muted"> {draftConfig.rolesSuffix}</span>
                    </div>
                  </div>

                  {/* Chips actuales de palabras */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted block font-medium">
                      Palabras actualmente activas (haz clic en × para eliminar):
                    </label>
                    <div className="flex flex-wrap gap-2 p-3.5 rounded-xl bg-surface border border-stroke/70 min-h-[52px]">
                      {draftConfig.roles.map((word, idx) => (
                        <span
                          key={`${word}-${idx}`}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs bg-bg border border-[#89AACC]/40 text-white shadow-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#89AACC]" />
                          <span className="font-display italic text-sm">{word}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveWord(word)}
                            className="text-muted hover:text-red-400 cursor-pointer ml-1 text-sm font-bold"
                            title={`Eliminar "${word}"`}
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      {draftConfig.roles.length === 0 && (
                        <span className="text-xs text-red-400 italic">
                          Debes agregar al menos una palabra.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Formulario para añadir nueva palabra */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs text-muted block font-medium">
                      Añadir nueva palabra personalizada:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newWordInput}
                        onChange={(e) => setNewWordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddWord();
                          }
                        }}
                        placeholder="Escribe una palabra y presiona Enter o Añadir..."
                        className="flex-1 bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddWord()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl accent-gradient text-bg text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Palabra</span>
                      </button>
                    </div>
                  </div>

                  {/* Sugerencias rápidas */}
                  <div className="space-y-1.5 pt-2 border-t border-stroke/50">
                    <span className="text-[11px] text-muted block">
                      Sugerencias temáticas para Samuel Restrepo (EAFIT &apos;26):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {WORD_SUGGESTIONS.map((sug) => {
                        const isAdded = draftConfig.roles.includes(sug);
                        return (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => {
                              if (!isAdded) handleAddWord(sug);
                            }}
                            disabled={isAdded}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              isAdded
                                ? 'bg-surface/50 border border-stroke/40 text-muted/60 cursor-default'
                                : 'bg-surface border border-stroke hover:border-[#89AACC] text-text-primary hover:text-[#89AACC]'
                            }`}
                          >
                            {isAdded ? `✓ ${sug}` : `+ ${sug}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VIDEO DE FONDO (BUCLE) */}
            {activeTab === 'video' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="p-6 rounded-2xl bg-bg/50 border border-stroke space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stroke/60 pb-3">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-emerald-400 font-medium block">
                        Video Cinemático de Fondo (Bucle Continuo Infinito)
                      </span>
                      <p className="text-xs text-muted">
                        El video se reproduce automáticamente en bucle continuo, sin sonido y sin pausas.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/quicktime,video/mp4,video/webm,.mov,.mp4,.webm,.m4v"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 rounded-full px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold cursor-pointer transition-colors shadow-md disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Subiendo video...' : 'Subir Video en Bucle (.MOV / .MP4)'}</span>
                      </button>
                    </div>
                  </div>

                  {videoError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                      {videoError}
                    </div>
                  )}

                  {/* Player Preview Box */}
                  <div className="relative aspect-video max-h-64 w-full rounded-2xl overflow-hidden border border-stroke/70 bg-black flex items-center justify-center shadow-lg">
                    <video
                      key={draftConfig.videoUrl}
                      src={draftConfig.videoUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Film className="w-3 h-3 text-emerald-400" />
                      <span>Video de fondo actual (Bucle infinito activo)</span>
                    </div>
                  </div>

                  {/* Manual URL input */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs text-muted block font-medium">
                      URL directa de video o ruta estática:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={draftConfig.videoUrl || ''}
                        onChange={(e) => updateDraft({ videoUrl: e.target.value })}
                        placeholder="https://... o /uploads/mi-video-bucle.mov"
                        className="flex-1 bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC] font-mono"
                      />
                    </div>
                    <span className="text-[11px] text-muted block">
                      Admite enlaces .mp4, .mov, .webm o transmisiones .m3u8 (HLS adaptativo).
                    </span>
                  </div>

                  {/* Preset library */}
                  <div className="space-y-2 pt-2 border-t border-stroke/50">
                    <span className="text-xs text-muted block font-medium">
                      O selecciona uno de los presets cinemáticos optimizados:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PRESET_VIDEOS.map((preset) => {
                        const isSelected = draftConfig.videoUrl === preset.url;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => handleSelectPreset(preset.url)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#89AACC]/15 border-[#89AACC] ring-1 ring-[#89AACC]'
                                : 'bg-surface border-stroke/70 hover:border-stroke'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-text-primary">
                                {preset.title}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] text-[#89AACC] font-medium bg-[#89AACC]/20 px-2 py-0.5 rounded-full">
                                  Activo
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted line-clamp-1">{preset.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VISTA PREVIA EN VIVO */}
            {activeTab === 'preview' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <span className="text-xs uppercase tracking-wider text-muted font-medium block text-center">
                  Previsualización exacta de la portada con tus textos y video de fondo
                </span>

                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden border border-stroke/80 bg-black flex flex-col items-center justify-center p-6 text-center shadow-2xl">
                  {/* Background Video */}
                  <video
                    key={draftConfig.videoUrl}
                    src={draftConfig.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Dark overlay & Halftone */}
                  <div className="absolute inset-0 bg-black/45" />

                  {/* Foreground Content */}
                  <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center space-y-3">
                    <span className="text-[10px] text-muted uppercase tracking-[0.3em] font-mono">
                      {draftConfig.eyebrow}
                    </span>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-display italic text-white leading-tight">
                      {draftConfig.name}
                    </h1>

                    <div className="text-xs sm:text-sm md:text-base text-white/90 font-light flex items-center justify-center flex-wrap gap-1">
                      <span>{draftConfig.rolesPrefix}</span>
                      <span className="font-display italic text-[#89AACC] font-medium px-1">
                        {draftConfig.roles[0] || 'Creatividad'}
                      </span>
                      <span>{draftConfig.rolesSuffix}</span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-muted max-w-md line-clamp-3 leading-relaxed">
                      {draftConfig.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2">
                      <span className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-black shadow-md">
                        {draftConfig.primaryButtonText}
                      </span>
                      <span className="px-4 py-2 rounded-full text-xs font-medium border border-white/30 text-white bg-black/40">
                        {draftConfig.secondaryButtonText}
                      </span>
                    </div>
                  </div>
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
              <span>Restablecer inicio original</span>
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
                  <span>Guardar y Aplicar al Inicio</span>
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
