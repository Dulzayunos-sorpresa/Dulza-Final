import React from 'react';
import { motion } from 'framer-motion';

const PainBanner = () => {
  const items = [
    "No sé qué regalarle",
    "Mañana es su cumple y no tengo nada",
    "Quiero que sienta que lo pensé",
    "No hay fecha pero quiero sorprenderla",
    "Un mensaje de WhatsApp no alcanza",
    "Quiero quedar como el mejor regalo del año"
  ];

  return (
    <div className="bg-texto py-6 overflow-hidden relative">
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          duration: 30, 
          ease: "linear", 
          repeat: Infinity 
        }}
        className="flex gap-20 whitespace-nowrap"
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-[10px] md:text-xs text-crema/40 uppercase tracking-[0.2em] flex items-center gap-4">
            <strong className="text-crema font-bold">{item}</strong>
            <span className="text-naranja opacity-50">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default PainBanner;
