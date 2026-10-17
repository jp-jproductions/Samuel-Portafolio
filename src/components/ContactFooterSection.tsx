import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
import { HlsBackgroundVideo } from './HlsBackgroundVideo';
import { HLS_VIDEO_URL, SOCIAL_LINKS } from '../data/portfolioData';

interface ContactFooterSectionProps {
  videoUrl?: string;
}

export const ContactFooterSection: React.FC<ContactFooterSectionProps> = ({ videoUrl }) => {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState<string>('');

  // Medellín / Colombia timezone clock (America/Bogota)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // GSAP Marquee
  useEffect(() => {
    if (!marqueeRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(marqueeRef.current, {
        xPercent: -50,
        duration: 40,
        ease: 'none',
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, []);

  const emailAddress = 'samuelrestreporaigoza@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const marqueeText = Array(10).fill('CONSTRUYENDO EL FUTURO • UNIVERSIDAD EAFIT • ').join('');

  return (
    <footer
      id="contact"
      className="relative bg-bg pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden select-none border-t border-stroke/40"
    >
      {/* Background Video: Flipped vertically */}
      <HlsBackgroundVideo
        src={videoUrl || HLS_VIDEO_URL}
        flipped={true}
        overlayClassName="bg-black/60"
        showBottomFade={false}
      />

      {/* GSAP Marquee */}
      <div className="relative z-10 w-full overflow-hidden mb-12 sm:mb-20 pointer-events-none opacity-40 hover:opacity-70 transition-opacity duration-500">
        <div
          ref={marqueeRef}
          className="flex whitespace-nowrap will-change-transform"
        >
          <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display uppercase tracking-widest text-text-primary/20 shrink-0 select-none">
            {marqueeText}
          </span>
          <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display uppercase tracking-widest text-text-primary/20 shrink-0 select-none">
            {marqueeText}
          </span>
        </div>
      </div>

      {/* Main CTA Container */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 flex flex-col items-center text-center mb-16 sm:mb-24">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-stroke" />
          <span className="text-xs text-muted uppercase tracking-[0.3em] font-medium">
            Contacto &amp; Oportunidades
          </span>
          <span className="w-8 h-px bg-stroke" />
        </div>

        {/* CTA Heading */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-text-primary tracking-tight max-w-4xl leading-[1.05] mb-8 sm:mb-10">
          Creemos proyectos <span className="font-display italic font-normal">extraordinarios</span> juntos.
        </h2>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a
            href={`mailto:${emailAddress}`}
            className="relative group inline-flex rounded-full p-[2px] transition-transform duration-300 hover:scale-105"
          >
            <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-3 rounded-full text-sm sm:text-base md:text-lg px-8 sm:px-10 py-4 bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary font-medium transition-all duration-300 shadow-2xl">
              <span>{emailAddress}</span>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </span>
          </a>

          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-2 rounded-full px-5 py-4 border border-stroke bg-surface/80 hover:bg-surface text-text-primary text-sm font-medium transition-all duration-300 cursor-pointer"
            title="Copiar correo al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-muted" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 pt-8 border-t border-stroke/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Status badge */}
          <div className="flex items-center gap-3 bg-surface/60 border border-stroke/80 rounded-full px-4 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs text-text-primary font-medium tracking-wide">
              Disponible para proyectos &amp; pasantías universitarias
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs uppercase tracking-wider text-muted hover:text-text-primary transition-colors flex items-center gap-1 group"
              >
                <span>{link.name}</span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
              </a>
            ))}
          </div>

          {/* Medellín time & copyright */}
          <div className="flex items-center gap-4 text-xs text-muted font-light">
            <span>Medellín, Colombia: {time || '18:00:00'} COT</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} JProduction´s</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
