import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Gift, Sparkles, Star } from 'lucide-react';

const Moments = () => {
  const moments = [
    { title: 'Aniversarios', icon: Heart, color: 'bg-red-50 text-red-500' },
    { title: 'Cumpleaños', icon: Gift, color: 'bg-blue-50 text-blue-500' },
    { title: 'Nacimientos', icon: Sparkles, color: 'bg-yellow-50 text-yellow-500' },
    { title: 'Logros', icon: Star, color: 'bg-green-50 text-green-500' },
  ];

  return (
    <section className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-serif text-stone-900 mb-8"
          >
            Acompañamos tus <span className="text-brand-500 italic">mejores</span> momentos
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-stone-500 max-w-2xl mx-auto"
          >
            No importa la ocasión, tenemos el detalle perfecto para que 
            ese día sea inolvidable.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {moments.map((moment, index) => (
            <motion.div
              key={moment.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className="bg-stone-50 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all duration-500 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-stone-100">
                <div className={`w-20 h-20 ${moment.color} rounded-3xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110`}>
                  <moment.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">{moment.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Moments);
