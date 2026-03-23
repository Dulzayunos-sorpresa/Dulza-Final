import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';

const Urgency = () => {
  return (
    <section className="py-32 bg-brand-500 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-bold mb-8">
              <Clock className="w-4 h-4" />
              <span>¡No te quedes sin el tuyo!</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-8">
              Hacé tu pedido con <span className="text-stone-900 italic underline decoration-brand-300 underline-offset-8">anticipación</span>
            </h2>
            
            <p className="text-xl text-white/80 mb-12 leading-relaxed max-w-lg">
              Nuestros productos son 100% artesanales y tenemos cupos limitados por día. 
              Asegurá tu regalo hoy mismo.
            </p>
            
            <a 
              href="#catalog"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-brand-600 rounded-full font-bold text-lg hover:bg-stone-50 transition-all shadow-xl shadow-brand-600/20 group"
            >
              Reservar Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1740743569577-76706.png?size=2000x2000" 
                alt="Desayuno Premium"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Urgency);
