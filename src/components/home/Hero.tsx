import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Heart, Sparkles, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-stone-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-sm font-bold mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Dulzura que emociona</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif text-stone-900 leading-[1.1] mb-8">
              Momentos que <span className="text-brand-500 italic">perduran</span>
            </h1>
            
            <p className="text-xl text-stone-600 mb-12 leading-relaxed max-w-lg">
              Creamos experiencias únicas en forma de desayunos y regalos artesanales. 
              Porque cada detalle cuenta cuando se trata de demostrar amor.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <a 
                href="#catalog"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-stone-900 text-white rounded-full font-bold text-lg hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 group"
              >
                Ver Catálogo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/nosotros"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-stone-900 border border-stone-200 rounded-full font-bold text-lg hover:bg-stone-50 transition-all"
              >
                Nuestra Historia
              </a>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-stone-200 pt-12">
              <div>
                <p className="text-3xl font-serif text-stone-900">10k+</p>
                <p className="text-stone-500 text-sm font-bold uppercase tracking-wider">Sonrisas</p>
              </div>
              <div>
                <p className="text-3xl font-serif text-stone-900">4.9/5</p>
                <p className="text-stone-500 text-sm font-bold uppercase tracking-wider">Calificación</p>
              </div>
              <div>
                <p className="text-3xl font-serif text-stone-900">100%</p>
                <p className="text-stone-500 text-sm font-bold uppercase tracking-wider">Artesanal</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://cdn.pedix.app/0faziepQZj69lgGsYCmH/products/1740743569577-76706.png?size=2000x2000" 
                alt="Desayuno Premium"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -right-8 bg-white p-6 rounded-3xl shadow-xl hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Hecho con Amor</p>
                  <p className="text-xs text-stone-500">100% Personalizado</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-stone-900" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Envío Especial</p>
                  <p className="text-xs text-stone-500">Llegamos a tiempo</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Hero);
