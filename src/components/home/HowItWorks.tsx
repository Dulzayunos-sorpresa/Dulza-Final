import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      num: "01",
      icon: "🎁",
      title: "Elegís tu desayuno",
      desc: "Seleccionás el combo que más representa lo que querés decir. Cada producto es artesanal y pensado para que se note."
    },
    {
      num: "02",
      icon: "💌",
      title: "Personalizás el mensaje",
      desc: "Escribís las palabras que querés que lleguen junto con el desayuno. O si no sabés qué decir, te ayudamos."
    },
    {
      num: "03",
      icon: "📦",
      title: "Nosotros lo armamos",
      desc: "Cada pedido se arma con cuidado esa misma noche. No es un paquete genérico — es una experiencia que se nota."
    },
    {
      num: "04",
      icon: "🚪",
      title: "Llega a la mañana",
      desc: "A primera hora del día. En la puerta. Cuando todavía no espera nada. Ese momento es el regalo."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section className="px-6 md:px-20 py-32 bg-texto dark:bg-dark-surface text-crema dark:text-dark-text relative overflow-hidden">
      {/* Background patterns */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.03 }}
        viewport={{ once: true }}
        className="absolute inset-0 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} 
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-24"
        >
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-naranja font-bold mb-6">El proceso</p>
          <h2 className="text-5xl md:text-7xl font-display text-crema dark:text-dark-text leading-[0.9] mb-8 uppercase tracking-tighter">
            De cero a sorpresa<br /><span className="text-naranja italic">en minutos.</span>
          </h2>
          <p className="text-base md:text-lg text-crema/50 dark:text-dark-text-muted leading-relaxed max-w-xl font-light">
            No hace falta planificarlo con días de anticipación. Si pedís antes de medianoche, llegamos mañana a la mañana.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="relative group transition-transform duration-500 hover:-translate-y-2"
            >
              <div className="flex items-baseline gap-4 mb-8">
                <div className="font-display text-6xl font-bold text-naranja leading-none transition-all duration-500 opacity-20 group-hover:opacity-40 group-hover:scale-110">
                  {step.num}
                </div>
                <div className="w-12 h-[1px] bg-naranja/30 group-hover:w-16 transition-all duration-500" />
              </div>
              
              <div className="w-14 h-14 bg-crema/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-naranja/10 transition-all duration-500 group-hover:scale-110">
                {step.icon}
              </div>
              
              <h3 className="text-xl font-bold text-crema dark:text-dark-text mb-4 uppercase tracking-tight">{step.title}</h3>
              <p className="text-sm text-crema/40 dark:text-dark-text-muted/40 leading-relaxed font-light group-hover:text-crema/60 dark:group-hover:text-dark-text/60 transition-colors duration-500">
                {step.desc}
              </p>
              
              {i < 3 && (
                <div className="hidden lg:block absolute top-12 -right-12 text-naranja/20 text-3xl animate-pulse">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
