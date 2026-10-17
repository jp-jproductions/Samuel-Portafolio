import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Eye, Edit3 } from 'lucide-react';
import { Exploration, VisualLabConfig } from '../types';
import { EXPLORATIONS, DEFAULT_VISUAL_LAB_CONFIG } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

interface ExplorationsSectionProps {
  onSelectExploration: (item: Exploration) => void;
  onOpenGallery: () => void;
  explorations?: Exploration[];
  config?: VisualLabConfig;
  onOpenEdit?: () => void;
  isAdmin?: boolean;
}

export const ExplorationsSection: React.FC<ExplorationsSectionProps> = ({
  onSelectExploration,
  onOpenGallery,
  explorations = EXPLORATIONS,
  config = DEFAULT_VISUAL_LAB_CONFIG,
  onOpenEdit,
  isAdmin = false,
}) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef<HTMLDivElement | null>(null);
  const col1Ref = useRef<HTMLDivElement | null>(null);
  const col2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !pinnedRef.current) return;

    const ctx = gsap.context(() => {
      // Smooth parallax column 1
      if (col1Ref.current) {
        gsap.fromTo(
          col1Ref.current,
          { y: 80 },
          {
            y: -80,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      }

      // Smooth parallax column 2 with slight offset
      if (col2Ref.current) {
        gsap.fromTo(
          col2Ref.current,
          { y: 140 },
          {
            y: -120,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const items = explorations && explorations.length > 0 ? explorations : EXPLORATIONS;
  const col1Items = items.slice(0, 3);
  const col2Items = items.slice(3, 6);

  return (
    <section
      id="explorations"
      ref={sectionRef}
      className="relative min-h-[135vh] sm:min-h-[145vh] bg-bg overflow-hidden select-none"
    >
      {/* Layer 1: Pinned Center (z-10) */}
      <div
        ref={pinnedRef}
        className="sticky top-0 h-screen w-full flex flex-col items-center justify-center text-center px-6 pointer-events-none z-10"
      >
        <div className="max-w-xl mx-auto flex flex-col items-center">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em] font-medium">
              {config.eyebrow || 'Exploraciones'}
            </span>
            <span className="w-8 h-px bg-stroke" />
          </div>

          {/* Heading */}
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-light text-text-primary tracking-tight leading-none mb-6">
            {config.titleMain || 'Laboratorio'}{' '}
            <span className="font-display italic font-normal">
              {config.titleItalic || 'visual'}
            </span>
          </h2>

          {/* Subtext */}
          <p className="text-sm md:text-base text-muted max-w-md leading-relaxed mb-8">
            {config.description ||
              'Bocetos automotrices, diarios de viaje fotográficos, activaciones de marca y experimentos gráficos en EAFIT.'}
          </p>

          {/* Button: VER MÁS & Admin Edit Shortcut */}
          <div className="pointer-events-auto flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onOpenGallery}
              aria-label="Ver más exploraciones fotográficas del laboratorio visual"
              className="relative group inline-flex rounded-full p-[1.5px] transition-transform duration-300 hover:scale-105 cursor-pointer"
            >
              <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2.5 rounded-full text-xs font-semibold uppercase tracking-wider px-7 py-3.5 bg-surface/90 backdrop-blur-md text-text-primary border border-stroke group-hover:border-transparent transition-all duration-300 shadow-xl">
                <span>{config.buttonText || 'VER MÁS'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#89AACC] transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>

            {isAdmin && onOpenEdit && (
              <button
                type="button"
                onClick={onOpenEdit}
                title="Modificar fotos y textos del Laboratorio Visual"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-medium text-[#89AACC] border border-[#89AACC]/40 bg-surface/90 hover:bg-[#89AACC]/20 transition-all cursor-pointer shadow-lg backdrop-blur-md"
              >
                <Edit3 className="w-3 h-3" />
                <span>Modificar Laboratorio Visual &amp; Fotos</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Layer 2: Parallax Columns (z-20) */}
      <div className="absolute inset-0 z-20 pointer-events-none pt-12 sm:pt-16 pb-12 sm:pb-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-full">
          <div className="grid grid-cols-2 gap-6 sm:gap-12 md:gap-24 lg:gap-36 h-full items-center">
            {/* Column 1 */}
            <div
              ref={col1Ref}
              className="flex flex-col gap-10 sm:gap-14 md:gap-18 items-start will-change-transform"
            >
              {col1Items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectExploration(item)}
                  className={`pointer-events-auto w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden border border-stroke/80 bg-surface relative group cursor-pointer shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-0 hover:border-stroke hover:z-30 ${item.rotation}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="halftone-overlay absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none" />

                  {/* Hover Card Overlay */}
                  <div className="absolute inset-0 bg-bg/80 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between p-5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-[#89AACC] font-medium">
                        {item.medium}
                      </span>
                      <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display italic text-2xl text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-muted line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div
              ref={col2Ref}
              className="flex flex-col gap-10 sm:gap-14 md:gap-18 items-end will-change-transform pt-14 sm:pt-20"
            >
              {col2Items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectExploration(item)}
                  className={`pointer-events-auto w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden border border-stroke/80 bg-surface relative group cursor-pointer shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-0 hover:border-stroke hover:z-30 ${item.rotation}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="halftone-overlay absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none" />

                  {/* Hover Card Overlay */}
                  <div className="absolute inset-0 bg-bg/80 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between p-5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-[#89AACC] font-medium">
                        {item.medium}
                      </span>
                      <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display italic text-2xl text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-muted line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
