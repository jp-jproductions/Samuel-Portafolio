import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { Sliders } from 'lucide-react';
import { HlsBackgroundVideo } from './HlsBackgroundVideo';
import { HLS_VIDEO_URL, DEFAULT_HERO_CONFIG } from '../data/portfolioData';
import { HeroConfig } from '../types';

interface HeroSectionProps {
  onSeeWorksClick: () => void;
  onReachOutClick: () => void;
  videoUrl?: string;
  config?: HeroConfig;
  onOpenEdit?: () => void;
  isAdmin?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSeeWorksClick,
  onReachOutClick,
  videoUrl,
  config = DEFAULT_HERO_CONFIG,
  onOpenEdit,
  isAdmin = false,
}) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const roles = config.roles && config.roles.length > 0 ? config.roles : DEFAULT_HERO_CONFIG.roles;

  // Cycler every 2s through the interactive words
  useEffect(() => {
    if (roles.length <= 1) return;
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [roles.length]);

  // Keep index within bounds if words were deleted
  const currentWord = roles[roleIndex % roles.length] || roles[0] || 'Creatividad';

  // GSAP Entrance
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.name-reveal',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
      );

      tl.fromTo(
        '.blur-in',
        { opacity: 0, filter: 'blur(10px)', y: 20 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: 0.1 },
        '-=0.9'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const activeVideoUrl = config.videoUrl || videoUrl || HLS_VIDEO_URL;

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden select-none"
    >
      {/* Background Video in continuous infinite loop */}
      <HlsBackgroundVideo
        src={activeVideoUrl}
        overlayClassName="bg-black/35"
        showBottomFade={true}
      />

      {/* Hero Content (centered, z-10) */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Eyebrow */}
        {config.eyebrow && (
          <div className="blur-in text-xs text-muted uppercase tracking-[0.3em] mb-8 font-medium">
            {config.eyebrow}
          </div>
        )}

        {/* Name */}
        <h1 className="name-reveal text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6">
          {config.name || "Samuel Restrepo"}
        </h1>

        {/* Dynamic cycling words */}
        <div className="blur-in text-lg sm:text-xl md:text-2xl text-text-primary/90 font-light mb-6 flex items-center justify-center flex-wrap gap-x-2">
          {config.rolesPrefix && <span>{config.rolesPrefix}</span>}
          <span
            key={`${roleIndex}-${currentWord}`}
            className="font-display italic text-[#89AACC] animate-role-fade-in inline-block text-2xl sm:text-3xl md:text-4xl px-1 font-normal"
          >
            {currentWord}
          </span>
          {config.rolesSuffix && <span>{config.rolesSuffix}</span>}
        </div>

        {/* Description */}
        {config.description && (
          <p className="blur-in text-sm md:text-base text-muted max-w-lg leading-relaxed mb-12">
            {config.description}
          </p>
        )}

        {/* CTA Buttons */}
        <div className="blur-in inline-flex items-center gap-4 flex-wrap justify-center">
          {/* "Ver Proyectos" */}
          <button
            onClick={onSeeWorksClick}
            className="relative group rounded-full p-[2px] transition-transform duration-300 hover:scale-105 cursor-pointer"
          >
            <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 block rounded-full text-sm px-7 py-3.5 bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary transition-all duration-300 font-medium">
              {config.primaryButtonText || "Ver Proyectos"}
            </span>
          </button>

          {/* "Contáctame..." */}
          <button
            onClick={onReachOutClick}
            className="relative group rounded-full p-[2px] transition-transform duration-300 hover:scale-105 cursor-pointer"
          >
            <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 block rounded-full text-sm px-7 py-3.5 border-2 border-stroke bg-bg text-text-primary group-hover:border-transparent transition-all duration-300 font-medium">
              {config.secondaryButtonText || "Contáctame..."}
            </span>
          </button>
        </div>

        {/* Admin Quick Action Button: Modificar Inicio (Textos, Palabras & Video) */}
        {isAdmin && onOpenEdit && (
          <div className="blur-in pt-6">
            <button
              type="button"
              onClick={onOpenEdit}
              title="Modificar textos, 5 palabras interactivas y video de fondo en bucle"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-[#89AACC] border border-[#89AACC]/40 bg-surface/90 hover:bg-[#89AACC]/20 transition-all cursor-pointer shadow-lg backdrop-blur-md hover:scale-105"
            >
              <Sliders className="w-3.5 h-3.5 text-[#89AACC]" />
              <span>Modificar Inicio (Textos, Palabras &amp; Video)</span>
            </button>
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none select-none">
        <span className="text-[10px] text-muted uppercase tracking-[0.2em] mb-2 font-medium">
          DESLIZAR
        </span>
        <div className="relative w-px h-10 bg-stroke overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 accent-gradient animate-scroll-down" />
        </div>
      </div>
    </section>
  );
};
