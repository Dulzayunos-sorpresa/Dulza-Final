import React, { useState, useEffect } from 'react';

const Urgency = () => {
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
    <section className="px-6 md:px-20 py-24 bg-gradient-to-br from-tostado to-cafe-medio text-center relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="text-[200px]">☀️</span>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-4xl md:text-6xl font-display text-white leading-[1.15] mb-6">
          Su cumpleaños es mañana.<br />
          <span className="opacity-80 italic">Todavía llegás.</span>
        </h2>
        <p className="text-lg text-white/75 mb-12 font-light">
          Pedidos antes de medianoche → entrega mañana a la mañana.
        </p>

        <div className="flex gap-8 justify-center mb-12">
          <div className="text-center">
            <span className="font-display text-5xl md:text-6xl text-white block leading-none">{String(timeLeft.h).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase tracking-[1.5px] text-white/50 font-bold">Horas</span>
          </div>
          <span className="text-4xl text-white/30 pt-2">:</span>
          <div className="text-center">
            <span className="font-display text-5xl md:text-6xl text-white block leading-none">{String(timeLeft.m).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase tracking-[1.5px] text-white/50 font-bold">Minutos</span>
          </div>
          <span className="text-4xl text-white/30 pt-2">:</span>
          <div className="text-center">
            <span className="font-display text-5xl md:text-6xl text-white block leading-none">{String(timeLeft.s).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase tracking-[1.5px] text-white/50 font-bold">Segundos</span>
          </div>
        </div>

        <button 
          onClick={() => {
            const element = document.getElementById('catalog');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="bg-white text-cafe px-12 py-5 rounded-full text-base font-bold shadow-2xl hover:bg-crema transition-all transform hover:-translate-y-1 active:scale-95"
        >
          Armar mi desayuno sorpresa →
        </button>
      </div>
    </section>
  );
};

export default Urgency;
