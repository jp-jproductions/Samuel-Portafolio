import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Video, Camera, FileText } from 'lucide-react';
import { Project } from '../types';
import { PROJECTS as DEFAULT_PROJECTS } from '../data/portfolioData';

interface SelectedWorksSectionProps {
  projects?: Project[];
  onSelectProject: (project: Project) => void;
  onViewAllClick: () => void;
}

export const SelectedWorksSection: React.FC<SelectedWorksSectionProps> = ({
  projects = DEFAULT_PROJECTS,
  onSelectProject,
  onViewAllClick,
}) => {
  return (
    <section id="work" className="bg-bg py-12 md:py-20 select-none">
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
                Proyectos EAFIT
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-text-primary tracking-tight">
              Proyectos <span className="font-display italic font-normal">destacados</span>
            </h2>

            {/* Subtext */}
            <p className="text-sm md:text-base text-muted max-w-md mt-3 leading-relaxed">
              Selección de iniciativas académicas, estrategias de mercadeo, eventos automotrices y activaciones en EAFIT.
            </p>
          </div>

          {/* "Ver todos los proyectos" (Desktop) */}
          <div className="hidden md:inline-flex">
            <button
              onClick={onViewAllClick}
              className="relative group rounded-full p-[1.5px] transition-transform duration-300 hover:scale-105 cursor-pointer"
            >
              <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider px-5 py-3 bg-surface text-text-primary border border-stroke/70 group-hover:border-transparent transition-all duration-300">
                <span>Ver todos los proyectos</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {projects.map((project, index) => {
            const isAlternateLarge = index === 0 || index === 3;
            const colSpan = isAlternateLarge ? 'md:col-span-7' : 'md:col-span-5';
            const hasVideo = Boolean(project.videoUrl);
            const galleryCount = (project.gallery || []).filter(
              (item) => item.url !== project.videoUrl && item.url !== project.image
            ).length;

            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.12,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                onClick={() => onSelectProject(project)}
                className={`col-span-1 ${colSpan} group relative rounded-3xl overflow-hidden bg-surface border border-stroke cursor-pointer transition-all duration-500 hover:border-stroke/80 min-h-[380px] sm:min-h-[440px] md:min-h-[460px] lg:min-h-[500px] flex flex-col justify-end p-6 sm:p-8`}
              >
                {/* Background image or video */}
                {hasVideo ? (
                  <video
                    src={project.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                )}

                {/* Halftone overlay */}
                <div className="halftone-overlay absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none" />

                {/* Ambient baseline gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/40 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-20" />

                {/* Top media indicator badge */}
                <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
                  {hasVideo && (
                    <span className="bg-black/70 backdrop-blur-md border border-[#89AACC]/40 text-white text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                      <Video className="w-3 h-3 text-[#89AACC]" />
                      <span className="capitalize">
                        {project.videoFormat ? project.videoFormat : 'Video'}
                      </span>
                    </span>
                  )}
                  {galleryCount > 0 && (
                    <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Camera className="w-3 h-3 text-emerald-400" />
                      <span>+{galleryCount}</span>
                    </span>
                  )}
                </div>

                {/* Resting content: ONLY Title, Date, and Tags */}
                <div className="relative z-10 transition-opacity duration-300 group-hover:opacity-20 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#89AACC] font-mono font-medium">
                      {project.year}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display italic text-text-primary leading-tight">
                    {project.title}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-bg/70 opacity-0 group-hover:opacity-100 backdrop-blur-lg transition-all duration-400 flex flex-col items-center justify-center p-6 text-center z-20">
                  {/* Hover label */}
                  <div className="p-[1.5px] rounded-full accent-border-gradient shadow-2xl transition-transform duration-400 scale-90 group-hover:scale-100">
                    <div className="bg-white text-black px-6 py-2.5 rounded-full flex items-center gap-2 font-medium text-xs sm:text-sm tracking-wide">
                      <span>Ver</span>
                      <span className="opacity-40">—</span>
                      <span className="font-display italic text-base sm:text-lg">
                        {project.title}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-sm">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/15"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Mobile Action Button */}
        <div className="mt-8 flex justify-center md:hidden">
          <button
            onClick={onViewAllClick}
            className="w-full relative group rounded-full p-[1.5px] cursor-pointer"
          >
            <span className="absolute inset-0 rounded-full accent-gradient" />
            <span className="relative z-10 flex items-center justify-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider px-6 py-3.5 bg-surface text-text-primary">
              <span>Ver todos los proyectos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
