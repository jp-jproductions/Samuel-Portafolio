import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileText,
  Check,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  RotateCcw,
  Eye,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { ResumeData } from '../types';
import { DEFAULT_RESUME } from '../data/portfolioData';
import { storeMediaFile } from '../utils/mediaStorage';

interface AdminCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData?: ResumeData;
  onSaveResume?: (updated: ResumeData) => Promise<void> | void;
  onOpenPublicPreview?: () => void;
}

export const AdminCvModal: React.FC<AdminCvModalProps> = ({
  isOpen,
  onClose,
  resumeData: externalResumeData,
  onSaveResume,
  onOpenPublicPreview,
}) => {
  const currentResume = externalResumeData || DEFAULT_RESUME;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    currentResume.customPdfUrl || '/Samuel_Restrepo_CV.pdf'
  );
  const [pdfName, setPdfName] = useState<string>(
    currentResume.customPdfName || 'Samuel_Restrepo_CV_EAFIT_2026.pdf'
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showUrlField, setShowUrlField] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Por favor selecciona un archivo en formato PDF (.pdf).');
      return;
    }

    try {
      setIsUploading(true);
      setSelectedFile(file);
      const stored = await storeMediaFile(file);
      setPreviewUrl(stored.url);
      setPdfName(file.name);

      if (onSaveResume) {
        await onSaveResume({
          ...currentResume,
          customPdfUrl: stored.url,
          customPdfName: file.name,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar archivo PDF en el panel admin:', err);
      alert('Ocurrió un error al procesar el archivo PDF.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = async () => {
    let clean = urlInput.trim();
    if (!clean) return;

    if (clean.includes('drive.google.com') && clean.includes('/view')) {
      clean = clean.replace(/\/view(\?.*)?$/, '/preview');
    }

    try {
      setIsUploading(true);
      setPreviewUrl(clean);
      setPdfName('Samuel_Restrepo_CV_Oficial.pdf');

      if (onSaveResume) {
        await onSaveResume({
          ...currentResume,
          customPdfUrl: clean,
          customPdfName: 'Samuel_Restrepo_CV_Oficial.pdf',
        });
      }

      setSaveSuccess(true);
      setShowUrlField(false);
      setUrlInput('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error guardando URL de PDF:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (
      window.confirm(
        '¿Deseas restablecer el documento al archivo PDF predeterminado de Samuel Restrepo?'
      )
    ) {
      const defaultUrl = '/Samuel_Restrepo_CV.pdf';
      const defaultName = 'Samuel_Restrepo_CV_EAFIT_2026.pdf';
      setPreviewUrl(defaultUrl);
      setPdfName(defaultName);
      setSelectedFile(null);

      if (onSaveResume) {
        await onSaveResume({
          ...currentResume,
          customPdfUrl: defaultUrl,
          customPdfName: defaultName,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stroke/70 bg-surface/95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#89AACC]/15 border border-[#89AACC]/30 flex items-center justify-center text-[#89AACC] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-text-primary tracking-wide">
                    Panel Administrador • Cargar PDF del CV
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Solo Admin
                  </span>
                </div>
                <p className="text-xs text-muted">
                  Sube el archivo PDF oficial de Samuel para que se muestre a los visitantes del portafolio.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted hover:text-white hover:bg-stroke/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-bg/60 border border-stroke flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted font-medium block">
                    PDF Actualmente Activo en el Portafolio
                  </span>
                  <span className="text-xs font-mono text-white font-medium">
                    {pdfName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenPublicPreview && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPublicPreview();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stroke bg-surface hover:bg-bg text-text-primary text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#89AACC]" />
                    <span>Ver como visitante</span>
                  </button>
                )}

                <button
                  onClick={handleResetToDefault}
                  title="Restablecer archivo predeterminado"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stroke/60 bg-surface/50 hover:bg-surface text-muted hover:text-white text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer</span>
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />

            {/* Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelect(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                isDragging
                  ? 'border-[#89AACC] bg-[#89AACC]/15 scale-[1.01]'
                  : 'border-[#89AACC]/30 bg-bg/40 hover:bg-bg/70 hover:border-[#89AACC]/60'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#89AACC]/15 border border-[#89AACC]/30 flex items-center justify-center text-[#89AACC] mb-3">
                {isUploading ? (
                  <RefreshCw className="w-7 h-7 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-7 h-7 text-emerald-400" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>

              <h3 className="text-base font-semibold text-white mb-1">
                {isUploading
                  ? 'Guardando archivo PDF...'
                  : saveSuccess
                  ? '¡PDF cargado y actualizado con éxito!'
                  : 'Haz clic aquí o arrastra el archivo PDF oficial de Samuel'}
              </h3>

              <p className="text-xs text-muted max-w-md mb-4 leading-relaxed">
                Selecciona el documento en formato <strong>.PDF</strong> que Samuel te proporcionó. Quedará guardado en la base de datos local y se mostrará inmediatamente en el portafolio.
              </p>

              <button
                type="button"
                className="px-5 py-2 rounded-xl accent-gradient text-bg font-semibold text-xs shadow-md hover:opacity-90 transition-opacity pointer-events-none"
              >
                Seleccionar PDF desde mi equipo
              </button>
            </div>

            {/* Optional Web URL Link */}
            <div className="p-4 rounded-2xl bg-bg/40 border border-stroke/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-text-primary">
                  <LinkIcon className="w-3.5 h-3.5 text-[#89AACC]" />
                  <span>¿Prefieres enlazar un archivo PDF en la nube?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUrlField(!showUrlField)}
                  className="text-xs text-[#89AACC] hover:underline cursor-pointer"
                >
                  {showUrlField ? 'Ocultar' : 'Ingresar URL de PDF'}
                </button>
              </div>

              {showUrlField && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://drive.google.com/... o https://midominio.com/cv.pdf"
                    className="flex-1 bg-surface border border-stroke rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-[#89AACC]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 rounded-xl accent-gradient text-bg font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  >
                    Guardar URL
                  </button>
                </div>
              )}
            </div>

            {/* Live Embedded Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="font-medium text-text-primary">
                  Vista Previa en Vivo del PDF Cargado
                </span>
                <span>Resolución completa</span>
              </div>
              <div className="w-full h-80 rounded-2xl overflow-hidden border border-stroke bg-slate-900 shadow-inner">
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
                  title="Vista Previa PDF Admin"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stroke/70 bg-surface/95 flex items-center justify-between">
            <span className="text-xs text-muted">
              {saveSuccess ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Cambios aplicados correctamente en el portafolio
                </span>
              ) : (
                'Los cambios se sincronizan automáticamente con el botón Perfil / CV'
              )}
            </span>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-bg border border-stroke text-white hover:bg-surface text-xs font-medium transition-colors cursor-pointer"
            >
              Cerrar Panel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
