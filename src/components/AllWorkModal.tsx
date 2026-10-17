import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Filter, Video, Camera, FileText } from 'lucide-react';
import { Project } from '../types';
import { PROJECTS as DEFAULT_PROJECTS } from '../data/portfolioData';

interface AllWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  projects?: Project[];
}

export const AllWorkModal: React.FC<AllWorkModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  projects = DEFAULT_PROJECTS,
}) => {
  const [filter, setFilter] = useState<string>('all');

  if (!isOpen) return null;

  // Extract unique filter tags dynamically
  const tagsSet = new Set<string>();
  projects.forEach((p) => {
    p.tags?.forEach((t) => tagsSet.add(t));
  });
  const filterOptions = ['all', ...Array.from(tagsSet)];

  const filteredProjects =
    filter === 'all'
      ? projects
      : projects.filter((p) => p.tags?.includes(filter));

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
          className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-surface border border-stroke rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-6 border-b border-stroke/70 bg-surface/90">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full accent-gradient" />
                <span className="text-xs uppercase tracking-widest text-[#89AACC] font-medium">
                  Índice de Trabajos • Universidad EAFIT
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display italic text-text-primary">
                Todos los Proyectos
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

          {/* Filter Bar */}
          <div className="flex items-center gap-2 p-4 px-6 border-b border-stroke/40 overflow-x-auto text-xs">
            <Filter className="w-3.5 h-3.5 text-muted shrink-0" />
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                  filter === opt
                    ? 'bg-white text-black font-medium'
                    : 'bg-stroke/40 text-muted hover:text-text-primary'
                }`}
              >
                {opt === 'all' ? 'Todos los proyectos' : `#${opt}`}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  onSelectProject(project);
                }}
                className="group relative rounded-2xl overflow-hidden bg-bg/50 border border-stroke hover:border-stroke/90 transition-all duration-300 p-5 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 border border-stroke/60 bg-black">
                  {project.videoUrl ? (
                    <video
                      src={project.videoUrl}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="halftone-overlay absolute inset-0 opacity-20 pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {project.videoUrl && (
                      <span className="bg-black/75 backdrop-blur-md border border-[#89AACC]/40 text-[10px] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Video className="w-2.5 h-2.5 text-[#89AACC]" />
                        <span className="capitalize">{project.videoFormat ? project.videoFormat : 'Video'}</span>
                      </span>
                    )}
                    {(() => {
                      const count = (project.gallery || []).filter(
                        (item) => item.url !== project.videoUrl && item.url !== project.image
                      ).length;
                      return count > 0 ? (
                        <span className="bg-black/75 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Camera className="w-2.5 h-2.5 text-emerald-400" />
                          <span>+{count}</span>
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="text-[#89AACC] font-mono font-medium">{project.year}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display italic text-text-primary group-hover:text-white transition-colors leading-snug">
                    {project.title}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-stroke/40 text-xs">
                    <span className="flex items-center gap-1 text-[#89AACC] font-medium group-hover:translate-x-1 transition-transform">
                      <span>Ver proyecto</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
