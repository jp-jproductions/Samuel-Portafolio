import React from 'react';
import { motion } from 'framer-motion';
import { STATS } from '../data/portfolioData';

export const StatsSection: React.FC = () => {
  return (
    <section className="bg-bg pt-8 pb-16 md:pt-10 md:pb-20 border-t border-stroke/40 select-none">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="relative p-6 sm:p-8 rounded-3xl bg-surface/30 border border-stroke flex flex-col justify-between group hover:border-stroke/80 transition-all duration-300"
            >
              <div className="mb-8">
                {/* Number */}
                <div className="text-6xl sm:text-7xl lg:text-8xl font-display text-text-primary tabular-nums tracking-tight font-normal leading-none group-hover:text-white transition-colors">
                  {stat.number}
                </div>
                {/* Accent indicator line */}
                <div className="w-12 h-1 accent-gradient rounded-full mt-4 transform origin-left group-hover:scale-x-125 transition-transform duration-500" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-medium text-text-primary mb-2">
                  {stat.label}
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed font-light">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
