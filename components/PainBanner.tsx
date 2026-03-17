import React from 'react';

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
    <div className="bg-cafe py-5 overflow-hidden relative">
      <div className="flex gap-16 animate-ticker whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs md:text-sm text-crema/60 tracking-wide flex items-center gap-3">
            <strong className="text-crema font-medium">{item}</strong>
            <span className="text-tostado opacity-50">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default PainBanner;
