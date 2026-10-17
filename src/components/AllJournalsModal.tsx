import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { JournalEntry } from '../types';
import { JOURNAL_ENTRIES } from '../data/portfolioData';

interface AllJournalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectJournal: (entry: JournalEntry) => void;
}

export const AllJournalsModal: React.FC<AllJournalsModalProps> = ({
  isOpen,
  onClose,
  onSelectJournal,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
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
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-6 border-b border-stroke/70 bg-surface/90">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full accent-gradient" />
                <span className="text-xs uppercase tracking-widest text-[#89AACC] font-medium">
                  Artículos &amp; Reflexiones • EAFIT
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display italic text-text-primary">
                Archivo Completo de Ideas
              </h2>
            </div>

            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-9 h-9 rounded-full bg-stroke/50 border border-stroke flex items-center justify-center text-text-primary hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of articles */}
          <div className="overflow-y-auto p-6 sm:p-8 space-y-4">
            {JOURNAL_ENTRIES.map((entry) => (
              <div
                key={entry.id}
                onClick={() => {
                  onSelectJournal(entry);
                }}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-bg/50 border border-stroke hover:border-stroke/90 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stroke/60">
                    <img
                      src={entry.image}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#89AACC] font-medium block mb-1">
                      {entry.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-medium text-text-primary group-hover:text-white transition-colors">
                      {entry.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    <span>{entry.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    <span>{entry.readTime}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stroke/50 flex items-center justify-center text-text-primary group-hover:bg-[#4E85BF] group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
