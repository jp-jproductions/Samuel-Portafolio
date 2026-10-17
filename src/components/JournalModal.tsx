import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Share2, Check } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({ entry, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-6 border-b border-stroke/70 bg-surface/90">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-[#89AACC] font-medium">
                {entry.category} • Universidad EAFIT
              </span>
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
          <div className="overflow-y-auto p-6 sm:p-10 space-y-6">
            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-60" />
                <span>{entry.date}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 opacity-60" />
                <span>{entry.readTime}</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display italic text-text-primary leading-tight">
              {entry.title}
            </h2>

            {/* Featured Image */}
            <div className="relative aspect-[16/8] w-full rounded-2xl overflow-hidden border border-stroke">
              <img
                src={entry.image}
                alt={entry.title}
                className="w-full h-full object-cover"
              />
              <div className="halftone-overlay absolute inset-0 opacity-20 pointer-events-none" />
            </div>

            {/* Excerpt */}
            <p className="text-base sm:text-lg text-[#89AACC] font-normal italic leading-relaxed border-l-2 border-[#89AACC] pl-4">
              &ldquo;{entry.excerpt}&rdquo;
            </p>

            {/* Content paragraphs */}
            <div className="space-y-4 text-sm sm:text-base text-text-primary/80 font-light leading-relaxed pt-2">
              {entry.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Footer with share / close */}
            <div className="pt-6 border-t border-stroke flex items-center justify-between">
              <span className="text-xs text-muted">
                Publicado por Samuel Restrepo • Bitácora Universitaria EAFIT
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Enlace copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir</span>
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
