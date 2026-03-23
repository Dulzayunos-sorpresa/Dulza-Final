import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, Gift } from 'lucide-react';

const PainBanner = () => {
  return (
    <section className="py-24 bg-stone-900 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-500 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-brand-500/20 transition-all duration-500">
              <Heart className="w-10 h-10 text-brand-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-serif mb-4">¿Te cuesta expresar lo que sentís?</h3>
            <p className="text-stone-400 leading-relaxed">
              A veces las palabras no alcanzan. Nuestros regalos hablan por vos, 
              transmitiendo cada emoción en un detalle único.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-brand-500/20 transition-all duration-500">
              <Clock className="w-10 h-10 text-brand-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-serif mb-4">¿Te falta tiempo para buscar el regalo ideal?</h3>
            <p className="text-stone-400 leading-relaxed">
              Nosotros nos encargamos de todo. Desde la selección artesanal 
              hasta la entrega puntual en la puerta de esa persona especial.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-brand-500/20 transition-all duration-500">
              <Gift className="w-10 h-10 text-brand-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-serif mb-4">¿Buscás algo que no sea "un regalo más"?</h3>
            <p className="text-stone-400 leading-relaxed">
              Huí de lo genérico. Cada Dulzayuno es una pieza artesanal 
              diseñada exclusivamente para quien lo recibe.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(PainBanner);
