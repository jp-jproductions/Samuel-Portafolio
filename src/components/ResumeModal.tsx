import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  FileText,
  ExternalLink,
  Check,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { ResumeData } from '../types';
import { DEFAULT_RESUME } from '../data/portfolioData';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData?: ResumeData;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  isOpen,
  onClose,
  resumeData: externalResumeData,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const currentResume = externalResumeData || DEFAULT_RESUME;
  const pdfUrl = currentResume.customPdfUrl || '/Samuel_Restrepo_CV.pdf';
  const pdfName = currentResume.customPdfName || 'Samuel_Restrepo_CV_EAFIT_2026.pdf';

  // Direct download handler
  const handleDownload = () => {
    setDownloaded(true);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloaded(false), 3000);
  };

  // Open in new browser tab
  const handleOpenNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 select-none">
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
          className="relative z-10 w-full max-w-5xl h-[92vh] max-h-[920px] bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-stroke/70 bg-surface/95 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#89AACC]/15 border border-[#89AACC]/30 flex items-center justify-center text-[#89AACC] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-semibold text-text-primary tracking-wide">
                    Samuel Restrepo — Currículum Vitae (PDF)
                  </h2>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#89AACC]/15 text-[#89AACC] border border-[#89AACC]/30">
                    EAFIT &apos;26
                  </span>
                </div>
                <span className="text-[11px] text-muted block">
                  Documento oficial en PDF • Pregrado en Mercadeo &amp; Estrategia Creativa
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Open in new tab / fullscreen button */}
              <button
                onClick={handleOpenNewTab}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stroke bg-bg/60 hover:bg-bg text-text-primary text-xs font-medium transition-colors cursor-pointer"
                title="Abrir en pantalla completa o pestaña nueva"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted" />
                <span className="hidden sm:inline">Pantalla completa</span>
              </button>

              {/* Download PDF button */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl accent-gradient text-bg font-medium text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                {downloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Descargado!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </>
                )}
              </button>

              {/* Close Modal button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted hover:text-text-primary hover:bg-stroke/60 transition-colors cursor-pointer ml-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader info strip */}
          <div className="bg-bg/40 px-5 py-2 border-b border-stroke/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-text-primary font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>Universidad EAFIT</span>
              </span>
              <span>•</span>
              <span>Medellín, Colombia</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Mercadeo &amp; Negocios Globales</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted">Archivo:</span>
              <span className="text-[11px] text-text-primary font-mono bg-surface px-2 py-0.5 rounded border border-stroke/60">
                {pdfName}
              </span>
            </div>
          </div>

          {/* Body: Embedded PDF Viewer */}
          <div className="flex-1 w-full h-full bg-[#1e232a] relative overflow-hidden flex flex-col">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
              title="Samuel Restrepo CV PDF Viewer"
              className="w-full flex-1 border-0 bg-white"
            />

            {/* Assistance footer bar */}
            <div className="p-3 bg-surface/95 border-t border-stroke/70 flex flex-wrap items-center justify-between gap-3 text-xs text-muted shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>
                  Visualizador interactivo oficial de Samuel Restrepo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenNewTab}
                  className="px-3 py-1 rounded-lg bg-bg border border-stroke text-text-primary hover:bg-surface text-xs font-medium cursor-pointer transition-colors"
                >
                  Abrir pantalla completa ↗
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 rounded-lg bg-[#89AACC] text-bg font-medium hover:opacity-90 text-xs cursor-pointer transition-opacity"
                >
                  Descargar archivo
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
