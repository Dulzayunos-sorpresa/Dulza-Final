import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '@/context/store';
import { getTheme } from '@/utils/themes';

const MoodBanner = () => {
  const { uiContent } = useStore();
  const theme = getTheme(uiContent.activeLayout);
  
  const items = [
    "Sorprenden",
    "Conectan",
    "Enamoran",
    "Emocionan",
    "Permanecen"
  ];

  return (
    <div className={`py-12 overflow-hidden relative border-y border-brand-100/10 dark:border-white/5`}>
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          duration: 20, 
          ease: "linear", 
          repeat: Infinity 
        }}
        className="flex gap-20 whitespace-nowrap"
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-4xl md:text-6xl font-display text-texto/10 dark:text-white/10 uppercase tracking-tighter flex items-center gap-10">
            <span className="hover:text-brand-500 transition-colors duration-500">{item}</span>
            <span className={`${theme.primary} opacity-20 text-2xl`}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default MoodBanner;
