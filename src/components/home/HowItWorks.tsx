import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, Truck, Heart } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    { title: 'Elegí tu Dulzayuno', description: 'Navegá por nuestro catálogo y seleccioná el regalo perfecto.', icon: ShoppingBag },
    { title: 'Personalizalo', description: 'Agregá un mensaje especial y elegí los detalles que más te gusten.', icon: Heart },
    { title: 'Pagá Seguro', description: 'Contamos con múltiples medios de pago para tu comodidad.', icon: CreditCard },
    { title: 'Entrega Puntual', description: 'Llevamos tu regalo a la puerta de esa persona especial.', icon: Truck },
  ];

  return (
    <section className="py-32 bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-serif text-stone-900 mb-8"
          >
            ¿Cómo <span className="text-brand-500 italic">funciona</span>?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-stone-500 max-w-2xl mx-auto"
          >
            Hacer feliz a alguien es más fácil de lo que pensás. 
            Seguí estos simples pasos.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-200 -translate-y-1/2 hidden md:block" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-10 shadow-xl shadow-stone-200 transition-all duration-500 group-hover:bg-brand-500 group-hover:text-white">
                <step.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4">{step.title}</h3>
              <p className="text-stone-500 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(HowItWorks);
