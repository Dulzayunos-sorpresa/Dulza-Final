import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "¿Hasta qué hora puedo pedir para que llegue mañana?",
      a: "Podés pedir hasta las 23:59 de hoy y el desayuno llega mañana antes de las 10am. Para zonas del GBA el límite es las 22hs."
    },
    {
      q: "¿En qué zonas entregan?",
      a: "Cubrimos toda la Ciudad de Buenos Aires y el primer y segundo cordón del GBA. Si tenés dudas sobre una dirección específica, escribinos por Instagram."
    },
    {
      q: "¿Puedo agregar un mensaje personalizado?",
      a: "Sí, siempre. Al momento de hacer el pedido podés escribir lo que querés que diga la tarjeta. Si no sabés qué poner, te tiramos ideas."
    },
    {
      q: "¿Qué pasa si el receptor no está en casa?",
      a: "Te avisamos antes de llegar. Si no podemos entregar, coordinamos un segundo intento o te devolvemos el dinero. Ninguna sorpresa se pierde."
    },
    {
      q: "¿Los productos son realmente artesanales?",
      a: "Sí. Las medialunas se hacen esa misma mañana. Las tablas se arman con productos seleccionados de productores locales. Nada es industrial."
    },
    {
      q: "¿Puedo pedir sin una fecha especial?",
      a: "Eso es lo que más nos gusta. El 40% de nuestros pedidos no tienen ninguna fecha especial — solo alguien que quiso sorprender. El martes también merece un desayuno sorpresa."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="px-6 md:px-20 py-32 bg-crema/30 relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-20"
        >
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-naranja font-bold mb-6">Preguntas frecuentes</p>
          <h2 className="text-5xl md:text-7xl font-display text-texto leading-[0.9] mb-8 uppercase tracking-tighter">
            Todo lo que necesitás<br /><span className="text-naranja italic">saber.</span>
          </h2>
          <p className="text-base md:text-lg text-texto/60 leading-relaxed max-w-xl font-light">
            No tenemos que explicar por qué funciona. Lo hacen ellos solos cuando abren la puerta.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {faqs.map((faq, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className={`p-10 rounded-[40px] cursor-pointer transition-all duration-500 border ${
                openIndex === i 
                ? 'bg-white shadow-[0_30px_60px_-15px_rgba(242,125,38,0.1)] border-naranja/10' 
                : 'bg-white/50 border-naranja/5 hover:bg-white hover:border-naranja/10'
              }`}
            >
              <div className="flex justify-between items-center gap-6">
                <h3 className="text-base font-bold text-texto uppercase tracking-tight leading-tight">{faq.q}</h3>
                <motion.div 
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  className={`w-10 h-10 rounded-full border border-naranja/20 flex items-center justify-center text-naranja transition-all duration-500 ${openIndex === i ? 'bg-naranja text-white border-naranja' : ''}`}
                >
                  <span className="text-xl">+</span>
                </motion.div>
              </div>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-texto/60 leading-relaxed font-light border-l-2 border-naranja/20 pl-6 mt-8">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
