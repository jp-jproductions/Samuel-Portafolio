import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Exploration } from '../types';

interface LightboxModalProps {
  item: Exploration | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-lg"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full max-w-2xl bg-surface border border-stroke rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-stroke/70 bg-surface/90">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#89AACC]" />
              <span className="text-xs uppercase tracking-widest text-muted font-medium">
                {item.medium} • {item.year}
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 rounded-full bg-stroke/60 border border-stroke flex items-center justify-center text-text-primary hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Large Visual */}
          <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="halftone-overlay absolute inset-0 opacity-20 pointer-events-none" />
          </div>

          {/* Info footer */}
          <div className="p-6 bg-surface">
            <h3 className="font-display italic text-3xl text-text-primary mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-muted font-light leading-relaxed">
              {item.description}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
