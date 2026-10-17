import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Clock, Calendar } from 'lucide-react';
import { JournalEntry } from '../types';
import { JOURNAL_ENTRIES } from '../data/portfolioData';

interface JournalSectionProps {
  onSelectJournal: (entry: JournalEntry) => void;
  onViewAllJournalClick: () => void;
}

export const JournalSection: React.FC<JournalSectionProps> = ({
  onSelectJournal,
  onViewAllJournalClick,
}) => {
  return (
    <section id="journal" className="bg-bg py-16 md:py-24 select-none">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Header with Framer Motion whileInView */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6"
        >
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em] font-medium">
                Bitácora &amp; Reflexiones
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-text-primary tracking-tight">
              Ideas <span className="font-display italic font-normal">recientes</span>
            </h2>

            {/* Subtext */}
            <p className="text-sm md:text-base text-muted max-w-md mt-3 leading-relaxed">
              Ensayos y aprendizajes sobre mercadeo, cultura automotriz, expediciones de viaje y locura creativa.
            </p>
          </div>

          {/* "Ver todos los artículos" */}
          <div className="hidden md:inline-flex">
            <button
              onClick={onViewAllJournalClick}
              className="relative group rounded-full p-[1.5px] transition-transform duration-300 hover:scale-105 cursor-pointer"
            >
              <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider px-5 py-3 bg-surface text-text-primary border border-stroke/70 group-hover:border-transparent transition-all duration-300">
                <span>Ver todos los artículos</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </motion.div>

        {/* 4 journal entries */}
        <div className="flex flex-col gap-4">
          {JOURNAL_ENTRIES.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.65,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onClick={() => onSelectJournal(entry)}
              className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 sm:pr-8 bg-surface/30 hover:bg-surface border border-stroke rounded-[32px] sm:rounded-full transition-all duration-300 cursor-pointer hover:border-stroke/90 hover:translate-x-1"
            >
              {/* Left group */}
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl sm:rounded-full overflow-hidden border border-stroke/70">
                  <img
                    src={entry.image}
                    alt={entry.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="halftone-overlay absolute inset-0 opacity-15 mix-blend-multiply pointer-events-none" />
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#89AACC] font-medium block mb-1">
                    {entry.category}
                  </span>
                  <h3 className="text-base sm:text-lg md:text-xl font-medium text-text-primary group-hover:text-white transition-colors truncate">
                    {entry.title}
                  </h3>
                </div>
              </div>

              {/* Right group */}
              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pl-18 sm:pl-0 pt-1 sm:pt-0 border-t border-stroke/30 sm:border-0">
                <div className="flex items-center gap-4 text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    <span className="uppercase tracking-wider">{entry.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    <span className="uppercase tracking-wider">{entry.readTime}</span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-stroke/40 border border-stroke/60 flex items-center justify-center text-text-primary group-hover:bg-[#4E85BF] group-hover:text-white group-hover:border-[#89AACC] transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 flex justify-center md:hidden">
          <button
            onClick={onViewAllJournalClick}
            className="w-full relative group rounded-full p-[1.5px] cursor-pointer"
          >
            <span className="absolute inset-0 rounded-full accent-gradient" />
            <span className="relative z-10 flex items-center justify-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider px-6 py-3.5 bg-surface text-text-primary">
              <span>Ver todos los artículos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
