import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/context/store';
import { getTheme } from '@/utils/themes';

const Urgency = () => {
  const { uiContent } = useStore();
  const theme = getTheme(uiContent.activeLayout);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      
      setTimeLeft({ h, m, s });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`px-6 md:px-20 py-32 ${theme.secondary} dark:bg-brand-500/90 text-center relative overflow-hidden`}>
      {/* Decorative background elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.1 }}
        viewport={{ once: true }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
      </motion.div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] md:text-xs uppercase tracking-[0.4em] text-white/80 font-bold mb-8">No pierdas tiempo</p>
          <h2 className="text-5xl md:text-8xl font-display text-white leading-[0.85] mb-10 uppercase tracking-tighter">
            Su cumpleaños es mañana.<br />
            <span className="text-texto dark:text-dark-text italic">Todavía llegás.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-16 font-light max-w-2xl mx-auto">
            Pedidos antes de medianoche → entrega mañana a la mañana.
          </p>
        </motion.div>

        <div className="flex gap-6 md:gap-12 justify-center mb-20">
          <div className="text-center min-w-[80px] md:min-w-[120px]">
            <AnimatePresence mode="wait">
              <motion.span 
                key={timeLeft.h}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="font-display text-6xl md:text-8xl text-white block leading-none mb-2"
              >
                {String(timeLeft.h).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-bold">Horas</span>
          </div>
          <span className="text-5xl md:text-7xl text-white/20 pt-2 font-display">:</span>
          <div className="text-center min-w-[80px] md:min-w-[120px]">
            <AnimatePresence mode="wait">
              <motion.span 
                key={timeLeft.m}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="font-display text-6xl md:text-8xl text-white block leading-none mb-2"
              >
                {String(timeLeft.m).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-bold">Minutos</span>
          </div>
          <span className="text-5xl md:text-7xl text-white/20 pt-2 font-display">:</span>
          <div className="text-center min-w-[80px] md:min-w-[120px]">
            <AnimatePresence mode="wait">
              <motion.span 
                key={timeLeft.s}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="font-display text-6xl md:text-8xl text-white block leading-none mb-2"
              >
                {String(timeLeft.s).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-bold">Segundos</span>
          </div>
        </div>

          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const element = document.getElementById('catalog');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-texto dark:bg-dark-bg text-crema dark:text-dark-text px-16 py-6 rounded-full text-sm font-bold uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-texto/90 dark:hover:bg-dark-bg/90 transition-all"
            aria-label="Armar mi desayuno sorpresa ahora"
          >
            Armar mi desayuno sorpresa →
          </motion.button>
      </div>
    </section>
  );
};

export default Urgency;
