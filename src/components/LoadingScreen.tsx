import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOADING_WORDS } from '../data/portfolioData';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState<number>(0);
  const [wordIndex, setWordIndex] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const duration = 2700; // 2700ms total
  const completedRef = useRef(false);

  useEffect(() => {
    // Word cycler every 900ms
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % LOADING_WORDS.length);
    }, 900);

    // requestAnimationFrame counter from 000 -> 100 over 2700ms
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 2.5);
      const currentVal = Math.floor(easedProgress * 100);
      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(100);
        if (!completedRef.current) {
          completedRef.current = true;
          setTimeout(() => {
            onComplete();
          }, 400); // 400ms delay after hitting 100
        }
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      clearInterval(wordInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      setCount(100);
      onComplete();
    }
  };

  return (
    <motion.aside
      aria-label="Pantalla de Carga"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }}
      className="fixed inset-0 z-[9999] bg-bg flex flex-col justify-between p-6 sm:p-10 md:p-14 select-none cursor-default"
      onClick={handleSkip}
    >
      {/* Top row: Portafolio label + skip hint */}
      <div className="flex items-center justify-between w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-xs text-muted uppercase tracking-[0.3em] font-medium"
        >
          Portafolio • EAFIT
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-[11px] uppercase tracking-wider text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          Saltar ↗
        </motion.button>
      </div>

      {/* Center: Rotating words */}
      <div className="flex items-center justify-center my-auto overflow-hidden h-24 sm:h-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={LOADING_WORDS[wordIndex]}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80 text-center tracking-tight"
          >
            {LOADING_WORDS[wordIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom row: Counter display */}
      <div className="flex items-end justify-between w-full pb-2">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted hidden sm:block">
          Samuel Restrepo • Universidad EAFIT © &apos;26
        </div>
        <div className="text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums tracking-tight font-normal leading-none ml-auto">
          {String(count).padStart(3, "0")}
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[3px] bg-stroke/50 overflow-hidden">
        <div
          className="h-full accent-gradient origin-left transition-transform duration-75"
          style={{
            transform: `scaleX(${count / 100})`,
            boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
          }}
        />
      </div>
    </motion.aside>
  );
};
